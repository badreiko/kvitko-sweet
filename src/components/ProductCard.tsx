// src/components/ProductCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { SmartImage } from "@/components/SmartImage";
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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

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

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group block h-full flex flex-col"
    >
      <Card className="overflow-hidden border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full rounded-[24px] flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
          <SmartImage
            src={product.imageUrl}
            alt={product.name}
            fillParent
            initialOrientation={product.imageOrientation}
            focalPoint={product.imageFocalPoint}
            contentBg="bg-muted/20"
            wrapperClassName="absolute inset-0"
            className="transition-transform duration-700 ease-out group-hover:scale-110"
          />

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
            <div className="absolute top-4 right-4 z-20">
              <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-md shadow-sm border-none px-3 py-1">
                Oblíbené
              </Badge>
            </div>
          )}

          {/* Темный градиент снизу при наведении для читабельности */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

          {/* Reveal-on-hover Button */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20 flex gap-2">
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

        <CardContent className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-transparent to-black/[0.01]">
          <h3 className="font-serif font-bold text-xl mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/40">
            {/* Цена + опциональная перечёркнутая старая цена, если задана
                discountPrice. discountPrice = «было», price = «стало». */}
            <div className="flex items-baseline gap-2">
              <p className="font-semibold text-lg">{product.price} Kč</p>
              {product.discountPrice && product.discountPrice > product.price && (
                <p className="text-sm text-muted-foreground line-through">
                  {product.discountPrice} Kč
                </p>
              )}
            </div>
            <span className="text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 flex items-center gap-1">
              Detail <span className="text-lg leading-none">&rarr;</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
