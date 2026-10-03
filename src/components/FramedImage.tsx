// src/components/FramedImage.tsx
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface FramedImageProps {
  src: string;
  alt: string;
  /** Точка фокуса (0..1): какая часть фото остаётся в кадре при обрезке. */
  focalPoint?: { x: number; y: number };
  /**
   * Масштаб относительно «заполнить кадр» (object-cover): 1 — без изменений,
   * < 1 — уменьшить (фото целиком с полями), > 1 — приблизить.
   */
  zoom?: number;
  /** Классы рамки: размер/пропорции, скругление, фон полей при zoom < 1. */
  className?: string;
  /** Классы самой картинки (например, hover-эффекты). */
  imgClassName?: string;
  /** Стиль рамки (например, aspectRatio). */
  style?: CSSProperties;
  loading?: "lazy" | "eager";
}

/**
 * Фото в рамке с точкой фокуса и масштабом, заданными в админке.
 * Тот же компонент рисует превью в FocalPointPicker — поэтому админ видит
 * ровно то, что увидит покупатель.
 */
export function FramedImage({
  src,
  alt,
  focalPoint,
  zoom = 1,
  className,
  imgClassName,
  style,
  loading = "lazy",
}: FramedImageProps) {
  const position = focalPoint
    ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
    : "50% 50%";

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      {/* Масштаб — на обёртке: transform самой картинки остаётся свободным
          для hover-эффектов вроде group-hover:scale-105. */}
      <div
        className="absolute inset-0"
        style={zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: position } : undefined}
      >
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          className={cn("w-full h-full object-cover", imgClassName)}
          style={{ objectPosition: position }}
        />
      </div>
    </div>
  );
}

export default FramedImage;
