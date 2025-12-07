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
import { toast } from "sonner";
import { getAllBlogTags } from "@/firebase/services/blogService";

// Интерфейс для тега
interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

const BlogTags: FC = () => {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<BlogTag | null>(null);
  const [newTag, setNewTag] = useState<Partial<BlogTag>>({
    name: "",
    slug: ""
  });

  // Загрузка тегов из Firestore
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const tagsData = await getAllBlogTags();

        // Преобразуем массив строк в массив объектов BlogTag
        // В реальном приложении здесь будет запрос к API для получения полной информации о тегах
        const formattedTags: BlogTag[] = tagsData.map((tag, index) => ({
          id: `tag-${index}`,
          name: tag,
          slug: tag.toLowerCase().replace(/\s+/g, '-'),
          postCount: Math.floor(Math.random() * 10) // Имитация количества постов
        }));

        setTags(formattedTags);
      } catch (error) {
        console.error("Error fetching blog tags:", error);
        toast.error("Ошибка при загрузке тегов блога");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Фильтрация тегов по поиску
  const filteredTags = tags.filter(tag => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tag.name.toLowerCase().includes(searchLower) ||
      tag.slug.toLowerCase().includes(searchLower)
    );
  });

  // Обработчики для формы добавления/редактирования
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTag(prev => ({ ...prev, [name]: value }));
  };

  // Генерация slug из названия
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Удаляем специальные символы
      .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
      .replace(/-+/g, '-'); // Удаляем повторяющиеся дефисы
  };

  // Обработчик изменения названия для автогенерации slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewTag(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  // Добавление нового тега
  const handleAddTag = () => {
    if (!newTag.name) {
      toast.error("Введите название тега");
      return;
    }

    const newTagItem: BlogTag = {
      id: `tag-${Date.now()}`,
      name: newTag.name,
      slug: newTag.slug || generateSlug(newTag.name),
      postCount: 0
    };

    setTags([...tags, newTagItem]);
    setNewTag({
      name: "",
      slug: ""
    });
    setIsAddDialogOpen(false);
    toast.success("Тег успешно добавлен");
  };

  // Редактирование тега
  const handleEditTag = (tag: BlogTag) => {
    setCurrentTag(tag);
    setNewTag({ ...tag });
    setIsEditDialogOpen(true);
  };

  // Сохранение изменений тега
  const handleSaveTag = () => {
    if (!currentTag || !newTag.name) {
      toast.error("Введите название тега");
      return;
    }

    setTags(tags.map(tag =>
      tag.id === currentTag.id
        ? {
          ...tag,
          name: newTag.name!,
          slug: newTag.slug || generateSlug(newTag.name!)
        }
        : tag
    ));
    setIsEditDialogOpen(false);
    toast.success("Тег успешно обновлен");
  };

  // Удаление тега
  const handleDeleteTag = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот тег?")) {
      setTags(tags.filter(tag => tag.id !== id));
      toast.success("Тег успешно удален");
    }
  };

  return (
    <AdminLayout>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Управление тегами блога</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск тегов..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить тег
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить новый тег</DialogTitle>
                  <DialogDescription>
                    Создайте новый тег для категоризации постов блога.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Название*
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newTag.name}
                      onChange={handleNameChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="slug" className="text-right">
                      Slug
                    </Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={newTag.slug}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Автоматически генерируется из названия"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddTag}>
                    Добавить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Загрузка тегов...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Количество постов</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {searchTerm ? "Теги не найдены" : "Нет доступных тегов"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-primary" />
                          {tag.name}
                        </div>
                      </TableCell>
                      <TableCell>{tag.slug}</TableCell>
                      <TableCell>{tag.postCount}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isEditDialogOpen && currentTag?.id === tag.id} onOpenChange={(open) => !open && setCurrentTag(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTag(tag)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Редактировать</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Редактировать тег</DialogTitle>
                              <DialogDescription>
                                Измените информацию о теге.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                  Название*
                                </Label>
                                <Input
                                  id="edit-name"
                                  name="name"
                                  value={newTag.name}
                                  onChange={handleNameChange}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-slug" className="text-right">
                                  Slug
                                </Label>
                                <Input
                                  id="edit-slug"
                                  name="slug"
                                  value={newTag.slug}
                                  onChange={handleInputChange}
                                  className="col-span-3"
                                  placeholder="Автоматически генерируется из названия"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleSaveTag}>
                                Сохранить
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTag(tag.id)}
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

export default BlogTags;
