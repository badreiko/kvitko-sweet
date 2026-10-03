// src/components/BouquetFlowerCard.tsx
import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import { FramedImage } from "@/components/FramedImage";

interface BouquetFlowerCardProps {
  imageUrl: string;
  name: string;
  /** Короткая надпись над названием (например, цвет). */
  label?: string;
  description?: string;
  price: number;
  /** Кадрирование из /admin/flowers. */
  focalPoint?: { x: number; y: number };
  zoom?: number;
  selected?: boolean;
  /** Управление количеством — внизу карточки. */
  children?: ReactNode;
}

// Сила эффекта (как в утверждённом примере карточки цветка).
const PAPER_TILT_X = 9; // наклон карточки по вертикали, °
const PAPER_TILT_Y = 11; // по горизонтали, °
const FLOWER_TILT_X = 6; // встречный наклон цветка, °
const FLOWER_TILT_Y = 7;
const FLOWER_SHIFT_X = 10; // смещение цветка, px
const FLOWER_SHIFT_Y = 7;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Карточка цветка в конструкторе букета: «бумажная» карточка наклоняется
 * к курсору, вырезанный цветок (PNG/WebP с прозрачностью) — в обратную
 * сторону, приподнимается и выходит за верх карточки. Наклон пишется в
 * CSS-переменные через requestAnimationFrame только у карточки под мышью;
 * стили и состояние покоя — в index.css (.bq-card).
 */
export function BouquetFlowerCard({
  imageUrl,
  name,
  label,
  description,
  price,
  focalPoint,
  zoom,
  selected,
  children,
}: BouquetFlowerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const setTilt = (x: number, y: number) => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rx", `${-y * PAPER_TILT_X}deg`);
    card.style.setProperty("--ry", `${x * PAPER_TILT_Y}deg`);
    card.style.setProperty("--frx", `${y * FLOWER_TILT_X}deg`);
    card.style.setProperty("--fry", `${-x * FLOWER_TILT_Y}deg`);
    card.style.setProperty("--fx", `${-x * FLOWER_SHIFT_X}px`);
    card.style.setProperty("--fy", `${-y * FLOWER_SHIFT_Y}px`);
  };

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onPointerEnter = (e: React.PointerEvent) => {
    // Только мышь: на телефоне касание сразу работает с кнопками
    if (e.pointerType !== "mouse") return;
    cardRef.current?.classList.add("bq-active");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reducedMotion()) return;
    const { clientX, clientY } = e;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const card = cardRef.current;
      if (!card) return;
      const b = card.getBoundingClientRect();
      setTilt(clamp(((clientX - b.left) / b.width) * 2 - 1), clamp(((clientY - b.top) / b.height) * 2 - 1));
    });
  };

  const onPointerLeave = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    cardRef.current?.classList.remove("bq-active");
    setTilt(0, 0);
  };

  return (
    <div
      ref={cardRef}
      className="bq-card group relative hover:z-10"
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className={cn("bq-paper relative rounded-[20px] bg-card overflow-hidden", selected && "ring-2 ring-primary")}>
        <div className="bq-halo absolute inset-x-0 top-0 aspect-square" aria-hidden="true" />
        {/* Место под цветок: сам цветок — отдельный слой поверх карточки */}
        <div className="aspect-square" aria-hidden="true" />
        <div className="relative px-5 pb-5 pt-3 text-card-foreground">
          {label && (
            <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
          )}
          <h3 className="mt-1 font-serif text-xl leading-tight">{name}</h3>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            <span className="shrink-0 font-semibold">{price} Kč</span>
          </div>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>

      <div className="bq-flower absolute inset-x-4 top-3.5 aspect-square pointer-events-none">
        <FramedImage
          src={imageUrl}
          alt={name}
          focalPoint={focalPoint}
          zoom={zoom}
          className="h-full w-full"
          imgClassName="select-none"
        />
      </div>
    </div>
  );
}

export default BouquetFlowerCard;
