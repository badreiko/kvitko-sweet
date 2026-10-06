import type { HeroSceneLayer } from './index';

/**
 * Физика слоёв сцены — перенесена из прототипа Halloween-Complete без изменения
 * коэффициентов: цветок под курсором отталкивается, соседи в радиусе 250
 * единиц слегка вздрагивают, всё возвращается на место пружиной.
 */

export interface LayerState {
  i: number;
  asset: string;
  x: number;
  y: number;
  w: number;
  a: number;
  opacity: number;
  moving: boolean;
  dx: number;
  dy: number;
  r: number;
  vx: number;
  vy: number;
  vr: number;
  /** Остаток «волны» в секундах (0 — нет). */
  pulse: number;
  /** Сила волны: 1 — как кнопка в прототипе, меньше — мягкое появление. */
  amp: number;
}

export interface AlphaMap {
  width: number;
  height: number;
  /** Высота / ширина картинки слоя. */
  ratio: number;
  alpha: Uint8Array;
}

export interface Pointer {
  x: number;
  y: number;
  on: boolean;
}

export function createLayers(specs: HeroSceneLayer[]): LayerState[] {
  return specs.map(([asset, x, y, w, a, opacity = 1, moving = true], i) => ({
    i, asset, x, y, w, a, opacity, moving,
    dx: 0, dy: 0, r: 0, vx: 0, vy: 0, vr: 0, pulse: 0, amp: 1,
  }));
}

/** Непрозрачна ли точка (x, y) сцены у этого слоя — с учётом его сдвига и поворота. */
export function hitLayer(layer: LayerState, map: AlphaMap | undefined, x: number, y: number): boolean {
  if (!map || !layer.moving) return false;
  const angle = layer.a + layer.r;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const px = x - layer.x - layer.dx;
  const py = y - layer.y - layer.dy;
  const u = (px * cos + py * sin) / layer.w + 0.5;
  const v = (-px * sin + py * cos) / (layer.w * map.ratio) + 0.5;
  if (u < 0 || u >= 1 || v < 0 || v >= 1) return false;
  return map.alpha[Math.floor(v * map.height) * map.width + Math.floor(u * map.width)] > 60;
}

/** Самый верхний подвижный слой под указателем. */
export function pickLayer(layers: LayerState[], maps: Record<string, AlphaMap>, pointer: Pointer): LayerState | null {
  if (!pointer.on) return null;
  for (let index = layers.length - 1; index >= 0; index--) {
    if (hitLayer(layers[index], maps[layers[index].asset], pointer.x, pointer.y)) return layers[index];
  }
  return null;
}

/** Запускает волну по всей сцене (слои вступают по очереди). */
export function startPulse(layers: LayerState[], amp = 1): void {
  for (const layer of layers) {
    layer.pulse = 1 + layer.i * 0.03;
    layer.amp = amp;
  }
}

const REST = 0.02;

/**
 * Один шаг симуляции. Возвращает true, пока что-то движется —
 * когда всё успокоилось, цикл анимации можно остановить.
 */
export function stepLayers(layers: LayerState[], selected: LayerState | null, pointer: Pointer, dt: number): boolean {
  let busy = false;
  const damp = Math.exp(-12 * dt);
  for (const layer of layers) {
    if (!layer.moving) continue;
    let tx = 0;
    let ty = 0;
    let tr = 0;
    if (selected) {
      const dist = Math.hypot(layer.x - selected.x, layer.y - selected.y);
      const force = layer === selected ? 1 : Math.max(0, 1 - dist / 250) * 0.22;
      const reach = Math.max(50, Math.hypot(layer.x - pointer.x, layer.y - pointer.y));
      tx = ((layer.x - pointer.x) / reach) * 18 * force;
      ty = ((layer.y - pointer.y) / reach) * 18 * force;
      tr = tx * 0.005;
    }
    if (layer.pulse > 0) {
      layer.pulse = Math.max(0, layer.pulse - dt);
      const wave = Math.sin(layer.pulse * 7 + layer.i * 0.7) * layer.amp;
      ty += wave * 12;
      tr += wave * 0.045;
      busy = true;
    }
    layer.vx += (tx - layer.dx) * 110 * dt;
    layer.vy += (ty - layer.dy) * 110 * dt;
    layer.vr += (tr - layer.r) * 110 * dt;
    layer.vx *= damp;
    layer.vy *= damp;
    layer.vr *= damp;
    layer.dx += layer.vx * dt;
    layer.dy += layer.vy * dt;
    layer.r += layer.vr * dt;
    if (Math.abs(layer.dx - tx) > REST || Math.abs(layer.dy - ty) > REST || Math.abs(layer.vx) > REST || Math.abs(layer.vy) > REST || Math.abs(layer.r - tr) > 0.0005) {
      busy = true;
    }
  }
  return busy;
}

/** Сбрасывает все смещения — при остановке и для «уменьшения движения». */
export function settleLayers(layers: LayerState[]): void {
  for (const layer of layers) {
    layer.dx = layer.dy = layer.r = layer.vx = layer.vy = layer.vr = layer.pulse = 0;
  }
}
