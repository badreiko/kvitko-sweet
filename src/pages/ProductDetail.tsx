import { useState, useEffect, useRef } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Premium Features States
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const [isAdded, setIsAdded] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Načtení produktu
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        let productData = await getProductBySlug(id);

        if (!productData) {
          productData = await getProductById(id);
        }

        if (productData) {
          setProduct(productData);

          if (productData.category) {
            try {
              const category = await getCategoryById(productData.category);
              if (category) {
                setCategoryName(category.name);
              } else {
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

  const handleAddToCartMorph = () => {
    if (!product || isAdded) return;

    try {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        });
      }

      setIsAdded(true);
      toast.success(`${product.name} přidán do košíku`);

      setTimeout(() => {
        setIsAdded(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Nepodařilo se přidat produkt do košíku");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    setLensPos({ x, y, bgX, bgY });
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
      <div className="container-custom pt-8 pb-24 md:pb-8 relative">
        {/* Premium Background Flairs */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-40 -left-64 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-80 -right-64 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

        {/* Drobečková navigace */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center text-sm text-muted-foreground mb-8"
        >
          <Link to="/" className="hover:text-foreground transition-colors">Domů</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/catalog" className="hover:text-foreground transition-colors">Katalog</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to={`/catalog/${product.category}`} className="hover:text-foreground transition-colors">
            {categoryName || product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>{product.name}</span>
        </motion.div>

        {/* Detaily produktu */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24 items-start">

          {/* Obrázek produktu - Sticky Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 relative group">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              ref={imageContainerRef}
              className={`aspect-square overflow-hidden rounded-[32px] shadow-2xl relative ${showLens ? 'cursor-crosshair' : 'cursor-auto'}`}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setShowLens(true)}
              onMouseLeave={() => setShowLens(false)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Premium Lens Zoom */}
              <AnimatePresence>
                {showLens && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute pointer-events-none border-3 border-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-50 overflow-hidden"
                    style={{
                      width: 160,
                      height: 160,
                      left: lensPos.x - 80,
                      top: lensPos.y - 80,
                      backgroundImage: `url(${product.imageUrl})`,
                      backgroundPosition: `${lensPos.bgX}% ${lensPos.bgY}%`,
                      backgroundSize: '500%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {product.featured && (
              <Badge className="absolute top-6 left-6 bg-white/90 text-primary backdrop-blur-md px-4 py-1.5 shadow-xl border-none text-sm z-10">
                Oblíbené
              </Badge>
            )}

            {/* Rychlé akce (Glassmorphic) */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
              <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 bg-white/70 backdrop-blur-md shadow-lg hover:bg-white hover:text-primary transition-all hover:scale-110">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 bg-white/70 backdrop-blur-md shadow-lg hover:bg-white hover:text-primary transition-all hover:scale-110">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Informace o produktu */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col pt-4"
          >
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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

            {/* Přidat do košíku - Morphing Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <div className="flex items-center h-14 border border-input rounded-full bg-background/50 backdrop-blur-sm self-start sm:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-l-full h-full w-12 hover:bg-muted/50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-r-full h-full w-12 hover:bg-muted/50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className={`flex-1 h-14 rounded-full text-lg shadow-xl outline-none border-none transition-all duration-500 overflow-hidden relative ${isAdded
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30 hover:scale-105'
                  }`}
                onClick={handleAddToCartMorph}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.div
                      key="added"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-center font-medium"
                    >
                      <Check className="mr-2 h-6 w-6" strokeWidth={3} /> V košíku
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-center font-medium"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" /> Přidat do košíku
                    </motion.div>
                  )}
                </AnimatePresence>
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
          </motion.div>
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
                          className={`h-4 w-4 ${star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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
                          className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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
                          className={`h-4 w-4 ${star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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

        {/* Související produkty - Parallax Reveal */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="pt-12"
          >
            <h2 className="text-4xl font-serif font-bold mb-12 text-center relative inline-block left-1/2 -translate-x-1/2">
              Mohlo by se vám také líbit
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"></div>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct, index) => (
                <motion.div
                  key={relProduct.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                >
                  <ProductCard product={relProduct} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Bar pro mobily */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-background/80 backdrop-blur-xl z-50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] pb-safe">
        <div className="flex items-center justify-between gap-6 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Celkem</span>
            <span className="text-xl font-bold font-serif">{product.price * quantity} Kč</span>
          </div>
          <Button
            className={`flex-1 h-12 rounded-full transition-all duration-300 font-medium ${isAdded ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'shadow-primary/20'}`}
            onClick={handleAddToCartMorph}
          >
            {isAdded ? (
              <span className="flex items-center justify-center gap-2"><Check className="h-5 w-5" /> V košíku</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><ShoppingBag className="h-4 w-4" /> Do košíku</span>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}