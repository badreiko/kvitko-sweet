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
  { id: "prague-1", name: "Praha 1", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-2", name: "Praha 2", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-3", name: "Praha 3", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-4", name: "Praha 4", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-5", name: "Praha 5", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-6", name: "Praha 6", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-7", name: "Praha 7", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-8", name: "Praha 8", time: "2-3 часа", price: 149, freeOver: 1500 },
  { id: "prague-9", name: "Praha 9", time: "3-4 часа", price: 199, freeOver: 1500 },
  { id: "prague-10", name: "Praha 10", time: "3-4 часа", price: 199, freeOver: 1500 },
];

const surroundingZones: DeliveryZone[] = [
  { id: "zone-1", name: "До 10 км от Праги", time: "3-5 часов", price: 249, freeOver: 2000 },
  { id: "zone-2", name: "10-20 км от Праги", time: "3-5 часов", price: 349, freeOver: 2500 },
  { id: "zone-3", name: "20-30 км от Праги", time: "4-6 часов", price: 449, freeOver: 3000 },
];

const deliveryOptions = [
  {
    id: "standard",
    name: "Стандартная доставка",
    description: "Доставка в тот же день, если заказ сделан до 14:00",
    price: 149,
    icon: Truck
  },
  {
    id: "express",
    name: "Экспресс-доставка",
    description: "Доставка в течение 2-3 часов с момента заказа",
    price: 249,
    icon: Clock
  },
  {
    id: "scheduled",
    name: "Запланированная доставка",
    description: "Выберите конкретную дату и временной интервал",
    price: 199,
    icon: Calendar
  },
  {
    id: "pickup",
    name: "Самовывоз",
    description: "Забрать заказ из нашего магазина",
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Доставка и оплата</h1>
          <p className="text-muted-foreground max-w-2xl">
            Мы предлагаем быструю и надежную доставку по Праге и окрестностям. Выберите удобный для вас способ доставки и оплаты.
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
                <h3 className="font-semibold text-lg mb-2">Быстрая доставка</h3>
                <p className="text-muted-foreground">
                  Доставляем в день заказа по всей Праге. В окрестности доставка в течение 3-5 часов.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Бесплатная доставка</h3>
                <p className="text-muted-foreground">
                  При заказе от 1500 Kč доставка по Праге бесплатна. Для окрестностей от 2000 Kč.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Различные способы оплаты</h3>
                <p className="text-muted-foreground">
                  Принимаем оплату картой, наличными при доставке, и банковским переводом.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Delivery Options */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Варианты доставки</h2>
            
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
                        {option.price > 0 ? `${option.price} Kč` : "Бесплатно"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Delivery Zones */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Зоны доставки</h2>
            
            <Tabs defaultValue="prague" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="prague">Прага</TabsTrigger>
                <TabsTrigger value="surroundings">Окрестности</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prague">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-muted-foreground">
                        Мы доставляем во все районы Праги. Стоимость доставки зависит от района.
                        При заказе от 1500 Kč доставка бесплатна.
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
                            <span>Время доставки: {zone.time}</span>
                            {zone.freeOver && (
                              <span>Бесплатно от {zone.freeOver} Kč</span>
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
                        Мы также доставляем в окрестности Праги. Стоимость и время доставки зависят от расстояния.
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
                            <span>Время доставки: {zone.time}</span>
                            {zone.freeOver && (
                              <span>Бесплатно от {zone.freeOver} Kč</span>
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
            <h2 className="text-2xl font-semibold mb-6">Способы оплаты</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Банковская карта</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Оплатите заказ онлайн банковской картой Visa, Mastercard, American Express.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Наличные при доставке</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Оплатите заказ наличными курьеру при получении.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <PackageCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Банковский перевод</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Оплатите заказ банковским переводом. Заказ будет обработан после получения оплаты.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Часто задаваемые вопросы</h2>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Как быстро вы доставляете?</h3>
                  <p className="text-muted-foreground">
                    Для Праги стандартная доставка осуществляется в тот же день, если заказ размещен до 14:00.
                    Экспресс-доставка выполняется в течение 2-3 часов с момента подтверждения заказа.
                    Для окрестностей доставка занимает 3-6 часов в зависимости от расстояния.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Могу ли я выбрать конкретное время доставки?</h3>
                  <p className="text-muted-foreground">
                    Да, вы можете выбрать запланированную доставку и указать желаемую дату и временной интервал.
                    Данная услуга стоит 199 Kč.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Что делать, если получателя нет дома?</h3>
                  <p className="text-muted-foreground">
                    В случае отсутствия получателя, курьер свяжется с ним по телефону.
                    Если связаться не удалось, курьер оставит уведомление и цветы будут возвращены в магазин.
                    Мы свяжемся с вами для организации повторной доставки.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Можно ли доставить цветы анонимно?</h3>
                  <p className="text-muted-foreground">
                    Да, вы можете указать, что желаете сохранить анонимность. В этом случае получатель не будет знать, кто отправил цветы,
                    если вы не укажете это в карточке с сообщением.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Доставляете ли вы в другие города Чехии?</h3>
                  <p className="text-muted-foreground">
                    На данный момент мы осуществляем доставку только по Праге и ближайшим окрестностям в радиусе 30 км.
                    Для доставки в другие города, пожалуйста, свяжитесь с нами для индивидуального расчета.
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
          <h2 className="text-2xl font-bold mb-4">Готовы сделать заказ?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Выберите идеальный букет из нашего каталога или создайте свой собственный.
            Мы доставим его с любовью и заботой.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/catalog">Перейти в каталог</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/custom-bouquet">Создать свой букет</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}