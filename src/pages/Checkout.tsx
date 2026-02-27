// src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from "@/components/ui/checkbox";
import {
    getActiveDeliveryZones,
    getActivePaymentMethods,
    DeliveryZone,
    PaymentMethod
} from '@/firebase/services/deliverySettingsService';
import { getActiveStores, Store } from '@/firebase/services/storeService';
import { createOrder } from '@/firebase/services/orderService';
import { toast } from 'sonner';
import {
    MapPin,
    CreditCard,
    Check,
    ArrowLeft,
    ArrowRight,
    Truck,
    ShoppingBag,
    Loader2,
    Store as StoreIcon,
    UserCircle,
    Package,
    Banknote,
    Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    note: string;
}

const paymentIcons: Record<string, React.ElementType> = {
    'credit-card': CreditCard,
    'banknote': Banknote,
    'landmark': Landmark,
    // Fallbacks for older DB entries
    'map-pin': Banknote,
    'package-check': Landmark,
};

export default function Checkout() {
    const navigate = useNavigate();
    const { cart, getTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Customer info
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        street: '',
        city: 'Praha',
        postalCode: '',
        note: ''
    });

    // Populate user details when available
    useEffect(() => {
        if (user) {
            setCustomerInfo(prev => {
                const nameParts = (user.displayName || '').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                return {
                    ...prev,
                    firstName: prev.firstName || firstName,
                    lastName: prev.lastName || lastName,
                    email: user.email || prev.email,
                    phone: user.phoneNumber || prev.phone,
                    street: user.address?.street || prev.street,
                    city: user.address?.city || prev.city,
                    postalCode: user.address?.postalCode || prev.postalCode,
                };
            });
        }
    }, [user]);

    // Delivery & Payment
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [selectedPayment, setSelectedPayment] = useState<string>('');

    // Order result
    const [orderId, setOrderId] = useState<string>('');

    // Load delivery zones, payment methods, and stores
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [zones, payments, storesList] = await Promise.all([
                    getActiveDeliveryZones(),
                    getActivePaymentMethods(),
                    getActiveStores()
                ]);
                setDeliveryZones(zones);
                setPaymentMethods(payments);
                setStores(storesList);
            } catch (error) {
                console.error('Error loading checkout data:', error);
                toast.error('Chyba při načítání dat');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0 && step < 4) {
            navigate('/cart');
        }
    }, [cart, navigate, step]);

    // Get delivery price
    const getDeliveryPrice = () => {
        if (deliveryType === 'pickup') return 0;
        const zone = deliveryZones.find(z => z.id === selectedZone);
        if (!zone) return 0;
        if (zone.freeOver && getTotal() >= zone.freeOver) {
            return 0;
        }
        return zone.price;
    };

    // Calculate final total
    const getFinalTotal = () => {
        return getTotal() + getDeliveryPrice();
    };

    // Validate step
    const isStepValid = (stepNum: number) => {
        switch (stepNum) {
            case 1:
                const baseValid = (
                    customerInfo.firstName.trim() !== '' &&
                    customerInfo.lastName.trim() !== '' &&
                    customerInfo.email.trim() !== '' &&
                    customerInfo.phone.trim() !== ''
                );
                if (deliveryType === 'delivery') {
                    return baseValid &&
                        customerInfo.street.trim() !== '' &&
                        customerInfo.city.trim() !== '' &&
                        customerInfo.postalCode.trim() !== '';
                }
                return baseValid;
            case 2:
                if (deliveryType === 'pickup') {
                    return selectedStore !== '' || stores.length === 0;
                }
                return selectedZone !== '';
            case 3:
                return selectedPayment !== '';
            default:
                return false;
        }
    };

    // Handle form input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    // Submit order
    const handleSubmitOrder = async () => {
        setIsSubmitting(true);
        try {
            const zone = deliveryZones.find(z => z.id === selectedZone);
            const store = stores.find(s => s.id === selectedStore);
            const payment = paymentMethods.find(p => p.id === selectedPayment);

            const orderData = {
                userId: user?.id || 'guest',
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                    isCustomBouquet: item.isCustomBouquet,
                    customBouquetData: item.customBouquetData
                })),
                totalPrice: getFinalTotal(),
                status: 'pending' as const,
                paymentStatus: 'pending' as const,
                shippingAddress: {
                    street: customerInfo.street,
                    city: customerInfo.city,
                    postalCode: customerInfo.postalCode,
                    country: 'Česká republika'
                },
                customerInfo: {
                    firstName: customerInfo.firstName,
                    lastName: customerInfo.lastName,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                    note: customerInfo.note
                },
                delivery: {
                    type: deliveryType,
                    zoneId: deliveryType === 'delivery' ? selectedZone : selectedStore,
                    zoneName: deliveryType === 'pickup'
                        ? (store ? `${store.name} - ${store.address}, ${store.city}` : 'Osobní vyzvednutí')
                        : (zone?.name || ''),
                    price: getDeliveryPrice()
                },
                payment: {
                    methodId: selectedPayment,
                    methodName: payment?.name || ''
                }
            };

            const newOrderId = await createOrder(orderData);
            setOrderId(newOrderId);

            // Send email notification
            try {
                await fetch('/.netlify/functions/order-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: newOrderId,
                        customerEmail: customerInfo.email,
                        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                        items: cart.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price
                        })),
                        totalPrice: getFinalTotal(),
                        deliveryType: deliveryType,
                        deliveryAddress: deliveryType === 'delivery'
                            ? `${customerInfo.street}, ${customerInfo.city} ${customerInfo.postalCode}`
                            : (stores.find(s => s.id === selectedStore)?.name || 'Osobní odběr'),
                        paymentMethod: payment?.name || ''
                    })
                });
            } catch (emailError) {
                console.error('Failed to send notification email:', emailError);
                // Don't fail the order if email fails
            }

            clearCart();
            setStep(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Objednávka byla úspěšně vytvořena!');
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Chyba při vytváření objednávky');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container-custom py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-6" />
                    <p className="text-xl text-muted-foreground animate-pulse">Připravujeme pokladnu...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-primary/5 pt-12 pb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="container-custom relative z-10">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-foreground tracking-tight balance-text">
                        Bezpečné <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic font-light pr-2">Odbavení</span>
                    </h1>
                </div>
            </section>

            <section className="py-8 bg-background min-h-[600px]">
                <div className="container-custom">

                    {/* Progress Steps (Apple-style pill navigation) */}
                    {step < 4 && (
                        <div className="mb-10 max-w-4xl mx-auto">
                            <div className="flex bg-muted/50 p-1.5 rounded-full border border-border/50 backdrop-blur-sm relative overflow-hidden">
                                {/* Active Tab Background Pill */}
                                <div
                                    className="absolute top-1.5 bottom-1.5 rounded-full bg-background shadow-sm border border-border/50 transition-all duration-500 ease-out"
                                    style={{
                                        width: 'calc(33.333% - 6px)',
                                        left: `calc(${(step - 1) * 33.333}% + 3px)`
                                    }}
                                />

                                <button onClick={() => setStep(1)} className={`relative w-1/3 py-3 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${step === 1 ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                                    <UserCircle className="h-4 w-4" /> <span className="hidden sm:inline">1. Údaje</span>
                                </button>
                                <button onClick={() => isStepValid(1) && setStep(2)} disabled={!isStepValid(1)} className={`relative w-1/3 py-3 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${step === 2 ? 'text-primary' : 'text-muted-foreground hover:text-foreground disabled:opacity-50'}`}>
                                    <Package className="h-4 w-4" /> <span className="hidden sm:inline">2. Doprava</span>
                                </button>
                                <button onClick={() => isStepValid(2) && setStep(3)} disabled={!isStepValid(2)} className={`relative w-1/3 py-3 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${step === 3 ? 'text-primary' : 'text-muted-foreground hover:text-foreground disabled:opacity-50'}`}>
                                    <CreditCard className="h-4 w-4" /> <span className="hidden sm:inline">3. Platba</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Main Content Area */}
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
                                    {/* Step 1: Customer Information */}
                                    {step === 1 && (
                                        <div className="flex-1">
                                            <div className="mb-8">
                                                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                                                    <MapPin className="h-6 w-6 text-primary" /> Vaše kontaktní údaje
                                                </h2>
                                                <p className="text-muted-foreground mt-2">Abychom vás mohli kontaktovat ohledně vaší objednávky.</p>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="firstName" className="text-sm font-medium">Jméno <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="firstName"
                                                            name="firstName"
                                                            value={customerInfo.firstName}
                                                            onChange={handleInputChange}
                                                            placeholder="Jan"
                                                            className="bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="lastName" className="text-sm font-medium">Příjmení <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="lastName"
                                                            name="lastName"
                                                            value={customerInfo.lastName}
                                                            onChange={handleInputChange}
                                                            placeholder="Novák"
                                                            className="bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="text-sm font-medium">E-mail <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={customerInfo.email}
                                                            onChange={handleInputChange}
                                                            placeholder="jan@email.cz"
                                                            className="bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone" className="text-sm font-medium">Telefon <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="phone"
                                                            name="phone"
                                                            type="tel"
                                                            value={customerInfo.phone}
                                                            onChange={handleInputChange}
                                                            placeholder="+420 123 456 789"
                                                            className="bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <Label htmlFor="note" className="text-sm font-medium">Poznámka k objednávce</Label>
                                                    <Textarea
                                                        id="note"
                                                        name="note"
                                                        value={customerInfo.note}
                                                        onChange={handleInputChange}
                                                        placeholder="Např. přání na kartičku, čas doručení..."
                                                        rows={3}
                                                        className="mt-2 text-base resize-none bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                    />
                                                </div>

                                                {deliveryType === 'delivery' && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 mt-6 border-t border-border/50 space-y-6">
                                                        <h3 className="text-lg font-serif font-semibold">Adresa doručení</h3>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="street" className="text-sm font-medium">Ulice a číslo popisné <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                id="street"
                                                                name="street"
                                                                value={customerInfo.street}
                                                                onChange={handleInputChange}
                                                                placeholder="Květinová 123"
                                                                className="bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="city" className="text-sm font-medium">Město <span className="text-red-500">*</span></Label>
                                                                <Input
                                                                    id="city"
                                                                    name="city"
                                                                    value={customerInfo.city}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Praha"
                                                                    className="bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="postalCode" className="text-sm font-medium">PSČ <span className="text-red-500">*</span></Label>
                                                                <Input
                                                                    id="postalCode"
                                                                    name="postalCode"
                                                                    value={customerInfo.postalCode}
                                                                    onChange={handleInputChange}
                                                                    placeholder="110 00"
                                                                    className="bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl"
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Delivery Zone */}
                                    {step === 2 && (
                                        <div className="flex-1">
                                            <div className="mb-8">
                                                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                                                    <Truck className="h-6 w-6 text-primary" /> Zvolte způsob doručení
                                                </h2>
                                                <p className="text-muted-foreground mt-2">Jak se k vám květiny dostanou?</p>
                                            </div>

                                            {/* Delivery Type Toggle */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                                <div
                                                    onClick={() => setDeliveryType('delivery')}
                                                    className={`cursor-pointer flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 ${deliveryType === 'delivery'
                                                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                                                        : 'border-border/50 hover:border-primary/50 bg-background hover:shadow-sm'
                                                        }`}
                                                >
                                                    <Truck className={`h-8 w-8 ${deliveryType === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    <span className={`font-semibold text-lg ${deliveryType === 'delivery' ? 'text-primary' : 'text-foreground'}`}>
                                                        Doručení kurýrem
                                                    </span>
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        setDeliveryType('pickup');
                                                        setSelectedZone('');
                                                    }}
                                                    className={`cursor-pointer flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 ${deliveryType === 'pickup'
                                                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                                                        : 'border-border/50 hover:border-primary/50 bg-background hover:shadow-sm'
                                                        }`}
                                                >
                                                    <StoreIcon className={`h-8 w-8 ${deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    <span className={`font-semibold text-lg ${deliveryType === 'pickup' ? 'text-primary' : 'text-foreground'}`}>
                                                        Osobní odběr
                                                    </span>
                                                </div>
                                            </div>

                                            <Separator className="mb-8" />

                                            {/* Pickup Stores */}
                                            {deliveryType === 'pickup' && (
                                                <div className="animate-fade-in-up">
                                                    <h3 className="text-lg font-serif font-semibold mb-4">Vyberte prodejnu</h3>
                                                    {stores.length === 0 ? (
                                                        <div className="p-6 rounded-2xl bg-muted/20 border border-dashed text-center">
                                                            <p className="text-muted-foreground">
                                                                Zatím nejsou k dispozici žádné prodejny pro osobní odběr.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {stores.map(store => {
                                                                const isSelected = selectedStore === store.id;
                                                                return (
                                                                    <div
                                                                        key={store.id}
                                                                        onClick={() => setSelectedStore(store.id)}
                                                                        className={`cursor-pointer relative overflow-hidden flex items-start p-5 rounded-2xl border transition-all duration-300 ${isSelected
                                                                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                                                            : 'border-border/50 bg-background hover:border-primary/50 hover:shadow-sm'
                                                                            }`}
                                                                    >
                                                                        <div className={`mt-1 h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-4 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground bg-transparent'}`}>
                                                                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className={`font-semibold text-lg mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>{store.name}</p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {store.address}, {store.city} {store.postalCode}
                                                                            </p>
                                                                            <p className="text-xs font-medium mt-2 bg-muted/50 inline-block px-2 py-1 rounded-md text-muted-foreground">
                                                                                Tel: {store.phone}
                                                                            </p>
                                                                        </div>
                                                                        <div className="pl-4">
                                                                            <span className="text-primary font-semibold text-sm bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Zdarma</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Delivery Zones */}
                                            {deliveryType === 'delivery' && (
                                                <div className="animate-fade-in-up">
                                                    <h3 className="text-lg font-serif font-semibold mb-4">Zóny pro doručení</h3>
                                                    {deliveryZones.length === 0 ? (
                                                        <div className="p-6 rounded-2xl bg-muted/20 border border-dashed text-center">
                                                            <p className="text-muted-foreground">
                                                                Žádné možnosti doručení nejsou k dispozici.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {deliveryZones.map(zone => {
                                                                const isSelected = selectedZone === zone.id;
                                                                const isFree = zone.freeOver && getTotal() >= zone.freeOver;

                                                                return (
                                                                    <div
                                                                        key={zone.id}
                                                                        onClick={() => setSelectedZone(zone.id)}
                                                                        className={`cursor-pointer relative overflow-hidden flex items-center p-5 rounded-2xl border transition-all duration-300 ${isSelected
                                                                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                                                            : 'border-border/50 bg-background hover:border-primary/50 hover:shadow-sm'
                                                                            }`}
                                                                    >
                                                                        <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-4 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground bg-transparent'}`}>
                                                                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{zone.name}</p>
                                                                            <p className="text-sm text-muted-foreground mt-0.5">{zone.time}</p>
                                                                            {zone.freeOver && !isFree && (
                                                                                <p className="text-xs text-primary/80 mt-1 font-medium bg-primary/5 inline-block px-2 py-0.5 rounded-md">
                                                                                    Zdarma od {zone.freeOver} Kč
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="pl-4 text-right">
                                                                            {isFree ? (
                                                                                <span className="text-primary font-semibold text-sm bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Zdarma</span>
                                                                            ) : (
                                                                                <span className="font-semibold text-lg">{zone.price} Kč</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 3: Payment Method */}
                                    {step === 3 && (
                                        <div className="flex-1">
                                            <div className="mb-8">
                                                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                                                    <CreditCard className="h-6 w-6 text-primary" /> Zvolte způsob platby
                                                </h2>
                                                <p className="text-muted-foreground mt-2">Bezpečná a rychlá platba pro dokončení nákupu.</p>
                                            </div>

                                            {paymentMethods.length === 0 ? (
                                                <div className="p-6 rounded-2xl bg-muted/20 border border-dashed text-center">
                                                    <p className="text-muted-foreground">
                                                        Žádné způsoby platby nejsou k dispozici.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {paymentMethods.map(method => {
                                                        const isSelected = selectedPayment === method.id;
                                                        return (
                                                            <div
                                                                key={method.id}
                                                                onClick={() => setSelectedPayment(method.id)}
                                                                className={`cursor-pointer relative overflow-hidden flex items-center p-5 rounded-2xl border transition-all duration-300 ${isSelected
                                                                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                                                    : 'border-border/50 bg-background hover:border-primary/50 hover:shadow-sm'
                                                                    }`}
                                                            >
                                                                <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-5 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground bg-transparent'}`}>
                                                                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                                                </div>
                                                                <div className="mr-5 opacity-80 flex items-center justify-center text-primary">
                                                                    {(() => {
                                                                        const Icon = paymentIcons[method.icon] || CreditCard;
                                                                        return <Icon className="h-8 w-8" />;
                                                                    })()}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className={`font-semibold text-lg ${isSelected ? 'text-primary' : 'text-foreground'}`}>{method.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{method.description}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="mt-8 bg-muted/30 border border-border/50 rounded-2xl p-5">
                                                <div className="flex items-start space-x-3">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                                        className="mt-1"
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <label
                                                            htmlFor="terms"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                                                        >
                                                            Souhlasím s obchodními podmínkami a zpracováním osobních údajů
                                                        </label>
                                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                            Potvrzuji, že jsem se seznámil/a s <button onClick={(e) => { e.preventDefault(); window.open('/terms', '_blank') }} className="text-primary hover:underline">Obchodními podmínkami</button> a <button onClick={(e) => { e.preventDefault(); window.open('/privacy', '_blank') }} className="text-primary hover:underline">Zásadami zpracování osobních údajů</button> a souhlasím s nimi. Souhlas je povinný pro dokončení objednávky.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Confirmation */}
                                    {step === 4 && (
                                        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-center px-4">
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 mx-auto"
                                            >
                                                <Check className="h-12 w-12 text-primary" />
                                            </motion.div>

                                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                                <h2 className="text-4xl font-serif font-bold mb-4">Děkujeme za váš nákup!</h2>
                                                <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
                                                    Vaše objednávka byla úspěšně přijata. Na e-mail <strong>{customerInfo.email}</strong> jsme zaslali veškeré detaily.
                                                </p>
                                                <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 mb-10 max-w-md mx-auto">
                                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Číslo objednávky</p>
                                                    <p className="text-2xl font-mono font-bold text-foreground">{orderId}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                    <Button variant="outline" size="lg" className="rounded-full px-8 border-border/50" onClick={() => navigate('/')}>
                                                        Zpět na hlavní stránku
                                                    </Button>
                                                    <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" onClick={() => navigate('/catalog')}>
                                                        Pokračovat v nákupu
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    {step < 4 && (
                                        <div className="mt-auto pt-8 flex items-center justify-between border-t border-border/50">
                                            <Button
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                                onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                {step === 1 ? 'Zpět do košíku' : 'Zpět'}
                                            </Button>

                                            {step < 3 ? (
                                                <Button
                                                    onClick={() => {
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        setStep(step + 1);
                                                    }}
                                                    disabled={!isStepValid(step)}
                                                    className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    Pokračovat
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleSubmitOrder}
                                                    disabled={!isStepValid(step) || !termsAccepted || isSubmitting}
                                                    className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all min-w-[200px]"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Zpracování...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Potvrdit objednávku
                                                            <Check className="ml-2 h-4 w-4" />
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Order Summary Sidebar */}
                        {step < 4 && (
                            <div className="lg:col-span-4">
                                <div className="sticky top-24 bg-background/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                                    <div className="p-6 border-b border-border/50 bg-muted/10 shrink-0">
                                        <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                                            <ShoppingBag className="w-5 h-5 text-primary" /> Souhrn objednávky
                                        </h3>
                                    </div>

                                    <div className="p-6 overflow-y-auto flex-1 scrollbar-thin space-y-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex gap-4 items-center group">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted relative shrink-0">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                                        {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} × {item.price} Kč</p>
                                                </div>
                                                <p className="font-semibold text-sm whitespace-nowrap">{item.price * item.quantity} Kč</p>
                                            </div>
                                        ))}

                                        <Separator className="my-6 bg-border/50" />

                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center text-muted-foreground">
                                                <span>Mezisoučet</span>
                                                <span className="font-medium">{getTotal()} Kč</span>
                                            </div>
                                            <div className="flex justify-between items-center text-muted-foreground">
                                                <span>Doprava</span>
                                                <span>
                                                    {deliveryType === 'pickup' ? (
                                                        <span className="text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-md text-xs uppercase tracking-wider">Zdarma</span>
                                                    ) : selectedZone ? (
                                                        getDeliveryPrice() === 0 ? (
                                                            <span className="text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-md text-xs uppercase tracking-wider">Zdarma</span>
                                                        ) : (
                                                            <span className="font-medium">{getDeliveryPrice()} Kč</span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs">dle výběru v kroku 2</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-muted/20 border-t border-border/50 shrink-0">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Celkem k úhradě</span>
                                            <motion.span
                                                key={getFinalTotal()}
                                                initial={{ scale: 1.05, opacity: 0.8 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-2xl font-serif font-bold text-foreground"
                                            >
                                                {getFinalTotal()} Kč
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
