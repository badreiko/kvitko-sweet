import { Link } from "react-router-dom";
import { ArrowRight, Heart, Truck, Gift, Star, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ProductCard } from "@/components/ProductCard";
import { BlogPostCard } from "@/components/BlogPostCard";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blogPosts";
import { testimonials } from "@/data/testimonials";

// Импортируем изображение для hero-секции
import { 
  SpringBouquet
} from '@/assets';

export default function Home() {
  // Отфильтровать только featured продукты
  const featuredProducts = products.filter(product => product.featured);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-secondary text-secondary-foreground px-3 py-1">
                Květinové studio s ukrajinským nádechem
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
              <div className="absolute -bottom-6 -right-6 bg-background p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Doručení po Praze</p>
                    <p className="text-sm text-muted-foreground">Zdarma při objednávce nad 1500 Kč</p>
                  </div>
                </div>
              </div>
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
              <p className="text-muted-foreground max-w-2xl">
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
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
              <img 
                src={products[1].imageUrl} 
                alt="Vlastní kytice" 
                className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="section-title text-center mb-12">Prozkoumejte naše kategorie</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/catalog/bouquets" className="group relative overflow-hidden rounded-lg aspect-square animate-fade-in">
              <img 
                src={products[0].imageUrl} 
                alt="Kytice" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white text-2xl font-bold mb-2">Kytice</h3>
                  <p className="text-white/80 mb-4">Originální kytice pro každou příležitost</p>
                  <Button variant="secondary" size="sm">
                    Prohlédnout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
            
            <Link to="/catalog/plants" className="group relative overflow-hidden rounded-lg aspect-square animate-fade-in animate-delay-100">
              <img 
                src={products[3].imageUrl} 
                alt="Pokojové rostliny" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white text-2xl font-bold mb-2">Pokojové rostliny</h3>
                  <p className="text-white/80 mb-4">Zelené rostliny pro váš domov</p>
                  <Button variant="secondary" size="sm">
                    Prohlédnout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
            
            <Link to="/catalog/gifts" className="group relative overflow-hidden rounded-lg aspect-square animate-fade-in animate-delay-200">
              <img 
                src={products[6].imageUrl} 
                alt="Dárky" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white text-2xl font-bold mb-2">Dárky</h3>
                  <p className="text-white/80 mb-4">Dárkové předměty a doplňky</p>
                  <Button variant="secondary" size="sm">
                    Prohlédnout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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

      {/* Delivery Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl"></div>
              <img 
                src={products[2].imageUrl} 
                alt="Doručení květin" 
                className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[4/3]"
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
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span>Expresní doručení (2-3 hodiny)</span>
                      <span className="font-semibold">199 Kč</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span>Standardní doručení (tentýž den)</span>
                      <span className="font-semibold">149 Kč</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span>Doručení v konkrétní čas</span>
                      <span className="font-semibold">249 Kč</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-medium">Objednávka nad 1500 Kč</span>
                      <span className="font-semibold text-primary">Zdarma</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="surroundings" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span>Do 10 km od Prahy</span>
                      <span className="font-semibold">249 Kč</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span>10-20 km od Prahy</span>
                      <span className="font-semibold">349 Kč</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span>20-30 km od Prahy</span>
                      <span className="font-semibold">449 Kč</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-medium">Objednávka nad 2000 Kč</span>
                      <span className="font-semibold text-primary">Zdarma</span>
                    </div>
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
            {blogPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
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