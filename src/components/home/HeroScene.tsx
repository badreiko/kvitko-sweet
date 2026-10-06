import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { HERO_SCENES, SCENE_HEIGHT, SCENE_WIDTH, type HeroSceneId, type HeroSceneLayer } from '@/lib/heroScenes';
import {
  createLayers, pickLayer, settleLayers, startPulse, stepLayers,
  type AlphaMap, type LayerState, type Pointer,
} from '@/lib/heroScenes/physics';
import { sceneAssetUrl } from '@/lib/heroScenes/assets';

/**
 * Сцена Hero из отдельных слоёв (прототип Halloween-Complete): каждый цветок
 * отдельно отталкивается от курсора или пальца. Обычные <img> вместо Three.js —
 * тот же вид без 600 КБ библиотеки. Цикл анимации крутится только пока что-то
 * движется. Компонент грузится лениво — только когда у темы выбрана сцена.
 */

// Раскладки сцен: src/lib/heroScenes/<id>.json.
const SPEC_FILES = import.meta.glob<HeroSceneLayer[]>('@/lib/heroScenes/*.json', { eager: true, import: 'default' });
const specsOf = (scene: HeroSceneId): HeroSceneLayer[] =>
  Object.entries(SPEC_FILES).find(([path]) => path.endsWith(`/${scene}.json`))?.[1] ?? [];

/** Альфа-карта слоя в уменьшенном виде (96 px) — для попадания курсором по форме цветка. */
function alphaMap(img: HTMLImageElement): AlphaMap {
  const width = 96;
  const height = Math.max(1, Math.round((width * img.naturalHeight) / img.naturalWidth));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const alpha = new Uint8Array(width * height);
  if (context) {
    context.drawImage(img, 0, 0, width, height);
    const data = context.getImageData(0, 0, width, height).data;
    for (let index = 0; index < alpha.length; index++) alpha[index] = data[index * 4 + 3];
  }
  return { width, height, ratio: img.naturalHeight / img.naturalWidth, alpha };
}

interface HeroSceneProps {
  scene: HeroSceneId;
  /** Меняется → по сцене проходит волна (например, при наведении на кнопку). */
  pulse?: number;
  /** В предпросмотре админки сцена не перехватывает касания. */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function HeroScene({ scene, pulse = 0, interactive = true, className = '', style }: HeroSceneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const layersRef = useRef<LayerState[]>([]);
  const mapsRef = useRef<Record<string, AlphaMap>>({});
  const pointerRef = useRef<Pointer>({ x: 0, y: 0, on: false });
  const kickRef = useRef<() => void>(() => {});
  const [loaded, setLoaded] = useState(false);
  const specs = specsOf(scene);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const layers = createLayers(specs);
    layersRef.current = layers;
    let frame = 0;
    let previous = 0;
    let cancelled = false;
    // Сцена в единицах → пиксели: обновляется при изменении размера.
    let scale = stage.clientWidth / SCENE_WIDTH;

    const paint = (layer: LayerState) => {
      const el = imgRefs.current[layer.i];
      if (el) el.style.transform = `translate(-50%,-50%) translate(${(layer.dx * scale).toFixed(2)}px,${(layer.dy * scale).toFixed(2)}px) rotate(${(layer.a + layer.r).toFixed(4)}rad)`;
    };

    const tick = (time: number) => {
      const dt = Math.min((time - previous) / 1000 || 0.016, 0.032);
      previous = time;
      const pointer = pointerRef.current;
      const selected = pickLayer(layers, mapsRef.current, pointer);
      const busy = stepLayers(layers, selected, pointer, dt);
      for (const layer of layers) if (layer.moving) paint(layer);
      frame = busy ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (reduced.matches || cancelled || frame) return;
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    };
    kickRef.current = kick;

    const resize = new ResizeObserver(() => {
      scale = stage.clientWidth / SCENE_WIDTH;
    });
    resize.observe(stage);

    // Все слои показываются разом, когда загружены, — без «выпрыгивания» по одному.
    const assets = [...new Set(specs.map(([asset]) => asset))];
    Promise.all(assets.map(asset => new Promise<void>(resolve => {
      const url = sceneAssetUrl(asset);
      if (!url) { resolve(); return; }
      const img = new Image();
      img.onload = () => {
        try { mapsRef.current[asset] = alphaMap(img); } catch { /* без альфа-карты слой просто не реагирует */ }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    }))).then(() => {
      if (cancelled) return;
      setLoaded(true);
      // Мягкая волна при появлении.
      if (!reduced.matches) { startPulse(layers, 0.45); kick(); }
    });

    const onReducedChange = () => {
      if (!reduced.matches) return;
      cancelAnimationFrame(frame);
      frame = 0;
      settleLayers(layers);
      layers.forEach(paint);
    };
    reduced.addEventListener?.('change', onReducedChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      reduced.removeEventListener?.('change', onReducedChange);
    };
  }, [specs]);

  useEffect(() => {
    if (!pulse || !loaded) return;
    startPulse(layersRef.current, 1);
    kickRef.current();
  }, [pulse, loaded]);

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - box.left) / box.width) * SCENE_WIDTH,
      y: ((event.clientY - box.top) / box.height) * SCENE_HEIGHT,
      on: true,
    };
    kickRef.current();
  };
  const releasePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.type === 'pointerup' && event.pointerType === 'mouse') return;
    pointerRef.current = { ...pointerRef.current, on: false };
    kickRef.current();
  };

  return (
    <div
      ref={stageRef}
      role="img"
      aria-label={HERO_SCENES[scene].ariaLabel}
      className={`hero-scene ${loaded ? 'is-loaded' : ''} ${className}`}
      style={style}
      onPointerMove={interactive ? updatePointer : undefined}
      onPointerDown={interactive ? updatePointer : undefined}
      onPointerLeave={interactive ? releasePointer : undefined}
      onPointerUp={interactive ? releasePointer : undefined}
      onPointerCancel={interactive ? releasePointer : undefined}
    >
      {specs.map(([asset, x, y, w, a, opacity, moving], index) => (
        <img
          key={index}
          ref={el => { imgRefs.current[index] = el; }}
          src={sceneAssetUrl(asset)}
          alt=""
          draggable={false}
          decoding="async"
          className={moving ? 'is-moving' : undefined}
          style={{
            left: `${(x / SCENE_WIDTH) * 100}%`,
            top: `${(y / SCENE_HEIGHT) * 100}%`,
            width: `${(w / SCENE_WIDTH) * 100}%`,
            opacity,
            transform: `translate(-50%,-50%) rotate(${a}rad)`,
          }}
        />
      ))}
    </div>
  );
}
