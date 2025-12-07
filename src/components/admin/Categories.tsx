import { FC, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import {
  Category,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from "@/firebase/services/categoryService";

const Categories: FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  // Загрузка категорий из Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Ошибка при загрузке категорий");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Фильтрация категорий по поиску
  const filteredCategories = categories.filter(category => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        category.name.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower) ||
        (category.description && category.description.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Обработчики для формы добавления/редактирования
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewCategory(prev => ({ ...prev, isActive: checked }));
  };

  // Генерация slug из названия
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  // Обработчик изменения названия для автогенерации slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewCategory(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // Добавление новой категории
  const handleAddCategory = async () => {
    try {
      if (!newCategory.name || !newCategory.slug) {
        toast.error("Название и slug обязательны");
        return;
      }

      setLoading(true);
      const categoryData = {
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description || "",
        isActive: newCategory.isActive === undefined ? true : newCategory.isActive,
        order: categories.length
      };

      const categoryId = await addCategory(categoryData as Omit<Category, 'id'>);

      // Добавляем новую категорию в локальный state
      setCategories(prev => [...prev, { id: categoryId, ...categoryData } as Category]);

      // Сбрасываем форму
      setNewCategory({
        name: "",
        slug: "",
        description: "",
        isActive: true
      });

      setIsAddDialogOpen(false);
      toast.success("Категория успешно добавлена");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Ошибка при добавлении категории");
    } finally {
      setLoading(false);
    }
  };

  // Редактирование категории
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setNewCategory({
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive
    });
    setIsEditDialogOpen(true);
  };

  // Сохранение изменений категории
  const handleSaveCategory = async () => {
    try {
      if (!currentCategory || !newCategory.name || !newCategory.slug) {
        toast.error("Название и slug обязательны");
        return;
      }

      setLoading(true);
      const categoryData = {
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description || "",
        isActive: newCategory.isActive === undefined ? true : newCategory.isActive
      };

      await updateCategory(currentCategory.id, categoryData);

      // Обновляем категорию в локальном state
      setCategories(prev =>
        prev.map(cat =>
          cat.id === currentCategory.id ? { ...cat, ...categoryData } : cat
        )
      );

      setIsEditDialogOpen(false);
      toast.success("Категория успешно обновлена");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Ошибка при обновлении категории");
    } finally {
      setLoading(false);
    }
  };

  // Удаление категории
  const handleDeleteCategory = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту категорию?")) {
      try {
        setLoading(true);
        await deleteCategory(id);

        // Удаляем категорию из локального state
        setCategories(prev => prev.filter(cat => cat.id !== id));

        toast.success("Категория успешно удалена");
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Ошибка при удалении категории");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Категории товаров</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить категорию
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новую категорию</DialogTitle>
                <DialogDescription>
                  Заполните данные для новой категории товаров
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название категории</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newCategory.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (для URL)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={newCategory.slug}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание (необязательно)</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newCategory.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Активная категория</Label>
                  <Switch
                    id="isActive"
                    checked={newCategory.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddCategory} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    "Добавить"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Все категории</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Поиск категорий..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && categories.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Загрузка категорий...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell>
                          {category.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Активна
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Неактивна
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-center">
                          <Tag className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-lg font-medium">Категории не найдены</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm
                              ? "Попробуйте изменить параметры поиска"
                              : "Нет доступных категорий"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Диалог редактирования категории */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать категорию</DialogTitle>
              <DialogDescription>
                Измените данные категории
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название категории</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={newCategory.name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug (для URL)</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  value={newCategory.slug}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Описание (необязательно)</Label>
                <Input
                  id="edit-description"
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-isActive">Активная категория</Label>
                <Switch
                  id="edit-isActive"
                  checked={newCategory.isActive}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveCategory} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Categories;
