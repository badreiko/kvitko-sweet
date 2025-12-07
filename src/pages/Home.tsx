import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Truck, Gift, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ProductCard } from "@/components/ProductCard";
import { BlogPostCard } from "@/components/BlogPostCard";
import { FadeSlider } from "@/components/FadeSlider";
import { getFeaturedProducts, Product } from "@/firebase/services/productService";
import { getRecentPosts, BlogPost } from "@/firebase/services/blogService";
import { getActiveTestimonials, Testimonial } from "@/firebase/services/testimonialService";
import { getActiveCategories, Category } from "@/firebase/services/categoryService";
import { getActiveDeliveryZones, DeliveryZone } from "@/firebase/services/deliverySettingsService";
import { getSiteSettings, SectionImages } from "@/firebase/services/settingsService";

// Импортируем изображение для hero-секции
import {
  SpringBouquet
} from '@/assets';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [sectionImages, setSectionImages] = useState<SectionImages>({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // Загрузка рекомендуемых товаров
  const loadFeaturedProducts = async () => {
    try {
      const products = await getFeaturedProducts(4);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Загрузка последних постов блога
  const loadRecentBlogs = async () => {
    try {
      const posts = await getRecentPosts(3);
      setRecentPosts(posts);
    } catch (error) {
      console.error('Error loading recent posts:', error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // Загрузка отзывов
  const loadTestimonials = async () => {
    try {
      const data = await getActiveTestimonials(10);
      // Сортируем по дате (новые сначала)
      const sorted = data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTestimonials(sorted);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // При ошибке оставляем пустой массив - секция не отобразится
      setTestimonials([]);
    }
  };

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const data = await getActiveCategories();
      console.log('[Home] Загружено категорий:', data.length, data);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  // Загрузка зон доставки
  const loadDeliveryZones = async () => {
    try {
      const zones = await getActiveDeliveryZones();
      setDeliveryZones(zones);
    } catch (error) {
      console.error('Error loading delivery zones:', error);
      setDeliveryZones([]);
    }
  };

  // Загрузка изображений секций
  const loadSectionImages = async () => {
    try {
      const settings = await getSiteSettings();
      setSectionImages(settings.sectionImages || {});
    } catch (error) {
      console.error('Error loading section images:', error);
    }
  };

  useEffect(() => {
    loadFeaturedProducts();
    loadRecentBlogs();
    loadTestimonials();
    loadCategories();
    loadDeliveryZones();
    loadSectionImages();
  }, []);

  // Фильтруем зоны по типу
  const pragueZones = deliveryZones.filter(z => z.type === 'prague');
  const surroundingZones = deliveryZones.filter(z => z.type === 'surrounding');

  // Находим минимальный порог бесплатной доставки
  const pragueFreeThreshold = pragueZones.reduce((min, z) =>
    z.freeOver && z.freeOver > 0 ? Math.min(min, z.freeOver) : min, Infinity
  );
  const surroundingFreeThreshold = surroundingZones.reduce((min, z) =>
    z.freeOver && z.freeOver > 0 ? Math.min(min, z.freeOver) : min, Infinity
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-secondary text-secondary-foreground px-3 py-1">
                Květinové studio
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Krásné <span className="text-primary">květiny</span> pro každou příležitost
              </h1>
              <p className="text-lg text-muted-foreground">
                Vítejte v Kvitko Sweet, kde tvoříme originální kytice a květinové dekorace
                s láskou a péčí. Nabízíme čerstvé květiny, doručení po celé Praze a okolí.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/catalog">
                    Prohlédnout katalog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/custom-bouquet">
                    Vytvořit vlastní kytici
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in animate-delay-200">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl"></div>
              <img
                src={SpringBouquet}
                alt="Květiny Kvitko Sweet"
                className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm animate-fade-in">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Čerstvé květiny</h3>
              <p className="text-muted-foreground">
                Používáme pouze čerstvé květiny nejvyšší kvality pro dlouhou trvanlivost.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm animate-fade-in animate-delay-100">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ruční výroba</h3>
              <p className="text-muted-foreground">
                Každá kytice je vytvořena ručně s láskou a péčí našimi zkušenými floristy.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm animate-fade-in animate-delay-200">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rychlé doručení</h3>
              <p className="text-muted-foreground">
                Doručujeme v den objednávky po celé Praze a okolí, aby květiny byly vždy čerstvé.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm animate-fade-in animate-delay-300">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dárkové balení</h3>
              <p className="text-muted-foreground">
                Nabízíme elegantní dárkové balení a možnost přidat osobní vzkaz k vaší kytici.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
              <h2 className="section-title">Naše oblíbené produkty</h2>
              <p className="text-muted-foreground max-w-4xl">
                Objevte naše nejpopulárnější kytice a rostliny, které si zamilovali naši zákazníci.
              </p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0">
              <Link to="/catalog">
                Zobrazit vše
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingProducts ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-background rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="bg-muted h-48"></div>
                  <div className="p-4">
                    <div className="bg-muted h-4 rounded mb-2"></div>
                    <div className="bg-muted h-4 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Custom Bouquet Section */}
      <section className="py-16 bg-muted leaf-pattern">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 animate-fade-in">
              <h2 className="section-title">Vytvořte si vlastní kytici</h2>
              <p className="text-muted-foreground mb-6">
                Navrhněte si kytici podle vašich představ. Vyberte si květiny, barvy a styl,
                a my vytvoříme jedinečnou kytici přesně podle vašich přání.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Vyberte květiny</h3>
                    <p className="text-muted-foreground">
                      Zvolte své oblíbené květiny, barvy a množství.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Přidejte doplňky</h3>
                    <p className="text-muted-foreground">
                      Vyberte si způsob balení, stuhy a případné dárky.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Dokončete objednávku</h3>
                    <p className="text-muted-foreground">
                      Zadejte doručovací údaje a my se postaráme o zbytek.
                    </p>
                  </div>
                </div>
              </div>
              <Button size="lg" asChild>
                <Link to="/custom-bouquet">
                  Vytvořit vlastní kytici
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2 relative animate-fade-in animate-delay-200">
              <div className="absolute -inset-4 bg-secondary/30 rounded-full blur-3xl"></div>
              <FadeSlider
                images={sectionImages.customBouquet || []}
                fallbackImage={featuredProducts[0]?.imageUrl || SpringBouquet}
                interval={5000}
                alt="Vlastní kytice"
                className="rounded-lg shadow-lg w-full aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - динамические категории из Firebase */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <h2 className="section-title text-center mb-12">Prozkoumejte naše kategorie</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((category, index) => (
                <Link
                  key={category.id}
                  to={`/catalog/${category.slug}`}
                  className={`group relative overflow-hidden rounded-lg aspect-square animate-fade-in ${index > 0 ? `animate-delay-${index}00` : ''}`}
                >
                  <img
                    src={category.imageUrl || featuredProducts[index]?.imageUrl || SpringBouquet}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/80 mb-4">{category.description || ''}</p>
                      <Button variant="secondary" size="sm">
                        Prohlédnout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - показываем только если есть отзывы */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="container-custom">
            <h2 className="section-title text-center mb-2">Co říkají naši zákazníci</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Přečtěte si recenze od našich spokojených zákazníků, kteří si zamilovali naše květiny a služby.
            </p>

            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id}>
                    <TestimonialCard testimonial={testimonial} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-6">
                <CarouselPrevious className="relative inset-0 translate-y-0" />
                <CarouselNext className="relative inset-0 translate-y-0" />
              </div>
            </Carousel>
          </div>
        </section>
      )}

      {/* Delivery Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl"></div>
              <FadeSlider
                images={sectionImages.deliverySection || []}
                fallbackImage={featuredProducts[0]?.imageUrl || SpringBouquet}
                interval={5000}
                alt="Doručení květin"
                className="rounded-lg shadow-lg w-full aspect-[4/3]"
              />
            </div>
            <div className="animate-fade-in animate-delay-200">
              <h2 className="section-title">Doručení květin</h2>
              <p className="text-muted-foreground mb-6">
                Nabízíme rychlé a spolehlivé doručení květin po celé Praze a okolí.
                Vaše kytice dorazí čerstvá a krásná, přesně podle vašich představ.
              </p>

              <Tabs defaultValue="prague" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="prague">Praha</TabsTrigger>
                  <TabsTrigger value="surroundings">Okolí Prahy</TabsTrigger>
                </TabsList>
                <TabsContent value="prague" className="mt-4">
                  <div className="space-y-4">
                    {pragueZones.map((zone, index) => (
                      <div key={zone.id} className={`flex justify-between items-center ${index < pragueZones.length - 1 ? 'border-b border-border pb-2' : ''}`}>
                        <span>{zone.name} ({zone.time})</span>
                        <span className="font-semibold">{zone.price} Kč</span>
                      </div>
                    ))}
                    {pragueFreeThreshold < Infinity && (
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-primary font-medium">Objednávka nad {pragueFreeThreshold} Kč</span>
                        <span className="font-semibold text-primary">Zdarma</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="surroundings" className="mt-4">
                  <div className="space-y-4">
                    {surroundingZones.map((zone, index) => (
                      <div key={zone.id} className={`flex justify-between items-center ${index < surroundingZones.length - 1 ? 'border-b border-border pb-2' : ''}`}>
                        <span>{zone.name} ({zone.time})</span>
                        <span className="font-semibold">{zone.price} Kč</span>
                      </div>
                    ))}
                    {surroundingFreeThreshold < Infinity && (
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-primary font-medium">Objednávka nad {surroundingFreeThreshold} Kč</span>
                        <span className="font-semibold text-primary">Zdarma</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to="/delivery">
                    Více o doručení
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-muted floral-pattern">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
              <h2 className="section-title">Náš blog o květinách</h2>
              <p className="text-muted-foreground max-w-2xl">
                Přečtěte si naše tipy a rady pro péči o květiny a inspirujte se našimi nápady.
              </p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0">
              <Link to="/blog">
                Všechny články
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingBlogs ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-background rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="bg-muted h-48"></div>
                  <div className="p-6">
                    <div className="bg-muted h-4 rounded mb-2"></div>
                    <div className="bg-muted h-4 rounded w-3/4 mb-4"></div>
                    <div className="bg-muted h-3 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              recentPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} viewMode="full" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-primary/10 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Připraveni objednat krásné květiny?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Prohlédněte si náš katalog a vyberte si z široké nabídky čerstvých květin,
              nebo si vytvořte vlastní kytici podle vašich představ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/catalog">
                  Prohlédnout katalog
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">
                  Kontaktujte nás
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}