// src/pages/Product.tsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useCartContext } from '@/hooks/use-cart';
import Layout from "@/components/layout/Layout";
import products from '@/data/products';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  
  // Находим продукт по ID
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <h1 className="text-2xl font-bold">Produkt nebyl nalezen</h1>
          <p className="mt-4">Omlouváme se, ale požadovaný produkt neexistuje.</p>
        </div>
      </Layout>
    );
  }
  
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
  };
  
  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold mb-6">{product.price} Kč</p>
            <p className="text-muted-foreground mb-8">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="mx-4 min-w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
              >
                Přidat do košíku
              </Button>
            </div>
            
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-2">Detaily produktu</h3>
              <p className="text-muted-foreground">
                Kategorie: {product.category === 'bouquets' ? 'Kytice' : 
                           product.category === 'plants' ? 'Pokojové rostliny' : 
                           product.category === 'wedding' ? 'Svatební květiny' : 
                           product.category === 'gifts' ? 'Dárky' : product.category}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
