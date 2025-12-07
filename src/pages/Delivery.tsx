import { useState, useEffect } from "react";
import {
  Truck,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  Calendar,
  PackageCheck,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Layout from "@/components/layout/Layout";
import {
  DeliveryZone,
  DeliveryOption,
  PaymentMethod,
  FAQ,
  getActiveDeliveryZones,
  getActiveDeliveryOptions,
  getActivePaymentMethods,
  getActiveFAQ
} from "@/firebase/services/deliverySettingsService";

// Иконки для опций доставки
const deliveryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'truck': Truck,
  'clock': Clock,
  'calendar': Calendar,
  'package': PackageCheck,
};

// Иконки для способов оплаты
const paymentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'credit-card': CreditCard,
  'map-pin': MapPin,
  'package-check': PackageCheck,
};

export default function Delivery() {
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [pragueZones, setPragueZones] = useState<DeliveryZone[]>([]);
  const [surroundingZones, setSurroundingZones] = useState<DeliveryZone[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [faqItems, setFaqItems] = useState<FAQ[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[Delivery] Loading data from Firebase...');
        const [zones, options, payments, faq] = await Promise.all([
          getActiveDeliveryZones(),
          getActiveDeliveryOptions(),
          getActivePaymentMethods(),
          getActiveFAQ()
        ]);

        console.log('[Delivery] Loaded:', { zones: zones.length, options: options.length, payments: payments.length, faq: faq.length });

        setPragueZones(zones.filter(z => z.type === 'prague'));
        setSurroundingZones(zones.filter(z => z.type === 'surrounding'));
        setDeliveryOptions(options);
        setPaymentMethods(payments);
        setFaqItems(faq);
      } catch (error) {
        console.error('[Delivery] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const hasNoData = pragueZones.length === 0 && surroundingZones.length === 0 &&
    deliveryOptions.length === 0 && paymentMethods.length === 0 && faqItems.length === 0;

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

      {/* No Data Message */}
      {hasNoData && (
        <section className="py-12">
          <div className="container-custom">
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Údaje o doručení nejsou k dispozici</h2>
                <p className="text-muted-foreground">
                  Informace o doručení a platbě budou brzy k dispozici.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Main Content - only show if data exists */}
      {!hasNoData && (
        <section className="py-12">
          <div className="container-custom">
            {/* Delivery Advantages - Dynamic Carousel */}
            {deliveryOptions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Výhody doručení</h2>
                {deliveryOptions.length <= 3 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {deliveryOptions.map(option => {
                      const IconComponent = deliveryIcons[option.icon] || Truck;
                      return (
                        <Card key={option.id}>
                          <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                            <p className="text-muted-foreground">{option.description}</p>
                            {option.price > 0 && (
                              <p className="mt-2 font-semibold text-primary">{option.price} Kč</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                      {deliveryOptions.map(option => {
                        const IconComponent = deliveryIcons[option.icon] || Truck;
                        return (
                          <CarouselItem key={option.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <Card className="h-full">
                              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                  <IconComponent className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                                <p className="text-muted-foreground flex-grow">{option.description}</p>
                                {option.price > 0 && (
                                  <p className="mt-2 font-semibold text-primary">{option.price} Kč</p>
                                )}
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <div className="flex justify-center gap-2 mt-4">
                      <CarouselPrevious className="relative inset-0 translate-y-0" />
                      <CarouselNext className="relative inset-0 translate-y-0" />
                    </div>
                  </Carousel>
                )}
              </div>
            )}


            {/* Delivery Zones */}
            {(pragueZones.length > 0 || surroundingZones.length > 0) && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Zóny doručení</h2>
                <Tabs defaultValue="prague" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="prague">Praha ({pragueZones.length})</TabsTrigger>
                    <TabsTrigger value="surroundings">Okolí ({surroundingZones.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="prague">
                    <Card>
                      <CardContent className="p-6">
                        {pragueZones.length > 0 ? (
                          <>
                            <div className="mb-4">
                              <p className="text-muted-foreground">
                                Doručujeme do všech částí Prahy. Cena doručení závisí na městské části.
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {pragueZones.map(zone => (
                                <div
                                  key={zone.id}
                                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedZone === zone.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                  onClick={() => setSelectedZone(zone.id)}
                                >
                                  <div className="flex justify-between mb-2">
                                    <span className="font-medium">{zone.name}</span>
                                    <span className="font-medium">{zone.price} Kč</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Doba doručení: {zone.time}</span>
                                    {zone.freeOver && <span>Zdarma od {zone.freeOver} Kč</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">Žádné zóny pro Prahu</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="surroundings">
                    <Card>
                      <CardContent className="p-6">
                        {surroundingZones.length > 0 ? (
                          <>
                            <div className="mb-4">
                              <p className="text-muted-foreground">
                                Doručujeme také do okolí Prahy. Cena a čas doručení závisí na vzdálenosti.
                              </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              {surroundingZones.map(zone => (
                                <div
                                  key={zone.id}
                                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedZone === zone.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                  onClick={() => setSelectedZone(zone.id)}
                                >
                                  <div className="flex justify-between mb-2">
                                    <span className="font-medium">{zone.name}</span>
                                    <span className="font-medium">{zone.price} Kč</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Doba doručení: {zone.time}</span>
                                    {zone.freeOver && <span>Zdarma od {zone.freeOver} Kč</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">Žádné zóny pro okolí</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Payment Methods */}
            {paymentMethods.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Způsoby platby</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {paymentMethods.map(payment => {
                    const IconComponent = paymentIcons[payment.icon] || CreditCard;
                    return (
                      <Card key={payment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-semibold">{payment.name}</h3>
                          </div>
                          <p className="text-muted-foreground">{payment.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FAQ */}
            {faqItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Často kladené otázky</h2>
                <div className="space-y-4">
                  {faqItems.map(faq => (
                    <Card key={faq.id}>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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