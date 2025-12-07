import { FC, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Loader2, Flower } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
// Импорт типа FlowerForBouquet из bouquetFlowerService
import { FlowerForBouquet, updateFlowerForCustomBouquet, ItemType } from "@/firebase/services/bouquetFlowerService";
// Импорт типа MultiLanguageText из flowerService
// Тип MultiLanguageText уже определен в bouquetFlowerService

// Функции для работы с цветами для букетов
// Реализация функций для работы с Firebase
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';

// Константы для коллекций
const BOUQUET_FLOWERS_COLLECTION = 'bouquetFlowers';

// Функции для работы с цветами для букетов
// Получение всех цветов для букетов
export const getAllFlowersForBouquet = async (): Promise<FlowerForBouquet[]> => {
  try {
    const q = query(
      collection(db, BOUQUET_FLOWERS_COLLECTION),
      where('forCustomBouquet', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as FlowerForBouquet[];
  } catch (error) {
    console.error('Error getting bouquet flowers: ', error);
    throw error;
  }
};

// Добавление нового цветка для букета
export const addFlowerForBouquet = async (flower: Omit<FlowerForBouquet, 'id'>, imageFile?: File): Promise<string> => {
  try {
    // Создаем запись цветка в Firestore
    const docRef = await addDoc(collection(db, BOUQUET_FLOWERS_COLLECTION), {
      ...flower,
      createdAt: new Date()
    });

    // Если есть файл изображения, загружаем его
    if (imageFile) {
      // Добавляем временную метку для предотвращения кэширования
      const timestamp = new Date().getTime();
      const imageRef = ref(storage, `bouquet_flowers/${docRef.id}/${timestamp}_${imageFile.name}`);

      // Загружаем файл
      await uploadBytes(imageRef, imageFile);

      // Получаем URL загруженного изображения
      const imageUrl = await getDownloadURL(imageRef);

      // Обновляем запись цветка с URL изображения
      await updateDoc(doc(db, BOUQUET_FLOWERS_COLLECTION, docRef.id), { imageUrl });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding bouquet flower: ', error);
    throw error;
  }
};

// Обновление цветка для букета
export const updateFlowerForBouquet = async (id: string, flower: Partial<FlowerForBouquet>): Promise<void> => {
  try {
    await updateDoc(doc(db, BOUQUET_FLOWERS_COLLECTION, id), flower);
  } catch (error) {
    console.error('Error updating bouquet flower: ', error);
    throw error;
  }
};

// Удаление цветка для букета
export const deleteFlowerForBouquet = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, BOUQUET_FLOWERS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting bouquet flower: ', error);
    throw error;
  }
};

// Типы цветов для выбора
const flowerTypes = [
  { value: "rose", label: "Роза" },
  { value: "tulip", label: "Тюльпан" },
  { value: "lily", label: "Лилия" },
  { value: "peony", label: "Пион" },
  { value: "sunflower", label: "Подсолнух" },
  { value: "orchid", label: "Орхидея" },
  { value: "chrysanthemum", label: "Хризантема" },
  { value: "gerbera", label: "Гербера" },
  { value: "eustoma", label: "Эустома" },
  { value: "other", label: "Другое" }
];

const BouquetFlowers: FC = () => {
  const [flowers, setFlowers] = useState<FlowerForBouquet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFlower, setCurrentFlower] = useState<FlowerForBouquet | null>(null);
  const [newFlower, setNewFlower] = useState<Partial<FlowerForBouquet>>({
    name: { cs: "" }, // Теперь name - это объект MultiLanguageText
    type: "",
    color: "",
    price: 0,
    inStock: true,
    stockQuantity: 0,
    description: "",
    forCustomBouquet: true,
    itemType: ItemType.FLOWER // По умолчанию - цветок
  });

  // Состояние для хранения выбранного файла изображения
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Обработчик файла изображения
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event:', e);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Selected file:', file);
      setSelectedFile(file);
      toast.success(`Файл выбран: ${file.name}`);
    } else {
      console.log('No file selected');
    }
  };

  // Загрузка изображения в Firebase Storage
  const uploadImage = async (file: File, flowerId: string): Promise<string> => {
    try {
      console.log('Starting upload for file:', file.name, 'to flower ID:', flowerId);
      toast.info(`Начало загрузки изображения: ${file.name}`);

      // Создаем ссылку на место в Storage, где будет храниться изображение
      // Добавляем временную метку, чтобы избежать кэширования
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `bouquet_flowers/${flowerId}/${timestamp}_${file.name}`);

      // Загружаем файл
      setUploadProgress(10); // Начало загрузки
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('Upload completed:', uploadResult);
      setUploadProgress(70); // Загрузка завершена

      // Получаем URL загруженного изображения
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadURL);
      setUploadProgress(100); // Загрузка полностью завершена

      toast.success(`Изображение успешно загружено`);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Ошибка при загрузке изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  };

  // Загрузка цветов из Firestore
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        setLoading(true);
        const flowersData = await getAllFlowersForBouquet();
        setFlowers(flowersData);
      } catch (error) {
        console.error("Error fetching bouquet flowers:", error);
        toast.error("Ошибка при загрузке цветов для букетов");
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, []);

  // Фильтрация цветов по поиску
  const filteredFlowers = flowers.filter(flower => {
    const searchLower = searchTerm.toLowerCase();
    // Проверяем все языковые версии названия
    const nameMatch = (
      (flower.name.cs && flower.name.cs.toLowerCase().includes(searchLower)) ||
      (flower.name.uk && flower.name.uk.toLowerCase().includes(searchLower)) ||
      (flower.name.en && flower.name.en.toLowerCase().includes(searchLower)) ||
      (flower.name.ru && flower.name.ru.toLowerCase().includes(searchLower))
    );

    return (
      nameMatch ||
      flower.color.toLowerCase().includes(searchLower) ||
      (flower.description && flower.description.toLowerCase().includes(searchLower))
    );
  });

  // Обработчики для формы добавления/редактирования
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Если изменяется поле name, обновляем объект MultiLanguageText
      setNewFlower(prev => ({
        ...prev,
        name: { ...prev.name, cs: value }
      }));
    } else if (name === "price" || name === "stockQuantity") {
      // Если изменяется числовое поле, преобразуем в число
      setNewFlower(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      // Для остальных полей
      setNewFlower(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTypeChange = (value: string) => {
    setNewFlower(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleInStockChange = (value: boolean) => {
    setNewFlower(prev => ({
      ...prev,
      inStock: value,
      stockQuantity: value ? prev.stockQuantity : 0
    }));
  };

  // Сброс формы
  const resetForm = () => {
    setNewFlower({
      name: { cs: "" },
      type: "",
      color: "",
      price: 0,
      inStock: true,
      stockQuantity: 0,
      description: "",
      forCustomBouquet: true,
      itemType: ItemType.FLOWER // Добавляем поле itemType при сбросе формы
    });
    setSelectedFile(null);
  };

  // Открытие диалога добавления цветка
  const openAddDialog = () => {
    // Сбрасываем форму и выбранный файл
    resetForm();
    setUploadProgress(0);
    setIsAddDialogOpen(true);
  };

  // Добавление нового цветка
  const handleAddFlower = async () => {
    try {
      console.log('Adding new flower with data:', newFlower);
      console.log('Selected file:', selectedFile);

      if (!newFlower.name?.cs || !newFlower.color || newFlower.price === undefined || newFlower.price <= 0) {
        toast.error("Заполните все обязательные поля");
        return;
      }

      if (!selectedFile) {
        toast.error("Выберите изображение для цветка");
        return;
      }

      setLoading(true);
      toast.info('Добавление нового цветка...');

      // Всегда устанавливаем флаг forCustomBouquet в true для этого раздела
      const flowerData = {
        ...newFlower,
        forCustomBouquet: true,
        itemType: newFlower.itemType || ItemType.FLOWER, // Убедимся, что поле itemType установлено
        createdAt: new Date()
      } as Omit<FlowerForBouquet, 'id'>;

      console.log('Creating flower record in database with data:', flowerData);

      try {
        // Добавляем цветок в базу данных и получаем его ID
        // Передаем файл изображения напрямую в функцию addFlowerForBouquet
        setUploadProgress(10); // Начало загрузки
        const flowerId = await addFlowerForBouquet(flowerData, selectedFile);
        console.log('Flower added to database with ID:', flowerId);
        setUploadProgress(100); // Загрузка завершена

        // Обновляем список цветов
        const updatedFlowers = await getAllFlowersForBouquet();
        setFlowers(updatedFlowers);
        console.log('Flowers list updated, new count:', updatedFlowers.length);

        // Сбрасываем форму
        resetForm(); // Используем функцию resetForm, которая уже включает поле itemType

        // Сбрасываем выбранный файл
        setSelectedFile(null);
        setUploadProgress(0);

        setIsAddDialogOpen(false);
        toast.success("Цветок успешно добавлен");
      } catch (innerError) {
        console.error('Error during flower creation process:', innerError);
        toast.error(`Ошибка при создании цветка: ${innerError instanceof Error ? innerError.message : 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error("Error adding flower:", error);
      toast.error(`Ошибка при добавлении цветка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  // Редактирование цветка
  const handleEditFlower = (flower: FlowerForBouquet) => {
    setCurrentFlower(flower);
    setNewFlower(flower);
    // Сбрасываем выбранный файл при редактировании
    setSelectedFile(null);
    setUploadProgress(0);
    setIsEditDialogOpen(true);
  };

  // Сохранение изменений цветка
  const handleSaveFlower = async () => {
    try {
      if (!currentFlower || !newFlower.name || !newFlower.color || newFlower.price === undefined || newFlower.price <= 0) {
        toast.error("Заполните все обязательные поля");
        return;
      }

      setLoading(true);

      // Всегда устанавливаем флаг forCustomBouquet в true для этого раздела
      const flowerData: Partial<FlowerForBouquet> = {
        ...newFlower,
        forCustomBouquet: true
      };

      // Если выбран новый файл изображения, загружаем его
      if (selectedFile) {
        // Загружаем изображение и получаем URL
        const imageUrl = await uploadImage(selectedFile, currentFlower.id);

        // Добавляем URL изображения в данные цветка
        flowerData.imageUrl = imageUrl;
      }

      await updateFlowerForBouquet(currentFlower.id, flowerData);

      // Обновляем список цветов
      const updatedFlowers = await getAllFlowersForBouquet();
      setFlowers(updatedFlowers);

      // Сбрасываем форму
      setCurrentFlower(null);
      setNewFlower({
        name: { cs: "" },  // Теперь name является объектом MultiLanguageText
        type: "other",
        color: "",
        price: 0,
        inStock: true,
        stockQuantity: 0,
        description: "",
        forCustomBouquet: true
      });

      // Сбрасываем выбранный файл
      setSelectedFile(null);
      setUploadProgress(0);

      setIsEditDialogOpen(false);
      toast.success("Цветок успешно обновлен");
    } catch (error) {
      console.error("Error updating flower:", error);
      toast.error("Ошибка при обновлении цветка");
    } finally {
      setLoading(false);
    }
  };

  // Обновление цветка для использования в букетах
  const handleUpdateFlowerForCustomBouquet = async (id: string) => {
    try {
      setLoading(true);
      await updateFlowerForCustomBouquet(id);

      // Обновляем список цветов
      const updatedFlowers = await getAllFlowersForBouquet();
      setFlowers(updatedFlowers);

      toast.success("Цветок успешно обновлен для использования в букетах");
    } catch (error) {
      console.error("Error updating flower for custom bouquet:", error);
      toast.error("Ошибка при обновлении цветка");
    } finally {
      setLoading(false);
    }
  };

  // Удаление цветка
  const handleDeleteFlower = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот цветок?")) {
      try {
        setLoading(true);
        await deleteFlowerForBouquet(id);

        // Обновляем список цветов
        const updatedFlowers = await getAllFlowersForBouquet();
        setFlowers(updatedFlowers);

        toast.success("Цветок успешно удален");
      } catch (error) {
        console.error("Error deleting flower:", error);
        toast.error("Ошибка при удалении цветка");
      } finally {
        setLoading(false);
      }
    }
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(price);
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Цветы для составления букетов</CardTitle>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить цветок
          </Button>
        </CardHeader>
        <CardContent>
          {/* Поиск и фильтры */}
          <div className="flex items-center mb-6 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск цветов..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Диалог добавления цветка */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новый цветок</DialogTitle>
                <DialogDescription>
                  Добавьте новый цветок для составления букетов
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Название <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newFlower.name?.cs || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Введите название на чешском языке"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Тип <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newFlower.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {flowerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemType" className="text-right">
                    Вид элемента <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newFlower.itemType}
                    onValueChange={(value) => setNewFlower({ ...newFlower, itemType: value as ItemType })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выберите вид элемента" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ItemType.FLOWER}>Цветок</SelectItem>
                      <SelectItem value={ItemType.WRAPPING}>Упаковка</SelectItem>
                      <SelectItem value={ItemType.ADDITION}>Дополнение</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    Цвет <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="color"
                    name="color"
                    value={newFlower.color}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Цена (Kč) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={newFlower.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                    min="0"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inStock" className="text-right">
                    В наличии
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Switch
                      id="inStock"
                      checked={newFlower.inStock}
                      onCheckedChange={handleInStockChange}
                    />
                  </div>
                </div>
                {newFlower.inStock && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stockQuantity" className="text-right">
                      Количество
                    </Label>
                    <Input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      value={newFlower.stockQuantity}
                      onChange={handleInputChange}
                      className="col-span-3"
                      min="0"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Описание
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={newFlower.description || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Изображение
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="col-span-3"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Выбрано: {selectedFile.name}
                      </p>
                    )}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddFlower} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Добавить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Таблица цветов */}
          {loading && flowers.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Загрузка цветов...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Цвет</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Наличие</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlowers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? (
                        <p>Цветы не найдены. Попробуйте изменить поисковый запрос.</p>
                      ) : (
                        <p>Нет доступных цветов для составления букетов.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlowers.map((flower) => (
                    <TableRow key={flower.id}>
                      <TableCell className="font-medium">{flower.name.cs || ''}</TableCell>
                      <TableCell>
                        {flowerTypes.find(t => t.value === flower.type)?.label || flower.type}
                      </TableCell>
                      <TableCell>{flower.color}</TableCell>
                      <TableCell>{formatPrice(flower.price)}</TableCell>
                      <TableCell>
                        {flower.inStock ? (
                          <span className="flex items-center text-green-600">
                            <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                            В наличии
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
                            Нет в наличии
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{flower.stockQuantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog open={isEditDialogOpen && currentFlower?.id === flower.id} onOpenChange={setIsEditDialogOpen}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditFlower(flower)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateFlowerForCustomBouquet(flower.id)}
                              className="text-primary hover:text-primary"
                              title="Обновить для использования в букетах"
                            >
                              <Flower className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFlower(flower.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Редактировать цветок</DialogTitle>
                                <DialogDescription>
                                  Внесите изменения в данные о цветке
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-name" className="text-right">
                                    Название <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    name="name"
                                    value={newFlower.name?.cs || ''}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    placeholder="Введите название на чешском языке"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-type" className="text-right">
                                    Тип <span className="text-destructive">*</span>
                                  </Label>
                                  <Select
                                    value={newFlower.type}
                                    onValueChange={handleTypeChange}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {flowerTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-itemType" className="text-right">
                                    Вид элемента <span className="text-destructive">*</span>
                                  </Label>
                                  <Select
                                    value={newFlower.itemType}
                                    onValueChange={(value) => setNewFlower({ ...newFlower, itemType: value as ItemType })}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Выберите вид элемента" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={ItemType.FLOWER}>Цветок</SelectItem>
                                      <SelectItem value={ItemType.WRAPPING}>Упаковка</SelectItem>
                                      <SelectItem value={ItemType.ADDITION}>Дополнение</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-color" className="text-right">
                                    Цвет <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    id="edit-color"
                                    name="color"
                                    value={newFlower.color}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-price" className="text-right">
                                    Цена (Kč) <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    id="edit-price"
                                    name="price"
                                    type="number"
                                    value={newFlower.price}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    min="0"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-inStock" className="text-right">
                                    В наличии
                                  </Label>
                                  <div className="col-span-3 flex items-center">
                                    <Switch
                                      id="edit-inStock"
                                      checked={newFlower.inStock}
                                      onCheckedChange={handleInStockChange}
                                    />
                                  </div>
                                </div>
                                {newFlower.inStock && (
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-stockQuantity" className="text-right">
                                      Количество
                                    </Label>
                                    <Input
                                      id="edit-stockQuantity"
                                      name="stockQuantity"
                                      type="number"
                                      value={newFlower.stockQuantity}
                                      onChange={handleInputChange}
                                      className="col-span-3"
                                      min="0"
                                    />
                                  </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-description" className="text-right">
                                    Описание
                                  </Label>
                                  <Input
                                    id="edit-description"
                                    name="description"
                                    value={newFlower.description || ""}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="itemType">Вид элемента</Label>
                                    <Select
                                      value={newFlower.itemType}
                                      onValueChange={(value) => setNewFlower({ ...newFlower, itemType: value as ItemType })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Выберите вид элемента" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={ItemType.FLOWER}>Цветок</SelectItem>
                                        <SelectItem value={ItemType.WRAPPING}>Упаковка</SelectItem>
                                        <SelectItem value={ItemType.ADDITION}>Дополнение</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="type">Тип</Label>
                                    <Input
                                      id="type"
                                      name="type"
                                      value={newFlower.type}
                                      onChange={handleInputChange}
                                      placeholder="Например: роза, тюльпан и т.д."
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="image">Изображение</Label>
                                    <Input
                                      id="image"
                                      name="image"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleFileChange}
                                    />
                                    {selectedFile && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Выбрано новое: {selectedFile.name}
                                      </p>
                                    )}
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                      <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-primary h-full"
                                          style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" onClick={handleSaveFlower} disabled={loading}>
                                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Сохранить
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFlower(flower.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Удалить</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default BouquetFlowers;
