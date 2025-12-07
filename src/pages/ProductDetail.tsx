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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { getProductById, getProductBySlug, getFeaturedProducts } from "@/firebase/services/productService";
import { getCategoryById } from "@/firebase/services/categoryService";
import { Product } from "@/firebase/services/productService";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Načtení produktu
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Zkusíme najít produkt podle slugu
        let productData = await getProductBySlug(id);

        // Pokud se nepodařilo najít podle slugu, zkusíme podle ID (pro zpětnou kompatibilitu)
        if (!productData) {
          productData = await getProductById(id);
        }

        if (productData) {
          setProduct(productData);

          // Načtení názvu kategorie
          if (productData.category) {
            try {
              const category = await getCategoryById(productData.category);
              if (category) {
                setCategoryName(category.name);
              } else {
                // Fallback pro statické kategorie
                const categoryMap: Record<string, string> = {
                  'bouquets': 'Kytice',
                  'plants': 'Pokojové rostliny',
                  'wedding': 'Svatební květiny',
                  'gifts': 'Dárky'
                };
                setCategoryName(categoryMap[productData.category] || productData.category);
              }
            } catch (error) {
              console.error("Error loading category:", error);
              setCategoryName(productData.category);
            }
          }

          // Načítáme podobné produkty
          const featured = await getFeaturedProducts();
          const filtered = featured.filter(item => item.id !== id);
          setRelatedProducts(filtered.slice(0, 4));
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Došlo k chybě při načítání produktu");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Přidání do košíku
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

      toast.success(`${product.name} přidán do košíku`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Nepodařilo se přidat produkt do košíku");
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
          <h1 className="text-2xl font-bold">Produkt nebyl nalezen</h1>
          <p className="mt-4">Bohužel požadovaný produkt neexistuje nebo byl odstraněn.</p>
          <Button asChild className="mt-6">
            <Link to="/catalog">Zpět do katalogu</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Drobečková navigace */}
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Domů</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/catalog" className="hover:text-foreground transition-colors">Katalog</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to={`/catalog/${product.category}`} className="hover:text-foreground transition-colors">
            {categoryName || product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>{product.name}</span>
        </div>

        {/* Detaily produktu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Obrázek produktu */}
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
                Oblíbené
              </Badge>
            )}

            {/* Rychlé akce */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="rounded-full">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Informace o produktu */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(12 recenzí)</span>
            </div>

            <div className="text-2xl font-semibold mb-6">{product.price} Kč</div>

            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>

            {/* Skladem */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-green-600 font-medium">Skladem</span>
            </div>

            {/* Přidat do košíku */}
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
                Přidat do košíku
              </Button>
            </div>

            {/* Informace o doručení */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Doručení</p>
                    <p className="text-sm text-muted-foreground">
                      Doručení po Praze během 2-3 hodin. <Link to="/delivery" className="text-primary hover:underline">Více o doručení</Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Štítky */}
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

        {/* Záložky */}
        <Tabs defaultValue="details" className="mb-16">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="details">Detaily</TabsTrigger>
            <TabsTrigger value="care">Péče</TabsTrigger>
            <TabsTrigger value="reviews">Recenze (12)</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Popis produktu</h3>
                <p className="text-muted-foreground mb-6">
                  {product.description}
                </p>

                <h3 className="text-lg font-semibold mb-4">Specifikace</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Kategorie</span>
                    <span>{categoryName || product.category}</span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Kód produktu</span>
                    <span>KS-{product.id.slice(0, 6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Doporučení k péči</h3>

                {product.category === 'plants' ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Pro zajištění dlouhého života vaší pokojové rostliny, dodržujte tato doporučení:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Umístěte rostlinu na místo s jasným nepřímým světlem</li>
                      <li>Zalévejte střídmě, nechte vrchní vrstvu půdy vyschnout mezi zaléváním</li>
                      <li>Udržujte vlhkost vzduchu, zejména v zimě</li>
                      <li>Přihnojujte hnojivem pro pokojové rostliny v období aktivního růstu</li>
                      <li>Pravidelně kontrolujte, zda rostlina nemá škůdce</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Aby vaše květiny zůstaly svěží co nejdéle, dodržujte tato jednoduchá doporučení:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Vložte kytici do čisté vázy s chladnou vodou</li>
                      <li>Zkraťte stonky šikmo před vložením do vody</li>
                      <li>Měňte vodu každé 2-3 dny</li>
                      <li>Udržujte květiny mimo přímé sluneční světlo a zdroje tepla</li>
                      <li>Odstraňujte zvadlé květy a listy</li>
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
                  <h3 className="text-lg font-semibold">Recenze zákazníků</h3>
                  <Button>Napsat recenzi</Button>
                </div>

                <div className="space-y-6">
                  {/* Ukázkové recenze */}
                  <div className="border-b border-border pb-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Anna K.</span>
                      <span className="text-sm text-muted-foreground">15.04.2023</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Krásné květiny, vypadají ještě lépe než na fotografii. Doručení bylo včas. Jsem velmi spokojená!
                    </p>
                  </div>

                  <div className="border-b border-border pb-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Petr V.</span>
                      <span className="text-sm text-muted-foreground">03.04.2023</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Objednal jsem kytici pro manželku k výročí. Kvalita je vynikající, květiny jsou čerstvé. Manželka byla nadšená!
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Marie D.</span>
                      <span className="text-sm text-muted-foreground">25.03.2023</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Již několikrát jsem objednala květiny v Kvitko Sweet a vždy jsem spokojená. Čerstvé květiny, krásná úprava, rychlé doručení!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Související produkty */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Mohlo by se vám také líbit</h2>
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