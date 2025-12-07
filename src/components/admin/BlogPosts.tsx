import { useState, useEffect, FC } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Tag, Loader2, Eye, ArrowUpRight, FileText } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BlogPost,
  createPost,
  updatePost,
  deletePost,
  getAllBlogTags
} from "@/firebase/services/blogService";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const BlogPosts: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Check for openNew param
  useEffect(() => {
    if (searchParams.get("openNew") === "true") {
      setIsAddDialogOpen(true);
      // Clean up the URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("openNew");
      setSearchParams(newSearchParams);
    }
  }, [searchParams, setSearchParams]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    author: "",
    tags: [],
    published: false
  });
  const [newTag, setNewTag] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Используем новый хук для real-time получения всех постов (включая неопубликованные)
  const { posts, loading, refreshPosts } = useBlogPosts({
    publishedOnly: false,
    realTime: true
  });

  // Статистика блога
  const [blogStats, setBlogStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalComments: 0,
    popularTags: [] as { tag: string, count: number }[]
  });

  // Загрузка всех тегов
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getAllBlogTags();
        setAllTags(tags);
      } catch (error) {
        console.error("Error fetching blog tags:", error);
        toast.error("Ошибка при загрузке тегов");
      }
    };

    fetchTags();
  }, []);

  // Обновление статистики блога
  useEffect(() => {
    if (!posts) return;

    const publishedPosts = posts.filter(post => post.published).length;
    const draftPosts = posts.length - publishedPosts;

    // Подсчет просмотров
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

    // Подсчет комментариев
    const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);

    // Подсчет популярных тегов
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setBlogStats({
      totalPosts: posts.length,
      publishedPosts,
      draftPosts,
      totalViews,
      totalComments,
      popularTags
    });
  }, [posts]);

  // Фильтрация постов по поиску и тегу
  const filteredPosts = posts?.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.author.toLowerCase().includes(searchLower) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  // Обработчики для формы добавления/редактирования
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewPost(prev => ({ ...prev, published: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newPost.tags?.includes(newTag.trim())) {
      setNewPost((prev: Partial<BlogPost>) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPost((prev: Partial<BlogPost>) => ({
      ...prev,
      tags: prev.tags?.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  // Добавление нового поста
  const handleAddPost = async () => {
    try {
      if (!newPost.title || !newPost.content || !newPost.excerpt) {
        toast.error("Заполните все обязательные поля");
        return;
      }

      // Создаем копию данных поста, исключая поле imageUrl если выбран файл
      const { imageUrl, ...postDataWithoutImage } = newPost;

      const postData = {
        ...postDataWithoutImage,
        // Если файл не выбран, но URL есть, сохраняем его
        ...(selectedImage ? {} : { imageUrl }),
        createdAt: new Date(),
        publishedAt: newPost.published ? new Date() : null
      } as Omit<BlogPost, 'id' | 'publishedAt' | 'createdAt'>;

      // Загружаем файл только если он выбран
      await createPost(postData, selectedImage || undefined);

      toast.success("Пост успешно добавлен");
      setIsAddDialogOpen(false);
      setNewPost({
        title: "",
        content: "",
        excerpt: "",
        imageUrl: "",
        author: "",
        tags: [],
        published: false
      });
      setSelectedImage(null);

      // Обновление списка постов
      refreshPosts();
    } catch (error) {
      console.error("Error adding blog post:", error);
      toast.error("Ошибка при добавлении поста");
    }
  };

  // Редактирование поста
  const handleEditPost = (post: BlogPost) => {
    setCurrentPost(post);
    setNewPost(post);
    setIsEditDialogOpen(true);
  };

  // Сохранение изменений поста
  const handleSavePost = async () => {
    try {
      if (!currentPost || !newPost.title || !newPost.content || !newPost.excerpt) {
        toast.error("Заполните все обязательные поля");
        return;
      }

      // Создаем копию данных поста, исключая поле imageUrl если выбран файл
      const { imageUrl, ...postDataWithoutImage } = newPost;

      await updatePost(
        currentPost.id,
        {
          ...postDataWithoutImage,
          // Если файл не выбран, но URL есть, сохраняем его
          ...(selectedImage ? {} : { imageUrl }),
          publishedAt: newPost.published && !currentPost.published ? new Date() : currentPost.publishedAt
        },
        selectedImage || undefined
      );

      toast.success("Пост успешно обновлен");
      setIsEditDialogOpen(false);
      setCurrentPost(null);
      setNewPost({
        title: "",
        content: "",
        excerpt: "",
        imageUrl: "",
        author: "",
        tags: [],
        published: false
      });
      setSelectedImage(null);

      // Обновление списка постов
      refreshPosts();
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Ошибка при обновлении поста");
    }
  };

  // Удаление поста
  const handleDeletePost = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот пост?")) {
      try {
        await deletePost(id);

        toast.success("Пост успешно удален");

        // Обновление списка постов
        refreshPosts();
      } catch (error) {
        console.error("Error deleting blog post:", error);
        toast.error("Ошибка при удалении поста");
      }
    }
  };

  // Форматирование даты
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return format(date, "dd MMMM yyyy", { locale: ru });
  };

  // Обрезка текста
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <AdminLayout>
      {/* Диалог для добавления нового поста */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Добавить новый пост</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом посте для блога
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-title" className="text-right">
                Заголовок*
              </Label>
              <Input
                id="add-title"
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-excerpt" className="text-right">
                Краткое описание*
              </Label>
              <Textarea
                id="add-excerpt"
                name="excerpt"
                value={newPost.excerpt}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-content" className="text-right">
                Содержание*
              </Label>
              <Textarea
                id="add-content"
                name="content"
                value={newPost.content}
                onChange={handleInputChange}
                className="col-span-3 min-h-[200px]"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-author" className="text-right">
                Автор
              </Label>
              <Input
                id="add-author"
                name="author"
                value={newPost.author}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-image" className="text-right">
                Изображение
              </Label>
              <div className="col-span-3">
                <Input
                  id="add-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-tags" className="text-right">
                Теги
              </Label>
              <div className="col-span-3">
                <div className="flex">
                  <Input
                    id="add-tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Добавить тег"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="ml-2"
                    variant="secondary"
                  >
                    Добавить
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPost.tags?.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/10"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <span className="sr-only">Удалить тег</span>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-published" className="text-right">
                Опубликовать
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="add-published"
                  checked={newPost.published}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddPost} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для редактирования поста */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Редактировать пост</DialogTitle>
            <DialogDescription>
              Внесите изменения в пост и нажмите Сохранить
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Заголовок
              </Label>
              <Input
                id="edit-title"
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-excerpt" className="text-right">
                Краткое описание
              </Label>
              <Textarea
                id="edit-excerpt"
                name="excerpt"
                value={newPost.excerpt}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-content" className="text-right">
                Содержание
              </Label>
              <Textarea
                id="edit-content"
                name="content"
                value={newPost.content}
                onChange={handleInputChange}
                className="col-span-3 min-h-[200px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-author" className="text-right">
                Автор
              </Label>
              <Input
                id="edit-author"
                name="author"
                value={newPost.author}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">
                Изображение
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {newPost.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={newPost.imageUrl}
                      alt="Preview"
                      className="max-h-[100px] rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tags" className="text-right">
                Теги
              </Label>
              <div className="col-span-3">
                <div className="flex">
                  <Input
                    id="edit-tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Добавить тег"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="ml-2"
                    variant="secondary"
                  >
                    Добавить
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPost.tags?.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/10"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <span className="sr-only">Удалить тег</span>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-published" className="text-right">
                Опубликовать
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="edit-published"
                  checked={newPost.published}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSavePost} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="posts" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="posts">Посты</TabsTrigger>
            <TabsTrigger value="statistics">Статистика</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить пост
          </Button>
        </div>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Управление блогом</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск постов..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Автор</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Просмотры</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Посты не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPosts?.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">
                            {truncateText(post.title, 50)}
                          </TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>
                            {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {post.published ? 'Опубликован' : 'Черновик'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                              {post.views || 0}
                            </div>
                          </TableCell>
                          <TableCell className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPost(post)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Редактировать</span>
                            </Button>

                            {/* Кнопка удаления поста */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive ml-1"
                                  aria-label="Удалить пост"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[400px]">
                                <DialogHeader>
                                  <DialogTitle>Удалить пост?</DialogTitle>
                                  <DialogDescription>Вы уверены, что хотите удалить этот пост? Это действие необратимо.</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">
                                    Отмена
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeletePost(post.id)}
                                  >
                                    Удалить
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Кнопка просмотра поста */}
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="ml-1"
                            >
                              <Link to={`/blog/${post.id}`} target="_blank">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">Просмотр</span>
                              </Link>
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
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Всего постов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogStats.totalPosts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {blogStats.publishedPosts} опубликовано, {blogStats.draftPosts} черновиков
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogStats.totalViews}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {blogStats.totalPosts > 0 ? Math.round(blogStats.totalViews / blogStats.totalPosts) : 0} в среднем на пост
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Комментарии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogStats.totalComments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Link to="/admin/blog/comments" className="text-primary flex items-center">
                    Управление комментариями
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Популярные теги</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {blogStats.popularTags.map(({ tag, count }) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <span className="text-xs bg-primary/10 px-1 rounded-sm">{count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Последние посты</CardTitle>
              <CardDescription>Обзор последних 5 опубликованных постов</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Дата публикации</TableHead>
                    <TableHead>Просмотры</TableHead>
                    <TableHead>Комментарии</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts
                    ?.filter(post => post.published)
                    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
                    .slice(0, 5)
                    .map(post => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{truncateText(post.title, 40)}</TableCell>
                        <TableCell>{formatDate(post.publishedAt)}</TableCell>
                        <TableCell>{post.views || 0}</TableCell>
                        <TableCell>{post.commentCount || 0}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/blog/${post.id}`} target="_blank" className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              Просмотр
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                  {posts?.filter(post => post.published).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Нет опубликованных постов
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default BlogPosts;