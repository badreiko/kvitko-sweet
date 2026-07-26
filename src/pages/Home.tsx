import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Truck, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { TestimonialCard } from "@/components/TestimonialCard";
import { FadeSlider } from "@/components/FadeSlider";
import MagneticButton from "@/components/MagneticButton";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductCard } from "@/components/ProductCard";
import { InfiniteMarquee } from "@/components/InfiniteMarquee";
import { SmartImage } from "@/components/SmartImage";
import { RatingStrip } from "@/components/RatingStrip";
import { OccasionNav } from "@/components/OccasionNav";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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

  // Загрузка рекомендуемых товаров.
  // 8 штук вместо 4: карусель на desktop прокручиваема, а mobile grid
  // получает больше вариантов для быстрого выбора.
  const loadFeaturedProducts = async () => {
    try {
      const products = await getFeaturedProducts(8);
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

  // Parallax эффекты для Hero секции.
  // Раньше тип был HTMLSelectElement (явная опечатка) — на рантайме работало,
  // но приводило к странным ошибкам типов на местах, где ref пробрасывается.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // ─────────────────────────────────────────────────────────────────────
  // Порядок секций (impact-first):
  //   1. Hero          — первое впечатление о бренде + primary CTA
  //   2. USP strip     — 3 бенефита (свежесть / ручная работа / доставка)
  //   3. Featured      — сразу товары: клиент пришёл покупать цветы
  //   4. Delivery      — цены зон и cutoff-время: убирает главный барьер
  //   5. Custom Bouquet — уникальный оффер, премиум-путь
  //   6. Categories    — навигация по типам для «ещё не решил»
  //   7. Testimonials  — соцдоказательство
  //   8. Blog          — SEO/удержание (условный рендер при 3+ постах)
  //   9. Final CTA     — брендовый финал (только desktop)
  // ─────────────────────────────────────────────────────────────────────

  return (
    <Layout>
      {/* 1. Hero Section. relative нужен, чтобы framer-motion useScroll
          корректно считал offset (иначе warn «container has non-static
          position»). */}
      <section ref={heroRef} className="relative mesh-gradient overflow-hidden min-h-[600px] md:min-h-[90vh] flex items-stretch md:items-center py-10 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-4 md:space-y-6 flex flex-col pt-0 md:pt-4"
            >
              <Badge className="hidden md:inline-flex bg-secondary text-secondary-foreground px-3 py-1 w-fit">
                Květinové studio · Praha
              </Badge>
              {/* Конкретное обещание вместо общего «pro každou příležitost».
                  Клиенту сразу видно, что этот флорист доставляет быстро. */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-0">
                Kytice z ranního trhu,
                <br className="hidden sm:inline" />
                <span className="text-primary"> u vás do večera.</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Ručně sestavené kytice a květinové dekorace pro každou příležitost.
                Doručujeme po celé Praze a okolí, obvykle do 90 minut od objednávky.
              </p>
              {/* Social-proof strip: рейтинг + количество отзывов + скорость.
                  RatingStrip сам скрывается, если отзывов <3 — не будет
                  фейкового «5.0 (1)». Размер согласован с описанием hero
                  (text-sm md:text-base) — одна ступень ниже, но всё ещё
                  «первый экран» типографика. */}
              <div className="flex flex-wrap items-center gap-3 md:gap-5 text-sm md:text-base">
                <RatingStrip testimonials={testimonials} variant="compact" />
                {testimonials.length >= 3 && <span className="text-muted-foreground/40">·</span>}
                <span className="text-muted-foreground">
                  Doručení <span className="font-semibold text-foreground">od 90 min</span>
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">Praha & okolí</span>
              </div>
              {/* Один primary CTA + мелкая inline-ссылка вместо двух равных
                  кнопок. Раньше «Katalog» и «Vlastní kytice» конкурировали
                  за внимание — пользователь тратил решение, куда кликнуть.
                  Теперь ясная иерархия: сначала каталог (основной путь), а
                  vlastní kytice — вспомогательный вариант. */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 md:pt-4">
                <MagneticButton className="w-full sm:w-auto">
                  <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto h-12 md:h-11" asChild>
                    <Link to="/catalog">
                      Prohlédnout katalog
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
                <Link
                  to="/custom-bouquet"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
                >
                  nebo vytvořte vlastní kytici
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
            <motion.div
              style={{ y, opacity }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              {/* Внешний div держит float-анимацию (CSS keyframes, transform),
                  внутренний — hover-эффект (scale/rotate). Разнесены, чтобы
                  transition-transform не конкурировал с animation на одном
                  элементе и не вызывал дёрганье. */}
              <div className="relative z-10 animate-float-hero">
                <div className="group transition-transform duration-300 ease-out hover:scale-105 hover:rotate-1">
                  <SmartImage
                    src={SpringBouquet}
                    alt="Květiny Kvitko Sweet"
                    portraitAspect="4 / 5"
                    landscapeAspect="4 / 3"
                    squareAspect="1 / 1"
                    contentBg="bg-muted/20"
                    wrapperClassName="rounded-xl shadow-2xl w-full"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. USP-полоса — 3 бенефита в одной строке. Отдельная секция,
          компактная, до продуктов. Раньше эти иконки были встроены между
          категориями бенто и разбавляли навигационный смысл секции. */}
      <section className="py-8 md:py-12 border-y border-border/40 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg leading-tight">Čerstvé květiny</h3>
                <p className="text-muted-foreground text-sm">Z ranního trhu, každý den.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg leading-tight">Ruční výroba</h3>
                <p className="text-muted-foreground text-sm">Každá kytice tvořená s láskou.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg leading-tight">Doručení od 90 minut</h3>
                <p className="text-muted-foreground text-sm">Po celé Praze a okolí.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Occasion Navigation — специфично для цветов: 40% покупок
          делаются по поводу («на день рождения»), а не по типу товара
          («розы»). Помогает клиенту с нерешительностью после Hero. */}
      <OccasionNav />

      {/* 4. Featured Products Section — двигали наверх сразу после USP.
          Клиент пришёл смотреть цветы, продукт должен быть первой
          покупательной точкой на странице. */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              {/* Бейдж-приманка: свежесть + скорость доставки. Показывается
                  первым делом, чтобы посетитель сразу видел USP до продукта. */}
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/15 border-none px-3 py-1 uppercase tracking-wider text-xs font-semibold">
                Čerstvé dnes · doručení od 90 min
              </Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight">Naše oblíbené <span className="text-primary italic">produkty</span></h2>
              <p className="text-muted-foreground max-w-2xl">
                Objevte naše nejpopulárnější kytice a rostliny, které si zamilovali naši zákazníci.
              </p>
            </div>
            <Button variant="outline" className="rounded-full px-6 border-border/50" asChild>
              <Link to="/catalog">
                Zobrazit vše
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-background rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="bg-muted h-48"></div>
                    <div className="p-4">
                      <div className="bg-muted h-4 rounded mb-2"></div>
                      <div className="bg-muted h-4 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <ProductCarousel products={featuredProducts} />
                </div>
                <div className="md:hidden grid grid-cols-2 gap-4">
                  {featuredProducts.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="md:hidden mt-6 text-center">
                  <Button variant="outline" className="rounded-full px-8 w-full border-primary/20 hover:bg-primary/5" asChild>
                    <Link to="/catalog">
                      Zobrazit všechny produkty
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* 4. Delivery Section (Premium Light Glass) — второй по значимости
          вопрос покупателя цветов: «когда доедет и сколько это стоит».
          Двигали выше, чтобы снять сомнение раньше в скролле. */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Декоративные фоновые элементы */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="container-custom">
          {/* MOBILE VIEW FOR DELIVERY */}
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-primary text-primary-foreground rounded-[32px] p-8 shadow-xl relative overflow-hidden text-center"
            >
              <div className="absolute -inset-4 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-serif font-bold mb-3 relative z-10">
                Expresní doručení
              </h2>
              <p className="text-primary-foreground/90 mb-8 relative z-10 text-sm">
                Po Praze od 90 minut. Bezpečná doprava klimatizovanými vozy zaručí perfektní stav vaší kytice.
              </p>
              <Button variant="secondary" size="lg" className="rounded-full w-full relative z-10" asChild>
                <Link to="/delivery">
                  Více o dopravě
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* DESKTOP VIEW FOR DELIVERY */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8 }}
              className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-primary/5 rounded-[40px] p-8 md:p-12 lg:p-16 relative overflow-hidden group hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-700"
            >
              {/* Внутренний блик для эффекта стекла */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-transparent pointer-events-none rounded-[40px]"></div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                <div className="order-2 lg:order-1 relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="rounded-3xl overflow-hidden shadow-xl aspect-square md:aspect-[4/3] relative">
                    <FadeSlider
                      images={sectionImages.deliverySection || []}
                      fallbackImage={featuredProducts[0]?.imageUrl || SpringBouquet}
                      interval={5000}
                      alt="Doručení květin"
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />

                    {/* Бейдж поверх картинки */}
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-white/50 animate-bounce-slow">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full text-primary">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Expresní</p>
                          <p className="text-sm text-muted-foreground w-max">doručení po Praze</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-2 space-y-8">
                  <div>
                    <Badge className="bg-primary/10 text-primary border-none mb-6 px-4 py-1.5 text-sm">Naše služby</Badge>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight mb-6">
                      Doručení s <span className="text-primary italic">láskou</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Každou kytici doručujeme osobně a s maximální péčí.
                      Zaručujeme, že vaše květiny dorazí přesně na čas, v dokonalém stavu a plné svěžesti.
                    </p>
                    {/* Cutoff-бейдж: снимает главный вопрос покупателя цветов —
                        «успею получить сегодня?». Точный час обещания
                        уменьшает трение перед оплатой. */}
                    <div className="mt-6 inline-flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-full px-4 py-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <p className="text-sm font-medium text-foreground">
                        Objednávka do <span className="font-bold text-primary">14:00</span> — doručení <span className="font-bold">ještě dnes</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-3xl p-2 border border-black/5 shadow-inner">
                    <Tabs defaultValue="prague" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-transparent h-14">
                        <TabsTrigger value="prague" className="rounded-2xl text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Praha</TabsTrigger>
                        <TabsTrigger value="surroundings" className="rounded-2xl text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Okolí</TabsTrigger>
                      </TabsList>

                      <div className="p-6">
                        <TabsContent value="prague" className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2 duration-500">
                          <div className="space-y-5">
                            {pragueZones.map((zone) => (<div key={zone.id} className="flex justify-between items-center group/item cursor-default">
                              <span className="text-foreground/80 group-hover/item:text-primary transition-colors">{zone.name} <span className="text-muted-foreground text-sm ml-1">({zone.time})</span></span>
                              <div className="flex-1 border-b border-dashed border-border/50 mx-4 group-hover/item:border-primary/30 transition-colors"></div>
                              <span className="font-bold text-foreground">{zone.price} Kč</span>
                            </div>
                            ))}
                            {pragueFreeThreshold < Infinity && (
                              <div className="flex justify-between items-center pt-4 mt-2 border-t border-black/5">
                                <span className="font-medium text-foreground">Objednávka nad {pragueFreeThreshold} Kč</span>
                                <Badge className="bg-primary text-primary-foreground pointer-events-none">Zdarma</Badge>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="surroundings" className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2 duration-500">
                          <div className="space-y-5">
                            {surroundingZones.map((zone) => (<div key={zone.id} className="flex justify-between items-center group/item cursor-default">
                              <span className="text-foreground/80 group-hover/item:text-primary transition-colors">{zone.name} <span className="text-muted-foreground text-sm ml-1">({zone.time})</span></span>
                              <div className="flex-1 border-b border-dashed border-border/50 mx-4 group-hover/item:border-primary/30 transition-colors"></div>
                              <span className="font-bold text-foreground">{zone.price} Kč</span>
                            </div>
                            ))}
                            {surroundingFreeThreshold < Infinity && (
                              <div className="flex justify-between items-center pt-4 mt-2 border-t border-black/5">
                                <span className="font-medium text-foreground">Objednávka nad {surroundingFreeThreshold} Kč</span>
                                <Badge className="bg-primary text-primary-foreground pointer-events-none">Zdarma</Badge>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  <div className="pt-2">
                    <MagneticButton>
                      <Button variant="outline" size="lg" className="rounded-full px-8 h-12 bg-white/50 border-primary/20 hover:bg-white hover:text-primary hover:border-primary transition-all shadow-sm" asChild>
                        <Link to="/delivery">
                          Zobrazit všechny zóny
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Custom Bouquet Section — уникальный оффер, премиум-путь.
          Показываем после Delivery: клиент уже знает, что доставим, теперь
          предлагаем настройку букета. */}
      <section className="py-16 md:py-24 bg-muted leaf-pattern overflow-visible relative">
        <div className="container-custom">

          {/* MOBILE VIEW — 3 карточки-шага в горизонтальном свайпе, каждая
              с фото + номером шага. Приводит mobile-версию к качеству
              premium desktop sticky-scroll, но нативно для тач-девайсов. */}
          <div className="md:hidden flex flex-col gap-8">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold text-foreground tracking-tight">
                Vytvořte si vlastní <span className="text-primary italic">umělecké dílo</span>
              </h2>
              <p className="text-muted-foreground mt-3 px-4">
                Navrhněte si kytici přesně podle vašich představ.
              </p>
            </div>

            {/* Горизонтальный swipe-carousel по 3 шагам */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-4 -mx-4 scrollbar-hide">
              {[
                {
                  step: "1",
                  title: "Vyberte základ",
                  desc: "Odstín, nálada, oblíbené druhy květin.",
                  img: sectionImages.customBouquet?.[0] || featuredProducts[0]?.imageUrl || SpringBouquet,
                },
                {
                  step: "2",
                  title: "Prémiové doplňky",
                  desc: "Eukalyptus, luxusní stuhy, dekorační papír.",
                  img: sectionImages.customBouquet?.[1] || featuredProducts[1]?.imageUrl || SpringBouquet,
                },
                {
                  step: "3",
                  title: "Doručení lásky",
                  desc: "My ji sestavíme a bezpečně doručíme.",
                  img: sectionImages.customBouquet?.[2] || featuredProducts[2]?.imageUrl || SpringBouquet,
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="shrink-0 w-[80vw] snap-center rounded-3xl overflow-hidden bg-background shadow-xl border border-border/40 flex flex-col"
                >
                  <div className="relative">
                    <SmartImage
                      src={s.img}
                      alt={s.title}
                      portraitAspect="4 / 5"
                      landscapeAspect="4 / 3"
                      squareAspect="1 / 1"
                      contentBg="bg-muted/30"
                      wrapperClassName="w-full"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {s.step}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-lg mb-1">{s.title}</h3>
                    <p className="text-muted-foreground text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price-hint (тот же что на desktop) */}
            <p className="text-muted-foreground text-sm text-center">
              Vlastní kytice <span className="font-bold text-foreground">od 590 Kč</span>
              <span className="mx-2 text-muted-foreground/40">·</span>
              průměrná objednávka 850 Kč
            </p>

            <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full shadow-xl shadow-primary/20" asChild>
              <Link to="/custom-bouquet">
                Zahájit tvorbu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* DESKTOP VIEW (STICKY SCROLL) */}
          <div className="hidden md:flex flex-col lg:flex-row gap-16 relative items-start">

            {/* Левая часть: Липкий контент */}
            <div className="lg:w-1/2 lg:sticky lg:top-32 h-fit space-y-8 animate-fade-in z-10 pb-8 lg:pb-0">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">Vytvořte si vlastní <span className="text-primary italic">umělecké dílo</span></h2>
              <p className="text-lg text-muted-foreground mr-8 leading-relaxed">
                Navrhněte si kytici přesně podle vašich představ. Náš tým zkušených
                floristů přetvoří vaši vizi do skutečné květinové symfonie plné barev,
                vůní a emocí.
              </p>

              <div className="space-y-6 pt-4">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-black/5"
                >
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-md">1</div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-1">Vyberte základ</h3>
                    <p className="text-muted-foreground">Odstín, nálada, oblíbené druhy květin.</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-black/5"
                >
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-md">2</div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-1">Prémiové doplňky</h3>
                    <p className="text-muted-foreground">Eukalyptus, luxusní stuhy, dekorační papír.</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-black/5"
                >
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-md">3</div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-1">Doručení lásky</h3>
                    <p className="text-muted-foreground">My ji sestavíme a bezpečně doručíme.</p>
                  </div>
                </motion.div>
              </div>

              {/* Price-hint: снимает страх «это будет очень дорого» —
                  главный барьер к клику по «Vytvořit vlastní kytici».
                  Точную стартовую цену можно поднять в Settings, если
                  захочешь синхронизировать с прайсом флориста. */}
              <div className="pt-2">
                <p className="text-muted-foreground text-sm">
                  Vlastní kytice <span className="font-bold text-foreground">od 590 Kč</span>
                  <span className="mx-2 text-muted-foreground/40">·</span>
                  průměrná objednávka 850 Kč
                </p>
              </div>

              <div className="pt-4">
                <MagneticButton className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20" asChild>
                    <Link to="/custom-bouquet">
                      Zahájit tvorbu
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </MagneticButton>
              </div>
            </div>

            {/* Правая часть: Скроллящиеся картинки */}
            <div className="lg:w-1/2 flex flex-col gap-8 lg:gap-16 pt-0 lg:pt-16 pb-16 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -z-10"></div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl overflow-hidden shadow-2xl"
              >
                <SmartImage
                  src={sectionImages.customBouquet?.[0] || featuredProducts[0]?.imageUrl || SpringBouquet}
                  alt="Kytice 1"
                  portraitAspect="4 / 5"
                  landscapeAspect="4 / 3"
                  squareAspect="1 / 1"
                  contentBg="bg-muted/30"
                  wrapperClassName="w-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl overflow-hidden shadow-2xl lg:ml-12"
              >
                <SmartImage
                  src={sectionImages.customBouquet?.[1] || featuredProducts[1]?.imageUrl || SpringBouquet}
                  alt="Kytice 2"
                  portraitAspect="4 / 5"
                  landscapeAspect="4 / 3"
                  squareAspect="1 / 1"
                  contentBg="bg-muted/30"
                  wrapperClassName="w-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl overflow-hidden shadow-2xl"
              >
                <SmartImage
                  src={sectionImages.customBouquet?.[2] || featuredProducts[2]?.imageUrl || SpringBouquet}
                  alt="Kytice 3"
                  portraitAspect="4 / 5"
                  landscapeAspect="4 / 3"
                  squareAspect="1 / 1"
                  contentBg="bg-muted/30"
                  wrapperClassName="w-full"
                />
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Categories Section — гибкая раскладка на все категории из БД.
          Раньше жёстко брались categories[0..2], поэтому 4-я никогда не
          показывалась, а при 1-2 категориях grid ломался. Теперь:
          - первая всегда крупнее (2×2 на desktop),
          - остальные — квадратные плитки в свободном grid,
          - на mobile — свайп-carousel по всем категориям. */}
      {(categories.length > 0) && (
        <section className="py-12 md:py-24 bg-muted/30">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-10 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 md:mb-4 text-foreground tracking-tight">Naše kategorie</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4 md:px-0">
                Vyberte si podle příležitosti — od každodenních kytic po svatební dekorace.
              </p>
            </motion.div>

            {/* MOBILE: горизонтальный свайп-carousel по ВСЕМ категориям */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-4 -mx-4 scrollbar-hide">
              {categories.map((category, idx) => (
                <Link
                  key={category.id ?? idx}
                  to={`/catalog/${category.slug}`}
                  className="shrink-0 w-[80vw] h-[300px] snap-center rounded-3xl overflow-hidden relative group"
                >
                  <SmartImage
                    src={category.imageUrl || SpringBouquet}
                    alt={category.name}
                    fillParent
                    initialOrientation={category.imageOrientation}
                    focalPoint={category.imageFocalPoint}
                    contentBg="bg-muted/30"
                    wrapperClassName="absolute inset-0"
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-white text-2xl font-serif font-bold mb-2">{category.name}</h3>
                    {idx === 0 && category.description && (
                      <p className="text-white/80 line-clamp-2 text-sm">{category.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* DESKTOP: bento — первая большая (2×2), остальные квадраты 1×1 */}
            <div className="hidden md:grid grid-cols-4 gap-6 auto-rows-[clamp(240px,20vw,320px)]">
              {categories.map((category, idx) => {
                const isPrimary = idx === 0;
                return (
                  <motion.div
                    key={category.id ?? idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(idx, 4) * 0.1 }}
                    className={
                      isPrimary
                        ? "col-span-2 row-span-2 group relative overflow-hidden rounded-3xl"
                        : "col-span-2 md:col-span-1 row-span-1 group relative overflow-hidden rounded-3xl"
                    }
                  >
                    <Link to={`/catalog/${category.slug}`} className="block w-full h-full">
                      <SmartImage
                        src={category.imageUrl || SpringBouquet}
                        alt={category.name}
                        fillParent
                        initialOrientation={category.imageOrientation}
                        focalPoint={category.imageFocalPoint}
                        contentBg="bg-muted/30"
                        wrapperClassName="absolute inset-0"
                        className="transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 ${isPrimary ? "via-black/20" : ""} to-transparent p-6 md:p-8 flex flex-col justify-end z-10`}>
                        <h3 className={`text-white font-serif font-bold transform transition-transform duration-500 group-hover:translate-x-2 ${isPrimary ? "text-3xl mb-3" : "text-xl"}`}>
                          {category.name}
                        </h3>
                        {isPrimary && category.description && (
                          <p className="text-white/80 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Testimonials Section — показываем только если есть отзывы */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container-custom">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border/50 text-sm font-medium text-muted-foreground mb-5 shadow-sm">
                ⭐ Naši zákazníci
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight">Co říkají naši zákazníci</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Přečtěte si recenze od spokojených zákazníků, kteří si zamilovali naše květiny.
              </p>
              {/* Крупный агрегат-рейтинг ДО карусели. Одна цифра конвертит
                  сильнее 10 отдельных карточек — Booking.com base practice. */}
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-3 bg-background border border-border rounded-full px-5 py-2.5 shadow-sm">
                  <RatingStrip testimonials={testimonials} variant="full" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-hidden mt-8 -mx-4 md:mx-0 px-4 md:px-0">
            <InfiniteMarquee
              items={testimonials.map((t) => <TestimonialCard key={t.id} testimonial={t} />)}
              speed="slow"
            />

            {/* Если отзывов много, можно пустить второй ряд в обратную сторону */}
            {testimonials.length > 3 && (
              <InfiniteMarquee
                items={testimonials.slice().reverse().map((t) => <TestimonialCard key={`rev-${t.id}`} testimonial={t} />)}
                direction="right"
                speed="slow"
                className="mt-6 hidden md:flex"
              />
            )}
          </div>
        </section>
      )}

      {/* 8. Blog Section (Editorial Magazine Layout) — показываем только
          при 3+ опубликованных постах. Меньше — секция выглядит пустой,
          и лучше вообще её не рендерить, чем создавать впечатление
          «сайт только начал жить». */}
      {(loadingBlogs || recentPosts.length >= 3) && (
      <section className="py-24 bg-muted/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div className="max-w-2xl">
              <Badge className="bg-primary/10 text-primary border-none mb-4 px-4 py-1.5 text-sm">Průvodce květinami</Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
                Rozkvetlé <span className="text-primary italic">příběhy</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Inspirace, rady a triky pro milovníky květin. Objevte fascinující svět floristiky v našem online magazínu.
              </p>
            </div>
            <MagneticButton>
              <Button variant="outline" className="mt-6 md:mt-0 rounded-full bg-transparent border-border/60 hover:bg-white hover:text-primary transition-all px-6 h-12" asChild>
                <Link to="/blog">
                  Všechny články
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </MagneticButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
            {loadingBlogs ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className={`bg-background/50 rounded-3xl shadow-sm overflow-hidden animate-pulse ${i === 0 ? 'lg:col-span-8' : 'lg:col-span-4'}`}>
                  <div className="bg-muted/50 aspect-video lg:aspect-auto lg:h-[400px]"></div>
                  <div className="p-8">
                    <div className="bg-muted h-6 rounded w-3/4 mb-4"></div>
                    <div className="bg-muted h-4 rounded w-full mb-2"></div>
                    <div className="bg-muted h-4 rounded w-2/3 mb-6"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Главная новость (крупно слева) */}
                {recentPosts[0] && (
                  <div className="lg:col-span-8 group">
                    <Link to={`/blog/${recentPosts[0].id}`} className="block h-full relative overflow-hidden rounded-[32px]">
                      {/* Изображение с эффектом параллакса и зума */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700 z-10 pointer-events-none"></div>
                      <SmartImage
                        src={recentPosts[0].imageUrl}
                        alt={recentPosts[0].title}
                        portraitAspect="4 / 5"
                        landscapeAspect="16 / 9"
                        squareAspect="1 / 1"
                        initialOrientation={recentPosts[0].imageOrientation}
                        focalPoint={recentPosts[0].imageFocalPoint}
                        contentBg="bg-muted/30"
                        wrapperClassName="w-full"
                        className="transform group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                      />

                      {/* Текстовый блок поверх картинки (снизу) */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex gap-2 mb-4">
                          {recentPosts[0].tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-none px-3 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight group-hover:text-primary-foreground transition-colors">
                          {recentPosts[0].title}
                        </h3>
                        <p className="text-white/80 line-clamp-2 md:text-lg mb-6 max-w-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                          {recentPosts[0].excerpt}
                        </p>

                        <div className="flex items-center justify-between text-white/70">
                          <span className="text-sm font-medium tracking-wider uppercase">čtěte více</span>
                          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Остальные новости (колонкой справа) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {recentPosts.slice(1, 3).map((post) => (
                    <Link key={post.id} to={`/blog/${post.id}`} className="group relative bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex-1 flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10 pointer-events-none"></div>
                        <SmartImage
                          src={post.imageUrl}
                          alt={post.title}
                          fillParent
                          initialOrientation={post.imageOrientation}
                          focalPoint={post.imageFocalPoint}
                          contentBg="bg-muted/30"
                          wrapperClassName="absolute inset-0"
                          className="transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                        />
                      </div>

                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <div className="flex gap-2 mb-3">
                          {post.tags?.slice(0, 1).map((tag) => (
                            <span key={tag} className="text-xs font-semibold text-primary uppercase tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-bold mb-3 leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-auto flex-1">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            Přečíst článek
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      )}

      {/* 9. Final CTA — скрыт на mobile: 80vh для околонулевой конверсии
          не оправдан, экономим скролл. На desktop — оставляем для
          бренд-выразительности после прочтения всей страницы. */}
      <section className="hidden md:flex relative min-h-[80vh] items-center justify-center overflow-hidden py-24 bg-background">
        {/* Анимированный градиентный фон */}
        <div className="absolute inset-0 bg-primary/5">
          <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center justify-center"
          >
            <p className="text-primary font-medium tracking-widest uppercase mb-6 flex items-center gap-4 text-sm md:text-base">
              <span className="w-12 h-[1px] bg-primary/50"></span>
              Pojďme to uskutečnit
              <span className="w-12 h-[1px] bg-primary/50"></span>
            </p>

            <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-foreground leading-[0.9] tracking-tighter mb-12 mix-blend-multiply relative group">
              <span className="block hover:text-primary transition-colors duration-500">VYTVOŘÍME</span>
              <span className="block text-primary/80 italic group-hover:text-foreground transition-colors duration-500">NĚCO</span>
              <span className="block hover:text-primary transition-colors duration-500">KRÁSNÉHO</span>

              {/* Эффект свечения при наведении (имитация gooey/mask) */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-secondary/20 to-primary/0 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
              <MagneticButton>
                <Button size="lg" className="h-16 px-10 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300" asChild>
                  <Link to="/catalog">
                    Prohlédnout katalog
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </MagneticButton>

              <MagneticButton>
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg border-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300" asChild>
                  <Link to="/contact">
                    Kontaktujte nás
                  </Link>
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
