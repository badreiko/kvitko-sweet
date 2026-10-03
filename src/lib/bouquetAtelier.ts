import type { HeroThemeId } from '@/firebase/services/settingsService';

/** Цветок, пригодный для мини-конструктора на главной. */
export interface AtelierFlower {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  colorHex?: string;
  color?: string;
}

/** Один стебель в букете (одного цветка может быть несколько стеблей). */
export interface AtelierStem {
  key: string;
  flowerId: string;
}

/** Цвета, на которые ориентируется сезонный букет каждой темы. */
const THEME_COLORS: Record<HeroThemeId, string[]> = {
  default: ['#EE8FB0', '#FFFFFF', '#8E5BB5', '#F8CFDC'],
  spring: ['#F8CFDC', '#EE8FB0', '#8E5BB5', '#FFFFFF'],
  summer: ['#F6D04D', '#F27C6B', '#FFFFFF', '#8E5BB5'],
  autumn: ['#F28C28', '#D32F2F', '#F6D04D', '#F27C6B'],
  winter: ['#FFFFFF', '#D32F2F', '#EE8FB0', '#8E5BB5'],
  halloween: ['#F28C28', '#8E5BB5', '#D32F2F', '#F6D04D'],
  christmas: ['#D32F2F', '#FFFFFF', '#EE8FB0', '#F6D04D'],
};

/** Оттенок по названию цвета — для цветов без colorHex в базе. */
const COLOR_NAME_HEX: Record<string, string> = {
  'oranžová': '#F28C28',
  'červená': '#D32F2F',
  'žlutá': '#F6D04D',
  'růžová': '#EE8FB0',
  'světle růžová': '#F8CFDC',
  'fialová': '#8E5BB5',
  'bílá': '#FFFFFF',
  'korálová': '#F27C6B',
  'vícebarevná': '#E9A0B0',
};

export function flowerHex(flower: Pick<AtelierFlower, 'colorHex' | 'color'>): string | null {
  if (flower.colorHex && /^#[0-9a-f]{6}$/i.test(flower.colorHex)) return flower.colorHex;
  return COLOR_NAME_HEX[(flower.color ?? '').trim().toLowerCase()] ?? null;
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function distance(a: string, b: string): number {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

let stemCounter = 0;
export function makeStem(flowerId: string): AtelierStem {
  stemCounter += 1;
  return { key: `${flowerId}-${stemCounter}`, flowerId };
}

/**
 * Сезонный букет: для каждого цвета темы — ближайший по оттенку цветок
 * (без повторов), затем 7 стеблей в пропорции 3 : 2 : 1 : 1.
 */
export function seasonalBouquet(flowers: AtelierFlower[], theme: HeroThemeId): AtelierStem[] {
  const pool = flowers.filter(flower => flowerHex(flower));
  const picked: AtelierFlower[] = [];
  for (const target of THEME_COLORS[theme] ?? THEME_COLORS.default) {
    const best = pool
      .filter(flower => !picked.includes(flower))
      .sort((a, b) => distance(flowerHex(a)!, target) - distance(flowerHex(b)!, target))[0];
    if (best) picked.push(best);
  }
  if (picked.length === 0) picked.push(...flowers.slice(0, 3));
  const pattern = [0, 1, 0, 2, 1, 3, 0];
  return pattern
    .map(index => picked[index] ?? picked[0])
    .filter(Boolean)
    .map(flower => makeStem(flower.id));
}

/** Случайный букет из 5–8 стеблей 2–4 разных цветов. */
export function randomBouquet(flowers: AtelierFlower[], random = Math.random): AtelierStem[] {
  if (flowers.length === 0) return [];
  const shuffled = [...flowers].sort(() => random() - 0.5);
  const kinds = shuffled.slice(0, Math.min(flowers.length, 2 + Math.floor(random() * 3)));
  const total = 5 + Math.floor(random() * 4);
  return Array.from({ length: total }, (_, index) => makeStem(kinds[index % kinds.length].id));
}

export interface StemPlacement {
  /** Наклон стебля, градусы. */
  rotate: number;
  /** Подъём головки над точкой связки, доля высоты сцены. */
  lift: number;
  /** Масштаб — крайние стебли чуть меньше, центр крупнее. */
  scale: number;
  zIndex: number;
}

/**
 * Раскладка веером: стебли сходятся в одну точку связки, центр выше и
 * крупнее, края ниже. Порядок слотов перемешан «через один», чтобы
 * одинаковые цветы не стояли рядом.
 */
export function fanLayout(count: number): StemPlacement[] {
  if (count === 0) return [];
  const spread = Math.min(78, 13 * (count - 1));
  const slots = Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0 : index / (count - 1) * 2 - 1; // -1..1
    return {
      rotate: t * spread / 2,
      lift: (1 - Math.abs(t)) * 0.07 + (index % 2) * 0.025,
      scale: 1 - Math.abs(t) * 0.12,
      zIndex: 10 + Math.round((1 - Math.abs(t)) * 10) + (index % 2 ? 0 : 1),
    };
  });
  // Слоты «изнутри наружу»: 1-й стебль в центр, следующие попеременно по бокам.
  const order = [...slots.keys()].sort((a, b) => Math.abs(a - (count - 1) / 2) - Math.abs(b - (count - 1) / 2));
  return order.map(slot => slots[slot]);
}

/** Выбор для конструктора: «id:2,id2:1» в порядке первого появления. */
export function encodeStems(stems: AtelierStem[]): string {
  const counts = new Map<string, number>();
  for (const stem of stems) counts.set(stem.flowerId, (counts.get(stem.flowerId) ?? 0) + 1);
  return [...counts].map(([id, quantity]) => `${id}:${quantity}`).join(',');
}

export function decodeStems(value: string | null): { id: string; quantity: number }[] {
  if (!value) return [];
  return value
    .split(',')
    .map(part => {
      const [id, raw] = part.split(':');
      const quantity = Math.min(99, Math.max(1, Math.floor(Number(raw) || 1)));
      return { id: id?.trim() ?? '', quantity };
    })
    .filter(item => /^[A-Za-z0-9_-]{1,64}$/.test(item.id));
}
