import { FC, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Check, X, MessageSquare, Eye, Loader2, AlertTriangle, Filter } from "lucide-react";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  getAllBlogComments,
  getCommentsByStatus,
  updateCommentStatus,
  replyToComment,
  CommentStatus,
  BlogComment as BlogCommentType
} from "@/firebase/services/blogCommentService";

// Дополнительный интерфейс для отображения комментария с заголовком поста
interface BlogCommentWithPost extends BlogCommentType {
  postTitle: string;
}

const BlogComments: FC = () => {
  const [comments, setComments] = useState<BlogCommentWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [currentComment, setCurrentComment] = useState<BlogCommentWithPost | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Загрузка комментариев
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);

        // Получаем комментарии в зависимости от фильтра
        let commentsData;
        if (statusFilter === "all") {
          commentsData = await getAllBlogComments();
        } else {
          commentsData = await getCommentsByStatus(statusFilter as CommentStatus);
        }

        // Добавляем заголовки постов (в реальном приложении нужно будет получить их из БД)
        // Временная имитация для демонстрации
        const postTitles: Record<string, string> = {
          "post1": "Как выбрать идеальный букет для свидания",
          "post2": "Уход за комнатными растениями в зимний период",
          "post3": "Тренды флористики 2023 года",
          "post4": "Подготовка к свадебному сезону: выбор цветов",
          "post5": "Язык цветов: что означают разные виды и цвета"
        };

        // Преобразуем данные и добавляем заголовки постов
        const commentsWithPostTitles = commentsData.map(comment => ({
          ...comment,
          postTitle: postTitles[comment.postId] || "Неизвестный пост"
        }));

        setComments(commentsWithPostTitles);

        // Сбор статистики
        const total = commentsData.length;
        const pending = commentsData.filter(c => c.status === CommentStatus.PENDING).length;
        const approved = commentsData.filter(c => c.status === CommentStatus.APPROVED).length;
        const rejected = commentsData.filter(c => c.status === CommentStatus.REJECTED).length;

        setStats({ total, pending, approved, rejected });
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("Ошибка при загрузке комментариев");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [statusFilter]);

  // Фильтрация комментариев
  const filteredComments = comments.filter(comment => {
    // Фильтр по статусу
    if (statusFilter !== "all" && comment.status !== statusFilter) {
      return false;
    }

    // Фильтр по поиску
    const searchLower = searchTerm.toLowerCase();
    return (
      comment.author.toLowerCase().includes(searchLower) ||
      comment.content.toLowerCase().includes(searchLower) ||
      comment.postTitle.toLowerCase().includes(searchLower) ||
      comment.email.toLowerCase().includes(searchLower)
    );
  });

  // Просмотр комментария
  const handleViewComment = (comment: BlogCommentWithPost) => {
    setCurrentComment(comment);
    setIsViewDialogOpen(true);
  };

  // Ответ на комментарий
  const handleReplyToComment = (comment: BlogCommentWithPost) => {
    setCurrentComment(comment);
    setReplyContent(comment.replyContent || "");
    setIsReplyDialogOpen(true);
  };

  // Сохранение ответа
  const handleSaveReply = async () => {
    if (!currentComment) return;

    try {
      // Сохраняем ответ в Firebase
      await replyToComment(currentComment.id, replyContent);

      // Обновляем локальные данные
      setComments(comments.map(comment =>
        comment.id === currentComment.id
          ? { ...comment, replyContent }
          : comment
      ));

      setIsReplyDialogOpen(false);
      toast.success("Ответ сохранен");
    } catch (error) {
      console.error("Error saving reply:", error);
      toast.error("Ошибка при сохранении ответа");
    }
  };

  // Изменение статуса комментария
  const handleStatusChange = async (id: string, status: CommentStatus) => {
    try {
      // Обновляем статус в Firebase
      await updateCommentStatus(id, status);

      // Обновляем локальные данные
      setComments(comments.map(comment =>
        comment.id === id
          ? { ...comment, status }
          : comment
      ));

      // Обновляем статистику
      const newStats = { ...stats };

      // Сначала уменьшаем счетчик старого статуса
      const oldStatus = comments.find(c => c.id === id)?.status;
      if (oldStatus === CommentStatus.PENDING) newStats.pending--;
      else if (oldStatus === CommentStatus.APPROVED) newStats.approved--;
      else if (oldStatus === CommentStatus.REJECTED) newStats.rejected--;

      // Затем увеличиваем счетчик нового статуса
      if (status === CommentStatus.PENDING) newStats.pending++;
      else if (status === CommentStatus.APPROVED) newStats.approved++;
      else if (status === CommentStatus.REJECTED) newStats.rejected++;

      setStats(newStats);

      const statusText =
        status === CommentStatus.APPROVED
          ? "одобрен"
          : status === CommentStatus.REJECTED
            ? "отклонен"
            : "ожидает проверки";

      toast.success(`Комментарий ${statusText}`);
    } catch (error) {
      console.error("Error updating comment status:", error);
      toast.error("Ошибка при изменении статуса комментария");
    }
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return format(date, "d MMMM yyyy", { locale: ru });
  };

  // Получение цвета бейджа в зависимости от статуса
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Получение текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Одобрен";
      case "rejected":
        return "Отклонен";
      case "pending":
        return "На проверке";
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление комментариями</h1>
          <p className="text-muted-foreground mt-2">
            Модерация и управление комментариями пользователей в блоге
          </p>
        </div>

        <Separator />

        {/* Статистика комментариев */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего комментариев</CardTitle>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">На проверке</CardTitle>
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ожидают модерации
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Одобренные</CardTitle>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Опубликованы на сайте
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Отклоненные</CardTitle>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Не прошли модерацию
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Список комментариев</CardTitle>
              <CardDescription>Управляйте комментариями пользователей в блоге</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск комментариев..."
                  className="w-[200px] pl-8 md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <select
                  className="border border-input bg-background pl-8 pr-3 py-2 text-sm rounded-md w-[150px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Все статусы</option>
                  <option value="pending">На проверке</option>
                  <option value="approved">Одобренные</option>
                  <option value="rejected">Отклоненные</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка комментариев...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Автор</TableHead>
                    <TableHead>Пост</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm || statusFilter !== "all"
                          ? "Комментарии не найдены"
                          : "Нет доступных комментариев"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{comment.author}</div>
                            <div className="text-xs text-muted-foreground">{comment.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={comment.postTitle}>
                            {comment.postTitle}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={comment.content}>
                            {comment.content}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(comment.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(comment.status)}>
                            {getStatusText(comment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewComment(comment)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Просмотреть</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReplyToComment(comment)}
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="sr-only">Ответить</span>
                            </Button>
                            {comment.status !== "approved" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(comment.id, CommentStatus.APPROVED)}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="sr-only">Одобрить</span>
                              </Button>
                            )}
                            {comment.status !== "rejected" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(comment.id, CommentStatus.REJECTED)}
                              >
                                <X className="h-4 w-4 text-red-600" />
                                <span className="sr-only">Отклонить</span>
                              </Button>
                            )}
                            {comment.status !== "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(comment.id, CommentStatus.PENDING)}
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="sr-only">На проверку</span>
                              </Button>
                            )}
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

        {/* Диалог просмотра комментария */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Просмотр комментария</DialogTitle>
            </DialogHeader>
            {currentComment && (
              <div className="space-y-4">
                <div>
                  <Label>Пост</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md">{currentComment.postTitle}</div>
                </div>
                <div>
                  <Label>Автор</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md">
                    {currentComment.author} ({currentComment.email})
                  </div>
                </div>
                <div>
                  <Label>Дата</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md">
                    {formatDate(currentComment.createdAt)}
                  </div>
                </div>
                <div>
                  <Label>Статус</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(currentComment.status)}>
                      {getStatusText(currentComment.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Комментарий</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                    {currentComment.content}
                  </div>
                </div>
                {currentComment.replyContent && (
                  <div>
                    <Label>Ответ</Label>
                    <div className="mt-1 p-2 bg-primary/10 rounded-md whitespace-pre-wrap">
                      {currentComment.replyContent}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Диалог ответа на комментарий */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ответ на комментарий</DialogTitle>
              <DialogDescription>
                Напишите ответ на комментарий пользователя.
              </DialogDescription>
            </DialogHeader>
            {currentComment && (
              <div className="space-y-4">
                <div>
                  <Label>Комментарий пользователя</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                    <div className="font-medium">{currentComment.author} пишет:</div>
                    <div className="mt-1">{currentComment.content}</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reply">Ваш ответ</Label>
                  <Textarea
                    id="reply"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={5}
                    className="mt-1"
                    placeholder="Введите ваш ответ на комментарий..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveReply}>Сохранить ответ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default BlogComments;
