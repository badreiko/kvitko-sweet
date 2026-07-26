// src/components/admin/FocalPointPicker.tsx
import { useRef } from "react";
import { Crosshair, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
   * Используется для рамки-предпросмотра кропа поверх картинки.
   * Например "4 / 5" для карточек товаров. Если не задано,
   * рамка не показывается.
   */
  previewAspect?: string;
  className?: string;
}

/**
 * Позволяет администратору кликом выбрать точку на изображении,
 * которая должна остаться по центру при кропе через `object-cover`.
 * Сохраняется как нормализованные координаты {x, y} в диапазоне 0..1.
 */
export function FocalPointPicker({
  imageUrl,
  value,
  onChange,
  previewAspect,
  className = "",
}: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onChange({
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    });
  };

  const reset = () => onChange(undefined);

  // Точка для отображения: либо выбранная, либо по умолчанию центр.
  const display = value ?? { x: 0.5, y: 0.5 };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative w-full overflow-hidden rounded-lg border border-border cursor-crosshair select-none"
        style={{ aspectRatio: "4 / 3" }}
        role="button"
        tabIndex={0}
        aria-label="Кликните, чтобы указать точку фокуса на изображении"
      >
        <img
          src={imageUrl}
          alt="Предпросмотр для выбора точки фокуса"
          className="w-full h-full object-contain bg-muted/30 pointer-events-none"
          draggable={false}
        />

        {previewAspect && (
          <PreviewFrame focal={display} previewAspect={previewAspect} />
        )}

        {/* Маркер фокусной точки */}
        <div
          className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${display.x * 100}%`,
            top: `${display.y * 100}%`,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <div className="absolute inset-1 rounded-full bg-primary border-2 border-white shadow-lg" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground inline-flex items-center gap-1">
          <Crosshair className="h-3 w-3" />
          {value
            ? `Точка фокуса: ${(value.x * 100).toFixed(0)}% × ${(value.y * 100).toFixed(0)}%`
            : "Кликните на изображение, чтобы выбрать точку фокуса (по умолчанию — центр)"}
        </span>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-7 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Сбросить
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Рамка, показывающая какую часть изображения увидит посетитель сайта
 * при заданной фокусной точке. Имитирует object-cover с object-position.
 *
 * Контейнер picker имеет соотношение 4:3 (containerRatio = 1.333).
 * Рамка должна иметь визуальное соотношение targetRatio.
 *
 * Чтобы (frameWidthPct·W) / (frameHeightPct·H) = targetRatio,
 * нужно: frameHeightPct = frameWidthPct · containerRatio / targetRatio.
 * Если получается >100%, фитим по высоте.
 */
function PreviewFrame({
  focal,
  previewAspect,
}: {
  focal: FocalPoint;
  previewAspect: string;
}) {
  const [w, h] = previewAspect.split("/").map((p) => Number(p.trim()));
  const targetRatio = w && h ? w / h : 1;
  const containerRatio = 4 / 3;

  // Стартуем с фита по ширине 80% контейнера.
  let frameWidthPct = 80;
  let frameHeightPct = (frameWidthPct * containerRatio) / targetRatio;

  // Если рамка не помещается по высоте — фитим по высоте 90%.
  if (frameHeightPct > 90) {
    frameHeightPct = 90;
    frameWidthPct = (frameHeightPct * targetRatio) / containerRatio;
  }

  const halfW = frameWidthPct / 2;
  const halfH = frameHeightPct / 2;

  let left = focal.x * 100 - halfW;
  let top = focal.y * 100 - halfH;
  left = Math.max(0, Math.min(100 - frameWidthPct, left));
  top = Math.max(0, Math.min(100 - frameHeightPct, top));

  return (
    <div
      className="absolute border-2 border-primary/70 border-dashed pointer-events-none rounded-sm"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${frameWidthPct}%`,
        height: `${frameHeightPct}%`,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
      }}
    />
  );
}

export default FocalPointPicker;
