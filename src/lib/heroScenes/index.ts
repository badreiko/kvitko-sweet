/**
 * Анимированные сцены Hero — альтернатива одной картинке темы.
 * Слои сцены лежат в ./<id>.json: [слой, x, y, ширина, угол (рад), прозрачность, реагирует на курсор].
 * Координаты — в «единицах сцены»: 1000 × 562.5 (16:9), x/y — центр слоя.
 * Картинки слоёв: src/assets/hero-scenes/<слой>.webp (scripts/build-hero-scene-assets.py).
 */

export type HeroSceneId = 'witch-hat' | 'autumn-cascade';

export type HeroSceneLayer = [asset: string, x: number, y: number, w: number, angle: number, opacity: number, moving: boolean];

export const SCENE_WIDTH = 1000;
export const SCENE_HEIGHT = 562.5;

export interface HeroSceneMeta {
  label: string;
  hint: string;
  ariaLabel: string;
  /**
   * Какую часть сцены показывать на телефоне (от–до в единицах сцены):
   * левая часть на компьютере уходит под текст, на телефоне текст стоит
   * над сценой, и пустые края не нужны.
   */
  mobileCrop: { x: [number, number]; y: [number, number] };
  /** Слой-акцент для финальной секции главной (вместо букета темы). */
  accent: string;
}

export const HERO_SCENES: Record<HeroSceneId, HeroSceneMeta> = {
  'witch-hat': {
    label: 'Ведьмина шляпа',
    hint: 'Шляпа с осенним каскадом, тыква, летучие мыши',
    ariaLabel: 'Sametový čarodějnický klobouk s podzimními květinami a dýní',
    mobileCrop: { x: [250, 1000], y: [0, SCENE_HEIGHT] },
    accent: 'pumpkin',
  },
  'autumn-cascade': {
    label: 'Осенняя композиция',
    hint: 'Пышный букет на мху с тыквами и летящими лепестками, без шляпы',
    ariaLabel: 'Podzimní aranžmá z lilií, jiřin, růží a dýní na mechu',
    mobileCrop: { x: [200, 1000], y: [95, SCENE_HEIGHT] },
    accent: 'pumpkin',
  },
};

export const HERO_SCENE_IDS = Object.keys(HERO_SCENES) as HeroSceneId[];

/**
 * Размеры для обрезки на телефоне: пропорция рамки и положение сцены
 * внутри неё в процентах рамки.
 */
export function mobileCropBox(scene: HeroSceneId) {
  const { x: [x0, x1], y: [y0, y1] } = HERO_SCENES[scene].mobileCrop;
  const width = x1 - x0;
  const height = y1 - y0;
  return {
    ratio: width / height,
    left: `${(-x0 / width) * 100}%`,
    top: `${(-y0 / height) * 100}%`,
    width: `${(SCENE_WIDTH / width) * 100}%`,
    height: `${(SCENE_HEIGHT / height) * 100}%`,
  };
}

export function isHeroSceneId(value: unknown): value is HeroSceneId {
  return typeof value === 'string' && value in HERO_SCENES;
}
