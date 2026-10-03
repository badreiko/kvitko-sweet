// src/components/admin/FocalPointPicker.tsx
import { useRef, useState } from "react";
import { Move, RotateCcw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FramedImage } from "@/components/FramedImage";
import { cn } from "@/lib/utils";

export interface FocalPoint {
  x: number; // 0..1
  y: number; // 0..1
}

interface FocalPointPickerProps {
  imageUrl: string;
  value?: FocalPoint;
  onChange: (point: FocalPoint | undefined) => void;
  /**
   * Соотношение «окна», в котором фото будет показано на сайте.
   * Используется для рамки кадрирования поверх картинки.
   * Например "4 / 5" для карточек товаров. Если не задано,
   * рамка не показывается — остаётся выбор точки кликом.
   */
  previewAspect?: string;
  /**
   * Масштаб фото в окне (1 — заполнить окно, < 1 — уменьшить с полями,
   * > 1 — приблизить). Если передан onZoomChange, рамку можно менять
   * за углы и показывается ползунок.
   */
  zoom?: number;
  onZoomChange?: (zoom: number | undefined) => void;
  /** Фон полей в превью при уменьшении — как на сайте. */
  previewClassName?: string;
  /** Подпись к превью (где на сайте показывается фото). */
  previewLabel?: string;
  className?: string;
}

// Пропорции области выбора; фото вписывается в неё целиком (object-contain).
const PICKER_RATIO = 4 / 3;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

type Rect = { left: number; top: number; width: number; height: number };
type Corner = "nw" | "ne" | "sw" | "se";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

/** Где внутри области выбора лежит само фото (в % области). */
function imageRectIn(imageRatio: number | null): Rect {
  if (!imageRatio) return { left: 0, top: 0, width: 100, height: 100 };
  if (imageRatio > PICKER_RATIO) {
    const height = (PICKER_RATIO / imageRatio) * 100;
    return { left: 0, top: (100 - height) / 2, width: 100, height };
  }
  const width = (imageRatio / PICKER_RATIO) * 100;
  return { left: (100 - width) / 2, top: 0, width, height: 100 };
}

function parseAspect(aspect?: string): number | null {
  if (!aspect) return null;
  const [w, h] = aspect.split("/").map((p) => Number(p.trim()));
  return w && h ? w / h : null;
}

/** Доли фото, видимые в окне при zoom = 1 (object-cover). */
function coverFractions(imageRatio: number, targetRatio: number) {
  return {
    fw: Math.min(1, targetRatio / imageRatio),
    fh: Math.min(1, imageRatio / targetRatio),
  };
}

/**
 * Какая часть фото (в долях 0..1, может выходить за 0..1 при уменьшении)
 * видна в окне с пропорцией targetRatio — та же математика, что у
 * FramedImage: object-cover + object-position + scale вокруг точки фокуса.
 */
export function visibleWindow(imageRatio: number, targetRatio: number, focal: FocalPoint, zoom: number) {
  const { fw, fh } = coverFractions(imageRatio, targetRatio);
  // Точка фото, которая стоит в окне на месте transform-origin (= focal)
  const ix = (1 - fw) * focal.x + focal.x * fw;
  const iy = (1 - fh) * focal.y + focal.y * fh;
  const w = fw / zoom;
  const h = fh / zoom;
  return { left: ix - focal.x * w, top: iy - focal.y * h, width: w, height: h };
}

/** Масштаб, при котором фото целиком помещается в окно. */
export function fitZoom(imageRatio: number, targetRatio: number) {
  const { fw, fh } = coverFractions(imageRatio, targetRatio);
  return Math.min(fw, fh);
}

/**
 * Обратная задача: рамка задана положением и шириной (в долях фото) →
 * точка фокуса и масштаб. Из visibleWindow: left = focal·(1 − width).
 * Если рамка по оси совпадает с фото (width = 1), положение по этой оси
 * не важно — оставляем прежнее.
 */
export function framingFromWindow(
  imageRatio: number,
  targetRatio: number,
  win: { left: number; top: number; width: number },
  prev: FocalPoint
): { focal: FocalPoint; zoom: number } {
  const { fw, fh } = coverFractions(imageRatio, targetRatio);
  const zoom = clampZoom(fw / win.width);
  const width = fw / zoom;
  const height = fh / zoom;
  const axis = (start: number, size: number, fallback: number) =>
    Math.abs(1 - size) < 1e-4 ? fallback : clamp01(start / (1 - size));
  return {
    focal: { x: axis(win.left, width, prev.x), y: axis(win.top, height, prev.y) },
    zoom,
  };
}

/** Рамка после перетаскивания угла (противоположный угол неподвижен). */
export function resizeWindow(
  start: { left: number; top: number; width: number; height: number },
  corner: Corner,
  pointer: { x: number; y: number }
) {
  const ratio = start.height / start.width;
  const anchorX = corner.includes("w") ? start.left + start.width : start.left;
  const anchorY = corner.includes("n") ? start.top + start.height : start.top;
  const fromX = corner.includes("e") ? pointer.x - anchorX : anchorX - pointer.x;
  const fromY = (corner.includes("s") ? pointer.y - anchorY : anchorY - pointer.y) / ratio;
  const width = Math.max(fromX, fromY, 0.05);
  const height = width * ratio;
  return {
    left: corner.includes("w") ? anchorX - width : anchorX,
    top: corner.includes("n") ? anchorY - height : anchorY,
    width,
  };
}

type Drag = {
  mode: "move" | "resize";
  corner?: Corner;
  pointer: { x: number; y: number };
  win: { left: number; top: number; width: number; height: number };
};

const CORNERS: { id: Corner; className: string; cursor: string }[] = [
  { id: "nw", className: "-left-1.5 -top-1.5", cursor: "nwse-resize" },
  { id: "ne", className: "-right-1.5 -top-1.5", cursor: "nesw-resize" },
  { id: "sw", className: "-left-1.5 -bottom-1.5", cursor: "nesw-resize" },
  { id: "se", className: "-right-1.5 -bottom-1.5", cursor: "nwse-resize" },
];

/**
 * Кадрирование фото для окна на сайте. Если задан previewAspect, поверх фото
 * показывается рамка — то, что увидит покупатель: её можно перетаскивать
 * (положение) и тянуть за углы (размер = масштаб, если передан
 * onZoomChange). Клик мимо рамки ставит туда точку фокуса. Результат
 * хранится как точка фокуса {x, y} (0..1) и масштаб — их рисует FramedImage.
 */
export function FocalPointPicker({
  imageUrl,
  value,
  onChange,
  previewAspect,
  zoom,
  onZoomChange,
  previewClassName = "bg-white",
  previewLabel = "Так фото будет выглядеть на сайте",
  className = "",
}: FocalPointPickerProps) {
  // Слой с фото, рамкой и маркером; при уменьшении фото он сам уменьшается
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  // Масштаб слоя замораживается на время перетаскивания, чтобы рамка не «уезжала» из-под курсора
  const [frozenScale, setFrozenScale] = useState<number | null>(null);

  const imgRect = imageRectIn(imageRatio);
  const targetRatio = parseAspect(previewAspect);
  const currentZoom = zoom ?? 1;
  const resizable = !!onZoomChange;

  // Точка для отображения: либо выбранная, либо по умолчанию центр.
  const display = value ?? { x: 0.5, y: 0.5 };
  const changed = !!value || (zoom !== undefined && zoom !== 1);

  const win = targetRatio && imageRatio ? visibleWindow(imageRatio, targetRatio, display, currentZoom) : null;
  const frame: Rect | null = win && {
    left: imgRect.left + win.left * imgRect.width,
    top: imgRect.top + win.top * imgRect.height,
    width: win.width * imgRect.width,
    height: win.height * imgRect.height,
  };

  // При уменьшении рамка (окно сайта) больше фото и выходит за область
  // выбора — уменьшаем весь слой, чтобы рамка оставалась видна целиком.
  let stageScale = 1;
  if (frame) {
    const reachX = Math.max(Math.abs(frame.left - 50), Math.abs(frame.left + frame.width - 50));
    const reachY = Math.max(Math.abs(frame.top - 50), Math.abs(frame.top + frame.height - 50));
    // 0.95 — постоянный отступ, чтобы уголки рамки не обрезались краем области
    stageScale = Math.min(0.95, 47 / reachX, 47 / reachY);
  }
  const appliedScale = frozenScale ?? stageScale;

  /** Координаты указателя в долях фото (getBoundingClientRect учитывает scale слоя). */
  const toImage = (clientX: number, clientY: number) => {
    const rect = stageRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    return { x: (px - imgRect.left) / imgRect.width, y: (py - imgRect.top) / imgRect.height };
  };

  const apply = (next: { left: number; top: number; width: number }) => {
    if (!imageRatio || !targetRatio) return;
    const { focal, zoom: z } = framingFromWindow(imageRatio, targetRatio, next, display);
    onChange({ x: Number(focal.x.toFixed(4)), y: Number(focal.y.toFixed(4)) });
    if (onZoomChange) {
      const rounded = Number(z.toFixed(2));
      onZoomChange(rounded === 1 ? undefined : rounded);
    }
  };

  const startDrag = (e: React.PointerEvent, mode: Drag["mode"], corner?: Corner) => {
    if (!win || !stageRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { mode, corner, pointer: toImage(e.clientX, e.clientY), win };
    setFrozenScale(stageScale);
  };

  const onDragMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toImage(e.clientX, e.clientY);
    if (drag.mode === "move") {
      apply({
        left: drag.win.left + (p.x - drag.pointer.x),
        top: drag.win.top + (p.y - drag.pointer.y),
        width: drag.win.width,
      });
    } else if (drag.corner) {
      apply(resizeWindow(drag.win, drag.corner, p));
    }
  };

  const endDrag = () => {
    dragRef.current = null;
    setFrozenScale(null);
  };

  // Клик мимо рамки (или без рамки) — поставить туда точку фокуса
  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (!stageRef.current) return;
    const p = toImage(e.clientX, e.clientY);
    onChange({ x: clamp01(p.x), y: clamp01(p.y) });
  };

  // Клавиатура: стрелки двигают, +/− меняют размер рамки
  const onFrameKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      onChange({ x: clamp01(display.x + dx), y: clamp01(display.y + dy) });
    } else if (onZoomChange && (e.key === "+" || e.key === "=" || e.key === "-")) {
      e.preventDefault();
      // «+» — рамка меньше (приблизить), «−» — рамка больше (уменьшить фото)
      const z = clampZoom(currentZoom + (e.key === "-" ? -0.05 : 0.05));
      onZoomChange(Number(z.toFixed(2)) === 1 ? undefined : Number(z.toFixed(2)));
    }
  };

  const fitWhole = () => {
    if (!imageRatio || !targetRatio) return;
    onChange(undefined);
    onZoomChange?.(Number(fitZoom(imageRatio, targetRatio).toFixed(2)));
  };

  const reset = () => {
    onChange(undefined);
    onZoomChange?.(undefined);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className="relative w-full overflow-hidden rounded-lg border border-border cursor-crosshair select-none bg-muted/30 touch-none"
        style={{ aspectRatio: "4 / 3" }}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={stageRef}
          className={cn("absolute inset-0", frozenScale === null && "transition-transform duration-200")}
          style={appliedScale < 1 ? { transform: `scale(${appliedScale})` } : undefined}
        >
          <img
            src={imageUrl}
            alt="Фото для кадрирования"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
            onLoad={(e) => {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
              if (w && h) setImageRatio(w / h);
            }}
          />

          {/* Рамка: какая часть фото попадёт в окно на сайте. Тянется и меняет размер. */}
          {frame && (
            <div
              role="slider"
              tabIndex={0}
              aria-label="Рамка кадрирования: перетащите или используйте стрелки; плюс и минус меняют размер"
              aria-valuetext={`Положение ${Math.round(display.x * 100)}% × ${Math.round(display.y * 100)}%, масштаб ${Math.round(currentZoom * 100)}%`}
              className="absolute cursor-move rounded-sm border-2 border-dashed border-white outline-none ring-1 ring-primary/70 focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                left: `${frame.left}%`,
                top: `${frame.top}%`,
                width: `${frame.width}%`,
                height: `${frame.height}%`,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              }}
              onPointerDown={(e) => startDrag(e, "move")}
              onKeyDown={onFrameKeyDown}
            >
              {/* Сетка третей — помогает выстроить композицию */}
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute inset-y-0 left-1/3 w-px bg-white" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white" />
              </div>
              {resizable &&
                CORNERS.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "absolute h-3.5 w-3.5 rounded-sm border-2 border-primary bg-white shadow",
                      c.className
                    )}
                    style={{ cursor: c.cursor }}
                    onPointerDown={(e) => startDrag(e, "resize", c.id)}
                  />
                ))}
            </div>
          )}

          {/* Без рамки — маркер точки фокуса */}
          {!frame && (
            <div
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${imgRect.left + display.x * imgRect.width}%`,
                top: `${imgRect.top + display.y * imgRect.height}%`,
              }}
            >
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <div className="absolute inset-1 rounded-full bg-primary border-2 border-white shadow-lg" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground inline-flex items-center gap-1">
          <Move className="h-3 w-3 shrink-0" />
          {frame
            ? resizable
              ? "Перетащите рамку и потяните за углы, чтобы выбрать кадр"
              : "Перетащите рамку, чтобы выбрать кадр"
            : "Кликните на изображение, чтобы выбрать точку фокуса (по умолчанию — центр)"}
        </span>
        {changed && (
          <Button type="button" variant="ghost" size="sm" onClick={reset} className="h-7 shrink-0 px-2 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" /> Сбросить
          </Button>
        )}
      </div>

      {onZoomChange && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Масштаб: <span className="font-mono tabular-nums text-foreground">{Math.round(currentZoom * 100)}%</span>
              {currentZoom < 1 && " — фото меньше окна, по краям поля"}
            </span>
            {targetRatio && imageRatio && (
              <Button type="button" variant="ghost" size="sm" onClick={fitWhole} className="h-7 px-2 text-xs">
                <Maximize2 className="h-3 w-3 mr-1" /> Вместить целиком
              </Button>
            )}
          </div>
          <Slider
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.05}
            value={[currentZoom]}
            onValueChange={([z]) => onZoomChange(z === 1 ? undefined : z)}
            aria-label="Масштаб фото"
          />
        </div>
      )}

      {/* Превью тем же компонентом, что и на сайте */}
      {previewAspect && (
        <div className="flex items-center gap-3 pt-1">
          <FramedImage
            src={imageUrl}
            alt={previewLabel}
            focalPoint={value}
            zoom={currentZoom}
            loading="eager"
            className={`w-28 shrink-0 rounded-md border border-border ${previewClassName}`}
            style={{ aspectRatio: previewAspect }}
          />
          <p className="text-xs text-muted-foreground">
            {previewLabel}
            <span className="block">окно {previewAspect.replace(/\s/g, "")}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default FocalPointPicker;
