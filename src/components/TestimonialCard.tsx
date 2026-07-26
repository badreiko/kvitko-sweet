// src/components/TestimonialCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck } from "lucide-react";

interface TestimonialCardProps {
  testimonial: {
    id: string;
    name: string;
    comment: string;
    rating: number;
    imageUrl?: string;
    orderNumber?: string;
    productImageUrl?: string;
    productName?: string;
  };
}

/**
 * Карточка отзыва в бегущей карусели.
 *
 * Улучшения над старой версией:
 *  - Verified-бейдж «Ověřená objednávka #KS-…» — сильно бустит доверие.
 *  - Мини-превью фото товара под текстом отзыва — клиент видит что
 *    именно человек купил (соц-доказательство ×2).
 *  - Компактнее (мельче padding), чтобы больше отзывов в кадре.
 */
export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="border border-border/40 bg-background shadow-sm w-[280px] md:w-[340px] shrink-0">
      <CardContent className="p-6 flex flex-col gap-4">
        {/* Header: рейтинг + verified бейдж */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < testimonial.rating
                    ? "text-primary fill-primary"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          {testimonial.orderNumber && (
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-semibold uppercase tracking-wider gap-1 px-2 py-0.5">
              <ShieldCheck className="h-3 w-3" />
              Ověřeno
            </Badge>
          )}
        </div>

        {/* Комментарий */}
        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-5">
          «{testimonial.comment}»
        </p>

        {/* Product preview (если есть) */}
        {testimonial.productImageUrl && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border/30">
            <img
              src={testimonial.productImageUrl}
              alt={testimonial.productName || "Продукт"}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Objednáno</p>
              <p className="text-sm font-medium truncate">
                {testimonial.productName || "Kytice"}
              </p>
            </div>
          </div>
        )}

        {/* Автор */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border/40">
          {testimonial.imageUrl && (
            <img
              src={testimonial.imageUrl}
              alt={testimonial.name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{testimonial.name}</p>
            {testimonial.orderNumber && (
              <p className="text-xs text-muted-foreground truncate">
                Objednávka #{testimonial.orderNumber}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
