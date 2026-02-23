import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Clock,
  MapPin,
  CreditCard,
  Calendar,
  PackageCheck,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Component for a single FAQ Accordion Item
function FAQAccordionItem({ faq, isOpen, onClick }: { faq: FAQ, isOpen: boolean, onClick: () => void }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-background hover:bg-muted/50 border-border/50'
        }`}
    >
      <button
        onClick={onClick}
        className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
      >
        <h3 className={`font-semibold text-lg transition-colors ${isOpen ? 'text-primary' : 'text-foreground'}`}>
          {faq.question}
        </h3>
        <div className={`flex-shrink-0 ml-4 h-8 w-8 rounded-full bg-background flex items-center justify-center border transition-colors ${isOpen ? 'border-primary/50 text-primary' : 'border-border'}`}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 pt-1 text-muted-foreground leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Delivery() {
  const [loading, setLoading] = useState(true);
  const [pragueZones, setPragueZones] = useState<DeliveryZone[]>([]);
  const [surroundingZones, setSurroundingZones] = useState<DeliveryZone[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [faqItems, setFaqItems] = useState<FAQ[]>([]);

  const [activeZoneTab, setActiveZoneTab] = useState<'prague' | 'surroundings'>('prague');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

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
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-xl text-muted-foreground animate-pulse">Načítání informací...</p>
        </div>
      </Layout>
    );
  }

  const hasNoData = pragueZones.length === 0 && surroundingZones.length === 0 &&
    deliveryOptions.length === 0 && paymentMethods.length === 0 && faqItems.length === 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border/50 text-sm font-medium text-muted-foreground mb-6 shadow-sm">
              <Truck className="h-4 w-4 text-primary" /> Rychle a spolehlivě
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-foreground tracking-tight balance-text">
              Doručení a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic font-light pr-2">Platba</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Nabízíme spolehlivé doručení po Praze a okolí. Vyberte si způsob předání a platby, který vám nejvíce vyhovuje.
            </p>
          </motion.div>
        </div>
      </section>

      {/* No Data Message */}
      {hasNoData && (
        <section className="py-24">
          <div className="container-custom max-w-2xl">
            <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-12 text-center shadow-sm">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h2 className="text-2xl font-serif font-bold mb-3">Údaje nejsou k dispozici</h2>
              <p className="text-muted-foreground text-lg">
                Informace o doručení a platbě budou brzy aktualizovány.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      {!hasNoData && (
        <section className="py-20">
          <div className="container-custom max-w-5xl space-y-24">

            {/* Delivery Advantages */}
            {deliveryOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-serif font-bold mb-4">Výhody doručení</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">Proč se vyplatí objednat u nás?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deliveryOptions.map((option, idx) => {
                    const IconComponent = deliveryIcons[option.icon] || Truck;
                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="group bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 flex flex-col items-center text-center h-full"
                      >
                        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <h3 className="font-serif font-bold text-xl mb-3">{option.name}</h3>
                        <p className="text-muted-foreground leading-relaxed flex-grow">{option.description}</p>
                        {option.price > 0 && (
                          <p className="mt-6 font-semibold text-lg text-primary bg-primary/5 px-4 py-1.5 rounded-full inline-flex border border-primary/10">
                            {option.price} Kč
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Delivery Zones */}
            {(pragueZones.length > 0 || surroundingZones.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-serif font-bold mb-4">Zóny doručení a ceník</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">Přesné ceny pro vaši lokalitu.</p>
                </div>

                {/* Custom Pill Navigation for Zones */}
                <div className="flex justify-center mb-10">
                  <div className="flex bg-muted/50 p-1.5 rounded-full border border-border/50 backdrop-blur-sm relative w-full max-w-md">
                    {/* Animated Background */}
                    <div
                      className="absolute top-1.5 bottom-1.5 rounded-full bg-background shadow-sm border border-border/50 transition-all duration-500 ease-out"
                      style={{
                        width: 'calc(50% - 6px)',
                        left: activeZoneTab === 'prague' ? '6px' : 'calc(50% + 0px)'
                      }}
                    />

                    <button
                      onClick={() => setActiveZoneTab('prague')}
                      className={`relative w-1/2 py-3 text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2 ${activeZoneTab === 'prague' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Praha ({pragueZones.length})
                    </button>
                    <button
                      onClick={() => setActiveZoneTab('surroundings')}
                      className={`relative w-1/2 py-3 text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2 ${activeZoneTab === 'surroundings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Okolí ({surroundingZones.length})
                    </button>
                  </div>
                </div>

                <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <AnimatePresence mode="wait">
                    {activeZoneTab === 'prague' ? (
                      <motion.div
                        key="prague"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <p className="text-foreground text-lg">Doručujeme do všech částí Prahy. Cena závisí na městské části.</p>
                        </div>
                        {pragueZones.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pragueZones.map(zone => (
                              <div key={zone.id} className="bg-muted/30 border border-border/50 rounded-2xl p-5 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-serif font-bold text-lg text-foreground">{zone.name}</span>
                                  <span className="font-bold text-lg text-primary">{zone.price} Kč</span>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground gap-2">
                                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Doba doručení: {zone.time}</span>
                                  {zone.freeOver && (
                                    <span className="text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-md">
                                      Zdarma od {zone.freeOver} Kč
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center italic py-8">Žádné zóny pro Prahu nejsou k dispozici.</p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="surroundings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <p className="text-foreground text-lg">Doručujeme také do okolí Prahy. Cena a čas doručení závisí na vzdálenosti.</p>
                        </div>
                        {surroundingZones.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {surroundingZones.map(zone => (
                              <div key={zone.id} className="bg-muted/30 border border-border/50 rounded-2xl p-5 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-serif font-bold text-lg text-foreground">{zone.name}</span>
                                  <span className="font-bold text-lg text-primary">{zone.price} Kč</span>
                                </div>
                                <div className="flex flex-col flex-wrap lg:flex-nowrap lg:flex-row justify-between text-sm text-muted-foreground gap-2 lg:items-center">
                                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="w-4 h-4 shrink-0" /> {zone.time}</span>
                                  {zone.freeOver && (
                                    <span className="text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-md text-center">
                                      Zdarma od {zone.freeOver} Kč
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center italic py-8">Žádné zóny pro okolí nejsou k dispozici.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Payment Methods */}
            {paymentMethods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-serif font-bold mb-4">Způsoby platby</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">Vyberte si tu nejpohodlnější formu úhrady.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paymentMethods.map((payment, idx) => {
                    const IconComponent = paymentIcons[payment.icon] || CreditCard;
                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-4">
                          <div className="bg-primary/10 w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <IconComponent className="h-7 w-7" />
                          </div>
                          <h3 className="font-serif font-bold text-xl">{payment.name}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed sm:ml-19">{payment.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* FAQ Custom Accordion */}
            {faqItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-serif font-bold mb-4">Často kladené otázky</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">Vše, co potřebujete vědět o doručení a platbách.</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                  {faqItems.map((faq) => (
                    <FAQAccordionItem
                      key={faq.id}
                      faq={faq}
                      isOpen={openFaqId === faq.id}
                      onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </section>
      )}

      {/* Premium CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif font-bold mb-6">Máte vybráno?</h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Objevte naše hotové kolekce, nebo si vytvořte kytici přesně podle svých představ.
            S doručením si starosti dělat nemusíte, my se o vše postaráme.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all h-14 text-base" asChild>
              <Link to="/catalog">Přejít do katalogu</Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background h-14 text-base" asChild>
              <Link to="/custom-bouquet">Sestavit vlastní kytici</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}