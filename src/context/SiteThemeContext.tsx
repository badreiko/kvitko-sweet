import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getSiteSettings,
  isFallbackSettings,
  type HeroSettings,
  type HeroThemeId,
  type SiteSettings,
} from '@/firebase/services/settingsService';
import { resolveHeroTheme } from '@/lib/heroTheme';

/**
 * Сезонная/праздничная тема всего сайта.
 *
 * Настройки сайта загружаются один раз; выбранная тема записывается в
 * <html data-theme-palette="autumn">, а цвета темы доступны любой секции
 * через CSS-переменные --theme-* (см. index.css).
 */

const CACHE_KEY = 'kvitko:hero-settings:v1';

interface ThemeCache {
  heroSettings?: HeroSettings;
  heroSection: string[];
}

function readCache(): ThemeCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ThemeCache) : null;
  } catch {
    return null;
  }
}

function writeCache(value: ThemeCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Приватный режим / заблокированное хранилище — просто без кэша.
  }
}

interface SiteThemeValue {
  /** Настройки сайта после загрузки; null — ещё грузятся. */
  settings: SiteSettings | null;
  /** Тема решена (из кэша или из базы) — можно рисовать без мигания. */
  ready: boolean;
  themeId: HeroThemeId;
  hero: ReturnType<typeof resolveHeroTheme>;
  /** Перечитать настройки (например, после сохранения в админке). */
  refresh: () => Promise<void>;
}

const SiteThemeContext = createContext<SiteThemeValue | null>(null);

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [cache] = useState(readCache);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | undefined>(cache?.heroSettings);
  const [legacyImages, setLegacyImages] = useState<string[]>(cache?.heroSection ?? []);
  const [ready, setReady] = useState(cache !== null);

  const refresh = useCallback(async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
      // Firestore недоступен — оставляем тему из кэша, а не откатываемся на базовую.
      if (isFallbackSettings(data) && readCache()) return;
      const heroSection = data.sectionImages?.heroSection ?? [];
      setHeroSettings(data.heroSettings);
      setLegacyImages(heroSection);
      writeCache({ heroSettings: data.heroSettings, heroSection });
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const hero = useMemo(
    () => resolveHeroTheme(heroSettings, { heroSection: legacyImages }),
    [heroSettings, legacyImages],
  );

  // До отрисовки, чтобы секции не мелькали цветами базовой темы.
  useLayoutEffect(() => {
    document.documentElement.dataset.themePalette = hero.themeId;
  }, [hero.themeId]);

  const value = useMemo<SiteThemeValue>(
    () => ({ settings, ready, themeId: hero.themeId, hero, refresh }),
    [settings, ready, hero, refresh],
  );

  return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>;
}

export function useSiteTheme(): SiteThemeValue {
  const value = useContext(SiteThemeContext);
  if (!value) throw new Error('useSiteTheme должен использоваться внутри SiteThemeProvider');
  return value;
}
