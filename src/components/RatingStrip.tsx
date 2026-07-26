// src/components/RatingStrip.tsx
import { Star } from "lucide-react";
import { Testimonial } from "@/firebase/services/testimonialService";

interface Aggregate {
  average: number;
  count: number;
}

/**
 * Считает средний рейтинг и количество отзывов.
 * Работает по массиву testimonials — можно передать уже загруженный
 * список из Home.tsx, не делая дополнительного запроса.
 */
export function computeRatingAggregate(testimonials: Testimonial[]): Aggregate {
  if (testimonials.length === 0) return { average: 0, count: 0 };
  const total = testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
  return {
    average: total / testimonials.length,
    count: testimonials.length,
  };
}

interface RatingStripProps {
  testimonials: Testimonial[];
  /** Компактный размер (для hero) vs полный (для секции testimonials) */
  variant?: "compact" | "full";
  className?: string;
}

/**
 * Универсальная строка соц-доказательства:
 *   ⭐ 4.9 / 5  ·  187 recenzí
 *
 * Если отзывов < 3 — ничего не рендерим, чтобы не выглядеть жалко.
 * Три отзыва — минимум, ниже которого агрегат вводит в заблуждение
 * (один пятизвёздочный друг = «5/5 (1 recenze)», это выглядит фейково).
 */
export function RatingStrip({ testimonials, variant = "compact", className = "" }: RatingStripProps) {
  const { average, count } = computeRatingAggregate(testimonials);

  if (count < 3) return null;

  const displayAvg = average.toFixed(1).replace(".", ",");
  const isCompact = variant === "compact";

  return (
    <div
      className={`inline-flex items-center gap-2 ${
        // Compact поднят на 1 ступень: раньше text-xs md:text-sm терялся
        // рядом с hero-description text-base md:text-lg. Теперь одна
        // ступень разрыва — читается как social-proof, а не petite.
        isCompact
          ? "text-sm md:text-base text-muted-foreground"
          : "text-sm md:text-base text-foreground"
      } ${className}`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${isCompact ? "h-4 w-4" : "h-5 w-5"} ${
              i <= Math.round(average)
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className={isCompact ? "" : "font-semibold"}>
        <span className={isCompact ? "font-semibold text-foreground" : "text-primary text-lg md:text-xl"}>
          {displayAvg}
        </span>
        <span className="text-muted-foreground"> / 5</span>
      </span>
      <span className="text-muted-foreground/60">·</span>
      <span className="text-muted-foreground">
        {count} {czechReviewsSuffix(count)}
      </span>
    </div>
  );
}

// Чешская плюрализация: 1 recenze / 2-4 recenze / 5+ recenzí.
function czechReviewsSuffix(n: number): string {
  if (n === 1) return "recenze";
  if (n >= 2 && n <= 4) return "recenze";
  return "recenzí";
}

export default RatingStrip;
