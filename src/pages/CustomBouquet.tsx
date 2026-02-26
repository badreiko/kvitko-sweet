import { useState, useEffect } from "react";
import { FlowerForBouquet, getAllFlowersForBouquet, ItemType } from "@/firebase/services/bouquetFlowerService";
import { ArrowRight, ArrowLeft, Check, Flower, Package, MessageSquare, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { createCustomBouquet } from "@/firebase/services/orderService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Импорт отдельных цветов
import {
  Rose, Tulip, Peony, Sunflower, Lily, Gerbera, Chrysanthemum, Eustoma
} from '@/assets';

// Импорт материалов упаковки
import {
  NaturalPaper, LuxuryPaper, JuteFabric, GiftBoxWrapping
} from '@/assets';

// Импорт дополнительных товаров
import {
  ChocolateBox, TeddyBear, WineBottle, ScentedCandle
} from '@/assets';

// Массив цветов с корректными изображениями
const flowers = [
  { id: "1", name: "Růže", price: 35, imageUrl: Rose },
  { id: "2", name: "Tulipán", price: 25, imageUrl: Tulip },
  { id: "3", name: "Pivoňka", price: 45, imageUrl: Peony },
  { id: "4", name: "Slunečnice", price: 30, imageUrl: Sunflower },
  { id: "5", name: "Lilie", price: 40, imageUrl: Lily },
  { id: "6", name: "Gerbera", price: 28, imageUrl: Gerbera },
  { id: "7", name: "Chryzantéma", price: 32, imageUrl: Chrysanthemum },
  { id: "8", name: "Eustoma", price: 38, imageUrl: Eustoma }
];

// Массив стилей упаковки с корректными изображениями
const wrappingStyles = [
  { id: "1", name: "Přírodní papír", price: 50, imageUrl: NaturalPaper },
  { id: "2", name: "Luxusní papír", price: 80, imageUrl: LuxuryPaper },
  { id: "3", name: "Jutová látka", price: 70, imageUrl: JuteFabric },
  { id: "4", name: "Dárková krabice", price: 120, imageUrl: GiftBoxWrapping }
];

// Массив дополнительных товаров с корректными изображениями
const additionalItems = [
  { id: "1", name: "Čokoládový box", price: 150, imageUrl: ChocolateBox },
  { id: "2", name: "Plyšový medvídek", price: 200, imageUrl: TeddyBear },
  { id: "3", name: "Láhev vína", price: 250, imageUrl: WineBottle },
  { id: "4", name: "Vonná svíčka", price: 180, imageUrl: ScentedCandle }
];

type SelectedFlower = { id: string; quantity: number };
type SelectedAdditionalItem = { id: string; quantity: number };

// Helper function to get display name from various formats
const getDisplayName = (name: unknown): string => {
  if (typeof name === 'string') return name;
  if (name && typeof name === 'object') {
    const nameObj = name as Record<string, string>;
    return nameObj.cs || nameObj.en || nameObj.uk || Object.values(nameObj)[0] || '';
  }
  return '';
};


export default function CustomBouquet() {
  const [step, setStep] = useState(1);
  const [selectedFlowers, setSelectedFlowers] = useState<SelectedFlower[]>([]);
  const [selectedWrapping, setSelectedWrapping] = useState<string>("");
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState<SelectedAdditionalItem[]>([]);
  const [message, setMessage] = useState<string>("");

  const { addToCart } = useCart();
  const { user } = useAuth();
  const [bouquetElements, setBouquetElements] = useState<FlowerForBouquet[]>([]);
  const [loadingElements, setLoadingElements] = useState(true);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [pendingBouquetDetails, setPendingBouquetDetails] = useState<any>(null);

  useEffect(() => {
    const fetchBouquetElements = async () => {
      try {
        setLoadingElements(true);
        const availableElements = await getAllFlowersForBouquet();
        setBouquetElements(availableElements);
      } catch (error) {
        console.error('CustomBouquet: Error fetching elements:', error);
      } finally {
        setLoadingElements(false);
      }
    };
    fetchBouquetElements();
  }, []);

  const calculateTotal = () => {
    let total = 0;
    selectedFlowers.forEach(selected => {
      const flower = bouquetElements.find(f => f.id === selected.id && f.itemType === ItemType.FLOWER);
      if (flower) total += flower.price * selected.quantity;
      else {
        const staticFlower = flowers.find(f => f.id === selected.id);
        if (staticFlower) total += staticFlower.price * selected.quantity;
      }
    });

    if (selectedWrapping) {
      const wrapping = bouquetElements.find(w => w.id === selectedWrapping && w.itemType === ItemType.WRAPPING);
      if (wrapping) total += wrapping.price;
      else {
        const staticWrapping = wrappingStyles.find(w => w.id === selectedWrapping);
        if (staticWrapping) total += staticWrapping.price;
      }
    }

    selectedAdditionalItems.forEach(selected => {
      const item = bouquetElements.find(i => i.id === selected.id && i.itemType === ItemType.ADDITION);
      if (item) total += item.price * selected.quantity;
      else {
        const staticItem = additionalItems.find(i => i.id === selected.id);
        if (staticItem) total += staticItem.price * selected.quantity;
      }
    });

    return total;
  };

  const handleFlowerChange = (flowerId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedFlowers(prev => prev.filter(f => f.id !== flowerId));
    } else {
      const existingIndex = selectedFlowers.findIndex(f => f.id === flowerId);
      if (existingIndex >= 0) {
        const updated = [...selectedFlowers];
        updated[existingIndex].quantity = quantity;
        setSelectedFlowers(updated);
      } else {
        setSelectedFlowers(prev => [...prev, { id: flowerId, quantity }]);
      }
    }
  };

  const handleAdditionalItemChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedAdditionalItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      const existingIndex = selectedAdditionalItems.findIndex(i => i.id === itemId);
      if (existingIndex >= 0) {
        const updated = [...selectedAdditionalItems];
        updated[existingIndex].quantity = quantity;
        setSelectedAdditionalItems(updated);
      } else {
        setSelectedAdditionalItems(prev => [...prev, { id: itemId, quantity }]);
      }
    }
  };

  const getFlowerQuantity = (flowerId: string) => {
    return selectedFlowers.find(f => f.id === flowerId)?.quantity || 0;
  };

  const getAdditionalItemQuantity = (itemId: string) => {
    return selectedAdditionalItems.find(i => i.id === itemId)?.quantity || 0;
  };

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return selectedFlowers.length > 0;
      case 2: return selectedWrapping !== "";
      case 3: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (step < 4 && isStepComplete(step)) setStep(step + 1);
  };
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Helper for Summary Preview
  const getItemDetails = (id: string, type: ItemType) => {
    const fromDb = bouquetElements.find(el => el.id === id && el.itemType === type);
    if (fromDb) return { name: getDisplayName(fromDb.name), price: fromDb.price, img: fromDb.imageUrl || `https://via.placeholder.com/150` };

    let fallbackArr: any[] = [];
    if (type === ItemType.FLOWER) fallbackArr = flowers;
    if (type === ItemType.WRAPPING) fallbackArr = wrappingStyles;
    if (type === ItemType.ADDITION) fallbackArr = additionalItems;

    const fallback = fallbackArr.find(el => el.id === id);
    if (fallback) return { name: fallback.name, price: fallback.price, img: fallback.imageUrl };
    return null;
  };

  const totalItemsCount = selectedFlowers.reduce((sum, f) => sum + f.quantity, 0);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="container-custom relative z-10">
          <Badge className="mb-4 bg-background/50 text-foreground backdrop-blur-md hover:bg-background/80 transition-colors cursor-default border-border/50">
            Designové Studio
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-foreground tracking-tight balance-text">
            Sestavte si <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic font-light pr-2">Mistrovské dílo</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed mix-blend-multiply dark:mix-blend-screen">
            Staňte se na chvíli naším floristou. Vyberte si ty nejčerstvější květiny, zvolte elegantní balení a vytvořte kytici, která vypráví váš vlastní příběh.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background min-h-[600px]">
        <div className="container-custom">
          {/* Progress Steps (Apple-style pill navigation) */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="flex bg-muted/50 p-1.5 rounded-full border border-border/50 backdrop-blur-sm relative overflow-hidden">
              {/* Active Tab Background Pill */}
              <div
                className="absolute top-1.5 bottom-1.5 rounded-full bg-background shadow-sm border border-border/50 transition-all duration-500 ease-out"
                style={{
                  width: 'calc(25% - 6px)',
                  left: `calc(${(step - 1) * 25}% + 3px)`
                }}
              />

              <button onClick={() => setStep(1)} className={`relative w-1/4 py-3 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${step === 1 ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <Flower className="h-4 w-4" /> <span className="hidden sm:inline">1. Květiny</span>
              </button>
              <button onClick={() => isStepComplete(1) && setStep(2)} disabled={!isStepComplete(1)} className={`relative w-1/4 py-3 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${step === 2 ? 'text-primary' : 'text-muted-foreground hover:text-foreground disabled:opacity-50'}`}>
                <Package className="h-4 w-4" /> <span className="hidden sm:inline">2. Balení</span>
              </button>
              <button onClick={() => isStepComplete(2) && setStep(3)} disabled={!isStepComplete(2)} className={`relative w-1/4 py-3 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${step === 3 ? 'text-primary' : 'text-muted-foreground hover:text-foreground disabled:opacity-50'}`}>
                <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">3. Doplňky</span>
              </button>
              <button onClick={() => isStepComplete(2) && setStep(4)} disabled={!isStepComplete(2)} className={`relative w-1/4 py-3 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${step === 4 ? 'text-primary' : 'text-muted-foreground hover:text-foreground disabled:opacity-50'}`}>
                <Check className="h-4 w-4" /> <span className="hidden sm:inline">4. Shrnutí</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Main Content Area (Left/Center) */}
            <div className="lg:col-span-8 overflow-hidden min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full flex flex-col"
                >

                  {/* Step 1: Květiny */}
                  {step === 1 && (
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-serif font-bold">Vyberte květiny</h2>
                          <p className="text-muted-foreground mt-2">Základ vaší kytice. Můžete kombinovat různé druhy a barvy.</p>
                        </div>
                        <Badge variant="outline" className="text-lg py-1 px-3 bg-primary/5 hidden sm:flex">
                          {totalItemsCount} ks
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pb-8">
                        {loadingElements ? (
                          <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                            <span className="text-muted-foreground animate-pulse">Načítání čerstvých květin...</span>
                          </div>
                        ) : bouquetElements.filter(el => el.itemType === ItemType.FLOWER).length === 0 ? (
                          <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground">V současné době nejsou k dispozici žádné květiny.</p>
                          </div>
                        ) : (
                          bouquetElements.filter(el => el.itemType === ItemType.FLOWER).map(flower => {
                            const qty = getFlowerQuantity(flower.id);
                            const name = getDisplayName(flower.name);
                            return (
                              <div
                                key={flower.id}
                                className={`group relative bg-background rounded-2xl border transition-all duration-300 overflow-hidden ${qty > 0 ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md'}`}
                              >
                                <div className="aspect-square overflow-hidden bg-muted">
                                  <img
                                    src={flower.imageUrl || `https://via.placeholder.com/300?text=${encodeURIComponent(name)}`}
                                    alt={name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </div>
                                <div className="p-4 bg-background/95 backdrop-blur-sm z-10 relative">
                                  <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-medium text-foreground">{name}</h3>
                                    <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{flower.price} Kč</span>
                                  </div>

                                  <div className="flex items-center justify-between bg-muted/50 rounded-full p-1 border border-border/50">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-background hover:text-destructive"
                                      onClick={() => handleFlowerChange(flower.id, Math.max(0, qty - 1))}
                                      disabled={qty === 0}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className={`w-8 text-center font-medium ${qty > 0 ? 'text-primary' : 'text-foreground'}`}>{qty}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-background hover:text-primary"
                                      onClick={() => handleFlowerChange(flower.id, qty + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Balení */}
                  {step === 2 && (
                    <div className="flex-1">
                      <div className="mb-8">
                        <h2 className="text-3xl font-serif font-bold">Způsob balení</h2>
                        <p className="text-muted-foreground mt-2">Dodejte vaší kytici ten správný finiš s našimi prémiovými materiály.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
                        {loadingElements ? (
                          <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                            <span className="text-muted-foreground animate-pulse">Načítání stylů balení...</span>
                          </div>
                        ) : bouquetElements.filter(el => el.itemType === ItemType.WRAPPING).length === 0 ? (
                          <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground">Aktuálně nemáme k dispozici žádné možnosti balení.</p>
                          </div>
                        ) : (
                          bouquetElements.filter(el => el.itemType === ItemType.WRAPPING).map(wrapping => {
                            const name = getDisplayName(wrapping.name);
                            const isSelected = selectedWrapping === wrapping.id;

                            return (
                              <div
                                key={wrapping.id}
                                onClick={() => setSelectedWrapping(wrapping.id)}
                                className={`cursor-pointer group relative bg-background rounded-2xl border transition-all duration-300 overflow-hidden flex flex-row items-center p-3 gap-4 ${isSelected ? 'border-primary shadow-md ring-1 ring-primary/20 bg-primary/5' : 'border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md'}`}
                              >
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                                  <img
                                    src={wrapping.imageUrl || `https://via.placeholder.com/300?text=${encodeURIComponent(name)}`}
                                    alt={name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                      <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                                        <Check className="w-5 h-5" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 py-2">
                                  <h3 className={`font-medium mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>{name}</h3>
                                  <p className="text-sm text-muted-foreground">{wrapping.price} Kč</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Doplňky & Vzkaz */}
                  {step === 3 && (
                    <div className="flex-1">
                      <div className="mb-8">
                        <h2 className="text-3xl font-serif font-bold">Přidejte osobní dotek</h2>
                        <p className="text-muted-foreground mt-2">Drobnost navíc a láskyplný vzkaz dělají divy.</p>
                      </div>

                      <Tabs defaultValue="items" className="w-full">
                        <TabsList className="mb-8 p-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-xl w-full max-w-sm">
                          <TabsTrigger value="items" className="w-1/2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Dárky</TabsTrigger>
                          <TabsTrigger value="message" className="w-1/2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Vzkaz</TabsTrigger>
                        </TabsList>

                        <TabsContent value="items" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
                            {loadingElements ? (
                              <div className="col-span-full flex justify-center py-20">
                                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                              </div>
                            ) : bouquetElements.filter(el => el.itemType === ItemType.ADDITION).length === 0 ? (
                              <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                                <p className="text-muted-foreground">Aktuálně nemáme k dispozici žádné doplňky.</p>
                              </div>
                            ) : (
                              bouquetElements.filter(el => el.itemType === ItemType.ADDITION).map(addition => {
                                const qty = getAdditionalItemQuantity(addition.id);
                                const name = getDisplayName(addition.name);

                                return (
                                  <div key={addition.id} className={`group relative bg-background rounded-2xl border transition-all duration-300 overflow-hidden flex flex-row items-center p-3 gap-4 ${qty > 0 ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md'}`}>
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                                      <img
                                        src={addition.imageUrl || `https://via.placeholder.com/300?text=${encodeURIComponent(name)}`}
                                        alt={name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between h-full py-1">
                                      <div>
                                        <h3 className="font-medium text-sm sm:text-base line-clamp-1">{name}</h3>
                                        <p className="text-sm font-semibold text-muted-foreground">{addition.price} Kč</p>
                                      </div>
                                      <div className="mt-2 flex items-center justify-between bg-muted/40 rounded-full p-1 border border-border/50 max-w-[120px]">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background" onClick={() => handleAdditionalItemChange(addition.id, Math.max(0, qty - 1))} disabled={qty === 0}>
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className={`text-sm font-medium ${qty > 0 ? 'text-primary' : ''}`}>{qty}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background" onClick={() => handleAdditionalItemChange(addition.id, qty + 1)}>
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="message" className="mt-0 focus-visible:outline-none focus-visible:ring-0 pb-8">
                          <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                            <Label htmlFor="message" className="text-base font-medium mb-3 block">Napište vzkaz na kartičku</Label>
                            <Textarea
                              id="message"
                              placeholder="Milí oslavenče, přeji ti vše nejlepší k narozeninám..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="mt-2 text-base resize-none bg-background border-border/50 focus-visible:ring-primary/20"
                              rows={5}
                            />
                            <p className="text-xs text-muted-foreground mt-3 text-right">Kartičku přidáme ke kytici zdarma.</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {/* Step 4: Hotovo / Shrnutí Main view */}
                  {step === 4 && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-md animate-fade-in-up">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                          <Check className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold mb-4">Vaše mistrovské dílo je připraveno</h2>
                        <p className="text-muted-foreground mb-8">
                          Zkontrolujte si ingredience v košíku vpravo a přidejte kytici do objednávky. Naši floristé ji poskládají s maximální péčí.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Desktop Navigation Below Content */}
                  <div className="mt-auto pt-6 pb-6 border-t border-border/50 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={prevStep}
                      className={`gap-2 ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                      <ArrowLeft className="w-4 h-4" /> Zpět
                    </Button>

                    {step < 4 ? (
                      <Button onClick={nextStep} disabled={!isStepComplete(step)} className="gap-2 rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                        Pokračovat <ArrowRight className="w-4 h-4 leading-none inline-block mt-[1px]" />
                      </Button>
                    ) : (
                      <Button disabled className="opacity-0 pointer-events-none">Dokončeno</Button>
                    )}
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Live Sidebar Cart / Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">

                <div className="p-6 border-b border-border/50 bg-muted/10 shrink-0">
                  <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" /> Vaše Kytice
                  </h3>
                </div>

                <div className="p-6 overflow-y-auto flex-1 scrollbar-thin space-y-6">
                  {/* Flores Preview */}
                  {selectedFlowers.length > 0 ? (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">Květiny</h4>
                      <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                          {selectedFlowers.map(selected => {
                            const details = getItemDetails(selected.id, ItemType.FLOWER);
                            if (!details) return null;
                            return (
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                key={selected.id}
                                className="flex justify-between items-center group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted relative">
                                    <img src={details.img} alt={details.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-0 right-0 bg-primary/90 text-white text-[10px] w-4 h-4 flex items-center justify-center font-bold rounded-bl-lg shadow-sm">
                                      {selected.quantity}
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium truncate max-w-[120px] xl:max-w-[160px]">{details.name}</span>
                                </div>
                                <motion.span key={selected.quantity} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-sm text-muted-foreground whitespace-nowrap">
                                  {details.price * selected.quantity} Kč
                                </motion.span>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Flower className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground italic">Zatím jste nevybrali žádné květiny</p>
                    </div>
                  )}

                  {/* Wrapping Preview */}
                  {selectedWrapping && (
                    <>
                      <Separator className="bg-border/50" />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">Balení</h4>
                        {(() => {
                          const details = getItemDetails(selectedWrapping, ItemType.WRAPPING);
                          if (!details) return null;
                          return (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                                  <img src={details.img} alt={details.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-medium truncate max-w-[120px] xl:max-w-[160px]">{details.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">{details.price} Kč</span>
                            </motion.div>
                          )
                        })()}
                      </div>
                    </>
                  )}

                  {/* Additions Preview */}
                  {selectedAdditionalItems.length > 0 && (
                    <>
                      <Separator className="bg-border/50" />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">Doplňky</h4>
                        <div className="space-y-4">
                          <AnimatePresence>
                            {selectedAdditionalItems.map(selected => {
                              const details = getItemDetails(selected.id, ItemType.ADDITION);
                              if (!details) return null;
                              return (
                                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={selected.id} className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted relative">
                                      <img src={details.img} alt={details.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-sm font-medium truncate max-w-[120px] xl:max-w-[160px]">{details.name}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">{details.price * selected.quantity} Kč</span>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Message Preview */}
                  {message && (
                    <>
                      <Separator className="bg-border/50" />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Vzkaz na kartičku</h4>
                        <p className="text-sm italic text-muted-foreground p-3 bg-muted/30 rounded-lg line-clamp-3">"{message}"</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Total & Checkout Button */}
                <div className="p-6 bg-muted/20 border-t border-border/50 shrink-0">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Celkem za kytici</span>
                    <motion.span
                      key={calculateTotal()}
                      initial={{ scale: 1.1, color: "hsl(var(--primary))" }}
                      animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                      className="text-2xl font-bold font-serif"
                    >
                      {calculateTotal()} Kč
                    </motion.span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base py-6 bg-primary text-primary-foreground group"
                    disabled={selectedFlowers.length === 0}
                    onClick={async () => {
                      let bouquetId = Date.now().toString();

                      const bouquetFlowers = selectedFlowers.map(s => {
                        const d = getItemDetails(s.id, ItemType.FLOWER);
                        return { id: s.id, name: d?.name || '', price: d?.price || 0, quantity: s.quantity, imageUrl: d?.img || '', itemType: ItemType.FLOWER };
                      });

                      let bouquetWrapping = null;
                      if (selectedWrapping) {
                        const d = getItemDetails(selectedWrapping, ItemType.WRAPPING);
                        bouquetWrapping = { id: selectedWrapping, name: d?.name || '', price: d?.price || 0, imageUrl: d?.img || '', itemType: ItemType.WRAPPING };
                      }

                      const bouquetAdditions = selectedAdditionalItems.map(s => {
                        const d = getItemDetails(s.id, ItemType.ADDITION);
                        return { id: s.id, name: d?.name || '', price: d?.price || 0, quantity: s.quantity, imageUrl: d?.img || '', itemType: ItemType.ADDITION };
                      });

                      const bouquetImageUrl = bouquetFlowers[0]?.imageUrl || '';
                      const totalPrice = calculateTotal();

                      const proceedAddToCart = async (shouldSaveToDb: boolean) => {
                        try {
                          // Create custom bouquet in DB if user wants to save it
                          if (shouldSaveToDb && user) {
                            const dbId = await createCustomBouquet({
                              userId: user.id,
                              flowers: bouquetFlowers.map(f => ({ id: f.id, name: f.name, quantity: f.quantity, price: f.price })),
                              wrapping: bouquetWrapping ? { id: bouquetWrapping.id, name: bouquetWrapping.name, price: bouquetWrapping.price } : undefined,
                              additionalItems: bouquetAdditions.map(a => ({ id: a.id, name: a.name, quantity: a.quantity, price: a.price })),
                              message: message,
                              totalPrice: totalPrice,
                              status: 'submitted'
                            });
                            bouquetId = dbId;
                          }

                          await addToCart({
                            id: bouquetId,
                            name: 'Vlastní kytice',
                            price: totalPrice,
                            imageUrl: bouquetImageUrl,
                            isCustomBouquet: true,
                            customBouquetData: {
                              flowers: bouquetFlowers.map(f => ({ id: f.id, name: f.name, quantity: f.quantity, price: f.price })),
                              wrapping: bouquetWrapping ? { id: bouquetWrapping.id, name: bouquetWrapping.name, price: bouquetWrapping.price } : undefined,
                              additionalItems: bouquetAdditions.map(a => ({ id: a.id, name: a.name, quantity: a.quantity, price: a.price })),
                              message: message
                            }
                          });

                          toast.success('Kytice uložena do košíku!', {
                            description: `Celková cena: ${totalPrice} Kč`,
                            icon: <Check className="w-4 h-4" />
                          });
                        } catch (error) {
                          toast.error('Chyba při přidávání do košíku');
                        }
                      };

                      if (user) {
                        setPendingBouquetDetails(() => proceedAddToCart);
                        setIsSaveDialogOpen(true);
                      } else {
                        await proceedAddToCart(false);
                      }
                    }}
                  >
                    Přidat do košíku
                    <ShoppingBag className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dialog pro uložení kytice do profilu */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Uložit kytici na profil?</DialogTitle>
            <DialogDescription>
              Přidáváte tuto kytici do košíku. Přejete si tuto vlastní kytici také uložit na svém profilu do záložky "Moje kytice" pro budoucí nákupy?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={async () => {
                setIsSaveDialogOpen(false);
                if (pendingBouquetDetails) await pendingBouquetDetails(false);
                setPendingBouquetDetails(null);
              }}
            >
              Ne, jen přidat do košíku
            </Button>
            <Button
              onClick={async () => {
                setIsSaveDialogOpen(false);
                if (pendingBouquetDetails) await pendingBouquetDetails(true);
                setPendingBouquetDetails(null);
              }}
            >
              Ano, uložit a přidat do košíku
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}