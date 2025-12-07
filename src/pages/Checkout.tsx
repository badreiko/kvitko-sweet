// src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
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
    Store as StoreIcon
} from 'lucide-react';

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

export default function Checkout() {
    const navigate = useNavigate();
    const { cart, getTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    imageUrl: item.imageUrl
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
            clearCart();
            setStep(4);
            toast.success('Objednávka byla úspěšně vytvořena!');
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Chyba při vytváření objednávky');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Progress indicator
    const ProgressStep = ({ number, label, isActive, isComplete }: { number: number; label: string; isActive: boolean; isComplete: boolean }) => (
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isComplete ? 'bg-primary text-primary-foreground' :
                    isActive ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                }`}>
                {isComplete ? <Check className="h-5 w-5" /> : number}
            </div>
            <span className={`text-xs mt-2 ${isActive || isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
            </span>
        </div>
    );

    if (isLoading) {
        return (
            <Layout>
                <div className="container-custom py-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Načítání...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container-custom py-12">
                <h1 className="text-3xl font-bold mb-8">Pokladna</h1>

                {/* Progress Steps */}
                {step < 4 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-center max-w-2xl mx-auto">
                            <ProgressStep number={1} label="Údaje" isActive={step === 1} isComplete={step > 1} />
                            <div className={`h-1 flex-1 mx-2 ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
                            <ProgressStep number={2} label="Doprava" isActive={step === 2} isComplete={step > 2} />
                            <div className={`h-1 flex-1 mx-2 ${step > 2 ? 'bg-primary' : 'bg-muted'}`} />
                            <ProgressStep number={3} label="Platba" isActive={step === 3} isComplete={step > 3} />
                            <div className={`h-1 flex-1 mx-2 ${step > 3 ? 'bg-primary' : 'bg-muted'}`} />
                            <ProgressStep number={4} label="Hotovo" isActive={step === 4} isComplete={false} />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Customer Information */}
                        {step === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Kontaktní údaje a adresa
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">Jméno *</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={customerInfo.firstName}
                                                onChange={handleInputChange}
                                                placeholder="Jan"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Příjmení *</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={customerInfo.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Novák"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email">E-mail *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={customerInfo.email}
                                                onChange={handleInputChange}
                                                placeholder="jan@email.cz"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Telefon *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={customerInfo.phone}
                                                onChange={handleInputChange}
                                                placeholder="+420 123 456 789"
                                            />
                                        </div>
                                    </div>

                                    {deliveryType === 'delivery' && (
                                        <>
                                            <Separator />
                                            <div>
                                                <Label htmlFor="street">Ulice a číslo popisné *</Label>
                                                <Input
                                                    id="street"
                                                    name="street"
                                                    value={customerInfo.street}
                                                    onChange={handleInputChange}
                                                    placeholder="Květinová 123"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="city">Město *</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={customerInfo.city}
                                                        onChange={handleInputChange}
                                                        placeholder="Praha"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="postalCode">PSČ *</Label>
                                                    <Input
                                                        id="postalCode"
                                                        name="postalCode"
                                                        value={customerInfo.postalCode}
                                                        onChange={handleInputChange}
                                                        placeholder="110 00"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <Label htmlFor="note">Poznámka k objednávce</Label>
                                        <Textarea
                                            id="note"
                                            name="note"
                                            value={customerInfo.note}
                                            onChange={handleInputChange}
                                            placeholder="Např. čas doručení, zvonit u souseda..."
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Delivery Zone */}
                        {step === 2 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Zvolte způsob doručení
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Delivery Type Toggle */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryType('delivery')}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${deliveryType === 'delivery'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <Truck className={`h-8 w-8 ${deliveryType === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`font-medium ${deliveryType === 'delivery' ? 'text-primary' : ''}`}>
                                                Doručení
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeliveryType('pickup');
                                                setSelectedZone('');
                                            }}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${deliveryType === 'pickup'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <StoreIcon className={`h-8 w-8 ${deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`font-medium ${deliveryType === 'pickup' ? 'text-primary' : ''}`}>
                                                Osobní odběr
                                            </span>
                                        </button>
                                    </div>

                                    {/* Pickup Stores */}
                                    {deliveryType === 'pickup' && (
                                        <>
                                            {stores.length === 0 ? (
                                                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                                    <p className="text-yellow-800">
                                                        Zatím nejsou k dispozici žádné prodejny pro osobní odběr.
                                                    </p>
                                                </div>
                                            ) : (
                                                <RadioGroup value={selectedStore} onValueChange={setSelectedStore}>
                                                    <div className="space-y-3">
                                                        {stores.map(store => (
                                                            <div key={store.id}>
                                                                <RadioGroupItem value={store.id} id={store.id} className="sr-only" />
                                                                <Label
                                                                    htmlFor={store.id}
                                                                    className={`block cursor-pointer p-4 rounded-lg border transition-colors ${selectedStore === store.id
                                                                            ? 'border-primary bg-primary/5'
                                                                            : 'border-border hover:border-primary/50'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <StoreIcon className="h-5 w-5 text-green-600 mt-0.5" />
                                                                        <div className="flex-1">
                                                                            <p className="font-medium">{store.name}</p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {store.address}, {store.city} {store.postalCode}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                Tel: {store.phone}
                                                                            </p>
                                                                        </div>
                                                                        <span className="text-green-600 font-semibold">Zdarma</span>
                                                                    </div>
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        </>
                                    )}

                                    {/* Delivery Zones */}
                                    {deliveryType === 'delivery' && (
                                        <>
                                            {deliveryZones.length === 0 ? (
                                                <p className="text-muted-foreground text-center py-8">
                                                    Žádné možnosti doručení nejsou k dispozici.
                                                </p>
                                            ) : (
                                                <RadioGroup value={selectedZone} onValueChange={setSelectedZone}>
                                                    <div className="space-y-3">
                                                        {deliveryZones.map(zone => (
                                                            <div key={zone.id}>
                                                                <RadioGroupItem value={zone.id} id={zone.id} className="sr-only" />
                                                                <Label
                                                                    htmlFor={zone.id}
                                                                    className={`block cursor-pointer p-4 rounded-lg border transition-colors ${selectedZone === zone.id
                                                                            ? 'border-primary bg-primary/5'
                                                                            : 'border-border hover:border-primary/50'
                                                                        }`}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <p className="font-medium">{zone.name}</p>
                                                                            <p className="text-sm text-muted-foreground">{zone.time}</p>
                                                                            {zone.freeOver && (
                                                                                <p className="text-xs text-green-600 mt-1">
                                                                                    Zdarma od {zone.freeOver} Kč
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            {zone.freeOver && getTotal() >= zone.freeOver ? (
                                                                                <span className="text-green-600 font-semibold">Zdarma</span>
                                                                            ) : (
                                                                                <span className="font-semibold">{zone.price} Kč</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Payment Method */}
                        {step === 3 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Zvolte způsob platby
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {paymentMethods.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            Žádné způsoby platby nejsou k dispozici.
                                        </p>
                                    ) : (
                                        <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                                            <div className="space-y-3">
                                                {paymentMethods.map(method => (
                                                    <div key={method.id}>
                                                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                                        <Label
                                                            htmlFor={method.id}
                                                            className={`block cursor-pointer p-4 rounded-lg border transition-colors ${selectedPayment === method.id
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-border hover:border-primary/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-2xl">{method.icon}</div>
                                                                <div>
                                                                    <p className="font-medium">{method.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{method.description}</p>
                                                                </div>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Confirmation */}
                        {step === 4 && (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="h-10 w-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Objednávka byla přijata!</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Děkujeme za vaši objednávku. Na e-mail {customerInfo.email} vám bude odeslán potvrzovací e-mail.
                                    </p>
                                    <p className="font-medium mb-8">
                                        Číslo objednávky: <span className="text-primary">{orderId}</span>
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <Button variant="outline" onClick={() => navigate('/')}>
                                            Zpět na hlavní stránku
                                        </Button>
                                        <Button onClick={() => navigate('/catalog')}>
                                            Pokračovat v nákupu
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Navigation */}
                        {step < 4 && (
                            <div className="flex justify-between mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {step === 1 ? 'Zpět do košíku' : 'Zpět'}
                                </Button>

                                {step < 3 ? (
                                    <Button
                                        onClick={() => setStep(step + 1)}
                                        disabled={!isStepValid(step)}
                                    >
                                        Pokračovat
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmitOrder}
                                        disabled={!isStepValid(step) || isSubmitting}
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
                    </div>

                    {/* Order Summary Sidebar */}
                    {step < 4 && (
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5" />
                                        Souhrn objednávky
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex gap-3">
                                                <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">{item.quantity}× {item.price} Kč</p>
                                                </div>
                                                <p className="font-medium">{item.price * item.quantity} Kč</p>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mezisoučet:</span>
                                            <span>{getTotal()} Kč</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Doprava:</span>
                                            <span>
                                                {deliveryType === 'pickup' ? (
                                                    <span className="text-green-600">Zdarma (osobní odběr)</span>
                                                ) : selectedZone ? (
                                                    getDeliveryPrice() === 0 ? (
                                                        <span className="text-green-600">Zdarma</span>
                                                    ) : (
                                                        `${getDeliveryPrice()} Kč`
                                                    )
                                                ) : (
                                                    'Zvolte v kroku 2'
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Celkem:</span>
                                        <span>{getFinalTotal()} Kč</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
