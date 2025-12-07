import { FC, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Plus, Edit, Trash2, Flower, Loader2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Flower as FlowerType,
  getAllFlowers,
  addFlower,
  updateFlower,
  deleteFlower
} from "@/firebase/services/flowerService";
import { ItemType } from "@/firebase/services/bouquetFlowerService";
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Типы цветов для выбора
const flowerTypes = [
  { value: "rose", label: "Роза" },
  { value: "tulip", label: "Тюльпан" },
  { value: "lily", label: "Лилия" },
  { value: "orchid", label: "Орхидея" },
  { value: "other", label: "Другое" }
];

const Flowers: FC = () => {
  const [flowers, setFlowers] = useState<FlowerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFlower, setCurrentFlower] = useState<FlowerType | null>(null);
  const [newFlower, setNewFlower] = useState<Partial<FlowerType>>({
    name: {
      cs: "", // Чешский (основной)
      uk: "", // Украинский
      en: "", // Английский
      ru: ""  // Русский
    },
    latinName: "",
    type: "other",
    color: "",
    price: 0,
    inStock: true,
    stockQuantity: 0,
    description: "",
    itemType: ItemType.FLOWER, // Добавляем поле для вида элемента (по умолчанию - цветок)
    forCustomBouquet: true // Добавляем флаг, что элемент для букета
  });

  // Состояние для пользовательского типа цветка
  const [customType, setCustomType] = useState<string>("");
  const [isCustomType, setIsCustomType] = useState<boolean>(false);

  // Состояния для работы с файлами
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Загрузка цветов из Firestore
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        setLoading(true);
        const flowersData = await getAllFlowers();
        setFlowers(flowersData);
      } catch (error) {
        console.error("Error fetching flowers:", error);
        toast.error("Ошибка при загрузке цветов");
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, []);

  // Фильтрация цветов по поиску
  const filteredFlowers = flowers.filter(flower => {
    const searchLower = searchTerm.toLowerCase();

    // Поиск по всем языковым версиям имени
    const nameMatches =
      (flower.name.cs && flower.name.cs.toLowerCase().includes(searchLower)) ||
      (flower.name.uk && flower.name.uk.toLowerCase().includes(searchLower)) ||
      (flower.name.en && flower.name.en.toLowerCase().includes(searchLower)) ||
      (flower.name.ru && flower.name.ru.toLowerCase().includes(searchLower));

    return (
      nameMatches ||
      (flower.latinName && flower.latinName.toLowerCase().includes(searchLower)) ||
      flower.color.toLowerCase().includes(searchLower) ||
      (flower.description && flower.description.toLowerCase().includes(searchLower))
    );
  });

  // Обработчики для формы добавления/редактирования
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Обработка многоязычных полей
    if (name.includes('.')) {
      const [fieldName, langCode] = name.split('.');
      if (fieldName === 'name') {
        setNewFlower(prev => ({
          ...prev,
          name: {
            ...(prev.name || { cs: '', uk: '', en: '', ru: '' }),
            [langCode]: value
          }
        }));
      }
    }
    // Преобразование числовых значений
    else if (name === "price" || name === "stockQuantity") {
      setNewFlower(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setNewFlower(prev => ({ ...prev, [name]: value }));
    }
  };

  // Обработчик для пользовательского типа цветка
  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomType(e.target.value);
    if (isCustomType) {
      setNewFlower(prev => ({ ...prev, type: e.target.value }));
    }
  };

  // Переключение между выбором из списка и пользовательским типом
  const toggleCustomType = () => {
    setIsCustomType(!isCustomType);
    if (!isCustomType) {
      // Переключаемся на пользовательский тип
      setNewFlower(prev => ({ ...prev, type: customType || '' }));
    } else {
      // Возвращаемся к выбору из списка
      setNewFlower(prev => ({ ...prev, type: 'other' }));
    }
  };

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
      const imageRef = ref(storage, `flowers/${flowerId}/${timestamp}_${file.name}`);

      // Загружаем файл
      setUploadProgress(10); // Начало загрузки
      const uploadResult = await uploadBytes(imageRef, file);
      console.log('Upload completed:', uploadResult);
      setUploadProgress(70); // Загрузка завершена

      // Получаем URL загруженного изображения
      const downloadURL = await getDownloadURL(imageRef);
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

  // Функция для открытия диалога добавления цветка
  const openAddDialog = () => {
    // Сбрасываем форму
    setNewFlower({
      name: {
        cs: "", // Чешский (основной)
        uk: "", // Украинский
        en: "", // Английский
        ru: ""  // Русский
      },
      latinName: "",
      type: "other",
      color: "",
      price: 0,
      inStock: true,
      stockQuantity: 0,
      description: ""
    });

    // Сбрасываем пользовательский тип
    setCustomType("");
    setIsCustomType(false);

    // Сбрасываем выбранный файл
    setSelectedFile(null);
    setUploadProgress(0);

    // Открываем диалог
    setIsAddDialogOpen(true);
  };

  const handleTypeChange = (value: string) => {
    setNewFlower(prev => ({ ...prev, type: value as FlowerType["type"] }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewFlower(prev => ({
      ...prev,
      inStock: checked,
      // Если товар не в наличии, устанавливаем количество в 0
      stockQuantity: checked ? prev.stockQuantity : 0
    }));
  };

  // Добавление нового цветка
  const handleAddFlower = async () => {
    try {
      console.log('Adding new flower with data:', newFlower);
      console.log('Selected file:', selectedFile);

      // Проверка обязательных полей
      if (!newFlower.name?.cs || !newFlower.type || !newFlower.color || newFlower.price === undefined || newFlower.price <= 0) {
        toast.error("Заполните все обязательные поля");
        return;
      }

      if (!selectedFile) {
        toast.error("Выберите изображение для цветка");
        return;
      }

      setLoading(true);
      toast.info('Добавление нового цветка...');

      try {
        // Проверяем наличие всех языковых версий имени
        const flowerName = {
          cs: newFlower.name?.cs || "",
          uk: newFlower.name?.uk || "",
          en: newFlower.name?.en || "",
          ru: newFlower.name?.ru || ""
        };

        // Если нет перевода на какой-то язык, используем чешскую версию
        if (!flowerName.uk) flowerName.uk = flowerName.cs;
        if (!flowerName.en) flowerName.en = flowerName.cs;
        if (!flowerName.ru) flowerName.ru = flowerName.cs;

        // Добавляем цветок в Firestore
        const flowerData = {
          ...newFlower,
          name: flowerName,
          // Если используется пользовательский тип, убедимся, что он задан
          type: isCustomType ? customType : newFlower.type
        } as Omit<FlowerType, 'id'>;

        console.log('Flower data to be added:', flowerData);
        const flowerId = await addFlower(flowerData);
        console.log('Flower added to database with ID:', flowerId);

        // Загружаем изображение и получаем URL
        const imageUrl = await uploadImage(selectedFile, flowerId);
        console.log('Image uploaded successfully, URL:', imageUrl);

        // Обновляем запись цветка с URL изображения
        await updateFlower(flowerId, { imageUrl });
        console.log('Flower record updated with image URL');

        // Обновляем список цветов
        const updatedFlowers = await getAllFlowers();
        setFlowers(updatedFlowers);
        console.log('Flowers list updated, new count:', updatedFlowers.length);

        // Сбрасываем форму
        setNewFlower({
          name: {
            cs: "", // Чешский (основной)
            uk: "", // Украинский
            en: "", // Английский
            ru: ""  // Русский
          },
          latinName: "",
          type: "other",
          color: "",
          price: 0,
          inStock: true,
          stockQuantity: 0,
          description: ""
        });

        // Сбрасываем пользовательский тип
        setCustomType("");
        setIsCustomType(false);

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
  const handleEditFlower = (flower: FlowerType) => {
    setCurrentFlower(flower);
    setNewFlower({ ...flower });
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
      const flowerData = {
        ...newFlower,
        price: Number(newFlower.price),
        stockQuantity: Number(newFlower.stockQuantity || 0),
        updatedAt: new Date()
      };

      await updateFlower(currentFlower.id, flowerData);

      // Обновляем цветок в локальном state
      setFlowers(prev =>
        prev.map(f => f.id === currentFlower.id ? { ...f, ...flowerData } : f)
      );

      setIsEditDialogOpen(false);
      toast.success("Цветок успешно обновлен");
    } catch (error) {
      console.error("Error updating flower:", error);
      toast.error("Ошибка при обновлении цветка");
    } finally {
      setLoading(false);
    }
  };

  // Удаление цветка
  const handleDeleteFlower = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот цветок?")) {
      try {
        setLoading(true);
        await deleteFlower(id);

        // Удаляем цветок из локального state
        setFlowers(prev => prev.filter(f => f.id !== id));

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
    return `${price} Kč`;
  };

  return (
    <AdminLayout>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Управление цветами</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск цветов..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Фильтр
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить цветок
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить новый цветок</DialogTitle>
                  <DialogDescription>
                    Заполните информацию о новом цветке для добавления в каталог.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Название на разных языках */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name.cs" className="text-right">
                      Название (Чешский)*
                    </Label>
                    <Input
                      id="name.cs"
                      name="name.cs"
                      value={newFlower.name?.cs || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name.uk" className="text-right">
                      Название (Украинский)
                    </Label>
                    <Input
                      id="name.uk"
                      name="name.uk"
                      value={newFlower.name?.uk || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name.en" className="text-right">
                      Название (Английский)
                    </Label>
                    <Input
                      id="name.en"
                      name="name.en"
                      value={newFlower.name?.en || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name.ru" className="text-right">
                      Название (Русский)
                    </Label>
                    <Input
                      id="name.ru"
                      name="name.ru"
                      value={newFlower.name?.ru || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="latinName" className="text-right">
                      Латинское название
                    </Label>
                    <Input
                      id="latinName"
                      name="latinName"
                      value={newFlower.latinName || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Тип*
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="custom-type-checkbox"
                            checked={isCustomType}
                            onCheckedChange={() => toggleCustomType()}
                          />
                          <Label htmlFor="custom-type-checkbox" className="cursor-pointer">
                            Свой тип
                          </Label>
                        </div>
                      </div>

                      {isCustomType ? (
                        <Input
                          id="customType"
                          name="customType"
                          value={customType}
                          onChange={handleCustomTypeChange}
                          placeholder="Введите тип цветка"
                          required
                        />
                      ) : (
                        <Select
                          value={newFlower.type}
                          onValueChange={handleTypeChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип цветка" />
                          </SelectTrigger>
                          <SelectContent>
                            {flowerTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="itemType" className="text-right">
                      Вид элемента*
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
                      Цвет*
                    </Label>
                    <Input
                      id="color"
                      name="color"
                      value={newFlower.color || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Цена (Kč)*
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={newFlower.price}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                      min="0"
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
                        onCheckedChange={handleSwitchChange}
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
          </div>
        </CardHeader>
        <CardContent>
          {loading && flowers.length === 0 ? (
            <div className="flex justify-center items-center h-64">
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
                  <TableHead>В наличии</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlowers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? "Цветы не найдены" : "Нет доступных цветов"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlowers.map((flower) => (
                    <TableRow key={flower.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {flower.imageUrl ? (
                            <img
                              src={flower.imageUrl}
                              alt={flower.name.cs || ""}
                              className="w-10 h-10 rounded-full object-cover mr-2"
                            />
                          ) : (
                            <Flower className="w-10 h-10 p-2 rounded-full bg-primary/10 text-primary mr-2" />
                          )}
                          <div>
                            <div>{flower.name.cs || ""}</div>
                            {flower.latinName && (
                              <div className="text-xs text-muted-foreground">
                                {flower.latinName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {flowerTypes.find(t => t.value === flower.type)?.label || flower.type}
                      </TableCell>
                      <TableCell>{flower.color}</TableCell>
                      <TableCell>{formatPrice(flower.price)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${flower.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {flower.inStock ? "Да" : "Нет"}
                        </span>
                      </TableCell>
                      <TableCell>{flower.stockQuantity}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isEditDialogOpen && currentFlower?.id === flower.id} onOpenChange={(open) => !open && setCurrentFlower(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditFlower(flower)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Редактировать</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Редактировать цветок</DialogTitle>
                              <DialogDescription>
                                Измените информацию о цветке.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {/* Название на разных языках */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name.cs" className="text-right">
                                  Название (Чешский)*
                                </Label>
                                <Input
                                  id="edit-name.cs"
                                  name="name.cs"
                                  value={newFlower.name?.cs || ""}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name.uk" className="text-right">
                                  Название (Украинский)
                                </Label>
                                <Input
                                  id="edit-name.uk"
                                  name="name.uk"
                                  value={newFlower.name?.uk || ""}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name.en" className="text-right">
                                  Название (Английский)
                                </Label>
                                <Input
                                  id="edit-name.en"
                                  name="name.en"
                                  value={newFlower.name?.en || ""}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name.ru" className="text-right">
                                  Название (Русский)
                                </Label>
                                <Input
                                  id="edit-name.ru"
                                  name="name.ru"
                                  value={newFlower.name?.ru || ""}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-latinName" className="text-right">
                                  Латинское название
                                </Label>
                                <Input
                                  id="edit-latinName"
                                  name="latinName"
                                  value={newFlower.latinName || ""}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-type" className="text-right">
                                  Тип*
                                </Label>
                                <Select
                                  value={newFlower.type}
                                  onValueChange={handleTypeChange}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Выберите тип цветка" />
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
                                  Вид элемента*
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
                                  Цвет*
                                </Label>
                                <Input
                                  id="edit-color"
                                  name="color"
                                  value={newFlower.color || ""}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-price" className="text-right">
                                  Цена (Kč)*
                                </Label>
                                <Input
                                  id="edit-price"
                                  name="price"
                                  type="number"
                                  value={newFlower.price}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                  required
                                  min="0"
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
                                    onCheckedChange={handleSwitchChange}
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
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-imageUrl" className="text-right">
                                  URL изображения
                                </Label>
                                <Input
                                  id="edit-imageUrl"
                                  name="imageUrl"
                                  value={newFlower.imageUrl || ""}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                />
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

export default Flowers;
