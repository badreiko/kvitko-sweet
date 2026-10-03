import { describe, expect, it } from 'vitest';
import { categoryBento } from './categoryBento';

/** Раскладывает плитки по сетке 4×N так же, как CSS grid (auto-flow dense) и считает пустые ячейки. */
function emptyCells(count: number): number {
  const grid: boolean[][] = [];
  const fits = (r: number, c: number, w: number, h: number) => {
    for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (x > 3 || grid[y]?.[x]) return false;
    return true;
  };
  for (const [w, h] of categoryBento(count)) {
    let placed = false;
    for (let r = 0; !placed; r++) {
      for (let c = 0; c < 4 && !placed; c++) {
        if (fits(r, c, w, h)) {
          for (let y = r; y < r + h; y++) { grid[y] ??= []; for (let x = c; x < c + w; x++) grid[y][x] = true; }
          placed = true;
        }
      }
    }
  }
  return grid.reduce((sum, row) => sum + [0, 1, 2, 3].filter(x => !row[x]).length, 0);
}

describe('category bento', () => {
  it('returns one span per category', () => {
    for (let n = 0; n <= 14; n++) expect(categoryBento(n)).toHaveLength(n);
  });

  it('never leaves an empty cell', () => {
    for (let n = 1; n <= 14; n++) expect(emptyCells(n), `${n} categories`).toBe(0);
  });
});
