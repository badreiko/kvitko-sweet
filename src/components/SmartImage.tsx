// src/components/SmartImage.tsx
import { useState, ImgHTMLAttributes, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type ImageOrientation = "portrait" | "landscape" | "square" | "unknown";

export interface FocalPoint {
  x: number; // 0..1
  y: number; // 0..1
}

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad"> {
  src: string;
  alt: string;
  /**
   * Aspect ratios chosen per detected orientation. Pass any CSS aspect-ratio
   * value (e.g. "4 / 5", "16 / 9"). If a slot is omitted, the container
   * keeps the previously rendered aspect — useful when the parent already
   * imposes its own height (e.g. a bento tile with `auto-rows-[...]`).
   */
  portraitAspect?: string;
  landscapeAspect?: string;
  squareAspect?: string;
  /**
   * When the parent imposes height (e.g. `h-full` inside a grid row),
   * set `fillParent` and SmartImage will use `object-contain` with a soft
   * background instead of cropping. Keeps the entire flower in frame.
   */
  fillParent?: boolean;
  /** Background colour visible around `object-contain` images. */
  contentBg?: string;
  /** Wrapper class — applied to the surrounding <div>, not the <img>. */
  wrapperClassName?: string;
  /**
   * Orientation already known (e.g. read from Firestore at save time).
   * When provided, SmartImage skips the onLoad sniff and renders the
   * correct aspect-ratio on the first paint — no layout jump.
   */
  initialOrientation?: ImageOrientation;
  /**
   * Точка фокуса для object-cover. Если не задана — используется центр.
   * Координаты нормализованы (0..1).
   */
  focalPoint?: FocalPoint;
}

/**
 * Drop-in <img> that picks its own aspect-ratio from the loaded image's
 * intrinsic dimensions, so portrait and landscape uploads coexist without
 * being cropped. Falls back to `object-cover` once a target aspect is
 * chosen — the container always matches the image's orientation, so
 * `object-cover` no longer needs to crop.
 *
 * If `fillParent` is set, the parent dictates height and SmartImage
 * switches to `object-contain` to avoid any crop at all.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  portraitAspect = "4 / 5",
  landscapeAspect = "16 / 10",
  squareAspect = "1 / 1",
  fillParent = false,
  contentBg = "bg-muted/30",
  style,
  initialOrientation,
  focalPoint,
  loading: loadingProp,
  decoding: decodingProp,
  // React 18.2 ждёт lowercase `fetchpriority` как DOM-атрибут, но
  // TypeScript-типы описывают camelCase `fetchPriority`. Ловим здесь,
  // передаём в HTML как lowercase — иначе React варнит на каждой
  // hero-картинке.
  fetchPriority,
  ...imgProps
}: SmartImageProps) {
  const [orientation, setOrientation] = useState<ImageOrientation>(
    initialOrientation ?? "unknown"
  );

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Если ориентация уже известна из Firestore — не пересчитываем.
    if (initialOrientation) return;
    const img = e.currentTarget;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;
    const ratio = w / h;
    if (ratio > 1.1) setOrientation("landscape");
    else if (ratio < 0.9) setOrientation("portrait");
    else setOrientation("square");
  };

  const aspectFor = (o: ImageOrientation): string | undefined => {
    if (o === "portrait") return portraitAspect;
    if (o === "landscape") return landscapeAspect;
    if (o === "square") return squareAspect;
    // Пока ориентация неизвестна (старая запись в Firestore без поля,
    // ещё не сработал onLoad), выбираем landscape как placeholder, чтобы
    // контейнер не схлопнулся до 0px. Любой из портрет/ландшафт/квадрат
    // подходит — берём первый существующий.
    return landscapeAspect || portraitAspect || squareAspect;
  };

  const wrapperStyle: CSSProperties = { ...style };
  if (!fillParent) {
    const aspect = aspectFor(orientation);
    if (aspect) wrapperStyle.aspectRatio = aspect;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        !fillParent && contentBg,
        wrapperClassName
      )}
      style={wrapperStyle}
    >
      <img
        {...imgProps}
        {...(fetchPriority ? ({ fetchpriority: fetchPriority } as Record<string, string>) : {})}
        src={src}
        alt={alt}
        // По умолчанию ленивая загрузка + async-decode, чтобы не блокировать
        // главный поток. Hero/above-the-fold картинки могут передать
        // loading="eager" явно.
        loading={loadingProp ?? "lazy"}
        decoding={decodingProp ?? "async"}
        onLoad={handleLoad}
        style={
          focalPoint
            ? { objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%` }
            : undefined
        }
        className={cn(
          "w-full h-full",
          // Если задана фокусная точка, админ явно указал, какую часть
          // оставить в кадре → используем object-cover даже в fillParent.
          focalPoint ? "object-cover" : fillParent ? "object-contain" : "object-cover",
          className
        )}
      />
    </div>
  );
}

export default SmartImage;
