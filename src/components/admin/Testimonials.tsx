// src/components/admin/Testimonials.tsx
import { FC, useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Star,
    Loader2,
    Upload,
    X,
    MessageSquare,
    User
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    Testimonial,
    getAllTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialStatus
} from "@/firebase/services/testimonialService";
import { formatFileSize, isSupportedImageFormat } from "@/utils/imageCompression";

// Форматирование даты
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
};

// Компонент рейтинга
const RatingStars: FC<{ rating: number; onChange?: (rating: number) => void }> = ({ rating, onChange }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-5 w-5 cursor-pointer transition-colors ${star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                        }`}
                    onClick={() => onChange?.(star)}
                />
            ))}
        </div>
    );
};

const Testimonials: FC = () => {
    // Состояния
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Состояния диалогов
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

    // Состояния формы
    const [formData, setFormData] = useState({
        name: "",
        comment: "",
        rating: 5,
        isActive: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Загрузка отзывов
    const loadTestimonials = async () => {
        setLoading(true);
        try {
            const data = await getAllTestimonials();
            setTestimonials(data);
        } catch (error) {
            console.error("Error loading testimonials:", error);
            toast.error("Не удалось загрузить отзывы");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTestimonials();
    }, []);

    // Фильтрация
    const filteredTestimonials = testimonials.filter(t => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            t.name.toLowerCase().includes(searchLower) ||
            t.comment.toLowerCase().includes(searchLower)
        );
    });

    // Открытие формы для создания
    const handleCreate = () => {
        setSelectedTestimonial(null);
        setFormData({ name: "", comment: "", rating: 5, isActive: true });
        setImageFile(null);
        setImagePreview(null);
        setIsFormDialogOpen(true);
    };

    // Открытие формы для редактирования
    const handleEdit = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setFormData({
            name: testimonial.name,
            comment: testimonial.comment,
            rating: testimonial.rating,
            isActive: testimonial.isActive
        });
        setImageFile(null);
        setImagePreview(testimonial.imageUrl || null);
        setIsFormDialogOpen(true);
    };

    // Открытие диалога удаления
    const handleDeleteClick = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setIsDeleteDialogOpen(true);
    };

    // Обработка выбора файла
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isSupportedImageFormat(file)) {
            toast.error("Неподдерживаемый формат файла. Используйте JPG, PNG или WebP");
            return;
        }

        setImageFile(file);

        // Создаем превью
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        toast.info(`Выбран файл: ${file.name} (${formatFileSize(file.size)})`);
    };

    // Удаление изображения
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Сохранение отзыва
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Введите имя клиента");
            return;
        }
        if (!formData.comment.trim()) {
            toast.error("Введите текст отзыва");
            return;
        }

        setIsSaving(true);
        setCompressionProgress(0);

        try {
            if (selectedTestimonial) {
                // Обновление
                await updateTestimonial(
                    selectedTestimonial.id,
                    formData,
                    imageFile || undefined,
                    (progress) => setCompressionProgress(progress)
                );
                toast.success("Отзыв обновлен");
            } else {
                // Создание
                await addTestimonial(
                    formData,
                    imageFile || undefined,
                    (progress) => setCompressionProgress(progress)
                );
                toast.success("Отзыв добавлен");
            }

            setIsFormDialogOpen(false);
            loadTestimonials();
        } catch (error) {
            console.error("Error saving testimonial:", error);
            toast.error("Не удалось сохранить отзыв");
        } finally {
            setIsSaving(false);
            setCompressionProgress(0);
        }
    };

    // Удаление отзыва
    const handleDelete = async () => {
        if (!selectedTestimonial) return;

        try {
            await deleteTestimonial(selectedTestimonial.id);
            toast.success("Отзыв удален");
            setIsDeleteDialogOpen(false);
            loadTestimonials();
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            toast.error("Не удалось удалить отзыв");
        }
    };

    // Переключение статуса
    const handleToggleStatus = async (testimonial: Testimonial) => {
        try {
            await toggleTestimonialStatus(testimonial.id, !testimonial.isActive);
            toast.success(
                testimonial.isActive
                    ? "Отзыв скрыт"
                    : "Отзыв активирован"
            );
            loadTestimonials();
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Не удалось изменить статус");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Заголовок */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Отзывы клиентов</h2>
                        <p className="text-muted-foreground">
                            Управление отзывами, отображаемыми на главной странице
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Поиск..."
                                className="pl-8 w-full md:w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить
                        </Button>
                    </div>
                </div>

                {/* Таблица */}
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Все отзывы ({filteredTestimonials.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredTestimonials.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Отзывы не найдены</h3>
                                <p className="text-muted-foreground mt-1">
                                    {searchTerm
                                        ? "Попробуйте изменить параметры поиска"
                                        : "Добавьте первый отзыв клиента"}
                                </p>
                                {!searchTerm && (
                                    <Button className="mt-4" onClick={handleCreate}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Добавить отзыв
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Клиент</TableHead>
                                        <TableHead className="hidden md:table-cell">Отзыв</TableHead>
                                        <TableHead>Рейтинг</TableHead>
                                        <TableHead className="hidden md:table-cell">Дата</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTestimonials.map((testimonial) => (
                                        <TableRow key={testimonial.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {testimonial.imageUrl ? (
                                                        <img
                                                            src={testimonial.imageUrl}
                                                            alt={testimonial.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{testimonial.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell max-w-[300px]">
                                                <p className="truncate text-muted-foreground">
                                                    {testimonial.comment}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= testimonial.rating
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {formatDate(testimonial.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={testimonial.isActive}
                                                    onCheckedChange={() => handleToggleStatus(testimonial)}
                                                    aria-label={testimonial.isActive ? "Скрыть отзыв" : "Показать отзыв"}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(testimonial)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(testimonial)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Диалог формы */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedTestimonial ? "Редактирование отзыва" : "Новый отзыв"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTestimonial
                                ? "Измените данные отзыва"
                                : "Добавьте новый отзыв клиента"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Фото */}
                        <div className="space-y-2">
                            <Label>Фото клиента</Label>
                            <div className="flex items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className="w-20 h-20 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSaving}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Выбрать фото
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG или WebP. Автоматическое сжатие.
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>

                        {/* Имя */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Имя клиента *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Введите имя"
                                disabled={isSaving}
                            />
                        </div>

                        {/* Отзыв */}
                        <div className="space-y-2">
                            <Label htmlFor="comment">Текст отзыва *</Label>
                            <Textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="Введите текст отзыва"
                                rows={4}
                                disabled={isSaving}
                            />
                        </div>

                        {/* Рейтинг */}
                        <div className="space-y-2">
                            <Label>Рейтинг</Label>
                            <RatingStars
                                rating={formData.rating}
                                onChange={(rating) => setFormData({ ...formData, rating })}
                            />
                        </div>

                        {/* Активность */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="isActive">Показывать на сайте</Label>
                                <p className="text-xs text-muted-foreground">
                                    Отзыв будет виден на главной странице
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                disabled={isSaving}
                            />
                        </div>

                        {/* Прогресс сжатия */}
                        {isSaving && compressionProgress > 0 && compressionProgress < 100 && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Сжатие изображения...</span>
                                    <span>{compressionProgress}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${compressionProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsFormDialogOpen(false)}
                            disabled={isSaving}
                        >
                            Отмена
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Сохранение...
                                </>
                            ) : (
                                selectedTestimonial ? "Сохранить" : "Добавить"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог удаления */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить отзыв от "{selectedTestimonial?.name}"?
                            Это действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default Testimonials;
