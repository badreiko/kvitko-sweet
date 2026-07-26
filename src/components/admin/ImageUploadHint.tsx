// src/components/admin/ImageUploadHint.tsx
import { Info } from "lucide-react";
import { TARGET_ASPECTS, AspectKey } from "@/utils/aspectRatio";

interface ImageUploadHintProps {
  target: AspectKey;
  /** Дополнительный текст под основной подсказкой. */
  note?: string;
  className?: string;
}

const ORIENTATION_LABEL: Record<string, string> = {
  portrait: "вертикальная",
  landscape: "горизонтальная",
  square: "квадратная",
};

/**
 * Информационный блок над полем загрузки изображения в админ-панели.
 * Показывает рекомендуемые пропорции, размер и ориентацию для секции,
 * чтобы фото правильно отобразились на сайте после загрузки.
 */
export function ImageUploadHint({ target, note, className = "" }: ImageUploadHintProps) {
  const spec = TARGET_ASPECTS[target] || TARGET_ASPECTS.generic;

  return (
    <div
      className={`flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm ${className}`}
    >
      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="space-y-1 text-foreground/80">
        <p className="font-medium text-foreground">
          Рекомендуемые параметры изображения
        </p>
        <ul className="space-y-0.5">
          <li>
            <span className="text-muted-foreground">Соотношение сторон:</span>{" "}
            <span className="font-semibold">{spec.label}</span>
          </li>
          <li>
            <span className="text-muted-foreground">Ориентация:</span>{" "}
            <span className="font-semibold">
              {ORIENTATION_LABEL[spec.orientation] || spec.orientation}
            </span>
          </li>
          <li>
            <span className="text-muted-foreground">Рекомендуемый размер:</span>{" "}
            <span className="font-semibold">{spec.recommendedSize}</span>
          </li>
          <li>
            <span className="text-muted-foreground">Использование:</span> {spec.usage}
          </li>
        </ul>
        {note && <p className="text-xs text-muted-foreground pt-1">{note}</p>}
        <p className="text-xs text-muted-foreground pt-1">
          Если ваше изображение не соответствует рекомендуемой пропорции,
          вы можете указать точку, которая должна остаться в кадре —
          фотография будет обрезана вокруг этой точки.
        </p>
      </div>
    </div>
  );
}

export default ImageUploadHint;
