import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  Flower,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  FileText,
  Clock,
  Check,
  Ban,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  getAllProducts, 
  getAllPublishedPosts,
  getAllCategories
} from "@/firebase/services";
import { toast } from "sonner";

// Типы для статистики
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  percentage?: number;
}

// Компонент карточки с статистикой
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

// Имитация данных заказов
const recentOrders = [
  {
    id: "ORD-123456",
    customer: "Анна Новакова",
    date: "2023-05-15",
    status: "delivered",
    total: 1290
  },
  {
    id: "ORD-123455",
    customer: "Петр Свобода",
    date: "2023-05-14",
    status: "processing",
    total: 890
  },
  {
    id: "ORD-123454",
    customer: "Мария Дворакова",
    date: "2023-05-14",
    status: "pending",
    total: 1490
  },
  {
    id: "ORD-123453",
    customer: "Ян Черны",
    date: "2023-05-13",
    status: "cancelled",
    total: 690
  },
  {
    id: "ORD-123452",
    customer: "Ева Крайкова",
    date: "2023-05-13",
    status: "shipped",
    total: 1190
  }
];

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    popularProducts: [],
    blogPosts: 0
  });

  // Загрузка данных
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Загружаем данные из Firebase
        const products = await getAllProducts();
        const categories = await getAllCategories();
        const blogPosts = await getAllPublishedPosts();
        
        // Имитация данных, которые пока не загружаем из Firebase
        const mockedStats = {
          totalUsers: 32,
          totalOrders: 187,
          revenueToday: 4570,
          revenueWeek: 24980,
          revenueMonth: 98450,
          popularProducts: products.slice(0, 3)
        };
        
        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          blogPosts: blogPosts.length,
          ...mockedStats
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Не удалось загрузить данные для панели управления");
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Цвета и иконки для разных статусов заказов
  const orderStatusConfig = {
    delivered: { color: "bg-green-100 text-green-800", icon: Check },
    processing: { color: "bg-blue-100 text-blue-800", icon: Clock },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    shipped: { color: "bg-purple-100 text-purple-800", icon: ShoppingBag },
    cancelled: { color: "bg-red-100 text-red-800", icon: Ban }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Панель управления</h1>
          <p className="text-muted-foreground">
            Добро пожаловать в административную панель Kvitko Sweet
          </p>
        </div>
        
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Доход сегодня"
            value={`${stats.revenueToday} Kč`}
            description="по сравнению со вчера"
            icon={DollarSign}
            trend="up"
            percentage={12}
          />
          <StatsCard
            title="Заказы"
            value={stats.totalOrders}
            description="за последний месяц"
            icon={ShoppingBag}
            trend="up"
            percentage={8}
          />
          <StatsCard
            title="Товары"
            value={stats.totalProducts}
            description="активных товаров"
            icon={Package}
          />
          <StatsCard
            title="Пользователи"
            value={stats.totalUsers}
            description="зарегистрированных пользователей"
            icon={Users}
            trend="up"
            percentage={5}
          />
        </div>
        
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Аналитика доходов</CardTitle>
            <Tabs defaultValue="week">
              <TabsList>
                <TabsTrigger value="day">День</TabsTrigger>
                <TabsTrigger value="week">Неделя</TabsTrigger>
                <TabsTrigger value="month">Месяц</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Здесь будет отображаться график доходов.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Orders and Popular Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Последние заказы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const StatusIcon = orderStatusConfig[order.status as keyof typeof orderStatusConfig]?.icon || Clock;
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderStatusConfig[order.status as keyof typeof orderStatusConfig]?.color || "bg-gray-100"}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{order.total} Kč</p>
                          <p className="text-xs text-muted-foreground">{order.id}</p>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/orders/${order.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/orders">Все заказы</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Popular Products */}
          <Card>
            <CardHeader>
              <CardTitle>Популярные товары</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularProducts && stats.popularProducts.length > 0 ? (
                  stats.popularProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{product.name}</p>
                          <p className="font-semibold">{product.price} Kč</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.category === 'bouquets' ? 'Букеты' : 
                           product.category === 'plants' ? 'Растения' : 
                           product.category === 'wedding' ? 'Свадебные цветы' : 
                           product.category === 'gifts' ? 'Подарки' : product.category}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Нет данных о популярных товарах</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/products">Все товары</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-auto py-4 flex flex-col">
                <Link to="/admin/products/new">
                  <Package className="h-8 w-8 mb-2" />
                  <span>Добавить товар</span>
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-auto py-4 flex flex-col">
                <Link to="/admin/blog/new">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>Создать статью</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                <Link to="/admin/orders">
                  <ShoppingBag className="h-8 w-8 mb-2" />
                  <span>Управление заказами</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}