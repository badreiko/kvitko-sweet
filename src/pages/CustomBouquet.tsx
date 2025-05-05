import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Flower, Package, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";

// Импорт отдельных цветов
import { 
  Rose, 
  Tulip, 
  Peony, 
  Sunflower, 
  Lily, 
  Gerbera, 
  Chrysanthemum, 
  Eustoma 
} from '@/assets';

// Импорт материалов упаковки
import { 
  NaturalPaper, 
  LuxuryPaper, 
  JuteFabric, 
  GiftBoxWrapping 
} from '@/assets';

// Импорт дополнительных товаров
import { 
  ChocolateBox, 
  TeddyBear, 
  WineBottle, 
  ScentedCandle 
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

type SelectedFlower = {
  id: string;
  quantity: number;
};

type SelectedAdditionalItem = {
  id: string;
  quantity: number;
};

export default function CustomBouquet() {
  const [step, setStep] = useState(1);
  const [selectedFlowers, setSelectedFlowers] = useState<SelectedFlower[]>([]);
  const [selectedWrapping, setSelectedWrapping] = useState<string>("");
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState<SelectedAdditionalItem[]>([]);
  const [message, setMessage] = useState<string>("");
  
  // Calculate total price
  const calculateTotal = () => {
    let total = 0;
    
    // Add flowers
    selectedFlowers.forEach(selected => {
      const flower = flowers.find(f => f.id === selected.id);
      if (flower) {
        total += flower.price * selected.quantity;
      }
    });
    
    // Add wrapping
    if (selectedWrapping) {
      const wrapping = wrappingStyles.find(w => w.id === selectedWrapping);
      if (wrapping) {
        total += wrapping.price;
      }
    }
    
    // Add additional items
    selectedAdditionalItems.forEach(selected => {
      const item = additionalItems.find(i => i.id === selected.id);
      if (item) {
        total += item.price * selected.quantity;
      }
    });
    
    return total;
  };
  
  // Handle flower selection
  const handleFlowerChange = (flowerId: string, quantity: number) => {
    if (quantity === 0) {
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
  
  // Handle additional item selection
  const handleAdditionalItemChange = (itemId: string, quantity: number) => {
    if (quantity === 0) {
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
  
  // Get flower quantity
  const getFlowerQuantity = (flowerId: string) => {
    const found = selectedFlowers.find(f => f.id === flowerId);
    return found ? found.quantity : 0;
  };
  
  // Get additional item quantity
  const getAdditionalItemQuantity = (itemId: string) => {
    const found = selectedAdditionalItems.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };
  
  // Check if step is complete
  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return selectedFlowers.length > 0;
      case 2:
        return selectedWrapping !== "";
      case 3:
        return true; // Additional items are optional
      default:
        return false;
    }
  };
  
  // Next step
  const nextStep = () => {
    if (step < 4 && isStepComplete(step)) {
      setStep(step + 1);
    }
  };
  
  // Previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-muted py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Vytvořte si vlastní kytici</h1>
          <p className="text-muted-foreground max-w-2xl">
            Navrhněte si kytici podle vašich představ. Vyberte si květiny, barvy a styl, 
            a my vytvoříme jedinečnou kytici přesně podle vašich přání.
          </p>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container-custom">
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Flower className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Květiny</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Balení</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Doplňky</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${step >= 4 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Check className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Shrnutí</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Select Flowers */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-semibold mb-6">Vyberte květiny</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {flowers.map(flower => (
                      <Card key={flower.id} className={`overflow-hidden border ${selectedFlowers.some(f => f.id === flower.id) ? 'border-primary' : 'border-border'}`}>
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={flower.imageUrl} 
                            alt={flower.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{flower.name}</h3>
                            <span>{flower.price} Kč/ks</span>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleFlowerChange(flower.id, Math.max(0, getFlowerQuantity(flower.id) - 1))}
                              disabled={getFlowerQuantity(flower.id) === 0}
                            >
                              -
                            </Button>
                            <span className="mx-3 min-w-8 text-center">{getFlowerQuantity(flower.id)}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleFlowerChange(flower.id, getFlowerQuantity(flower.id) + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Step 2: Select Wrapping */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-semibold mb-6">Vyberte balení</h2>
                  <RadioGroup value={selectedWrapping} onValueChange={setSelectedWrapping}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wrappingStyles.map(style => (
                        <div key={style.id}>
                          <RadioGroupItem
                            value={style.id}
                            id={`wrapping-${style.id}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`wrapping-${style.id}`}
                            className={`cursor-pointer block h-full ${selectedWrapping === style.id ? 'ring-2 ring-primary' : ''}`}
                          >
                            <Card className="overflow-hidden h-full">
                              <div className="aspect-video overflow-hidden">
                                <img 
                                  src={style.imageUrl} 
                                  alt={style.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-medium">{style.name}</h3>
                                  <span>{style.price} Kč</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              {/* Step 3: Additional Items */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-semibold mb-6">Přidejte doplňky a vzkaz</h2>
                  
                  <Tabs defaultValue="items">
                    <TabsList className="mb-6">
                      <TabsTrigger value="items">Doplňky</TabsTrigger>
                      <TabsTrigger value="message">Vzkaz</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="items">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {additionalItems.map(item => (
                          <Card key={item.id} className={`overflow-hidden border ${selectedAdditionalItems.some(i => i.id === item.id) ? 'border-primary' : 'border-border'}`}>
                            <div className="aspect-video overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{item.name}</h3>
                                <span>{item.price} Kč</span>
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleAdditionalItemChange(item.id, Math.max(0, getAdditionalItemQuantity(item.id) - 1))}
                                  disabled={getAdditionalItemQuantity(item.id) === 0}
                                >
                                  -
                                </Button>
                                <span className="mx-3 min-w-8 text-center">{getAdditionalItemQuantity(item.id)}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleAdditionalItemChange(item.id, getAdditionalItemQuantity(item.id) + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="message">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="message">Přidat vzkaz ke kytici</Label>
                          <Textarea
                            id="message"
                            placeholder="Napište svůj vzkaz..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="mt-2"
                            rows={5}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Step 4: Summary */}
              {step === 4 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-semibold mb-6">Shrnutí objednávky</h2>
                  
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Vybrané květiny</h3>
                      {selectedFlowers.length > 0 ? (
                        <div className="space-y-3">
                          {selectedFlowers.map(selected => {
                            const flower = flowers.find(f => f.id === selected.id);
                            return flower ? (
                              <div key={flower.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-md overflow-hidden">
                                    <img 
                                      src={flower.imageUrl} 
                                      alt={flower.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span>{flower.name} × {selected.quantity}</span>
                                </div>
                                <span>{flower.price * selected.quantity} Kč</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Žádné květiny nebyly vybrány</p>
                      )}
                      
                      <Separator className="my-4" />
                      
                      <h3 className="font-semibold text-lg mb-4">Balení</h3>
                      {selectedWrapping ? (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden">
                              <img 
                                src={wrappingStyles.find(w => w.id === selectedWrapping)?.imageUrl} 
                                alt={wrappingStyles.find(w => w.id === selectedWrapping)?.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span>{wrappingStyles.find(w => w.id === selectedWrapping)?.name}</span>
                          </div>
                          <span>{wrappingStyles.find(w => w.id === selectedWrapping)?.price} Kč</span>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Žádné balení nebylo vybráno</p>
                      )}
                      
                      {selectedAdditionalItems.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          
                          <h3 className="font-semibold text-lg mb-4">Doplňky</h3>
                          <div className="space-y-3">
                            {selectedAdditionalItems.map(selected => {
                              const item = additionalItems.find(i => i.id === selected.id);
                              return item ? (
                                <div key={item.id} className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-md overflow-hidden">
                                      <img 
                                        src={item.imageUrl} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span>{item.name} × {selected.quantity}</span>
                                  </div>
                                  <span>{item.price * selected.quantity} Kč</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </>
                      )}
                      
                      {message && (
                        <>
                          <Separator className="my-4" />
                          
                          <h3 className="font-semibold text-lg mb-4">Vzkaz</h3>
                          <p className="italic">"{message}"</p>
                        </>
                      )}
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Celková cena</span>
                        <span>{calculateTotal()} Kč</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button size="lg" className="w-full">
                    Přidat do košíku
                  </Button>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zpět
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {step < 4 && (
                  <Button 
                    onClick={nextStep}
                    disabled={!isStepComplete(step)}
                  >
                    Další
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Shrnutí</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Vybrané květiny</h4>
                        {selectedFlowers.length > 0 ? (
                          <ul className="space-y-1">
                            {selectedFlowers.map(selected => {
                              const flower = flowers.find(f => f.id === selected.id);
                              return flower ? (
                                <li key={flower.id} className="flex justify-between text-sm">
                                  <span>{flower.name} × {selected.quantity}</span>
                                  <span>{flower.price * selected.quantity} Kč</span>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Žádné květiny nebyly vybrány</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Balení</h4>
                        {selectedWrapping ? (
                          <div className="flex justify-between text-sm">
                            <span>{wrappingStyles.find(w => w.id === selectedWrapping)?.name}</span>
                            <span>{wrappingStyles.find(w => w.id === selectedWrapping)?.price} Kč</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Žádné balení nebylo vybráno</p>
                        )}
                      </div>
                      
                      {selectedAdditionalItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Doplňky</h4>
                          <ul className="space-y-1">
                            {selectedAdditionalItems.map(selected => {
                              const item = additionalItems.find(i => i.id === selected.id);
                              return item ? (
                                <li key={item.id} className="flex justify-between text-sm">
                                  <span>{item.name} × {selected.quantity}</span>
                                  <span>{item.price * selected.quantity} Kč</span>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                      )}
                      
                      {message && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Vzkaz</h4>
                          <p className="text-sm italic truncate">{message}</p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between font-semibold">
                        <span>Celková cena</span>
                        <span>{calculateTotal()} Kč</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}