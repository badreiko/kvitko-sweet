/**
 * Раскладка плиток категорий в сетке из 4 колонок без пустых ячеек.
 *
 * Первая категория — крупная (2×2), остальные заполняют правую половину
 * и следующие ряды. Возвращает [колонки, ряды] для каждой плитки.
 *
 *   1: [4×1]                       — одна широкая плитка
 *   2: [2×1][2×1]
 *   3: [2×2] + [2×1][2×1]          — справа две широкие друг под другом
 *   4: [2×2] + [2×1] + [1×1][1×1]
 *   5: [2×2] + 4×[1×1]
 *   6+: как 5, дальше ряды по 4; неполный последний ряд растягивается.
 */
export type BentoSpan = [cols: 1 | 2 | 4, rows: 1 | 2];

export function categoryBento(count: number): BentoSpan[] {
  if (count <= 0) return [];
  if (count === 1) return [[4, 1]];
  if (count === 2) return [[2, 1], [2, 1]];
  if (count === 3) return [[2, 2], [2, 1], [2, 1]];
  if (count === 4) return [[2, 2], [2, 1], [1, 1], [1, 1]];

  const spans: BentoSpan[] = [[2, 2], [1, 1], [1, 1], [1, 1], [1, 1]];
  const rest = count - 5;
  const fullRows = Math.floor(rest / 4);
  for (let i = 0; i < fullRows * 4; i++) spans.push([1, 1]);
  const tail = rest % 4;
  if (tail === 1) spans.push([4, 1]);
  if (tail === 2) spans.push([2, 1], [2, 1]);
  if (tail === 3) spans.push([2, 1], [1, 1], [1, 1]);
  return spans;
}

/** Tailwind-классы для span (полные строки, чтобы JIT их увидел). */
export const BENTO_COL_CLASS: Record<1 | 2 | 4, string> = { 1: 'col-span-1', 2: 'col-span-2', 4: 'col-span-4' };
export const BENTO_ROW_CLASS: Record<1 | 2, string> = { 1: 'row-span-1', 2: 'row-span-2' };
