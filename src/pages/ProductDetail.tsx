import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Truck, 
  ShoppingBag, 
  Heart, 
  Share, 
  Check, 
  Minus, 
  Plus, 
  Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { getProductById, getFeaturedProducts } from "@/firebase/services";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  featured?: boolean;
  tags?: string[];
  createdAt: Date;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Загрузка продукта
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
          
          // Загружаем похожие продукты
          const featured = await getFeaturedProducts();
          const filtered = featured.filter(item => item.id !== id);
          setRelatedProducts(filtered.slice(0, 4));
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Произошла ошибка при загрузке продукта");
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  // Добавление в корзину
  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        });
      }
      
      toast.success(`${product.name} добавлен в корзину`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Не удалось добавить товар в корзину");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <h1 className="text-2xl font-bold">Товар не найден</h1>
          <p className="mt-4">К сожалению, запрашиваемый товар не существует или был удален.</p>
          <Button asChild className="mt-6">
            <Link to="/catalog">Вернуться в каталог</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/catalog" className="hover:text-foreground transition-colors">Каталог</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to={`/catalog/${product.category}`} className="hover:text-foreground transition-colors">
            {product.category === 'bouquets' ? 'Букеты' : 
             product.category === 'plants' ? 'Растения' : 
             product.category === 'wedding' ? 'Свадебные цветы' : 
             product.category === 'gifts' ? 'Подарки' : product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                Популярное
              </Badge>
            )}

            {/* Quick Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="rounded-full">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(12 отзывов)</span>
            </div>
            
            <div className="text-2xl font-semibold mb-6">{product.price} Kč</div>
            
            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>
            
            {/* In Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-green-600 font-medium">В наличии</span>
            </div>
            
            {/* Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-input rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button className="flex-1" onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Добавить в корзину
              </Button>
            </div>
            
            {/* Delivery Info */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Доставка</p>
                    <p className="text-sm text-muted-foreground">
                      Доставка по Праге в течение 2-3 часов. <Link to="/delivery" className="text-primary hover:underline">Подробнее о доставке</Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="mb-16">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="details">Детали</TabsTrigger>
            <TabsTrigger value="care">Уход</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы (12)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Описание продукта</h3>
                <p className="text-muted-foreground mb-6">
                  {product.description}
                </p>
                
                <h3 className="text-lg font-semibold mb-4">Характеристики</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Категория</span>
                    <span>
                      {product.category === 'bouquets' ? 'Букеты' : 
                       product.category === 'plants' ? 'Растения' : 
                       product.category === 'wedding' ? 'Свадебные цветы' : 
                       product.category === 'gifts' ? 'Подарки' : product.category}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Артикул</span>
                    <span>KS-{product.id.slice(0, 6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="care" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Рекомендации по уходу</h3>
                
                {product.category === 'plants' ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Для обеспечения долгой жизни вашей комнатной растении, следуйте этим рекомендациям:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Поставьте растение в место с ярким непрямым светом</li>
                      <li>Поливайте умеренно, позволяя верхнему слою почвы высохнуть между поливами</li>
                      <li>Поддерживайте влажность воздуха, особенно зимой</li>
                      <li>Подкармливайте удобрением для комнатных растений в период активного роста</li>
                      <li>Регулярно осматривайте растение на наличие вредителей</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Чтобы ваши цветы оставались свежими как можно дольше, следуйте этим простым рекомендациям:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Поставьте букет в чистую вазу с прохладной водой</li>
                      <li>Обрежьте стебли под углом перед тем, как поставить в воду</li>
                      <li>Меняйте воду каждые 2-3 дня</li>
                      <li>Держите цветы вдали от прямых солнечных лучей и источников тепла</li>
                      <li>Удаляйте увядшие цветы и листья</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Отзывы клиентов</h3>
                  <Button>Написать отзыв</Button>
                </div>
                
                <div className="space-y-6">
                  {/* Sample reviews */}
                  <div className="border-b border-border pb-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Анна К.</span>
                      <span className="text-sm text-muted-foreground">15.04.2023</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Прекрасные цветы, выглядят даже лучше, чем на фото. Доставка была вовремя. Очень довольна!
                    </p>
                  </div>
                  
                  <div className="border-b border-border pb-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Петр В.</span>
                      <span className="text-sm text-muted-foreground">03.04.2023</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Заказывал букет для жены на годовщину. Качество отличное, цветы свежие. Жена была в восторге!
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Мария Д.</span>
                      <span className="text-sm text-muted-foreground">25.03.2023</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Уже не первый раз заказываю цветы в Kvitko Sweet и всегда остаюсь довольна. Свежие цветы, красивое оформление, быстрая доставка!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Вам также может понравиться</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}