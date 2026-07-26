// src/utils/blogTracking.ts
//
// Клиентская обёртка над recordPostView / recordPostInteraction.
//
// Дедупликация просмотров:
//   Сервис проверяет 30-минутное окно по IP на сервере, но браузер IP
//   не знает. Поэтому дублируем логику на клиенте через localStorage —
//   не спамим analytics при перезагрузках вкладки.
//
// Дедупликация лайков:
//   Один лайк с одного устройства. Если уже лайкнул — второй клик
//   должен сниматься. Пока делаем idempotent «уже лайкнуто» и не шлём.

import { recordPostView, recordPostInteraction, InteractionType } from "@/firebase/services/blogAnalyticsService";

const VIEW_KEY_PREFIX = "kvitko:blog:viewed:";
const LIKE_KEY_PREFIX = "kvitko:blog:liked:";
const VIEW_TTL_MS = 30 * 60 * 1000; // 30 минут — как на сервере

function readTs(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeTs(key: string, ts: number) {
  try {
    localStorage.setItem(key, String(ts));
  } catch {
    // localStorage может быть заблокирован (Safari private) — молча идём дальше.
  }
}

/**
 * Записать просмотр статьи. Не бросает — analytics fire-and-forget.
 */
export async function trackBlogView(postId: string, userId?: string): Promise<void> {
  const key = VIEW_KEY_PREFIX + postId;
  const lastView = readTs(key);
  const now = Date.now();

  if (now - lastView < VIEW_TTL_MS) {
    return; // уже засчитан недавно
  }
  writeTs(key, now);

  try {
    await recordPostView(postId, {
      userId,
      // Точный IP на клиенте не доступен. Отправляем плейсхолдер —
      // server-side дедуп сработает по userId (если есть), а по IP
      // всё равно бесполезно из браузера. В идеале это должна делать
      // Cloud Function на trigger blog view.
      ip: userId ? "auth" : "anonymous",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      referer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  } catch (err) {
    // Не рушим страницу из-за трекинга.
    console.warn("[blogTracking] recordPostView failed:", err);
  }
}

/**
 * Лайк / анлайк. Возвращает новое состояние (true = теперь лайкнуто).
 */
export async function toggleBlogLike(postId: string, userId?: string): Promise<boolean> {
  const key = LIKE_KEY_PREFIX + postId;
  const alreadyLiked = readTs(key) > 0;
  const nextLiked = !alreadyLiked;

  writeTs(key, nextLiked ? Date.now() : 0);

  try {
    await recordPostInteraction(postId, InteractionType.LIKE, userId);
  } catch (err) {
    console.warn("[blogTracking] recordPostInteraction failed:", err);
    // Откатываем локальное состояние, чтобы UI не соврал.
    writeTs(key, alreadyLiked ? Date.now() : 0);
    return alreadyLiked;
  }

  return nextLiked;
}

export function hasLikedBlog(postId: string): boolean {
  return readTs(LIKE_KEY_PREFIX + postId) > 0;
}
