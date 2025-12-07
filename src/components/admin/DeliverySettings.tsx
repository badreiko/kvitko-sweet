// src/components/admin/DeliverySettings.tsx
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Truck,
    Clock,
    Calendar,
    Package,
    CreditCard,
    MapPin,
    PackageCheck,
    HelpCircle,
    Save,
    X,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from "@/components/admin/AdminLayout";
import {
    DeliveryZone,
    DeliveryOption,
    PaymentMethod,
    FAQ,
    getAllDeliveryZones,
    getAllDeliveryOptions,
    getAllPaymentMethods,
    getAllFAQ,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    addDeliveryOption,
    updateDeliveryOption,
    deleteDeliveryOption,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    initializeDeliverySettings
} from '@/firebase/services/deliverySettingsService';

// Иконки для опций доставки
const deliveryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'truck': Truck,
    'clock': Clock,
    'calendar': Calendar,
    'package': Package,
};

// Иконки для способов оплаты
const paymentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'credit-card': CreditCard,
    'map-pin': MapPin,
    'package-check': PackageCheck,
};

export default function DeliverySettings() {
    const [loading, setLoading] = useState(true);
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [options, setOptions] = useState<DeliveryOption[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [faqItems, setFaqItems] = useState<FAQ[]>([]);

    // Модальные окна
    const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
    const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);

    // Редактируемые элементы
    const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
    const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null);
    const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    // Формы
    const [zoneForm, setZoneForm] = useState({
        name: '',
        time: '',
        price: 0,
        freeOver: 0,
        type: 'prague' as 'prague' | 'surrounding',
        order: 1,
        isActive: true
    });

    const [optionForm, setOptionForm] = useState({
        name: '',
        description: '',
        price: 0,
        icon: 'truck',
        order: 1,
        isActive: true
    });

    const [paymentForm, setPaymentForm] = useState({
        name: '',
        description: '',
        icon: 'credit-card',
        order: 1,
        isActive: true
    });

    const [faqForm, setFaqForm] = useState({
        question: '',
        answer: '',
        order: 1,
        isActive: true
    });

    // Загрузка данных
    const loadData = async () => {
        setLoading(true);
        try {
            const [zonesData, optionsData, paymentsData, faqData] = await Promise.all([
                getAllDeliveryZones(),
                getAllDeliveryOptions(),
                getAllPaymentMethods(),
                getAllFAQ()
            ]);
            setZones(zonesData);
            setOptions(optionsData);
            setPaymentMethods(paymentsData);
            setFaqItems(faqData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Инициализация данных по умолчанию
    const handleInitialize = async () => {
        try {
            setLoading(true);
            await initializeDeliverySettings();
            await loadData();
            toast.success('Данные успешно инициализированы');
        } catch (error) {
            toast.error('Ошибка инициализации');
        } finally {
            setLoading(false);
        }
    };

    // =============== ЗОНЫ ДОСТАВКИ ===============

    const openZoneDialog = (zone?: DeliveryZone) => {
        if (zone) {
            setEditingZone(zone);
            setZoneForm({
                name: zone.name,
                time: zone.time,
                price: zone.price,
                freeOver: zone.freeOver || 0,
                type: zone.type,
                order: zone.order,
                isActive: zone.isActive
            });
        } else {
            setEditingZone(null);
            setZoneForm({
                name: '',
                time: '2-3 hodiny',
                price: 149,
                freeOver: 1500,
                type: 'prague',
                order: zones.length + 1,
                isActive: true
            });
        }
        setIsZoneDialogOpen(true);
    };

    const handleSaveZone = async () => {
        try {
            if (editingZone) {
                await updateDeliveryZone(editingZone.id, zoneForm);
                toast.success('Зона обновлена');
            } else {
                await addDeliveryZone(zoneForm);
                toast.success('Зона добавлена');
            }
            setIsZoneDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Ошибка сохранения');
        }
    };

    const handleDeleteZone = async (id: string) => {
        if (confirm('Удалить эту зону?')) {
            try {
                await deleteDeliveryZone(id);
                toast.success('Зона удалена');
                loadData();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    const handleToggleZoneActive = async (zone: DeliveryZone) => {
        try {
            await updateDeliveryZone(zone.id, { isActive: !zone.isActive });
            loadData();
        } catch (error) {
            toast.error('Ошибка обновления');
        }
    };

    // =============== ОПЦИИ ДОСТАВКИ ===============

    const openOptionDialog = (option?: DeliveryOption) => {
        if (option) {
            setEditingOption(option);
            setOptionForm({
                name: option.name,
                description: option.description,
                price: option.price,
                icon: option.icon,
                order: option.order,
                isActive: option.isActive
            });
        } else {
            setEditingOption(null);
            setOptionForm({
                name: '',
                description: '',
                price: 0,
                icon: 'truck',
                order: options.length + 1,
                isActive: true
            });
        }
        setIsOptionDialogOpen(true);
    };

    const handleSaveOption = async () => {
        try {
            if (editingOption) {
                await updateDeliveryOption(editingOption.id, optionForm);
                toast.success('Опция обновлена');
            } else {
                await addDeliveryOption(optionForm);
                toast.success('Опция добавлена');
            }
            setIsOptionDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Ошибка сохранения');
        }
    };

    const handleDeleteOption = async (id: string) => {
        if (confirm('Удалить эту опцию?')) {
            try {
                await deleteDeliveryOption(id);
                toast.success('Опция удалена');
                loadData();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    // =============== СПОСОБЫ ОПЛАТЫ ===============

    const openPaymentDialog = (payment?: PaymentMethod) => {
        if (payment) {
            setEditingPayment(payment);
            setPaymentForm({
                name: payment.name,
                description: payment.description,
                icon: payment.icon,
                order: payment.order,
                isActive: payment.isActive
            });
        } else {
            setEditingPayment(null);
            setPaymentForm({
                name: '',
                description: '',
                icon: 'credit-card',
                order: paymentMethods.length + 1,
                isActive: true
            });
        }
        setIsPaymentDialogOpen(true);
    };

    const handleSavePayment = async () => {
        try {
            if (editingPayment) {
                await updatePaymentMethod(editingPayment.id, paymentForm);
                toast.success('Способ оплаты обновлён');
            } else {
                await addPaymentMethod(paymentForm);
                toast.success('Способ оплаты добавлен');
            }
            setIsPaymentDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Ошибка сохранения');
        }
    };

    const handleDeletePayment = async (id: string) => {
        if (confirm('Удалить этот способ оплаты?')) {
            try {
                await deletePaymentMethod(id);
                toast.success('Способ оплаты удалён');
                loadData();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    // =============== FAQ ===============

    const openFaqDialog = (faq?: FAQ) => {
        if (faq) {
            setEditingFaq(faq);
            setFaqForm({
                question: faq.question,
                answer: faq.answer,
                order: faq.order,
                isActive: faq.isActive
            });
        } else {
            setEditingFaq(null);
            setFaqForm({
                question: '',
                answer: '',
                order: faqItems.length + 1,
                isActive: true
            });
        }
        setIsFaqDialogOpen(true);
    };

    const handleSaveFaq = async () => {
        try {
            if (editingFaq) {
                await updateFAQ(editingFaq.id, faqForm);
                toast.success('FAQ обновлён');
            } else {
                await addFAQ(faqForm);
                toast.success('FAQ добавлен');
            }
            setIsFaqDialogOpen(false);
            loadData();
        } catch (error) {
            toast.error('Ошибка сохранения');
        }
    };

    const handleDeleteFaq = async (id: string) => {
        if (confirm('Удалить этот вопрос?')) {
            try {
                await deleteFAQ(id);
                toast.success('FAQ удалён');
                loadData();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    const pragueZones = zones.filter(z => z.type === 'prague');
    const surroundingZones = zones.filter(z => z.type === 'surrounding');

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Настройки доставки</h1>
                        <p className="text-muted-foreground">
                            Управление зонами доставки, опциями, способами оплаты и FAQ
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadData}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Обновить
                        </Button>
                        {zones.length === 0 && (
                            <Button onClick={handleInitialize}>
                                <Plus className="h-4 w-4 mr-2" />
                                Инициализировать данные
                            </Button>
                        )}
                        {zones.length > 0 && (
                            <Button variant="outline" onClick={handleInitialize}>
                                <Plus className="h-4 w-4 mr-2" />
                                Пересоздать данные
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="zones" className="w-full">
                    <TabsList>
                        <TabsTrigger value="zones">Зоны доставки ({zones.length})</TabsTrigger>
                        <TabsTrigger value="options">Опции ({options.length})</TabsTrigger>
                        <TabsTrigger value="payments">Оплата ({paymentMethods.length})</TabsTrigger>
                        <TabsTrigger value="faq">FAQ ({faqItems.length})</TabsTrigger>
                    </TabsList>

                    {/* ЗОНЫ ДОСТАВКИ */}
                    <TabsContent value="zones">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Зоны доставки</CardTitle>
                                <Button onClick={() => openZoneDialog()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Добавить зону
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold mb-4">Прага</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Время</TableHead>
                                            <TableHead>Цена</TableHead>
                                            <TableHead>Бесплатно от</TableHead>
                                            <TableHead>Активна</TableHead>
                                            <TableHead className="text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pragueZones.map(zone => (
                                            <TableRow key={zone.id}>
                                                <TableCell className="font-medium">{zone.name}</TableCell>
                                                <TableCell>{zone.time}</TableCell>
                                                <TableCell>{zone.price} Kč</TableCell>
                                                <TableCell>{zone.freeOver ? `${zone.freeOver} Kč` : '-'}</TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={zone.isActive}
                                                        onCheckedChange={() => handleToggleZoneActive(zone)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => openZoneDialog(zone)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <h3 className="font-semibold mt-8 mb-4">Пригороды</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Время</TableHead>
                                            <TableHead>Цена</TableHead>
                                            <TableHead>Бесплатно от</TableHead>
                                            <TableHead>Активна</TableHead>
                                            <TableHead className="text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {surroundingZones.map(zone => (
                                            <TableRow key={zone.id}>
                                                <TableCell className="font-medium">{zone.name}</TableCell>
                                                <TableCell>{zone.time}</TableCell>
                                                <TableCell>{zone.price} Kč</TableCell>
                                                <TableCell>{zone.freeOver ? `${zone.freeOver} Kč` : '-'}</TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={zone.isActive}
                                                        onCheckedChange={() => handleToggleZoneActive(zone)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => openZoneDialog(zone)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ОПЦИИ ДОСТАВКИ */}
                    <TabsContent value="options">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Опции доставки</CardTitle>
                                <Button onClick={() => openOptionDialog()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Добавить опцию
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Иконка</TableHead>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Описание</TableHead>
                                            <TableHead>Цена</TableHead>
                                            <TableHead>Активна</TableHead>
                                            <TableHead className="text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {options.map(option => {
                                            const IconComponent = deliveryIcons[option.icon] || Truck;
                                            return (
                                                <TableRow key={option.id}>
                                                    <TableCell>
                                                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                                                            <IconComponent className="h-4 w-4 text-primary" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{option.name}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{option.description}</TableCell>
                                                    <TableCell>{option.price > 0 ? `${option.price} Kč` : 'Zdarma'}</TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            checked={option.isActive}
                                                            onCheckedChange={async () => {
                                                                await updateDeliveryOption(option.id, { isActive: !option.isActive });
                                                                loadData();
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => openOptionDialog(option)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteOption(option.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* СПОСОБЫ ОПЛАТЫ */}
                    <TabsContent value="payments">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Способы оплаты</CardTitle>
                                <Button onClick={() => openPaymentDialog()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Добавить способ
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Иконка</TableHead>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Описание</TableHead>
                                            <TableHead>Активен</TableHead>
                                            <TableHead className="text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentMethods.map(payment => {
                                            const IconComponent = paymentIcons[payment.icon] || CreditCard;
                                            return (
                                                <TableRow key={payment.id}>
                                                    <TableCell>
                                                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                                                            <IconComponent className="h-4 w-4 text-primary" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{payment.name}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            checked={payment.isActive}
                                                            onCheckedChange={async () => {
                                                                await updatePaymentMethod(payment.id, { isActive: !payment.isActive });
                                                                loadData();
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => openPaymentDialog(payment)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(payment.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* FAQ */}
                    <TabsContent value="faq">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Часто задаваемые вопросы</CardTitle>
                                <Button onClick={() => openFaqDialog()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Добавить вопрос
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {faqItems.map(faq => (
                                        <Card key={faq.id} className={!faq.isActive ? 'opacity-50' : ''}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <HelpCircle className="h-5 w-5 text-primary" />
                                                            <h4 className="font-semibold">{faq.question}</h4>
                                                        </div>
                                                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <Switch
                                                            checked={faq.isActive}
                                                            onCheckedChange={async () => {
                                                                await updateFAQ(faq.id, { isActive: !faq.isActive });
                                                                loadData();
                                                            }}
                                                        />
                                                        <Button variant="ghost" size="sm" onClick={() => openFaqDialog(faq)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Диалог зоны */}
                <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingZone ? 'Редактировать зону' : 'Новая зона'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Название</Label>
                                <Input
                                    value={zoneForm.name}
                                    onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })}
                                    placeholder="Praha 1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Тип</Label>
                                    <Select
                                        value={zoneForm.type}
                                        onValueChange={(v: 'prague' | 'surrounding') => setZoneForm({ ...zoneForm, type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="prague">Прага</SelectItem>
                                            <SelectItem value="surrounding">Пригород</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Время доставки</Label>
                                    <Input
                                        value={zoneForm.time}
                                        onChange={e => setZoneForm({ ...zoneForm, time: e.target.value })}
                                        placeholder="2-3 hodiny"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Цена (Kč)</Label>
                                    <Input
                                        type="number"
                                        value={zoneForm.price}
                                        onChange={e => setZoneForm({ ...zoneForm, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>Бесплатно от (Kč)</Label>
                                    <Input
                                        type="number"
                                        value={zoneForm.freeOver}
                                        onChange={e => setZoneForm({ ...zoneForm, freeOver: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={zoneForm.isActive}
                                    onCheckedChange={v => setZoneForm({ ...zoneForm, isActive: v })}
                                />
                                <Label>Активна</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsZoneDialogOpen(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Отмена
                            </Button>
                            <Button onClick={handleSaveZone}>
                                <Save className="h-4 w-4 mr-2" />
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог опции доставки */}
                <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingOption ? 'Редактировать опцию' : 'Новая опция'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Название</Label>
                                <Input
                                    value={optionForm.name}
                                    onChange={e => setOptionForm({ ...optionForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Описание</Label>
                                <Textarea
                                    value={optionForm.description}
                                    onChange={e => setOptionForm({ ...optionForm, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Иконка</Label>
                                    <Select
                                        value={optionForm.icon}
                                        onValueChange={v => setOptionForm({ ...optionForm, icon: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="truck">🚚 Грузовик</SelectItem>
                                            <SelectItem value="clock">⏰ Часы</SelectItem>
                                            <SelectItem value="calendar">📅 Календарь</SelectItem>
                                            <SelectItem value="package">📦 Посылка</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Цена (Kč)</Label>
                                    <Input
                                        type="number"
                                        value={optionForm.price}
                                        onChange={e => setOptionForm({ ...optionForm, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={optionForm.isActive}
                                    onCheckedChange={v => setOptionForm({ ...optionForm, isActive: v })}
                                />
                                <Label>Активна</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOptionDialogOpen(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Отмена
                            </Button>
                            <Button onClick={handleSaveOption}>
                                <Save className="h-4 w-4 mr-2" />
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог способа оплаты */}
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingPayment ? 'Редактировать способ' : 'Новый способ оплаты'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Название</Label>
                                <Input
                                    value={paymentForm.name}
                                    onChange={e => setPaymentForm({ ...paymentForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Описание</Label>
                                <Textarea
                                    value={paymentForm.description}
                                    onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Иконка</Label>
                                <Select
                                    value={paymentForm.icon}
                                    onValueChange={v => setPaymentForm({ ...paymentForm, icon: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="credit-card">💳 Карта</SelectItem>
                                        <SelectItem value="map-pin">📍 Наличные</SelectItem>
                                        <SelectItem value="package-check">✅ Перевод</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={paymentForm.isActive}
                                    onCheckedChange={v => setPaymentForm({ ...paymentForm, isActive: v })}
                                />
                                <Label>Активен</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Отмена
                            </Button>
                            <Button onClick={handleSavePayment}>
                                <Save className="h-4 w-4 mr-2" />
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог FAQ */}
                <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingFaq ? 'Редактировать FAQ' : 'Новый вопрос'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Вопрос</Label>
                                <Input
                                    value={faqForm.question}
                                    onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Ответ</Label>
                                <Textarea
                                    value={faqForm.answer}
                                    onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={faqForm.isActive}
                                    onCheckedChange={v => setFaqForm({ ...faqForm, isActive: v })}
                                />
                                <Label>Активен</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Отмена
                            </Button>
                            <Button onClick={handleSaveFaq}>
                                <Save className="h-4 w-4 mr-2" />
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
