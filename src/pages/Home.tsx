import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
import { FramedImage } from "@/components/FramedImage";
import { RatingStrip } from "@/components/RatingStrip";
import { OccasionNav } from "@/components/OccasionNav";
import { BouquetAtelier } from "@/components/home/BouquetAtelier";
import { BENTO_COL_CLASS, BENTO_ROW_CLASS, categoryBento } from "@/lib/categoryBento";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { getFeaturedProducts, Product } from "@/firebase/services/productService";
import { getRecentPosts, BlogPost } from "@/firebase/services/blogService";
import { getActiveTestimonials, Testimonial } from "@/firebase/services/testimonialService";
import { getActiveCategories, Category } from "@/firebase/services/categoryService";
import { getActiveDeliveryZones, DeliveryZone } from "@/firebase/services/deliverySettingsService";
import { closingLines, heroRatio } from "@/lib/heroTheme";
import { useSiteTheme } from "@/context/SiteThemeContext";
import { HeroArt } from "@/components/HeroArt";

// Импортируем изображение для hero-секции
import {
  SpringBouquet
} from '@/assets';
import homeFreshFlowersIcon from "@/assets/icons/home/home-fresh-flowers.webp";
import homeHandmadeIcon from "@/assets/icons/home/home-handmade.webp";
import homeFastDeliveryIcon from "@/assets/icons/home/home-fast-delivery.webp";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  // Настройки и тема сайта загружаются один раз в SiteThemeProvider.
  const { settings: siteSettings, ready: heroReady, hero } = useSiteTheme();
  const sectionImages = siteSettings?.sectionImages ?? {};
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

  useEffect(() => {
    loadFeaturedProducts();
    loadRecentBlogs();
    loadTestimonials();
    loadCategories();
    loadDeliveryZones();
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
  // «от X Kč» для мобильной карточки доставки.
  const pragueFrom = pragueZones.length ? Math.min(...pragueZones.map(z => z.price)) : null;
  const surroundingFrom = surroundingZones.length ? Math.min(...surroundingZones.map(z => z.price)) : null;

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
  const { themeId: heroThemeId, content: heroContent } = hero;
  const heroDesktopImage = heroContent.desktopImage || SpringBouquet;

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
  //   9. Final CTA     — сезонная финальная фраза темы
  // ─────────────────────────────────────────────────────────────────────

  return (
    <Layout>
      {/* 1. Hero Section. relative нужен, чтобы framer-motion useScroll
          корректно считал offset (иначе warn «container has non-static
          position»). */}
      <section
        ref={heroRef}
        data-theme-palette={heroThemeId}
        className={`hero-theme relative overflow-hidden min-h-[560px] md:min-h-[min(760px,82vh)] flex items-stretch md:items-center py-10 md:py-16 ${heroThemeId === 'default' ? 'mesh-gradient' : ''}`}
      >
        {/* До первого ответа Firestore (и без кэша) прячем содержимое,
            иначе посетитель на долю секунды видит базовую тему. */}
        <div className={`container-custom transition-opacity duration-300 ${heroReady ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-4 md:space-y-6 flex flex-col pt-0 md:pt-4"
            >
              <p className="hero-eyebrow">{heroContent.eyebrow}</p>
              {/* Конкретное обещание вместо общего «pro každou příležitost».
                  Клиенту сразу видно, что этот флорист доставляет быстро. */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-0">
                {heroContent.title}
                <span className="block font-serif italic font-normal" style={{ color: 'var(--theme-accent)' }}>{heroContent.highlight}</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                {heroContent.description}
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
                      {heroContent.primaryLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
                <Link
                  to="/custom-bouquet"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
                >
                  {heroContent.secondaryLabel}
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
              {/* Внешний div держит float-анимацию (CSS keyframes, transform),
                  внутренний (HeroArt) — наклон за курсором. Разнесены, чтобы
                  анимации transform не конкурировали на одном элементе. */}
              <div className="relative z-10 animate-float-hero">
                <HeroArt
                  desktopImage={heroDesktopImage}
                  alt={heroContent.imageAlt}
                  fit={heroContent.imageFit}
                  decorations={heroContent.decorations}
                  signatureKicker={heroContent.signatureKicker}
                  signatureTitle={heroContent.signatureTitle}
                  ratio={heroRatio(heroContent)}
                  pending={!heroReady}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. USP-полоса — 3 бенефита в одной строке. Отдельная секция,
          компактная, до продуктов. Раньше эти иконки были встроены между
          категориями бенто и разбавляли навигационный смысл секции. */}
      <section className="py-6 md:py-10 border-y season-band season-divider">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-10">
            {[
              { icon: homeFreshFlowersIcon, title: 'Čerstvé květiny', text: 'Z ranního trhu, každý den.' },
              { icon: homeHandmadeIcon, title: 'Ruční výroba', text: 'Každá kytice tvořená s láskou.' },
              { icon: homeFastDeliveryIcon, title: 'Doručení od 90 minut', text: 'Po celé Praze a okolí.' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4">
                {/* Плашка иконки в тон текущей темы (у базовой — фирменный зелёный). */}
                <div className="bg-season-soft p-3 rounded-2xl shrink-0">
                  <img src={item.icon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-tight">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.text}</p>
                </div>
              </div>
            ))}
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
      <section className="py-16 season-band-soft">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              {/* Бейдж-приманка: свежесть + скорость доставки. Показывается
                  первым делом, чтобы посетитель сразу видел USP до продукта. */}
              <p className="season-eyebrow mb-4">Čerstvé dnes · doručení od 90 min</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight">Naše oblíbené <span className="text-season-accent italic">produkty</span></h2>
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
                    <div className="bg-muted aspect-[4/5]"></div>
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
                <div className="md:hidden grid grid-cols-2 gap-3">
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

      {/* 5. Доставка — второй по важности вопрос покупателя цветов:
          «когда доедет и сколько стоит». В палитре текущей темы. */}
      <section className="py-14 md:py-20 relative overflow-hidden">
        {/* Тёплые пятна света из палитры темы */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" style={{ background: 'color-mix(in srgb, var(--theme-warm) 45%, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-[520px] h-[520px] rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" style={{ background: 'color-mix(in srgb, var(--theme-blush) 70%, transparent)' }} />

        <div className="container-custom">
          {/* ТЕЛЕФОН: компактная карточка с ценами — раньше была только
              зелёная плашка без зон и цен. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:hidden rounded-[28px] border border-season-line bg-background/80 p-6 shadow-lg"
          >
            <p className="season-eyebrow mb-3">Naše služby</p>
            <h2 className="text-3xl font-serif font-bold tracking-tight mb-3">
              Doručení s <span className="text-season-accent italic">láskou</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Po Praze od 90 minut. Každou kytici vezeme osobně, aby dorazila v dokonalém stavu.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-season-line bg-season-soft px-3 py-1.5 mb-5">
              <span className="w-2 h-2 shrink-0 rounded-full bg-season-clay animate-pulse" />
              <span className="text-xs font-medium">
                Objednávka do <span className="font-bold text-season-clay">14:00</span> — doručení <span className="font-bold">ještě dnes</span>
              </span>
            </div>
            <dl className="divide-y divide-border/60 rounded-2xl border border-season-line bg-background/70 mb-5 text-sm">
              {pragueFrom !== null && (
                <div className="flex justify-between gap-3 px-4 py-3"><dt>Praha</dt><dd className="font-semibold whitespace-nowrap">od {pragueFrom} Kč</dd></div>
              )}
              {surroundingFrom !== null && (
                <div className="flex justify-between gap-3 px-4 py-3"><dt>Okolí Prahy</dt><dd className="font-semibold whitespace-nowrap">od {surroundingFrom} Kč</dd></div>
              )}
              {pragueFreeThreshold < Infinity && (
                <div className="flex justify-between items-center gap-3 px-4 py-3">
                  <dt>Nad {pragueFreeThreshold} Kč</dt>
                  <dd><span className="rounded-full bg-season-accent px-2.5 py-0.5 text-xs font-semibold text-white">Zdarma</span></dd>
                </div>
              )}
            </dl>
            <Button size="lg" className="rounded-full w-full" asChild>
              <Link to="/delivery">
                Více o dopravě
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* КОМПЬЮТЕР */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
            className="hidden md:block rounded-[36px] border border-season-line bg-background/70 backdrop-blur-xl p-8 lg:p-12"
            style={{ boxShadow: '0 25px 50px -20px var(--theme-shadow)' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="order-2 lg:order-1 relative">
                {/* Фото заполняет рамку целиком — раньше оно вписывалось
                    и по бокам оставались пустые поля. */}
                <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3] relative group">
                  <FadeSlider
                    images={sectionImages.deliverySection || []}
                    fallbackImage={featuredProducts[0]?.imageUrl || SpringBouquet}
                    interval={5000}
                    alt="Doručení květin"
                    fit="cover"
                    className="w-full h-full group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute bottom-5 left-5 bg-background/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-season-line">
                    <div className="flex items-center gap-3">
                      <div className="bg-season-soft p-2.5 rounded-xl">
                        <img src={homeFastDeliveryIcon} alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground leading-tight">Expresní</p>
                        <p className="text-sm text-muted-foreground w-max">doručení po Praze</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-6">
                <div>
                  <p className="season-eyebrow mb-4">Naše služby</p>
                  <h2 className="text-4xl font-serif font-bold text-foreground tracking-tight mb-4">
                    Doručení s <span className="text-season-accent italic">láskou</span>
                  </h2>
                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                    Každou kytici doručujeme osobně a s maximální péčí. Vaše květiny dorazí přesně na čas, v dokonalém stavu a plné svěžesti.
                  </p>
                  {/* Cutoff: «успею получить сегодня?» — главный вопрос перед оплатой. */}
                  <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-season-line bg-season-soft px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-season-clay animate-pulse" />
                    <p className="text-sm font-medium text-foreground">
                      Objednávka do <span className="font-bold text-season-clay">14:00</span> — doručení <span className="font-bold">ještě dnes</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl p-2 border border-season-line bg-background/60">
                  <Tabs defaultValue="prague" className="w-full">
                    {/* Вкладку «Okolí» показываем, только если такие зоны есть. */}
                    {surroundingZones.length > 0 && (
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-transparent h-12">
                        <TabsTrigger value="prague" className="rounded-2xl text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">Praha</TabsTrigger>
                        <TabsTrigger value="surroundings" className="rounded-2xl text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">Okolí</TabsTrigger>
                      </TabsList>
                    )}
                    {([
                      ['prague', pragueZones, pragueFreeThreshold],
                      ['surroundings', surroundingZones, surroundingFreeThreshold],
                    ] as const).map(([value, zones, freeOver]) => (
                      <TabsContent key={value} value={value} className="mt-0 px-5 py-4 data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-500">
                        <div className="space-y-4">
                          {zones.map(zone => (
                            <div key={zone.id} className="flex justify-between items-center group/item">
                              <span className="text-foreground/80 group-hover/item:text-season-accent transition-colors">
                                {zone.name} <span className="text-muted-foreground text-sm ml-1">({zone.time})</span>
                              </span>
                              <div className="flex-1 border-b border-dashed border-border/60 mx-4" />
                              <span className="font-bold text-foreground whitespace-nowrap">{zone.price} Kč</span>
                            </div>
                          ))}
                          {freeOver < Infinity && (
                            <div className="flex justify-between items-center pt-3 border-t border-border/60">
                              <span className="font-medium text-foreground">Objednávka nad {freeOver} Kč</span>
                              <span className="rounded-full bg-season-accent px-2.5 py-0.5 text-xs font-semibold text-white">Zdarma</span>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                <MagneticButton>
                  <Button variant="outline" size="lg" className="rounded-full px-8 h-12 bg-background/60 border-season-line hover:bg-background hover:text-season-accent transition-all shadow-sm" asChild>
                    <Link to="/delivery">
                      Zobrazit všechny zóny
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Ateliér — мини-конструктор букета из реальных цветов базы.
          Раньше: три большие фотографии столбиком (2128px на компьютере). */}
      <BouquetAtelier />

      {/* 7. Категории — плитки из БД. Раскладка categoryBento() заполняет
          сетку без пустых ячеек при любом числе категорий (раньше при 4
          категориях справа внизу оставалась дыра). */}
      {(categories.length > 0) && (
        <section className="py-12 md:py-20 bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-8 md:mb-12"
            >
              <p className="season-eyebrow mb-3">Katalog</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-foreground tracking-tight">
                Naše <span className="text-season-accent italic">kategorie</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Od každodenních kytic po svatební dekorace a dárky.
              </p>
            </motion.div>

            {/* ТЕЛЕФОН: свайп по всем категориям */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 px-4 -mx-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category, idx) => (
                <Link
                  key={category.id ?? idx}
                  to={`/catalog/${category.slug}`}
                  className="shrink-0 w-[72vw] h-[260px] snap-center rounded-3xl overflow-hidden relative group border border-season-line"
                >
                  {/* Кадр (точка фокуса, масштаб) задаётся в /admin/categories */}
                  <FramedImage
                    src={category.imageUrl || SpringBouquet}
                    alt={category.name}
                    focalPoint={category.imageFocalPoint}
                    zoom={category.imageZoom}
                    className="absolute inset-0 bg-muted/30"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent p-5 flex flex-col justify-end">
                    <h3 className="text-white text-2xl font-serif font-bold">{category.name}</h3>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/85">
                      Prohlédnout <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* КОМПЬЮТЕР: bento без пустых ячеек */}
            <div className="hidden md:grid grid-cols-4 grid-flow-dense gap-4 lg:gap-5 auto-rows-[clamp(200px,17vw,260px)]">
              {categories.map((category, idx) => {
                const [cols, rows] = categoryBento(categories.length)[idx];
                const isLarge = rows === 2 || cols === 4;
                return (
                  <motion.div
                    key={category.id ?? idx}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(idx, 4) * 0.08 }}
                    className={`${BENTO_COL_CLASS[cols]} ${BENTO_ROW_CLASS[rows]} group relative overflow-hidden rounded-3xl border border-season-line`}
                  >
                    <Link to={`/catalog/${category.slug}`} className="block w-full h-full">
                      <FramedImage
                        src={category.imageUrl || SpringBouquet}
                        alt={category.name}
                        focalPoint={category.imageFocalPoint}
                        zoom={category.imageZoom}
                        className="absolute inset-0 bg-muted/30"
                        imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent p-6 md:p-7 flex flex-col justify-end z-10">
                        <h3 className={`text-white font-serif font-bold ${isLarge ? "text-3xl mb-2" : "text-xl"}`}>
                          {category.name}
                        </h3>
                        {isLarge && category.description && (
                          <p className="text-white/80 line-clamp-2 max-w-md">{category.description}</p>
                        )}
                        {/* Подсказка-стрелка в цвете темы появляется при наведении */}
                        <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-season-accent opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                          Prohlédnout <ArrowRight className="h-3.5 w-3.5" />
                        </span>
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

      {/* 9. Финал — сезонная фраза темы (правится в админке у каждой темы).
          Раньше: 80% высоты экрана, всегда зелёный и только на компьютере. */}
      <section className="season-band relative overflow-hidden py-16 md:py-24">
        <div className="absolute -top-24 left-[10%] h-[420px] w-[420px] rounded-full blur-[110px] pointer-events-none" style={{ background: 'color-mix(in srgb, var(--theme-warm) 55%, transparent)' }} aria-hidden="true" />
        <div className="absolute -bottom-32 right-[8%] h-[460px] w-[460px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'color-mix(in srgb, var(--theme-blush) 80%, transparent)' }} aria-hidden="true" />
        {/* Арка, как вокруг букета в Hero */}
        <div className="absolute left-1/2 top-8 bottom-0 w-[min(620px,86vw)] -translate-x-1/2 rounded-t-full border border-b-0 pointer-events-none" style={{ borderColor: 'color-mix(in srgb, var(--theme-clay) 20%, transparent)' }} aria-hidden="true" />

        {/* Букет темы — небольшой акцент справа (только прозрачные букеты) */}
        {heroContent.imageFit === 'contain' && heroContent.decorations && heroDesktopImage && (
          <img
            src={heroDesktopImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="hidden lg:block absolute right-[4%] bottom-[-6%] w-[230px] rotate-[8deg] drop-shadow-[0_18px_16px_rgba(80,50,20,0.18)] pointer-events-none select-none"
          />
        )}

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <p className="season-eyebrow mb-6">
              {heroThemeId === 'default' ? 'Pojďme to uskutečnit' : heroContent.eyebrow}
            </p>

            <h2 className="font-serif font-bold text-foreground text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-10">
              {closingLines(heroContent.closingLine).map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={`block ${index === 1 ? 'font-normal italic text-season-accent' : ''}`}
                >
                  {line}
                </span>
              ))}
            </h2>

            <div className="flex w-full flex-col sm:w-auto sm:flex-row gap-3 sm:gap-5 justify-center items-stretch sm:items-center">
              <MagneticButton>
                <Button size="lg" className="h-14 w-full sm:w-auto px-9 rounded-full text-base shadow-lg" asChild>
                  <Link to="/catalog">
                    {heroThemeId === 'default' ? 'Prohlédnout katalog' : heroContent.primaryLabel}
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button size="lg" variant="outline" className="h-14 w-full sm:w-auto px-9 rounded-full text-base border-season-line bg-background/60 hover:bg-background hover:text-season-accent" asChild>
                  <Link to="/contact">Kontaktujte nás</Link>
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
