// src/components/admin/Stores.tsx
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, MapPin, Loader2 } from "lucide-react";
import {
    Store,
    OpeningHours,
    getAllStores,
    addStore,
    updateStore,
    deleteStore,
} from "@/firebase/services/storeService";

const defaultOpeningHours: OpeningHours = {
    monday: "09:00 - 18:00",
    tuesday: "09:00 - 18:00",
    wednesday: "09:00 - 18:00",
    thursday: "09:00 - 18:00",
    friday: "09:00 - 18:00",
    saturday: "10:00 - 14:00",
    sunday: "Zavřeno",
};

const dayLabels: Record<keyof OpeningHours, string> = {
    monday: "Pondělí",
    tuesday: "Úterý",
    wednesday: "Středa",
    thursday: "Čtvrtek",
    friday: "Pátek",
    saturday: "Sobota",
    sunday: "Neděle",
};

export default function Stores() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStore, setCurrentStore] = useState<Partial<Store> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        email: "",
        description: "",
        isActive: true,
        order: 0,
        openingHours: { ...defaultOpeningHours },
    });

    // Validation state
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showErrors, setShowErrors] = useState(false);

    // Required fields validation
    const requiredFields = ['name', 'address', 'city', 'phone'] as const;
    const getFieldError = (field: string): string | null => {
        const value = formData[field as keyof typeof formData];
        if (requiredFields.includes(field as typeof requiredFields[number]) && (!value || String(value).trim() === '')) {
            return 'Toto pole je povinné';
        }
        if (field === 'email' && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return 'Neplatný formát e-mailu';
        }
        return null;
    };

    const hasErrors = requiredFields.some(field => getFieldError(field) !== null);

    // Load stores
    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const data = await getAllStores();
            setStores(data);
        } catch (error) {
            console.error("Error fetching stores:", error);
            toast.error("Chyba při načítání prodejen");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            address: "",
            city: "",
            postalCode: "",
            phone: "",
            email: "",
            description: "",
            isActive: true,
            order: stores.length,
            openingHours: { ...defaultOpeningHours },
        });
        setCurrentStore(null);
        setIsEditing(false);
        setTouched({});
        setShowErrors(false);
    };

    const handleOpenDialog = (store?: Store) => {
        if (store) {
            setIsEditing(true);
            setCurrentStore(store);
            setFormData({
                name: store.name,
                address: store.address,
                city: store.city,
                postalCode: store.postalCode,
                phone: store.phone,
                email: store.email || "",
                description: store.description || "",
                isActive: store.isActive,
                order: store.order,
                openingHours: store.openingHours || { ...defaultOpeningHours },
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleHoursChange = (day: keyof OpeningHours, value: string) => {
        setFormData((prev) => ({
            ...prev,
            openingHours: {
                ...prev.openingHours,
                [day]: value,
            },
        }));
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        if (hasErrors) {
            toast.error("Vyplňte všechna povinná pole");
            return;
        }

        setIsSaving(true);
        try {
            const storeData = {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                phone: formData.phone,
                email: formData.email || undefined,
                description: formData.description || undefined,
                isActive: formData.isActive,
                order: formData.order,
                openingHours: formData.openingHours,
            };

            if (isEditing && currentStore?.id) {
                await updateStore(currentStore.id, storeData);
                toast.success("Prodejna byla úspěšně aktualizována");
            } else {
                await addStore(storeData);
                toast.success("Prodejna byla úspěšně přidána");
            }

            handleCloseDialog();
            fetchStores();
        } catch (error) {
            console.error("Error saving store:", error);
            toast.error("Chyba při ukládání prodejny");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Opravdu chcete smazat tuto prodejnu?")) return;

        try {
            await deleteStore(id);
            toast.success("Prodejna byla smazána");
            fetchStores();
        } catch (error) {
            console.error("Error deleting store:", error);
            toast.error("Chyba při mazání prodejny");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Prodejny</h1>
                        <p className="text-muted-foreground">
                            Správa prodejen pro osobní odběr
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Přidat prodejnu
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Seznam prodejen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : stores.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Zatím nemáte žádné prodejny.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Název</TableHead>
                                        <TableHead>Adresa</TableHead>
                                        <TableHead>Telefon</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Akce</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stores.map((store) => (
                                        <TableRow key={store.id}>
                                            <TableCell className="font-medium">{store.name}</TableCell>
                                            <TableCell>
                                                {store.address}, {store.city} {store.postalCode}
                                            </TableCell>
                                            <TableCell>{store.phone}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${store.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {store.isActive ? "Aktivní" : "Neaktivní"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(store)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(store.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Upravit prodejnu" : "Přidat prodejnu"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name" className={(showErrors || touched.name) && getFieldError('name') ? 'text-destructive' : ''}>
                                    Název prodejny *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('name')}
                                    placeholder="Kvitko Sweet - Centrum"
                                    className={(showErrors || touched.name) && getFieldError('name') ? 'border-destructive' : ''}
                                />
                                {(showErrors || touched.name) && getFieldError('name') && (
                                    <p className="text-sm text-destructive mt-1">{getFieldError('name')}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="address" className={(showErrors || touched.address) && getFieldError('address') ? 'text-destructive' : ''}>
                                        Adresa *
                                    </Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('address')}
                                        placeholder="Květinová 123"
                                        className={(showErrors || touched.address) && getFieldError('address') ? 'border-destructive' : ''}
                                    />
                                    {(showErrors || touched.address) && getFieldError('address') && (
                                        <p className="text-sm text-destructive mt-1">{getFieldError('address')}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="city" className={(showErrors || touched.city) && getFieldError('city') ? 'text-destructive' : ''}>
                                        Město *
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('city')}
                                        placeholder="Praha"
                                        className={(showErrors || touched.city) && getFieldError('city') ? 'border-destructive' : ''}
                                    />
                                    {(showErrors || touched.city) && getFieldError('city') && (
                                        <p className="text-sm text-destructive mt-1">{getFieldError('city')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="postalCode">PSČ</Label>
                                    <Input
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="110 00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone" className={(showErrors || touched.phone) && getFieldError('phone') ? 'text-destructive' : ''}>
                                        Telefon *
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('phone')}
                                        placeholder="+420 123 456 789"
                                        className={(showErrors || touched.phone) && getFieldError('phone') ? 'border-destructive' : ''}
                                    />
                                    {(showErrors || touched.phone) && getFieldError('phone') && (
                                        <p className="text-sm text-destructive mt-1">{getFieldError('phone')}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className={(showErrors || touched.email) && getFieldError('email') ? 'text-destructive' : ''}>
                                    E-mail
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="prodejna@kvitko.cz"
                                    className={(showErrors || touched.email) && getFieldError('email') ? 'border-destructive' : ''}
                                />
                                {(showErrors || touched.email) && getFieldError('email') && (
                                    <p className="text-sm text-destructive mt-1">{getFieldError('email')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Popis</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Krátký popis prodejny..."
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Otevírací doba</Label>
                            <div className="grid gap-2">
                                {(Object.keys(dayLabels) as Array<keyof OpeningHours>).map((day) => (
                                    <div key={day} className="flex items-center gap-4">
                                        <span className="w-20 text-sm">{dayLabels[day]}</span>
                                        <Input
                                            value={formData.openingHours[day]}
                                            onChange={(e) => handleHoursChange(day, e.target.value)}
                                            placeholder="09:00 - 18:00"
                                            className="flex-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Aktivní prodejna</Label>
                                <p className="text-sm text-muted-foreground">
                                    Neaktivní prodejny se nezobrazí při výběru osobního odběru
                                </p>
                            </div>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({ ...prev, isActive: checked }))
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Zrušit
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Ukládání...
                                </>
                            ) : isEditing ? (
                                "Uložit změny"
                            ) : (
                                "Přidat prodejnu"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
