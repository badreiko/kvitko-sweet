import { FC } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Tag, Settings, BarChart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const Blog: FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление блогом</h1>
          <p className="text-muted-foreground mt-2">
            Управляйте постами, тегами, комментариями и аналитикой блога
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Посты</CardTitle>
              <CardDescription>
                Создавайте, редактируйте и удаляйте посты блога
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/blog/posts">
                  <FileText className="mr-2 h-4 w-4" /> Управление постами
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Теги</CardTitle>
              <CardDescription>
                Управляйте тегами для категоризации постов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/blog/tags">
                  <Tag className="mr-2 h-4 w-4" /> Управление тегами
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Комментарии</CardTitle>
              <CardDescription>
                Модерация и управление комментариями пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/blog/comments">
                  <MessageSquare className="mr-2 h-4 w-4" /> Управление комментариями
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Аналитика</CardTitle>
              <CardDescription>
                Просмотр статистики и аналитики по блогу
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/blog/analytics">
                  <BarChart className="mr-2 h-4 w-4" /> Аналитика блога
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Категории</CardTitle>
              <CardDescription>
                Управляйте категориями для организации постов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/categories">
                  <Tag className="mr-2 h-4 w-4" /> Управление категориями
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Настройки блога</CardTitle>
              <CardDescription>
                Настройте параметры отображения и функциональности блога
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" /> Настройки блога
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Blog;
