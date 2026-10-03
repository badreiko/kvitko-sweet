// src/lib/flowerPalette.ts
// Палитра цветов цветка: выбирается в /admin/flowers, на сайте по ней
// показывается чешское название цвета (в т.ч. для старых записей на
// русском/украинском).

export interface PaletteColor {
  /** Название, которое сохраняется в цветке (по-чешски, как на сайте). */
  name: string;
  /** Цвет для образца и поля colorHex; null — смешанный. */
  hex: string | null;
  /** Как выглядит образец (для смешанного — градиент). */
  swatch: string;
  /** Другие написания для узнавания уже сохранённых значений. */
  aliases: string[];
}

const solid = (name: string, hex: string, aliases: string[]): PaletteColor => ({ name, hex, swatch: hex, aliases });

export const FLOWER_PALETTE: PaletteColor[] = [
  solid("Bílá", "#FFFFFF", ["белый", "білий", "white"]),
  solid("Krémová", "#F3E9D2", ["кремовый", "кремовий", "cream", "ivory"]),
  solid("Žlutá", "#F6D04D", ["желтый", "жёлтый", "жовтий", "yellow"]),
  solid("Oranžová", "#F39C4A", ["оранжевый", "помаранчевий", "orange"]),
  solid("Broskvová", "#F7B98B", ["персиковый", "персиковий", "peach"]),
  solid("Korálová", "#F27C6B", ["коралловый", "кораловий", "coral"]),
  solid("Světle růžová", "#F8CFDC", ["светло-розовый", "нежно-розовый", "світло-рожевий", "light pink"]),
  solid("Růžová", "#EE8FB0", ["розовый", "рожевий", "pink"]),
  solid("Fuchsiová", "#C2185B", ["фуксия", "малиновый", "fuchsia", "magenta"]),
  solid("Červená", "#D32F2F", ["красный", "червоний", "red"]),
  solid("Bordó", "#7B1F3A", ["бордовый", "бордо", "бордовий", "burgundy"]),
  solid("Fialová", "#8E5BB5", ["фиолетовый", "фіолетовий", "purple", "violet"]),
  solid("Levandulová", "#BFA8E0", ["лавандовый", "лавандовий", "lavender", "lilac", "сиреневый"]),
  solid("Modrá", "#4F7FD8", ["синий", "голубой", "синій", "блакитний", "blue"]),
  solid("Zelená", "#6A9F58", ["зеленый", "зелёный", "зелений", "green"]),
  {
    name: "Vícebarevná",
    hex: null,
    swatch: "conic-gradient(#EE8FB0, #F6D04D, #6A9F58, #4F7FD8, #8E5BB5, #EE8FB0)",
    aliases: ["разноцветный", "микс", "різнокольоровий", "mix", "multicolor"],
  },
];

const key = (s: string) => s.trim().toLocaleLowerCase();

/** Цвет палитры по сохранённому названию (в т.ч. по-русски/по-украински). */
export function findPaletteColor(color?: string): PaletteColor | undefined {
  if (!color?.trim()) return undefined;
  const k = key(color);
  return FLOWER_PALETTE.find((c) => key(c.name) === k || c.aliases.some((a) => key(a) === k));
}

/** CSS-фон образца для сохранённого цвета: свой оттенок, иначе из палитры. */
export function colorSwatchCss(color?: string, colorHex?: string): string | undefined {
  return colorHex || findPaletteColor(color)?.swatch;
}
