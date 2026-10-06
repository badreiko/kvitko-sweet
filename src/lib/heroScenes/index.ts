/**
 * Анимированные сцены Hero — альтернатива одной картинке темы.
 * Раскладка сцены — ./<id>.json: { view, layers }.
 *   layers: [слой, x, y, ширина, угол (рад), прозрачность, реагирует на курсор],
 *           x/y — центр слоя в «единицах сцены» (исходный холст прототипа 1000 × 562.5).
 *   view:   [x0, y0, x1, y1] — границы всего видимого в сцене (считает
 *           scripts/build-hero-scene-assets.py). Сцена показывается ровно в
 *           этом кадре: ничего не обрезается, композиция только масштабируется.
 * Картинки слоёв: src/assets/hero-scenes/<слой>.webp.
 */

export type HeroSceneId = 'witch-hat' | 'autumn-cascade';

export type HeroSceneLayer = [asset: string, x: number, y: number, w: number, angle: number, opacity: number, moving: boolean];

export interface HeroSceneData {
  view: [x0: number, y0: number, x1: number, y1: number];
  layers: HeroSceneLayer[];
}

const SCENE_FILES = import.meta.glob<HeroSceneData>('./*.json', { eager: true, import: 'default' });

export function sceneData(scene: HeroSceneId): HeroSceneData {
  return Object.entries(SCENE_FILES).find(([path]) => path.endsWith(`/${scene}.json`))?.[1]
    ?? { view: [0, 0, 1000, 562.5], layers: [] };
}

/** Пропорция кадра сцены (ширина / высота). */
export function sceneRatio(scene: HeroSceneId): number {
  const [x0, y0, x1, y1] = sceneData(scene).view;
  return (x1 - x0) / (y1 - y0);
}

export interface HeroSceneMeta {
  label: string;
  hint: string;
  ariaLabel: string;
  /** Слой-акцент для финальной секции главной (вместо букета темы). */
  accent: string;
}

export const HERO_SCENES: Record<HeroSceneId, HeroSceneMeta> = {
  'witch-hat': {
    label: 'Ведьмина шляпа',
    hint: 'Шляпа с осенним каскадом, тыква, летучие мыши',
    ariaLabel: 'Sametový čarodějnický klobouk s podzimními květinami a dýní',
    accent: 'pumpkin',
  },
  'autumn-cascade': {
    label: 'Осенняя композиция',
    hint: 'Пышный букет на мху с тыквами и летящими лепестками, без шляпы',
    ariaLabel: 'Podzimní aranžmá z lilií, jiřin, růží a dýní na mechu',
    accent: 'pumpkin',
  },
};

export const HERO_SCENE_IDS = Object.keys(HERO_SCENES) as HeroSceneId[];

export function isHeroSceneId(value: unknown): value is HeroSceneId {
  return typeof value === 'string' && value in HERO_SCENES;
}
