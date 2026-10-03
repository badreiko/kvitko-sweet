import type {
  HeroHolidayId,
  HeroHolidayPeriod,
  HeroImageRatio,
  HeroSettings,
  HeroThemeContent,
  HeroThemeId,
  SectionImages,
} from '@/firebase/services/settingsService';

export const HERO_THEME_IDS: HeroThemeId[] = [
  'default', 'spring', 'summer', 'autumn', 'winter', 'halloween', 'christmas',
];

export const HERO_SEASON_IDS = ['spring', 'summer', 'autumn', 'winter'] as const;
export const HERO_HOLIDAY_IDS: HeroHolidayId[] = ['halloween', 'christmas'];

export const HERO_THEME_LABELS: Record<HeroThemeId, string> = {
  default: 'Базовая',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
  winter: 'Зима',
  halloween: 'Хэллоуин',
  christmas: 'Рождество',
};

/** Подсказка, в какой период тема показывается в режиме «По сезону». */
export const HERO_SEASON_HINTS: Record<(typeof HERO_SEASON_IDS)[number], string> = {
  spring: 'март – май',
  summer: 'июнь – август',
  autumn: 'сентябрь – ноябрь',
  winter: 'декабрь – февраль',
};

export const HERO_HOLIDAY_DEFAULTS: Record<HeroHolidayId, HeroHolidayPeriod> = {
  halloween: { enabled: true, start: '10-20', end: '11-01' },
  christmas: { enabled: true, start: '12-01', end: '12-26' },
};

export const HERO_THEME_DEFAULTS: Record<HeroThemeId, HeroThemeContent> = {
  default: {
    eyebrow: 'Květinové studio · Praha',
    title: 'Kytice z ranního trhu,',
    highlight: 'u vás do večera.',
    description: 'Ručně sestavené kytice a květinové dekorace pro každou příležitost. Doručujeme po celé Praze a okolí, obvykle do 90 minut od objednávky.',
    primaryLabel: 'Prohlédnout katalog',
    secondaryLabel: 'nebo vytvořte vlastní kytici',
    imageAlt: 'Květiny Kvitko Sweet',
    imageFit: 'cover',
    imageRatio: 'auto',
    signatureKicker: '',
    signatureTitle: '',
    decorations: false,
    closingLine: 'Vytvoříme / něco / krásného',
  },
  spring: {
    eyebrow: 'JARO V KVITKO SWEET',
    title: 'Jaro v každém květu.',
    highlight: 'Radost v každém dni.',
    description: 'Čerstvé jarní květiny a kytice vázané s citem. Přineste domů barvy nové sezóny.',
    primaryLabel: 'Vybrat jarní kytici',
    secondaryLabel: 'Sestavit vlastní kytici',
    imageAlt: 'Jarní kytice Kvitko Sweet',
    imageFit: 'contain',
    imageRatio: 'auto',
    signatureKicker: 'Sezónní inspirace',
    signatureTitle: 'Jarní probuzení',
    decorations: true,
    closingLine: 'Jaro / rozkvete / u vás',
  },
  summer: {
    eyebrow: 'LÉTO V KVITKO SWEET',
    title: 'Léto plné barev.',
    highlight: 'Květiny plné života.',
    description: 'Lehké letní kytice pro dlouhé dny, oslavy i malé radosti.',
    primaryLabel: 'Vybrat letní kytici',
    secondaryLabel: 'Sestavit vlastní kytici',
    imageAlt: 'Letní kytice Kvitko Sweet',
    imageFit: 'contain',
    imageRatio: 'auto',
    signatureKicker: 'Sezónní inspirace',
    signatureTitle: 'Letní louka',
    decorations: true,
    closingLine: 'Léto / plné / květin',
  },
  autumn: {
    eyebrow: 'PODZIM V KVITKO SWEET',
    title: 'Trocha podzimu.',
    highlight: 'Spousta radosti.',
    description: 'Hřejivé odstíny, čerstvé květiny a kytice vázané s citem. Pro někoho blízkého. Nebo jen tak, pro sebe.',
    primaryLabel: 'Vybrat podzimní kytici',
    secondaryLabel: 'Sestavit vlastní kytici',
    imageAlt: 'Podzimní kytice krémových růží, terakotových jiřin a eukalyptu',
    imageFit: 'contain',
    imageRatio: 'auto',
    signatureKicker: 'Sezónní inspirace',
    signatureTitle: 'Podzimní harmonie',
    decorations: true,
    closingLine: 'Podzim / v každé / kytici',
  },
  winter: {
    eyebrow: 'ZIMA V KVITKO SWEET',
    title: 'Květiny pro zimní dny.',
    highlight: 'Teplo pro vaše blízké.',
    description: 'Ručně vázané zimní kytice, které rozjasní každý den.',
    primaryLabel: 'Vybrat zimní kytici',
    secondaryLabel: 'Sestavit vlastní kytici',
    imageAlt: 'Zimní kytice Kvitko Sweet',
    imageFit: 'contain',
    imageRatio: 'auto',
    signatureKicker: 'Sezónní inspirace',
    signatureTitle: 'Zimní klid',
    decorations: true,
    closingLine: 'Teplo / pro zimní / dny',
  },
  halloween: {
    eyebrow: 'HALLOWEEN V KVITKO SWEET',
    title: 'Podzim s trochou kouzla.',
    highlight: 'Květiny s charakterem.',
    description: 'Výrazné podzimní kytice a dekorace pro sváteční atmosféru.',
    primaryLabel: 'Prohlédnout kytice',
    secondaryLabel: 'Sestavit vlastní kytici',
    imageAlt: 'Halloweenská květinová dekorace Kvitko Sweet',
    imageFit: 'contain',
    imageRatio: 'auto',
    signatureKicker: 'Sváteční edice',
    signatureTitle: 'Kouzelný podzim',
    decorations: true,
    closingLine: 'Trochu / kouzla / do kytice',
  },
  christmas: {
    eyebrow: 'VÁNOCE V KVITKO SWEET',
    title: 'Vánoce začínají květinami.',
    highlight: 'Darujte radost.',
    description: 'Sváteční kytice a dekorace připravené s péčí pro vaše nejbližší.',
    primaryLabel: 'Vybrat vánoční kytici',
    secondaryLabel: 'Sestavit vlastní kytici',
    imageAlt: 'Vánoční kytice Kvitko Sweet',
    imageFit: 'contain',
    imageRatio: 'auto',
    signatureKicker: 'Sváteční edice',
    signatureTitle: 'Vánoční pohoda',
    decorations: true,
    closingLine: 'Vánoce / plné / květin',
  },
};

export const HERO_RATIO_OPTIONS: { value: HeroImageRatio; label: string }[] = [
  { value: 'auto', label: 'Авто — высота по экрану' },
  { value: '1:1', label: '1 : 1 · квадрат' },
  { value: '4:5', label: '4 : 5 · вертикальная' },
  { value: '3:4', label: '3 : 4 · вертикальная' },
  { value: '2:3', label: '2 : 3 · высокая' },
  { value: '4:3', label: '4 : 3 · горизонтальная' },
  { value: '3:2', label: '3 : 2 · горизонтальная' },
  { value: '16:9', label: '16 : 9 · широкая' },
];

/** '4:5' → 0.8 (ширина / высота); 'auto' и неизвестные значения → null. */
export function heroRatioValue(ratio?: string): number | null {
  const match = /^(\d+):(\d+)$/.exec(ratio ?? '');
  if (!match) return null;
  const value = Number(match[1]) / Number(match[2]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Ближайшая предустановленная пропорция к реальной (ширина / высота). */
export function nearestHeroRatio(aspect: number): HeroImageRatio {
  let best: HeroImageRatio = '1:1';
  let bestDiff = Infinity;
  for (const option of HERO_RATIO_OPTIONS) {
    const value = heroRatioValue(option.value);
    if (value === null) continue;
    // Сравнение в логарифме: 2:3 и 3:2 одинаково «далеки» от 1:1.
    const diff = Math.abs(Math.log(value / aspect));
    if (diff < bestDiff) { best = option.value; bestDiff = diff; }
  }
  return best;
}

/** «Podzim / v každé / kytici» → ['Podzim', 'v každé', 'kytici'] (пустые строки отбрасываются). */
export function closingLines(value: string | undefined): string[] {
  const parts = (value ?? '').split('/').map(part => part.trim()).filter(Boolean);
  return parts.length ? parts.slice(0, 4) : ['Vytvoříme', 'něco', 'krásného'];
}

/** Пропорция области картинки темы (ширина / высота); null = авто. */
export function heroRatio(content: Pick<HeroThemeContent, 'imageRatio'>): number | null {
  return heroRatioValue(content.imageRatio);
}

const DAY_MONTH = /^(\d{2})-(\d{2})$/;

/** '10-20' → '20.10' для полей ввода. */
export function formatDayMonth(value: string): string {
  const match = DAY_MONTH.exec(value);
  return match ? `${match[2]}.${match[1]}` : value;
}

/** '20.10' / '20.10.' / '1.11' → '10-20'; null, если дата не существует. */
export function parseDayMonth(input: string): string | null {
  const match = /^\s*(\d{1,2})\s*[./-]\s*(\d{1,2})\s*\.?\s*$/.exec(input);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  // Високосный год, чтобы 29.02 считалось допустимым.
  const probe = new Date(2024, month - 1, day);
  if (month < 1 || month > 12 || probe.getMonth() !== month - 1 || probe.getDate() !== day) return null;
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizePeriod(value: Partial<HeroHolidayPeriod> | undefined, fallback: HeroHolidayPeriod): HeroHolidayPeriod {
  return {
    enabled: value?.enabled ?? fallback.enabled,
    start: value?.start && DAY_MONTH.test(value.start) ? value.start : fallback.start,
    end: value?.end && DAY_MONTH.test(value.end) ? value.end : fallback.end,
  };
}

export function normalizeHeroSettings(value?: Partial<HeroSettings>): HeroSettings {
  const selectedTheme = HERO_THEME_IDS.includes(value?.selectedTheme as HeroThemeId)
    ? value!.selectedTheme!
    : 'default';
  return {
    mode: value?.mode === 'auto' ? 'auto' : 'manual',
    selectedTheme,
    holidaysEnabled: value?.holidaysEnabled ?? false,
    holidays: {
      halloween: normalizePeriod(value?.holidays?.halloween, HERO_HOLIDAY_DEFAULTS.halloween),
      christmas: normalizePeriod(value?.holidays?.christmas, HERO_HOLIDAY_DEFAULTS.christmas),
    },
    themes: value?.themes ?? {},
  };
}

/** Текущая дата в Праге в формате MM-DD. */
export function pragueDayMonth(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Prague', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const month = parts.find(part => part.type === 'month')?.value ?? '01';
  const day = parts.find(part => part.type === 'day')?.value ?? '01';
  return `${month}-${day}`;
}

/** Период включительный; start > end означает переход через Новый год (20.12–06.01). */
export function isInPeriod(dayMonth: string, start: string, end: string): boolean {
  return start <= end
    ? dayMonth >= start && dayMonth <= end
    : dayMonth >= start || dayMonth <= end;
}

export function currentSeason(date: Date): (typeof HERO_SEASON_IDS)[number] {
  const month = Number(pragueDayMonth(date).slice(0, 2));
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function holidayTheme(
  date: Date,
  holidays: Record<HeroHolidayId, HeroHolidayPeriod> = HERO_HOLIDAY_DEFAULTS,
): HeroHolidayId | null {
  const today = pragueDayMonth(date);
  return HERO_HOLIDAY_IDS.find(id => {
    const period = holidays[id];
    return period.enabled && isInPeriod(today, period.start, period.end);
  }) ?? null;
}

export function isHeroThemeReady(settings: HeroSettings, id: HeroThemeId): boolean {
  return Boolean(settings.themes[id]?.desktopImage || settings.themes[id]?.mobileImage);
}

export function resolveHeroTheme(
  value?: Partial<HeroSettings>,
  sectionImages?: SectionImages,
  date = new Date(),
) {
  const settings = normalizeHeroSettings(value);
  const ready = (id: HeroThemeId) => isHeroThemeReady(settings, id);

  let themeId: HeroThemeId = 'default';
  if (settings.mode === 'manual') {
    if (settings.selectedTheme === 'default' || ready(settings.selectedTheme)) {
      themeId = settings.selectedTheme;
    }
  } else {
    const season = currentSeason(date);
    if (ready(season)) themeId = season;
  }
  // Праздник перекрывает и выбранную вручную, и сезонную тему —
  // но только в свой период и только если у него есть изображение.
  const holiday = settings.holidaysEnabled ? holidayTheme(date, settings.holidays) : null;
  if (holiday && ready(holiday)) themeId = holiday;

  const content = { ...HERO_THEME_DEFAULTS[themeId], ...settings.themes[themeId] };
  const legacyImage = sectionImages?.heroSection?.[0];
  return {
    themeId,
    content: {
      ...content,
      // Одна картинка на все экраны; старая mobileImage — только запасной вариант.
      desktopImage: content.desktopImage || content.mobileImage || legacyImage,
    },
  };
}
