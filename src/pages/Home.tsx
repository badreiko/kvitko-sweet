import { Link } from "react-router-dom";
import { ArrowRight, Heart, Truck, Gift, Star, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";

// Sample data for featured products
const featuredProducts = [
  {
    id: "1",
    name: "Jarní romance",
    description: "Kytice plná jarních květin v pastelových barvách",
    price: 890,
    imageUrl: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "bouquets",
    featured: true
  },
  {
    id: "2",
    name: "Růžový sen",
    description: "Elegantní kytice růží v růžových odstínech",
    price: 1290,
    imageUrl: "https://images.unsplash.com/photo-1548386135-b47c7e488fcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "bouquets",
    featured: true
  },
  {
    id: "3",
    name: "Slunečnice",
    description: "Zářivá kytice slunečnic pro rozjasnění dne",
    price: 790,
    imageUrl: "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "bouquets",
    featured: true
  },
  {
    id: "4",
    name: "Monstera Deliciosa",
    description: "Populární pokojová rostlina s dělenými listy",
    price: 690,
    imageUrl: "https://images.unsplash.com/photo-1637967886160-fd78dc3ce2af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "plants",
    featured: true
  }
];

// Sample data for blog posts
const blogPosts = [
  {
    id: "1",
    title: "Jak pečovat o řezané květiny",
    excerpt: "Tipy a triky pro prodloužení životnosti vašich květin",
    imageUrl: "https://images.unsplash.com/photo-1484900503188-a9a4b3c78d94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    date: "15. 5. 2023"
  },
  {
    id: "2",
    title: "Květiny pro každou příležitost",
    excerpt: "Průvodce výběrem správných květin pro různé události",
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    date: "2. 4. 2023"
  },
  {
    id: "3",
    title: "Pěstování pokojových rostlin",
    excerpt: "Základní rady pro začátečníky i pokročilé pěstitele",
    imageUrl: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    date: "18. 3. 2023"
  }
];

// Sample data for testimonials
const testimonials = [
  {
    id: "1",
    name: "Jana Nováková",
    comment: "Nádherné květiny a skvělý servis! Kytice dorazila včas a vypadala přesně jako na fotografii. Určitě budu objednávat znovu.",
    rating: 5
  },
  {
    id: "2",
    name: "Petr Svoboda",
    comment: "Objednal jsem kytici pro manželku k výročí. Byla nadšená! Květiny byly čerstvé a krásně zabalené. Děkuji za profesionální přístup.",
    rating: 5
  },
  {
    id: "3",
    name: "Martina Dvořáková",
    comment: "Pravidelně nakupuji pokojové rostliny a vždy jsem spokojená. Rostliny jsou zdravé a personál ochotně poradí s péčí.",
    rating: 4
  }
];

export default function Home() {
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
                src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
              <Link 
                to={`/product/${product.id}`} 
                key={product.id}
                className="group"
              >
                <Card className="overflow-hidden border-border card-hover animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground">
                        Oblíbené
                      </Badge>
                    </div>
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
                      <Button size="sm" variant="outline">
                        Do košíku
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
                src="https://images.unsplash.com/photo-1561729098-cbab0f7a9f7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                src="https://images.unsplash.com/photo-1545239705-1564e58b9e4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                  <Card className="border-none bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-lg mb-6 italic">"{testimonial.comment}"</p>
                      <p className="font-semibold">{testimonial.name}</p>
                    </CardContent>
                  </Card>
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
                src="https://images.unsplash.com/photo-1577401239170-897942555fb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
            {blogPosts.map((post, index) => (
              <Link 
                to={`/blog/${post.id}`} 
                key={post.id}
                className="group"
              >
                <Card className="overflow-hidden border-border card-hover h-full animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-primary font-medium">
                      <span>Číst více</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
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