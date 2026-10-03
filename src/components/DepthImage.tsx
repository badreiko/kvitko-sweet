// src/components/DepthImage.tsx
import { useEffect, useRef, useState, CSSProperties, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";
import { DEPTH_EFFECT } from "@/config/depthEffect";

interface DepthImageProps {
  /** Товар без фона (WebP/PNG с прозрачностью) в том же кадре, что и фон. */
  foregroundUrl: string;
  /** Фон с восстановленным местом под товаром. Без него используется backgroundColor. */
  backgroundUrl?: string;
  /** CSS-цвет или градиент фона. */
  backgroundColor?: string;
  alt: string;
  /** Точка фокуса для object-cover (0..1), общая для обоих слоёв. */
  focalPoint?: { x: number; y: number };
  /** Индивидуальная коррекция слоя товара: масштаб и смещение в % области фото. */
  fgScale?: number;
  fgOffsetX?: number;
  fgOffsetY?: number;
  /** Обычное фото — показывается, если слои не загрузились. */
  fallback: ReactNode;
  /**
   * Элемент, наведение на который включает эффект (например, вся карточка).
   * По умолчанию — сама область фото. Наклон всегда считается от центра фото.
   */
  hoverTargetRef?: RefObject<HTMLElement>;
  /**
   * Скругление области фото (CSS border-radius, например "24px 24px 0 0").
   * В покое по нему обрезаются оба слоя, при наведении товар выступает.
   */
  radius?: string;
  className?: string;
  loading?: "lazy" | "eager";
}

type LoadState = { key: string; fg: boolean; bg: boolean; error: boolean };

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Фото товара из двух слоёв: при наведении мышью фон наклоняется в сторону
 * курсора, а товар — в противоположную, увеличивается и выступает за верхний
 * и боковые края фото. Положение слоёв обновляется через requestAnimationFrame
 * только у активной карточки; плавность даёт CSS-transition на transform.
 *
 * Касания, prefers-reduced-motion и отсутствие слоёв → статичное изображение.
 * Состояние фокуса с клавиатуры (`.group:focus-visible`) и reduced-motion
 * описаны в index.css (классы depth-*).
 */
export function DepthImage({
  foregroundUrl,
  backgroundUrl,
  backgroundColor,
  alt,
  focalPoint,
  fgScale = 1,
  fgOffsetX = 0,
  fgOffsetY = 0,
  fallback,
  hoverTargetRef,
  radius = "0px",
  className,
  loading = "lazy",
}: DepthImageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

  // Состояние загрузки привязано к паре URL: при замене слоя (предпросмотр
  // в админке) оно сбрасывается без отдельного эффекта.
  const key = `${foregroundUrl}|${backgroundUrl ?? ""}`;
  const fresh: LoadState = { key, fg: false, bg: false, error: false };
  const [loadState, setLoadState] = useState<LoadState>(fresh);
  const current = loadState.key === key ? loadState : fresh;
  const ready = current.fg && (!backgroundUrl || current.bg);

  const markLoaded = (layer: "fg" | "bg") =>
    setLoadState((prev) => ({ ...(prev.key === key ? prev : fresh), [layer]: true }));
  const markError = () => setLoadState({ ...fresh, error: true });

  useEffect(() => {
    const stage = stageRef.current;
    const target = hoverTargetRef?.current ?? stage;
    if (!stage || !target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const c = DEPTH_EFFECT;
    let raf = 0;
    let active = false;
    let pointerX = 0;
    let pointerY = 0;

    const apply = () => {
      raf = 0;
      const bg = bgRef.current;
      const fg = fgRef.current;
      if (!active || !fg) return;
      // Прямоугольник читаем раз в кадр: он мог сдвинуться при прокрутке.
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = clamp(((pointerX - rect.left) / rect.width) * 2 - 1);
      const ny = clamp(((pointerY - rect.top) / rect.height) * 2 - 1);

      // Однотонный фон наклонять бессмысленно — слоя bg тогда нет.
      if (bg) {
        bg.style.transform =
          `rotateX(${(-ny * c.bgTiltDeg).toFixed(2)}deg) ` +
          `rotateY(${(nx * c.bgTiltDeg).toFixed(2)}deg) scale(${c.bgScale})`;
      }
      fg.style.transform =
        `translate3d(${(nx * c.fgOffsetPx).toFixed(1)}px, ` +
        `${(ny * c.fgOffsetPx - c.fgLiftPx).toFixed(1)}px, 0) ` +
        `rotateX(${(ny * c.fgTiltDeg).toFixed(2)}deg) ` +
        `rotateY(${(-nx * c.fgTiltDeg).toFixed(2)}deg) scale(${c.fgScale})`;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const reset = () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      delete stage.dataset.active;
      // Пустой inline-transform → CSS возвращает слои в покой (или в
      // мягкое состояние фокуса) с длительностью returnMs.
      if (bgRef.current) bgRef.current.style.transform = "";
      if (fgRef.current) fgRef.current.style.transform = "";
    };

    const onEnter = (e: PointerEvent) => {
      // Только мышь: на тач-устройствах касание сразу открывает товар.
      if (e.pointerType !== "mouse" || reducedMotion.matches) return;
      active = true;
      stage.dataset.active = "";
      pointerX = e.clientX;
      pointerY = e.clientY;
      schedule();
    };

    const onMove = (e: PointerEvent) => {
      if (!active) {
        onEnter(e);
        return;
      }
      pointerX = e.clientX;
      pointerY = e.clientY;
      schedule();
    };

    target.addEventListener("pointerenter", onEnter);
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerleave", reset);
    return () => {
      target.removeEventListener("pointerenter", onEnter);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [hoverTargetRef]);

  if (current.error) return <>{fallback}</>;

  const c = DEPTH_EFFECT;
  const fit = backgroundUrl ? "object-cover" : "object-contain";
  const objectPosition =
    backgroundUrl && focalPoint ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%` : undefined;
  const imgStyle: CSSProperties = { objectPosition };
  const stageStyle = {
    "--depth-enter": `${c.enterMs}ms`,
    "--depth-return": `${c.returnMs}ms`,
    "--depth-shadow-opacity": c.shadowOpacity,
    "--depth-overflow": `${c.maxOverflowPx}px`,
    "--depth-radius": radius,
  } as CSSProperties;
  const layerVisibility = cn("transition-opacity duration-300", ready ? "opacity-100" : "opacity-0");

  return (
    <div ref={stageRef} className={cn("depth-stage absolute inset-0", className)} style={stageStyle}>
      {/* Фон: обрезается по скруглению области фото */}
      <div
        className="absolute inset-0 overflow-hidden bg-muted/20"
        style={{
          perspective: `${c.perspectivePx}px`,
          borderRadius: radius,
          background: backgroundColor || undefined,
        }}
      >
        {backgroundUrl && (
          <div ref={bgRef} className="depth-bg absolute inset-0">
            <img
              src={backgroundUrl}
              alt=""
              aria-hidden="true"
              loading={loading}
              decoding="async"
              draggable={false}
              onLoad={() => markLoaded("bg")}
              onError={markError}
              className={cn("absolute inset-0 w-full h-full", fit, layerVisibility)}
              style={imgStyle}
            />
          </div>
        )}
      </div>

      {/* Товар: в покое обрезан по фото, при наведении выступает на
          maxOverflowPx вверх и в стороны, но не вниз — там текст и цена
          (clip-path в index.css, .depth-fg-clip). */}
      <div
        className="depth-fg-clip absolute inset-0 pointer-events-none"
        style={{ perspective: `${c.perspectivePx}px` }}
      >
        <div ref={fgRef} className="depth-fg absolute inset-0" style={{ transformOrigin: "50% 100%" }}>
          <div
            className={cn("absolute inset-0", layerVisibility)}
            style={{ transform: `translate(${fgOffsetX}%, ${fgOffsetY}%) scale(${fgScale})` }}
          >
            <img
              src={foregroundUrl}
              alt=""
              aria-hidden="true"
              loading={loading}
              decoding="async"
              draggable={false}
              className={cn("depth-shadow absolute inset-0 w-full h-full", fit)}
              style={imgStyle}
            />
            <img
              src={foregroundUrl}
              alt={alt}
              loading={loading}
              decoding="async"
              draggable={false}
              onLoad={() => markLoaded("fg")}
              onError={markError}
              className={cn("absolute inset-0 w-full h-full", fit)}
              style={imgStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepthImage;
