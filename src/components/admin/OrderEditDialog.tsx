// src/components/admin/OrderEditDialog.tsx
import { FC, useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Truck, Building, CreditCard, User } from "lucide-react";
import { toast } from "sonner";
import { Order, updateOrder, OrderUpdateData } from "@/firebase/services/orderService";
import { getAllDeliveryZones, getAllPaymentMethods, DeliveryZone, PaymentMethod } from "@/firebase/services/deliverySettingsService";
import { getAllStores, Store as StoreType } from "@/firebase/services/storeService";

interface OrderEditDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrderUpdated: () => void;
}

const OrderEditDialog: FC<OrderEditDialogProps> = ({
    order,
    open,
    onOpenChange,
    onOrderUpdated
}) => {
    const [saving, setSaving] = useState(false);
    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
    const [stores, setStores] = useState<StoreType[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    // Form state
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [paymentMethodId, setPaymentMethodId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'refunded'>('pending');
    const [status, setStatus] = useState<Order['status']>('pending');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            const [zones, storesList, payments] = await Promise.all([
                getAllDeliveryZones(),
                getAllStores(),
                getAllPaymentMethods()
            ]);
            setDeliveryZones(zones);
            setStores(storesList);
            setPaymentMethods(payments);
        };
        loadData();
    }, []);

    // Populate form when order changes
    useEffect(() => {
        if (order) {
            setDeliveryType(order.delivery?.type || 'delivery');
            setSelectedZone(order.delivery?.zoneId || '');
            setSelectedStore(order.delivery?.type === 'pickup' ? order.delivery?.zoneId || '' : '');
            setStreet(order.shippingAddress?.street || '');
            setCity(order.shippingAddress?.city || '');
            setPostalCode(order.shippingAddress?.postalCode || '');
            setPaymentMethodId(order.payment?.methodId || '');
            setPaymentStatus(order.paymentStatus || 'pending');
            setStatus(order.status);
            setFirstName(order.customerInfo?.firstName || '');
            setLastName(order.customerInfo?.lastName || '');
            setEmail(order.customerInfo?.email || '');
            setPhone(order.customerInfo?.phone || '');
            setNote(order.customerInfo?.note || '');
        }
    }, [order]);

    const calculateNewTotal = (): number => {
        if (!order) return 0;
        const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let deliveryPrice = 0;
        if (deliveryType === 'delivery') {
            const zone = deliveryZones.find(z => z.id === selectedZone);
            deliveryPrice = zone?.price || 0;
        }
        return itemsTotal + deliveryPrice;
    };

    const handleSave = async () => {
        if (!order) return;

        setSaving(true);
        try {
            const zone = deliveryZones.find(z => z.id === selectedZone);
            const store = stores.find(s => s.id === selectedStore);
            const payment = paymentMethods.find(p => p.id === paymentMethodId);

            const updates: OrderUpdateData = {
                status,
                paymentStatus,
                delivery: {
                    type: deliveryType,
                    zoneId: deliveryType === 'delivery' ? selectedZone : selectedStore,
                    zoneName: deliveryType === 'pickup'
                        ? (store ? `${store.name} - ${store.address}` : '')
                        : (zone?.name || ''),
                    price: deliveryType === 'delivery' ? (zone?.price || 0) : 0
                },
                payment: {
                    methodId: paymentMethodId,
                    methodName: payment?.name || ''
                },
                customerInfo: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    note
                },
                totalPrice: calculateNewTotal()
            };

            if (deliveryType === 'delivery') {
                updates.shippingAddress = {
                    street,
                    city,
                    postalCode,
                    country: 'Česká republika'
                };
            }

            await updateOrder(order.id, updates);
            toast.success('Заказ успешно обновлен');
            onOrderUpdated();
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Ошибка при обновлении заказа');
        } finally {
            setSaving(false);
        }
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать заказ #{order.orderNumber || order.id.slice(0, 8)}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="delivery" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="delivery" className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            <span className="hidden sm:inline">Доставка</span>
                        </TabsTrigger>
                        <TabsTrigger value="payment" className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Оплата</span>
                        </TabsTrigger>
                        <TabsTrigger value="contact" className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Контакт</span>
                        </TabsTrigger>
                        <TabsTrigger value="status" className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span className="hidden sm:inline">Статус</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Delivery Tab */}
                    <TabsContent value="delivery" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Тип получения</Label>
                            <Select value={deliveryType} onValueChange={(v: 'delivery' | 'pickup') => setDeliveryType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="delivery">🚚 Доставка</SelectItem>
                                    <SelectItem value="pickup">🏪 Самовывоз</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {deliveryType === 'delivery' ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Зона доставки</Label>
                                    <Select value={selectedZone} onValueChange={setSelectedZone}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите зону" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {deliveryZones.map(zone => (
                                                <SelectItem key={zone.id} value={zone.id}>
                                                    {zone.name} - {zone.price} Kč
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Улица</Label>
                                    <Input value={street} onChange={e => setStreet(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Город</Label>
                                        <Input value={city} onChange={e => setCity(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Почтовый индекс</Label>
                                        <Input value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label>Точка самовывоза</Label>
                                <Select value={selectedStore} onValueChange={setSelectedStore}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите магазин" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stores.map(store => (
                                            <SelectItem key={store.id} value={store.id}>
                                                {store.name} - {store.address}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium">Новая сумма заказа: <span className="text-primary">{calculateNewTotal()} Kč</span></p>
                        </div>
                    </TabsContent>

                    {/* Payment Tab */}
                    <TabsContent value="payment" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Способ оплаты</Label>
                            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите способ оплаты" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map(method => (
                                        <SelectItem key={method.id} value={method.id}>
                                            {method.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Статус оплаты</Label>
                            <Select value={paymentStatus} onValueChange={(v: 'pending' | 'paid' | 'refunded') => setPaymentStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">⏳ Ожидает оплаты</SelectItem>
                                    <SelectItem value="paid">✅ Оплачено</SelectItem>
                                    <SelectItem value="refunded">↩️ Возврат</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Имя</Label>
                                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Фамилия</Label>
                                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Телефон</Label>
                            <Input value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Заметка</Label>
                            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} />
                        </div>
                    </TabsContent>

                    {/* Status Tab */}
                    <TabsContent value="status" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Статус заказа</Label>
                            <Select value={status} onValueChange={(v: Order['status']) => setStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">⏳ Ожидает</SelectItem>
                                    <SelectItem value="processing">📦 В обработке</SelectItem>
                                    {deliveryType === 'pickup' ? (
                                        <>
                                            <SelectItem value="ready">✨ Готов к выдаче</SelectItem>
                                            <SelectItem value="delivered">✅ Выдан</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="shipped">🚚 Отправлен</SelectItem>
                                            <SelectItem value="delivered">✅ Доставлен</SelectItem>
                                        </>
                                    )}
                                    <SelectItem value="cancelled">❌ Отменен</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OrderEditDialog;
