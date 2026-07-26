// src/utils/aspectRatio.ts
import { ImageOrientation } from "./imageCompression";

/**
 * Целевые соотношения сторон по разделам сайта.
 * Значение — числовое width/height. Используется для проверки фотографий,
 * загружаемых через админ-панель.
 */
export interface TargetSpec {
  ratio: number;
  label: string;
  /** Минимально рекомендуемый размер в пикселях (ширина × высота). */
  recommendedSize: string;
  /** Ожидаемая ориентация. */
  orientation: "portrait" | "landscape" | "square";
  /** Где это используется на сайте — для подсказки пользователю. */
  usage: string;
}

export const TARGET_ASPECTS: Record<string, TargetSpec> = {
  product: {
    ratio: 4 / 5,
    label: "4:5 (вертикальное)",
    recommendedSize: "1200 × 1500 px",
    orientation: "portrait",
    usage: "карточки товаров в каталоге",
  },
  category: {
    ratio: 1 / 1,
    label: "1:1 (квадрат)",
    recommendedSize: "1200 × 1200 px",
    orientation: "square",
    usage: "плитки категорий на главной странице",
  },
  blog: {
    ratio: 16 / 9,
    label: "16:9 (горизонтальное)",
    recommendedSize: "1920 × 1080 px",
    orientation: "landscape",
    usage: "главное изображение статьи блога",
  },
  hero: {
    ratio: 4 / 3,
    label: "4:3 (горизонтальное)",
    recommendedSize: "1600 × 1200 px",
    orientation: "landscape",
    usage: "hero-секция (главный баннер) на главной странице",
  },
  delivery: {
    ratio: 4 / 3,
    label: "4:3 (горизонтальное)",
    recommendedSize: "1600 × 1200 px",
    orientation: "landscape",
    usage: "секция о доставке на главной странице",
  },
  customBouquet: {
    ratio: 4 / 5,
    label: "4:5 (вертикальное)",
    recommendedSize: "1200 × 1500 px",
    orientation: "portrait",
    usage: "секция «Создай свой букет»",
  },
  testimonialAvatar: {
    ratio: 1 / 1,
    label: "1:1 (квадрат)",
    recommendedSize: "400 × 400 px",
    orientation: "square",
    usage: "аватар в секции отзывов клиентов",
  },
  flower: {
    ratio: 1 / 1,
    label: "1:1 (квадрат)",
    recommendedSize: "600 × 600 px",
    orientation: "square",
    usage: "каталог цветов в конфигураторе букетов",
  },
  generic: {
    ratio: 4 / 3,
    label: "4:3 (горизонтальное)",
    recommendedSize: "1200 × 900 px",
    orientation: "landscape",
    usage: "общее использование на сайте",
  },
};

export type AspectKey = keyof typeof TARGET_ASPECTS | string;

export interface AspectCheckResult {
  ok: boolean;
  /** Текст подсказки на чешском для toast/UI. */
  message?: string;
  expected: string;
  actual: string;
  actualOrientation: ImageOrientation;
  actualRatio: number;
}

/**
 * Описывает соотношение сторон в формате "Ш:В" с минимальным целым приближением.
 */
function formatRatio(ratio: number): string {
  const candidates: Array<[number, string]> = [
    [4 / 5, "4:5"],
    [3 / 4, "3:4"],
    [1, "1:1"],
    [4 / 3, "4:3"],
    [16 / 9, "16:9"],
    [16 / 10, "16:10"],
    [2 / 1, "2:1"],
    [3 / 2, "3:2"],
  ];
  let best = candidates[0];
  let bestDiff = Math.abs(ratio - candidates[0][0]);
  for (const c of candidates) {
    const d = Math.abs(ratio - c[0]);
    if (d < bestDiff) {
      best = c;
      bestDiff = d;
    }
  }
  return `${best[1]} (${ratio.toFixed(2)})`;
}

/**
 * Сравнивает фактическое соотношение с целевым. Допуск 8% — флористические
 * фото редко имеют идеальные пропорции, главное — не путать landscape с
 * portrait. Возвращает мягкое предупреждение, никогда не блокирует загрузку.
 */
export function checkAspect(
  actualRatio: number,
  target: AspectKey,
  orientation: ImageOrientation,
  tolerance = 0.08
): AspectCheckResult {
  const cfg = TARGET_ASPECTS[target];
  const relativeDiff = Math.abs(actualRatio - cfg.ratio) / cfg.ratio;
  const ok = relativeDiff <= tolerance;
  return {
    ok,
    expected: cfg.label,
    actual: formatRatio(actualRatio),
    actualOrientation: orientation,
    actualRatio,
    message: ok
      ? undefined
      : `Рекомендуемое соотношение сторон — ${cfg.label}, у вашей фотографии — ${formatRatio(actualRatio)}. Изображение будет сохранено, но в некоторых секциях может отображаться с полями.`,
  };
}
