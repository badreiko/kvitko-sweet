// src/components/ProductCard.tsx
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { SmartImage } from "@/components/SmartImage";
import { DepthImage } from "@/components/DepthImage";
import type { ProductDepthEffect } from "@/firebase/services/productService";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug?: string;
    description: string;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    imageOrientation?: "portrait" | "landscape" | "square";
    imageFocalPoint?: { x: number; y: number };
    category: string;
    featured?: boolean;
    isBestseller?: boolean;
    isNew?: boolean;
    stockQuantity?: number;
    depthEffect?: ProductDepthEffect;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
      toast.success(`${product.name} přidán do košíku`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Nepodařilo se přidat do košíku');
    }
  };

  const depth = product.depthEffect;
  const hasDepth = !!(depth?.enabled && depth.foregroundUrl);

  // Обычное фото — и для товаров без слоёв, и как запасной вариант,
  // если слои эффекта объёма не загрузились.
  const plainImage = (
    <div className="absolute inset-0 overflow-hidden rounded-t-[24px] bg-muted/20">
      <SmartImage
        src={product.imageUrl}
        alt={product.name}
        fillParent
        initialOrientation={product.imageOrientation}
        // Фото всегда заполняет рамку 4:5 (раньше квадратные фото вписывались
        // целиком и под ними оставалась пустая полоса — названия «прыгали»).
        // Какую часть кадра оставить, задаёт фокусная точка в админке.
        focalPoint={product.imageFocalPoint ?? { x: 0.5, y: 0.5 }}
        contentBg="bg-muted/20"
        wrapperClassName="absolute inset-0"
        className="transition-transform duration-700 ease-out group-hover:scale-110"
      />
    </div>
  );

  return (
    <Link
      ref={linkRef}
      to={`/product/${product.slug || product.id}`}
      className="group relative block h-full flex flex-col rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Без overflow-hidden на карточке: товар с эффектом объёма выступает
          за верх и бока фото. Обрезку по скруглению делают слои внутри. */}
      <Card className="border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full rounded-[24px] flex flex-col">
        <div className="relative aspect-[4/5]">
          {hasDepth && depth?.foregroundUrl ? (
            <DepthImage
              foregroundUrl={depth.foregroundUrl}
              backgroundUrl={depth.backgroundUrl}
              backgroundColor={depth.backgroundColor}
              alt={product.name}
              focalPoint={product.imageFocalPoint}
              fgScale={depth.fgScale}
              fgOffsetX={depth.fgOffsetX}
              fgOffsetY={depth.fgOffsetY}
              hoverTargetRef={linkRef}
              radius="24px 24px 0 0"
              fallback={plainImage}
            />
          ) : (
            plainImage
          )}

          {/* Trust-badges сверху-слева: Bestseller / Nový / Poslední kusy.
              Максимум 2 бейджа одновременно — иначе визуальный шум. */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
            {product.isBestseller && (
              <Badge className="bg-primary text-primary-foreground border-none px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide shadow-md">
                Bestseller
              </Badge>
            )}
            {product.isNew && !product.isBestseller && (
              <Badge className="bg-secondary text-secondary-foreground border-none px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide shadow-md">
                Novinka
              </Badge>
            )}
            {typeof product.stockQuantity === 'number' && product.stockQuantity > 0 && product.stockQuantity <= 3 && (
              <Badge className="bg-orange-500 text-white border-none px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide shadow-md animate-pulse">
                Poslední {product.stockQuantity} {product.stockQuantity === 1 ? 'kus' : 'kusy'}
              </Badge>
            )}
          </div>

          {/* Featured сверху-справа (совместимо со старым дизайном) */}
          {product.featured && (
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
              <Badge className="bg-white/90 text-season-accent hover:bg-white backdrop-blur-md shadow-sm border-none px-2.5 py-0.5 md:px-3 md:py-1 text-[11px] md:text-xs">
                Oblíbené
              </Badge>
            </div>
          )}

          {/* Градиент и кнопка обрезаны по области фото: спрятанная кнопка
              (translate-y-4) не должна заходить на текст карточки. */}
          <div className="absolute inset-0 z-10 overflow-hidden rounded-t-[24px] pointer-events-none">
            {/* Темный градиент снизу при наведении для читабельности */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Reveal-on-hover Button */}
            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex gap-2 pointer-events-auto">
              <Button
                className="w-full bg-white/95 text-primary hover:bg-primary hover:text-white backdrop-blur-md shadow-xl border-none transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
              >
                Do košíku
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-3.5 md:p-5 flex flex-col flex-1 relative rounded-b-[24px] bg-gradient-to-b from-transparent to-black/[0.01]">
          <h3 className="font-serif font-bold text-base md:text-xl leading-snug mb-1 group-hover:text-season-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex justify-between items-center gap-2 mt-auto pt-2 border-t border-border/40">
            {/* Цена + опциональная перечёркнутая старая цена, если задана
                discountPrice. discountPrice = «было», price = «стало». */}
            <div className="flex items-baseline gap-2">
              <p className="font-semibold text-base md:text-lg whitespace-nowrap">{product.price} Kč</p>
              {product.discountPrice && product.discountPrice > product.price && (
                <p className="text-xs md:text-sm text-muted-foreground line-through whitespace-nowrap">
                  {product.discountPrice} Kč
                </p>
              )}
            </div>
            {/* Только для мыши: на телефоне невидимая надпись занимала место и цена переносилась. */}
            <span className="hidden md:flex text-sm font-medium text-season-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 items-center gap-1">
              Detail <span className="text-lg leading-none">&rarr;</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
