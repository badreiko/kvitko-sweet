// src/pages/Account.tsx
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders, getUserCustomBouquets } from "@/firebase/services";
import { Order, CustomBouquet } from "@/app/repo/apps/firestore/models/product";
import { toast } from "sonner";
import { User, Settings, LogOut, Package, ShoppingBag, Heart } from "lucide-react";

export default function Account() {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customBouquets, setCustomBouquets] = useState<CustomBouquet[]>([]);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || ""
    }
  });

  // Загрузка данных пользователя
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          // Загружаем заказы пользователя
          const userOrders = await getUserOrders(user.id);
          setOrders(userOrders);
          
          // Загружаем пользовательские букеты
          const userBouquets = await getUserCustomBouquets(user.id);
          setCustomBouquets(userBouquets);
        } catch (error) {
          console.error('Error loading user data:', error);
          toast.error('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        }
      };
      
      loadUserData();
    }
  }, [user]);

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Обрабатываем вложенные поля (адрес)
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      // Обрабатываем обычные поля
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Обновление профиля
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile({
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address
      });
      
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Не удалось обновить профиль. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Выход из аккаунта
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Вы успешно вышли из аккаунта');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Ошибка при выходе из аккаунта');
    }
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Мой аккаунт</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Боковое меню */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">{user?.displayName || 'Пользователь'}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <Separator className="mb-6" />
                
                <nav className="space-y-1">
                  <Button 
                    variant={activeTab === "profile" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Личные данные
                  </Button>
                  <Button 
                    variant={activeTab === "orders" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("orders")}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Мои заказы
                  </Button>
                  <Button 
                    variant={activeTab === "bouquets" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("bouquets")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Мои букеты
                  </Button>
                  <Button 
                    variant={activeTab === "settings" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </Button>
                  <Separator className="my-2" />
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive hover:text-destructive" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Основное содержимое */}
          <div className="md:col-span-3">
            {/* Профиль */}
            {activeTab === "profile" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Личные данные</h2>
                  
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Имя</Label>
                        <Input 
                          id="displayName" 
                          name="displayName" 
                          value={profileData.displayName} 
                          onChange={handleChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          value={profileData.email} 
                          onChange={handleChange} 
                          disabled 
                        />
                        <p className="text-xs text-muted-foreground">Электронная почта не может быть изменена</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Телефон</Label>
                        <Input 
                          id="phoneNumber" 
                          name="phoneNumber" 
                          value={profileData.phoneNumber} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-4">Адрес доставки</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <Label htmlFor="address.street">Улица и номер дома</Label>
                        <Input 
                          id="address.street" 
                          name="address.street" 
                          value={profileData.address.street} 
                          onChange={handleChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.city">Город</Label>
                        <Input 
                          id="address.city" 
                          name="address.city" 
                          value={profileData.address.city} 
                          onChange={handleChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.postalCode">Почтовый индекс</Label>
                        <Input 
                          id="address.postalCode" 
                          name="address.postalCode" 
                          value={profileData.address.postalCode} 
                          onChange={handleChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.country">Страна</Label>
                        <Input 
                          id="address.country" 
                          name="address.country" 
                          value={profileData.address.country} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {/* Заказы */}
            {activeTab === "orders" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Мои заказы</h2>
                  
                  {orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-medium">Заказ #{order.id.slice(0, 6)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status === 'delivered' ? 'Доставлен' : 
                                   order.status === 'shipped' ? 'Отправлен' : 
                                   order.status === 'processing' ? 'В обработке' : 
                                   order.status === 'pending' ? 'Ожидает оплаты' : 
                                   'Отменен'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{item.name} × {item.quantity}</span>
                                  <span>{item.price * item.quantity} Kč</span>
                                </div>
                              ))}
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="flex justify-between font-semibold">
                              <span>Итого:</span>
                              <span>{order.totalAmount} Kč</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">У вас пока нет заказов</h3>
                      <p className="text-muted-foreground mb-6">
                        Когда вы разместите свой первый заказ, он появится здесь.
                      </p>
                      <Button asChild>
                        <a href="/catalog">Перейти в каталог</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Пользовательские букеты */}
            {activeTab === "bouquets" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Мои букеты</h2>
                  
                  {customBouquets.length > 0 ? (
                    <div className="space-y-6">
                      {customBouquets.map(bouquet => (
                        <Card key={bouquet.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-medium">Букет #{bouquet.id.slice(0, 6)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(bouquet.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  bouquet.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  bouquet.status === 'ordered' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {bouquet.status === 'completed' ? 'Готов' : 
                                   bouquet.status === 'ordered' ? 'Заказан' : 
                                   'Черновик'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <p className="font-medium">Цветы:</p>
                              {bouquet.flowers.map((flower, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>Цветок ID {flower.flowerId} × {flower.quantity}</span>
                                </div>
                              ))}
                              
                              {bouquet.message && (
                                <div className="mt-4">
                                  <p className="font-medium">Сообщение:</p>
                                  <p className="italic">"{bouquet.message}"</p>
                                </div>
                              )}
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="flex justify-between font-semibold">
                              <span>Стоимость:</span>
                              <span>{bouquet.price} Kč</span>
                            </div>
                            
                            {bouquet.status === 'draft' && (
                              <div className="mt-4">
                                <Button className="w-full">Завершить оформление</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">У вас пока нет созданных букетов</h3>
                      <p className="text-muted-foreground mb-6">
                        Создайте свой первый уникальный букет.
                      </p>
                      <Button asChild>
                        <a href="/custom-bouquet">Создать букет</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Настройки */}
            {activeTab === "settings" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Настройки</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Смена пароля</h3>
                      <p className="text-muted-foreground mb-4">
                        Для смены пароля мы отправим вам письмо на электронную почту.
                      </p>
                      <Button>Сбросить пароль</Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Удаление аккаунта</h3>
                      <p className="text-muted-foreground mb-4">
                        Внимание! Это действие безвозвратно удалит ваш аккаунт и все связанные данные.
                      </p>
                      <Button variant="destructive">Удалить аккаунт</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}