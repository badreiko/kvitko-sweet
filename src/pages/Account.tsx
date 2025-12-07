// src/pages/Account.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { getUserOrders, getUserCustomBouquets, Order, CustomBouquet } from "@/firebase/services/orderService";

export default function Account() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customBouquets, setCustomBouquets] = useState<CustomBouquet[]>([]);
  const { user, updateProfile, logout } = useAuth();

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
          toast.error('Nepodařilo se načíst data. Zkuste to prosím později.');
        } finally {
          setLoading(false);
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
      if (parent === 'address') {
        setProfileData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      }
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

      toast.success('Profil byl úspěšně aktualizován');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Nepodařilo se aktualizovat profil. Zkuste to prosím později.');
    } finally {
      setLoading(false);
    }
  };

  // Выход из аккаунта
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Úspěšně jste se odhlásili');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Chyba při odhlášení');
    }
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Můj účet</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Боковое меню */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-lg">{user?.displayName || 'Uživatel'}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>

                <Separator className="mb-6" />

                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Osobní údaje
                  </Button>
                  <Button
                    variant={activeTab === "orders" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("orders")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Moje objednávky
                  </Button>
                  <Button
                    variant={activeTab === "bouquets" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bouquets")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Moje kytice
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Nastavení
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Odhlásit se
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
                  <h2 className="text-xl font-semibold mb-6">Osobní údaje</h2>

                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Jméno</Label>
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
                        <p className="text-xs text-muted-foreground">E-mail nelze změnit</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Telefon</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mb-4">Doručovací adresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <Label htmlFor="address.street">Ulice a číslo</Label>
                        <Input
                          id="address.street"
                          name="address.street"
                          value={profileData.address.street}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.city">Město</Label>
                        <Input
                          id="address.city"
                          name="address.city"
                          value={profileData.address.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.postalCode">PSČ</Label>
                        <Input
                          id="address.postalCode"
                          name="address.postalCode"
                          value={profileData.address.postalCode}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.country">Země</Label>
                        <Input
                          id="address.country"
                          name="address.country"
                          value={profileData.address.country}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? 'Ukládání...' : 'Uložit změny'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Заказы */}
            {activeTab === "orders" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Moje objednávky</h2>

                  {orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-medium">Objednávka #{order.orderNumber || order.id.slice(0, 6)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                                </p>
                              </div>
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                  }`}>
                                  {order.status === 'delivered' ? (order.delivery?.type === 'pickup' ? 'Vyzvednuto' : 'Doručeno') :
                                    order.status === 'ready' ? 'Připraveno k vyzvednutí' :
                                      order.status === 'shipped' ? 'Odesláno' :
                                        order.status === 'processing' ? 'Zpracovává se' :
                                          order.status === 'pending' ? 'Čeká na zpracování' :
                                            order.status === 'cancelled' ? 'Zrušeno' : order.status}
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

                            {/* Delivery/Pickup info */}
                            {order.delivery && (
                              <div className="bg-muted/50 p-3 rounded-lg mb-4">
                                {order.delivery.type === 'pickup' ? (
                                  <>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">🏪 Osobní odběr</p>
                                    <p className="text-sm">{order.delivery.zoneName}</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">🚚 Doručení</p>
                                    <p className="text-sm">{order.delivery.zoneName}</p>
                                    {order.shippingAddress && (
                                      <p className="text-sm text-muted-foreground">
                                        {order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                                      </p>
                                    )}
                                  </>
                                )}
                                {order.delivery.price > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Cena doručení: {order.delivery.price} Kč
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Payment info */}
                            {order.payment && (
                              <div className="text-sm text-muted-foreground mb-4">
                                💳 Platba: {order.payment.methodName}
                                {order.paymentStatus && (
                                  <span className={`ml-2 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    ({order.paymentStatus === 'paid' ? 'Zaplaceno' : 'Čeká na platbu'})
                                  </span>
                                )}
                              </div>
                            )}

                            <Separator className="my-4" />

                            <div className="flex justify-between font-semibold">
                              <span>Celkem:</span>
                              <span>{order.totalPrice} Kč</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-muted-foreground mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2">Zatím nemáte žádné objednávky</h3>
                      <p className="text-muted-foreground mb-6">
                        Až zadáte první objednávku, zobrazí se zde.
                      </p>
                      <Button asChild>
                        <a href="/catalog">Přejít do katalogu</a>
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
                  <h2 className="text-xl font-semibold mb-6">Moje kytice</h2>

                  {customBouquets.length > 0 ? (
                    <div className="space-y-6">
                      {customBouquets.map(bouquet => (
                        <Card key={bouquet.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-medium">Kytice #{bouquet.id.slice(0, 6)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(bouquet.createdAt).toLocaleDateString('cs-CZ')}
                                </p>
                              </div>
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs ${bouquet.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  bouquet.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                    bouquet.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                  {bouquet.status === 'confirmed' ? 'Potvrzeno' :
                                    bouquet.status === 'submitted' ? 'Odesláno' :
                                      bouquet.status === 'cancelled' ? 'Zrušeno' :
                                        'Koncept'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <p className="font-medium">Květiny:</p>
                              {bouquet.flowers.map((flower, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{flower.name} × {flower.quantity}</span>
                                  <span>{flower.price * flower.quantity} Kč</span>
                                </div>
                              ))}

                              {bouquet.message && (
                                <div className="mt-4">
                                  <p className="font-medium">Zpráva:</p>
                                  <p className="italic">"{bouquet.message}"</p>
                                </div>
                              )}
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-between font-semibold">
                              <span>Cena:</span>
                              <span>{bouquet.totalPrice} Kč</span>
                            </div>

                            {bouquet.status === 'draft' && (
                              <div className="mt-4">
                                <Button className="w-full">Dokončit objednávku</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-muted-foreground mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2">Zatím nemáte žádné vlastní kytice</h3>
                      <p className="text-muted-foreground mb-6">
                        Vytvořte si svou první unikátní kytici.
                      </p>
                      <Button asChild>
                        <a href="/custom-bouquet">Vytvořit kytici</a>
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
                  <h2 className="text-xl font-semibold mb-6">Nastavení</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Změna hesla</h3>
                      <p className="text-muted-foreground mb-4">
                        Pro změnu hesla vám zašleme e-mail na vaši e-mailovou adresu.
                      </p>
                      <Button>Resetovat heslo</Button>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Smazání účtu</h3>
                      <p className="text-muted-foreground mb-4">
                        Upozornění! Tato akce nenávratně smaže váš účet a všechna související data.
                      </p>
                      <Button variant="destructive">Smazat účet</Button>
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