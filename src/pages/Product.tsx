// src/pages/Product.tsx
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext';
import Layout from "@/components/layout/Layout";
import { getProductById, Product as ProductType } from '@/firebase/services/productService';
import { Loader2 } from "lucide-react";

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка продукта из Firebase по ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID produktu chybí');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
        } else {
          setError('Produkt nebyl nalezen');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Nastala chyba při načítání produktu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Отображение загрузки
  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Načítání produktu...</p>
        </div>
      </Layout>
    );
  }
  
  // Отображение ошибки
  if (error || !product) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <h1 className="text-2xl font-bold">Produkt nebyl nalezen</h1>
          <p className="mt-4 text-muted-foreground">{error || 'Omlouváme se, ale požadovaný produkt neexistuje.'}</p>
          <Button variant="outline" className="mt-6" asChild>
            <Link to="/catalog">Zpět do katalogu</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
  };
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(price);
  };

  // Преобразование категории в читаемый формат
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'bouquets': return 'Kytice';
      case 'plants': return 'Pokojové rostliny';
      case 'wedding': return 'Svatební květiny';
      case 'gifts': return 'Dárky';
      default: return category;
    }
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted/20">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">Obrázek není k dispozici</p>
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-2xl font-semibold">
                {product.discountPrice ? formatPrice(product.discountPrice) : formatPrice(product.price)}
              </p>
              {product.discountPrice && (
                <p className="text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
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
                disabled={!product.inStock}
              >
                {product.inStock ? 'Přidat do košíku' : 'Momentálně není skladem'}
              </Button>
            </div>
            
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-2">Detaily produktu</h3>
              <p className="text-muted-foreground mb-2">
                Kategorie: {getCategoryName(product.category)}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Tagy:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="bg-muted px-2 py-1 rounded-md text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}