import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { HERO_SCENE_IDS, type HeroSceneLayer } from './index';
import { createLayers, hitLayer, pickLayer, startPulse, stepLayers, type AlphaMap } from './physics';

// Квадратная картинка 4×4: непрозрачна только левая половина.
const halfMap: AlphaMap = {
  width: 4, height: 4, ratio: 1,
  alpha: Uint8Array.from([255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0]),
};

const run = (layers: ReturnType<typeof createLayers>, pointer = { x: 0, y: 0, on: false }, maps = {}) => {
  let frames = 0;
  while (frames < 2000) {
    frames++;
    if (!stepLayers(layers, pickLayer(layers, maps, pointer), pointer, 0.016)) break;
  }
  return frames;
};

describe('hero scene physics', () => {
  it('hits only opaque pixels of moving layers', () => {
    const [flower, still] = createLayers([['rose', 500, 300, 100, 0, 1, true], ['hat', 500, 300, 100, 0, 1, false]]);
    expect(hitLayer(flower, halfMap, 470, 300)).toBe(true);
    expect(hitLayer(flower, halfMap, 530, 300)).toBe(false);
    expect(hitLayer(flower, halfMap, 700, 300)).toBe(false);
    expect(hitLayer(still, halfMap, 470, 300)).toBe(false);
  });

  it('pushes the flower away from the pointer and settles back', () => {
    const layers = createLayers([['rose', 500, 300, 100, 0, 1, true]]);
    const pointer = { x: 480, y: 300, on: true };
    for (let i = 0; i < 60; i++) stepLayers(layers, pickLayer(layers, { rose: halfMap }, pointer), pointer, 0.016);
    expect(layers[0].dx).toBeGreaterThan(1);
    pointer.on = false;
    expect(run(layers, pointer, { rose: halfMap })).toBeLessThan(2000);
    expect(Math.abs(layers[0].dx)).toBeLessThan(0.05);
  });

  it('stops the animation loop after a pulse fades out', () => {
    const layers = createLayers([['rose', 500, 300, 100, 0, 1, true], ['lily', 600, 300, 100, 0, 1, true]]);
    expect(stepLayers(layers, null, { x: 0, y: 0, on: false }, 0.016)).toBe(false);
    startPulse(layers, 0.5);
    const frames = run(layers);
    expect(frames).toBeGreaterThan(30);
    expect(frames).toBeLessThan(2000);
    expect(layers.every(layer => layer.pulse === 0)).toBe(true);
  });

  it('every scene references existing layer images', () => {
    const assets = new Set(readdirSync(join(__dirname, '../../assets/hero-scenes')).map(file => file.replace(/\.webp$/, '')));
    for (const id of HERO_SCENE_IDS) {
      const specs = JSON.parse(readFileSync(join(__dirname, `${id}.json`), 'utf-8')) as HeroSceneLayer[];
      expect(specs.length).toBeGreaterThan(10);
      for (const [asset] of specs) expect(assets.has(asset), `${id}: ${asset}`).toBe(true);
    }
  });
});
