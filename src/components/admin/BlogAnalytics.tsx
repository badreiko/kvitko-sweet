import { FC, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart, Eye, MessageSquare, ThumbsUp, Calendar, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getBlogStats, getPopularPosts, getViewsStats } from "@/firebase/services/blogAnalyticsService";

// Импортируем интерфейсы из сервиса аналитики
import { PostStats, DailyStats } from "@/firebase/services/blogAnalyticsService";

// Типы для статистики
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  percentage?: number;
}

// Компонент карточки с статистикой (аналогично Dashboard)
const StatsCard = ({ title, value, description, icon: Icon, trend, percentage }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs mt-1 text-muted-foreground flex items-center">
        {trend && (
          <>
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            ) : null}
            <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""}>
              {percentage}%
            </span>
            <span className="text-muted-foreground ml-1">{description}</span>
          </>
        )}
        {!trend && description}
      </p>
    </CardContent>
  </Card>
);

// Интерфейс для состояния статистики блога
interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgViewsPerPost: number;
  popularPosts: PostStats[];
  viewsData: DailyStats[];
  commentsData: DailyStats[];
}

const BlogAnalytics: FC = () => {
  // Удаляем неиспользуемое состояние
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [stats, setStats] = useState<BlogStats>({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    avgViewsPerPost: 0,
    popularPosts: [] as PostStats[],
    viewsData: [] as DailyStats[],
    commentsData: [] as DailyStats[]
  });

  // Загрузка данных аналитики
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      try {
        // Получаем общую статистику блога
        const blogStats = await getBlogStats();

        // Получаем популярные посты
        const popularPosts = await getPopularPosts(5);

        // Получаем статистику просмотров за выбранный период
        const days = period === "7days" ? 7 : period === "30days" ? 30 : period === "90days" ? 90 : 365;
        const viewsStats = await getViewsStats(days);

        setStats({
          ...blogStats,
          popularPosts,
          viewsData: viewsStats,
          commentsData: viewsStats
        });
      } catch (error) {
        console.error("Error loading analytics data:", error);
        toast.error("Ошибка при загрузке данных аналитики");
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [period]);

  // Расчет средних просмотров и комментариев в день
  const avgDailyViews = Math.round(stats.totalViews / (stats.viewsData?.length || 1));
  const avgDailyComments = Math.round(stats.totalComments / (stats.viewsData?.length || 1));

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM", { locale: ru });
  };

  // Создание SVG для графика просмотров
  const createViewsChart = () => {
    if (!stats.viewsData || stats.viewsData.length === 0) return null;

    const viewsData = stats.viewsData;
    const maxViews = Math.max(...viewsData.map((d: any) => d.views || 0));
    const width = 600;
    const height = 200;
    const padding = 40;

    // Создаем точки для линии
    const points = viewsData.map((d: any, i: number) => {
      const x = padding + (i * (width - 2 * padding) / (viewsData.length - 1));
      const y = height - padding - ((d.views / maxViews) * (height - 2 * padding));
      return `${x},${y}`;
    }).join(" ");

    // Создаем метки оси X (даты)
    const xLabels = viewsData.filter((_: any, i: number) => i % 5 === 0).map((d: any, i: number) => {
      const x = padding + (i * 5 * (width - 2 * padding) / (viewsData.length - 1));
      return (
        <text
          key={`x-${i}`}
          x={x}
          y={height - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {formatDate(d.date)}
        </text>
      );
    });

    // Создаем метки оси Y (просмотры)
    const yLabels = [0, maxViews / 2, maxViews].map((value, i) => {
      const y = height - padding - (i * (height - 2 * padding) / 2);
      return (
        <text
          key={`y-${i}`}
          x={30}
          y={y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {Math.round(value)}
        </text>
      );
    });

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Ось X */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* Ось Y */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* Горизонтальные линии сетки */}
        <line x1={padding} y1={padding + (height - 2 * padding) / 2} x2={width - padding} y2={padding + (height - 2 * padding) / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />

        {/* Линия графика */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Точки на графике */}
        {viewsData.map((d: any, i: number) => {
          const x = padding + (i * (width - 2 * padding) / (viewsData.length - 1));
          const y = height - padding - ((d.views / maxViews) * (height - 2 * padding));
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
            />
          );
        })}

        {/* Метки осей */}
        {xLabels}
        {yLabels}
      </svg>
    );
  };

  // Создание SVG для графика комментариев
  const createCommentsChart = () => {
    if (!stats.commentsData || stats.commentsData.length === 0) return null;

    const commentsData = stats.commentsData;
    const maxComments = Math.max(...commentsData.map((d: any) => d.comments || 0));
    const width = 600;
    const height = 200;
    const padding = 40;
    const barWidth = ((width - 2 * padding) / commentsData.length) - 2;

    // Создаем столбцы
    const bars = commentsData.map((d: any, i: number) => {
      const x = padding + (i * ((width - 2 * padding) / commentsData.length));
      const barHeight = (d.comments / maxComments) * (height - 2 * padding);
      const y = height - padding - barHeight;
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill="#10b981"
          rx="2"
          ry="2"
        />
      );
    });

    // Создаем метки оси X (даты)
    const xLabels = commentsData.filter((_: any, i: number) => i % 5 === 0).map((d: any, i: number) => {
      const x = padding + (i * 5 * (width - 2 * padding) / commentsData.length) + barWidth / 2;
      return (
        <text
          key={`x-${i}`}
          x={x}
          y={height - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {formatDate(d.date)}
        </text>
      );
    });

    // Создаем метки оси Y (комментарии)
    const yLabels = [0, maxComments / 2, maxComments].map((value, i) => {
      const y = height - padding - (i * (height - 2 * padding) / 2);
      return (
        <text
          key={`y-${i}`}
          x={30}
          y={y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {Math.round(value)}
        </text>
      );
    });

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Ось X */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* Ось Y */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* Горизонтальные линии сетки */}
        <line x1={padding} y1={padding + (height - 2 * padding) / 2} x2={width - padding} y2={padding + (height - 2 * padding) / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />

        {/* Столбцы */}
        {bars}

        {/* Метки осей */}
        {xLabels}
        {yLabels}
      </svg>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитика блога</h1>
          <p className="text-muted-foreground mt-2">
            Статистика и аналитика по блогу и активности пользователей
          </p>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Tabs defaultValue="30days" value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="7days">7 дней</TabsTrigger>
              <TabsTrigger value="30days">30 дней</TabsTrigger>
              <TabsTrigger value="90days">90 дней</TabsTrigger>
              <TabsTrigger value="year">Год</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Карточки с основными метриками */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Всего просмотров"
            value={loading ? "..." : stats.totalViews.toLocaleString()}
            description="по сравнению с прошлым периодом"
            icon={Eye}
            trend="up"
            percentage={12}
          />

          <StatsCard
            title="Просмотров в день"
            value={loading ? "..." : avgDailyViews.toLocaleString()}
            description="В среднем за выбранный период"
            icon={Calendar}
          />

          <StatsCard
            title="Всего комментариев"
            value={loading ? "..." : stats.totalComments.toLocaleString()}
            description="по сравнению с прошлым периодом"
            icon={MessageSquare}
            trend="up"
            percentage={8}
          />

          <StatsCard
            title="Комментариев в день"
            value={loading ? "..." : avgDailyComments.toLocaleString()}
            description="В среднем за выбранный период"
            icon={Calendar}
          />
        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Просмотры</CardTitle>
                  <CardDescription>Количество просмотров по дням</CardDescription>
                </div>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                createViewsChart()
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Комментарии</CardTitle>
                  <CardDescription>Количество комментариев по дням</CardDescription>
                </div>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                createCommentsChart()
              )}
            </CardContent>
          </Card>
        </div>

        {/* Популярные посты */}
        <Card>
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle>Популярные посты</CardTitle>
              <CardDescription>Посты с наибольшим количеством просмотров</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/blog/posts">Все посты</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {stats.popularPosts.map((post: any, index: number) => (
                  <div key={post.id} className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{post.title}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            {post.views}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            {post.comments}
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            {post.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/admin/blog/posts?id=${post.id}`}>Просмотр</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Категории */}
        <Card>
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle>Статистика по дням</CardTitle>
              <CardDescription>Распределение просмотров и комментариев</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/blog/tags">Управление тегами</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    {stats.viewsData && stats.viewsData.slice(0, 5).map((category: any) => (
                      <div key={category.date} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{category.date}</h3>
                          <p className="text-sm text-muted-foreground">{category.comments || 0} комментариев</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{(category.views || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">просмотров</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-[200px] h-[200px]">
                    <PieChart className="w-full h-full text-muted-foreground" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Всего просмотров</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto py-4 flex flex-col">
              <Link to="/admin/blog/posts">
                <FileText className="h-8 w-8 mb-2" />
                <span>Все посты</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-auto py-4 flex flex-col">
              <Link to="/admin/blog/posts?new=true">
                <FileText className="h-8 w-8 mb-2" />
                <span>Создать новый пост</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
              <Link to="/admin/blog/comments">
                <MessageSquare className="h-8 w-8 mb-2" />
                <span>Управление комментариями</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default BlogAnalytics;
