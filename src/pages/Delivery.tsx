import { useState } from "react";
import { 
  Truck, 
  Clock, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";

interface DeliveryZone {
  id: string;
  name: string;
  time: string;
  price: number;
  freeOver?: number;
}

const pragueCityZones: DeliveryZone[] = [
  { id: "prague-1", name: "Praha 1", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-2", name: "Praha 2", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-3", name: "Praha 3", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-4", name: "Praha 4", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-5", name: "Praha 5", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-6", name: "Praha 6", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-7", name: "Praha 7", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-8", name: "Praha 8", time: "2-3 hodiny", price: 149, freeOver: 1500 },
  { id: "prague-9", name: "Praha 9", time: "3-4 hodiny", price: 199, freeOver: 1500 },
  { id: "prague-10", name: "Praha 10", time: "3-4 hodiny", price: 199, freeOver: 1500 },
];

const surroundingZones: DeliveryZone[] = [
  { id: "zone-1", name: "Do 10 km od Prahy", time: "3-5 hodin", price: 249, freeOver: 2000 },
  { id: "zone-2", name: "10-20 km od Prahy", time: "3-5 hodin", price: 349, freeOver: 2500 },
  { id: "zone-3", name: "20-30 km od Prahy", time: "4-6 hodin", price: 449, freeOver: 3000 },
];

const deliveryOptions = [
  {
    id: "standard",
    name: "Standardní doručení",
    description: "Doručení ve stejný den, pokud je objednávka zadána do 14:00",
    price: 149,
    icon: Truck
  },
  {
    id: "express",
    name: "Expresní doručení",
    description: "Doručení do 2-3 hodin od objednávky",
    price: 249,
    icon: Clock
  },
  {
    id: "scheduled",
    name: "Plánované doručení",
    description: "Vyberte konkrétní datum a časové rozmezí",
    price: 199,
    icon: Calendar
  },
  {
    id: "pickup",
    name: "Osobní odběr",
    description: "Vyzvednutí objednávky v naší prodejně",
    price: 0,
    icon: PackageCheck
  }
];

export default function Delivery() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-muted py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Doručení a platba</h1>
          <p className="text-muted-foreground max-w-2xl">
            Nabízíme rychlé a spolehlivé doručení po Praze a okolí. Vyberte si způsob doručení a platby, který vám vyhovuje.
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          {/* Delivery Advantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Rychlé doručení</h3>
                <p className="text-muted-foreground">
                  Doručujeme v den objednávky po celé Praze. Do okolí doručujeme do 3-5 hodin.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Doprava zdarma</h3>
                <p className="text-muted-foreground">
                  Při objednávce nad 1500 Kč je doprava po Praze zdarma. Pro okolí od 2000 Kč.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Různé způsoby platby</h3>
                <p className="text-muted-foreground">
                  Přijímáme platby kartou, hotově při doručení a bankovním převodem.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Delivery Options */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Možnosti doručení</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deliveryOptions.map(option => (
                <Card key={option.id} className="transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                      <option.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {option.price > 0 ? `${option.price} Kč` : "Zdarma"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Delivery Zones */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Zóny doručení</h2>
            
            <Tabs defaultValue="prague" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="prague">Praha</TabsTrigger>
                <TabsTrigger value="surroundings">Okolí</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prague">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-muted-foreground">
                        Doručujeme do všech částí Prahy. Cena doručení závisí na městské části.
                        Při objednávce nad 1500 Kč je doručení zdarma.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pragueCityZones.map(zone => (
                        <div 
                          key={zone.id} 
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedZone === zone.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedZone(zone.id)}
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{zone.name}</span>
                            <span className="font-medium">{zone.price} Kč</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Doba doručení: {zone.time}</span>
                            {zone.freeOver && (
                              <span>Zdarma od {zone.freeOver} Kč</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="surroundings">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-muted-foreground">
                        Doručujeme také do okolí Prahy. Cena a čas doručení závisí na vzdálenosti.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {surroundingZones.map(zone => (
                        <div 
                          key={zone.id} 
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedZone === zone.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedZone(zone.id)}
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{zone.name}</span>
                            <span className="font-medium">{zone.price} Kč</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Doba doručení: {zone.time}</span>
                            {zone.freeOver && (
                              <span>Zdarma od {zone.freeOver} Kč</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Payment Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Způsoby platby</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Platební karta</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Zaplaťte objednávku online platební kartou Visa, Mastercard, American Express.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Hotově při doručení</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Zaplaťte objednávku hotově kurýrovi při převzetí.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <PackageCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Bankovní převod</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Zaplaťte objednávku bankovním převodem. Objednávka bude zpracována po přijetí platby.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Často kladené otázky</h2>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Jak rychle doručujete?</h3>
                  <p className="text-muted-foreground">
                    Pro Prahu standardní doručení probíhá ve stejný den, pokud je objednávka zadána do 14:00.
                    Expresní doručení je k dispozici do 2-3 hodin od potvrzení objednávky.
                    Pro okolí doručujeme do 3-6 hodin v závislosti na vzdálenosti.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Mohu si vybrat konkrétní čas doručení?</h3>
                  <p className="text-muted-foreground">
                    Ano, můžete si vybrat plánované doručení a určit požadované datum a časový interval.
                    Tato služba stojí 199 Kč.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Co dělat, když příjemce není doma?</h3>
                  <p className="text-muted-foreground">
                    V případě nepřítomnosti příjemce se s ním kurýr spojí telefonicky.
                    Pokud se nepodaří spojit, kurýr zanechá oznámení a květiny budou vráceny do obchodu.
                    Kontaktujeme vás pro zorganizování opakovaného doručení.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Je možné doručit květiny anonymně?</h3>
                  <p className="text-muted-foreground">
                    Ano, můžete uvést, že si přejete zachovat anonymitu. V tomto případě příjemce nebude vědět, kdo květiny poslal,
                    pokud to neuvedete v kartičce se zprávou.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Doručujete i do jiných měst v České republice?</h3>
                  <p className="text-muted-foreground">
                    V současné době zajišťujeme doručení pouze po Praze a nejbližším okolí v okruhu 30 km.
                    Pro doručení do jiných měst nás prosím kontaktujte pro individuální kalkulaci.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-muted">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold mb-4">Jste připraveni objednat?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Vyberte si ideální kytici z našeho katalogu nebo si vytvořte svou vlastní.
            Doručíme ji s láskou a péčí.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/catalog">Přejít do katalogu</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/custom-bouquet">Vytvořit vlastní kytici</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}