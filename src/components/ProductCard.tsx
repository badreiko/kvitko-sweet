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
      className="group"
    >
      <Card className="overflow-hidden border-border card-hover h-full">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground">
                Oblíbené
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <p className="font-semibold">{product.price} Kč</p>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
            >
              Do košíku
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
