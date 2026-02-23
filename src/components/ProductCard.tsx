// src/components/ProductCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug?: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    featured?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group block h-full flex flex-col"
    >
      <Card className="overflow-hidden border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full rounded-[24px] flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

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
            <p className="font-semibold text-lg">{product.price} Kč</p>
            {/* Minimalistic "+" icon string or arrow can be added here if needed, but price is enough */}
            <span className="text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 flex items-center gap-1">
              Detail <span className="text-lg leading-none">&rarr;</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
