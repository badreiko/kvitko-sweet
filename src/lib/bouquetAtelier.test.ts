import { describe, expect, it } from 'vitest';
import { decodeStems, encodeStems, fanLayout, flowerHex, makeStem, randomBouquet, seasonalBouquet, type AtelierFlower } from './bouquetAtelier';

const flower = (id: string, color: string, colorHex?: string): AtelierFlower => ({ id, name: id, price: 50, imageUrl: `${id}.webp`, color, colorHex });

const flowers = [
  flower('lily', 'Oranžová'),
  flower('hypericum', 'Červená', '#D32F2F'),
  flower('solidago', 'Žlutá', '#F6D04D'),
  flower('gerbera', 'Korálová', '#F27C6B'),
  flower('rose', 'Růžová', '#EE8FB0'),
  flower('gypsophila', 'Bílá', '#FFFFFF'),
];

describe('bouquet atelier', () => {
  it('falls back to colour names when hex is missing', () => {
    expect(flowerHex({ color: 'Oranžová' })).toBe('#F28C28');
    expect(flowerHex({ color: 'neznámá' })).toBeNull();
  });

  it('builds a seasonal bouquet from theme colours', () => {
    const ids = new Set(seasonalBouquet(flowers, 'autumn').map(stem => stem.flowerId));
    expect(ids).toEqual(new Set(['lily', 'hypericum', 'solidago', 'gerbera']));
    expect(seasonalBouquet(flowers, 'winter')[0].flowerId).toBe('gypsophila');
    expect(seasonalBouquet(flowers, 'autumn')).toHaveLength(7);
  });

  it('fans stems symmetrically, first stem in the centre', () => {
    const layout = fanLayout(5);
    expect(layout[0].rotate).toBe(0);
    expect(layout.map(place => place.rotate).sort((a, b) => a - b)).toEqual([-26, -13, 0, 13, 26]);
    expect(fanLayout(15).every(place => Math.abs(place.rotate) <= 39)).toBe(true);
    expect(fanLayout(0)).toEqual([]);
  });

  it('round-trips the configurator link and rejects junk ids', () => {
    const stems = [makeStem('rose'), makeStem('lily'), makeStem('rose')];
    expect(encodeStems(stems)).toBe('rose:2,lily:1');
    expect(decodeStems('rose:2,lily:1')).toEqual([{ id: 'rose', quantity: 2 }, { id: 'lily', quantity: 1 }]);
    expect(decodeStems('rose:0,<script>:3,lily:500')).toEqual([{ id: 'rose', quantity: 1 }, { id: 'lily', quantity: 99 }]);
    expect(decodeStems(null)).toEqual([]);
  });

  it('creates a random bouquet of 5–8 stems', () => {
    let seed = 1;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const stems = randomBouquet(flowers, random);
    expect(stems.length).toBeGreaterThanOrEqual(5);
    expect(stems.length).toBeLessThanOrEqual(8);
  });
});
