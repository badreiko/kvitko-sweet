import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  Flower2,
  Settings,
  LogOut,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  CreditCard,
  Truck,
  Store,
  ChevronRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { getUserOrders, getUserCustomBouquets, Order, CustomBouquet } from "@/firebase/services/orderService";

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const [userOrders, userBouquets] = await Promise.all([
            getUserOrders(user.id),
            getUserCustomBouquets(user.id)
          ]);
          setOrders(userOrders);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
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
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

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
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Úspěšně jste se odhlásili');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Chyba při odhlášení');
    }
  };

  const tabs = [
    { id: "profile", label: "Osobní údaje", icon: User },
    { id: "orders", label: "Moje objednávky", icon: Package },
    { id: "bouquets", label: "Moje kytice", icon: Flower2 },
    { id: "settings", label: "Nastavení", icon: Settings },
  ];

  const getOrderStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered': return { color: 'text-green-600 bg-green-100', icon: CheckCircle2, label: 'Doručeno' };
      case 'ready': return { color: 'text-purple-600 bg-purple-100', icon: CheckCircle2, label: 'Připraveno k vyzvednutí' };
      case 'shipped': return { color: 'text-blue-600 bg-blue-100', icon: Truck, label: 'Odesláno' };
      case 'processing': return { color: 'text-yellow-600 bg-yellow-100', icon: Clock, label: 'Zpracovává se' };
      case 'cancelled': return { color: 'text-red-600 bg-red-100', icon: XCircle, label: 'Zrušeno' };
      default: return { color: 'text-gray-600 bg-gray-100', icon: Clock, label: 'Čeká na zpracování' };
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 tracking-tight">
              Můj <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic font-light pr-2">účet</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Vítejte zpět, {user?.displayName || 'uživateli'}! Zde můžete spravovat své objednávky a údaje.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3 lg:sticky lg:top-24"
            >
              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center mb-4 border-4 border-background shadow-sm">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="font-serif font-bold text-xl">{user?.displayName || 'Uživatel'}</h2>
                  <p className="text-sm text-muted-foreground mt-1 truncate w-full px-2">{user?.email}</p>
                </div>

                <Separator className="mb-6 opacity-50" />

                <nav className="space-y-1.5">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSearchParams({ tab: tab.id })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                          ? "bg-primary/10 text-primary shadow-sm font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                          <span>{tab.label}</span>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </button>
                    );
                  })}

                  <Separator className="my-4 opacity-50" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Odhlásit se</span>
                  </button>
                </nav>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-9"
            >
              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Načítání dat...</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2">
                          <User className="h-6 w-6 text-primary" /> Osobní údaje
                        </h2>

                        <form onSubmit={handleProfileUpdate} className="space-y-8">
                          <div className="space-y-6">
                            <h3 className="text-lg font-medium border-b pb-2">Základní informace</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="displayName">Jméno a příjmení</Label>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="displayName"
                                    name="displayName"
                                    value={profileData.displayName}
                                    onChange={handleChange}
                                    className="pl-10 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/20"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">E-mail <span className="text-xs font-normal text-muted-foreground ml-1">(nelze změnit)</span></Label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                  <Input
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleChange}
                                    disabled
                                    className="pl-10 rounded-xl border-border/50 bg-muted/50 text-muted-foreground/70"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="phoneNumber">Telefon</Label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={profileData.phoneNumber}
                                    onChange={handleChange}
                                    className="pl-10 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/20"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-lg font-medium border-b pb-2">Doručovací adresa</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address.street">Ulice a číslo popisné</Label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="address.street"
                                    name="address.street"
                                    value={profileData.address.street}
                                    onChange={handleChange}
                                    className="pl-10 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/20"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="address.city">Město</Label>
                                <Input
                                  id="address.city"
                                  name="address.city"
                                  value={profileData.address.city}
                                  onChange={handleChange}
                                  className="rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/20"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="address.postalCode">PSČ</Label>
                                <Input
                                  id="address.postalCode"
                                  name="address.postalCode"
                                  value={profileData.address.postalCode}
                                  onChange={handleChange}
                                  className="rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/20"
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address.country">Země</Label>
                                <Input
                                  id="address.country"
                                  name="address.country"
                                  value={profileData.address.country}
                                  onChange={handleChange}
                                  className="rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/20"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4">
                            <Button type="submit" disabled={isSaving} className="rounded-full px-8 h-12 shadow-md hover:shadow-lg transition-all">
                              {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ukládání...</>
                              ) : (
                                "Uložit změny"
                              )}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === "orders" && (
                      <motion.div
                        key="orders"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2">
                          <Package className="h-6 w-6 text-primary" /> Moje objednávky
                        </h2>

                        {orders.length > 0 ? (
                          <div className="space-y-6">
                            {orders.map(order => {
                              const statusConfig = getOrderStatusConfig(order.status);
                              const StatusIcon = statusConfig.icon;

                              return (
                                <div key={order.id} className="border border-border/50 rounded-3xl overflow-hidden bg-background/40 hover:bg-background/80 transition-colors duration-300">
                                  {/* Order Header */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border/50 bg-muted/20 gap-4">
                                    <div>
                                      <p className="font-semibold text-lg flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                        Objednávka #{order.orderNumber || order.id.slice(0, 6)}
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(order.createdAt).toLocaleDateString('cs-CZ', { dateStyle: 'long' })}
                                      </p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap ${statusConfig.color}`}>
                                      <StatusIcon className="h-4 w-4" />
                                      {statusConfig.label}
                                    </div>
                                  </div>

                                  {/* Order Body */}
                                  <div className="p-6">
                                    {/* Items array - usually abbreviated */}
                                    <div className="mb-6">
                                      <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Položky</h4>
                                      <ul className="space-y-3">
                                        {order.items.map((item, index) => (
                                          <li key={index} className="flex justify-between items-center text-sm md:text-base">
                                            <div className="flex items-center gap-3">
                                              <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-medium">{item.quantity}x</span>
                                              <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="text-muted-foreground">{item.price * item.quantity} Kč</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Delivery & Payment Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-muted/30">
                                      {order.delivery && (
                                        <div>
                                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                            {order.delivery.type === 'pickup' ? <Store className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                                            {order.delivery.type === 'pickup' ? 'Osobní odběr' : 'Doručení'}
                                          </div>
                                          <p className="text-sm font-medium">{order.delivery.zoneName}</p>
                                          {order.delivery.type !== 'pickup' && order.shippingAddress && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {order.payment && (
                                        <div>
                                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                            <CreditCard className="h-4 w-4" /> Platba
                                          </div>
                                          <p className="text-sm font-medium">{order.payment.methodName}</p>
                                          {order.paymentStatus && (
                                            <p className={`text-sm mt-1 flex items-center gap-1.5 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                              {order.paymentStatus === 'paid' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                              {order.paymentStatus === 'paid' ? 'Zaplaceno' : 'Čeká na platbu'}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Order Footer */}
                                  <div className="bg-primary/5 p-6 flex flex-col sm:flex-row justify-between items-center border-t border-primary/10 gap-4">
                                    <div className="text-sm text-muted-foreground">
                                      Cena doručení: {order.delivery?.price || 0} Kč
                                    </div>
                                    <div className="text-xl font-serif font-bold text-primary flex items-baseline gap-2">
                                      <span className="text-sm font-sans font-normal text-muted-foreground">Celkem:</span>
                                      {order.totalPrice} Kč
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl bg-muted/10">
                            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Package className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-serif font-bold mb-3">Zatím nemáte žádné objednávky</h3>
                            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                              Objevte naši nabídku květin a dekorací a vytvořte svou první objednávku ještě dnes.
                            </p>
                            <Button className="rounded-full px-8 h-12 shadow-md hover:shadow-lg transition-all" asChild>
                              <a href="/catalog">Prohlédnout katalog</a>
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* BOUQUETS TAB */}
                    {activeTab === "bouquets" && (
                      <motion.div
                        key="bouquets"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2">
                          <Flower2 className="h-6 w-6 text-primary" /> Moje kytice
                        </h2>

                        {customBouquets.length > 0 ? (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {customBouquets.map(bouquet => (
                              <div key={bouquet.id} className="border border-border/50 rounded-3xl overflow-hidden bg-background/40 hover:border-primary/30 transition-colors duration-300 flex flex-col h-full">
                                <div className="p-6 border-b border-border/50 bg-muted/20 flex justify-between items-start gap-4">
                                  <div>
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                      <Flower2 className="h-5 w-5 text-primary" />
                                      Kytice #{bouquet.id.slice(0, 6)}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {new Date(bouquet.createdAt).toLocaleDateString('cs-CZ', { dateStyle: 'long' })}
                                    </p>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${bouquet.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    bouquet.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                      bouquet.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {bouquet.status === 'confirmed' ? 'Potvrzeno' :
                                      bouquet.status === 'submitted' ? 'Odesláno' :
                                        bouquet.status === 'cancelled' ? 'Zrušeno' : 'Koncept'}
                                  </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                  <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Složení:</h4>
                                  <ul className="space-y-3 mb-6">
                                    {bouquet.flowers.map((flower, index) => (
                                      <li key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                          <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">{flower.quantity}x</span>
                                          <span className="font-medium">{flower.name}</span>
                                        </div>
                                        <span className="text-muted-foreground whitespace-nowrap">{flower.price * flower.quantity} Kč</span>
                                      </li>
                                    ))}
                                  </ul>

                                  {bouquet.message && (
                                    <div className="mt-auto bg-muted/30 p-4 rounded-2xl italic text-sm text-foreground/80 mb-6 relative">
                                      <div className="absolute top-3 left-3 text-muted-foreground/30 font-serif text-3xl leading-none">"</div>
                                      <p className="relative z-10 pl-4 pr-2 pt-1">{bouquet.message}</p>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <span className="font-medium text-muted-foreground">Celkem:</span>
                                    <span className="text-xl font-bold font-serif">{bouquet.totalPrice} Kč</span>
                                  </div>

                                  {bouquet.status === 'draft' && (
                                    <Button className="w-full mt-6 rounded-xl hover:-translate-y-0.5 transition-transform">
                                      Dokončit objednávku
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl bg-muted/10">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Flower2 className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-serif font-bold mb-3">Zatím nemáte žádné vlastní kytice</h3>
                            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                              Staňte se floristou a sestavte si svou vlastní, naprosto unikátní kytici v našem konfigurátoru.
                            </p>
                            <Button className="rounded-full px-8 h-12 shadow-md hover:shadow-lg transition-all" asChild>
                              <a href="/custom-bouquet">Sestavit vlastní kytici</a>
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === "settings" && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2">
                          <Settings className="h-6 w-6 text-primary" /> Nastavení účtu
                        </h2>

                        <div className="space-y-8">
                          <div className="bg-muted/30 border border-border/50 rounded-2xl p-6">
                            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                              Změna hesla
                            </h3>
                            <p className="text-muted-foreground mb-6 text-sm md:text-base max-w-2xl">
                              Pokud si přejete změnit heslo, zašleme vám na vaši e-mailovou adresu odkaz pro vytvoření nového hesla.
                            </p>
                            <Button variant="outline" className="rounded-xl border-border/50 hover:bg-muted/50">
                              Odeslat odkaz pro reset hesla
                            </Button>
                          </div>

                          <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
                            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                              <ShieldAlert className="h-5 w-5" /> Nebezpečná zóna
                            </h3>
                            <p className="text-red-600/80 dark:text-red-400/80 mb-6 text-sm md:text-base max-w-2xl">
                              Tato akce je nevratná. Jakmile svůj účet smažete, nebudete jej moci obnovit a ztratíte přístup k historii objednávek a uloženým kyticím.
                            </p>
                            <Button variant="destructive" className="rounded-xl">
                              Trvale smazat můj účet
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}