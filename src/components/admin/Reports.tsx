import { FC, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, PieChart, TrendingUp, Users, ShoppingBag, Calendar } from "lucide-react";

// Имитация данных для графиков
const salesData = [
  { month: "Янв", sales: 12500 },
  { month: "Фев", sales: 18200 },
  { month: "Мар", sales: 22800 },
  { month: "Апр", sales: 25400 },
  { month: "Май", sales: 32100 },
  { month: "Июн", sales: 28700 },
];

const categoryData = [
  { name: "Букеты", value: 45 },
  { name: "Растения", value: 25 },
  { name: "Подарки", value: 15 },
  { name: "Свадебные", value: 10 },
  { name: "Прочее", value: 5 },
];

const Reports: FC = () => {
  const [period, setPeriod] = useState("month");

  // Функция для форматирования суммы
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount);
  };

  // Генерация статистики
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const avgOrderValue = 1250;
  const totalOrders = 245;
  const totalCustomers = 180;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Отчёты</h2>
            <p className="text-muted-foreground">Аналитика и статистика по продажам и посещениям</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
                <SelectItem value="year">Год</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Выбрать даты
            </Button>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Сформировать
            </Button>
          </div>
        </div>

        {/* Основные показатели */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Общие продажи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12.5% по сравнению с прошлым периодом
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +5.3% по сравнению с прошлым периодом
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +8.1% по сравнению с прошлым периодом
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +15.2% по сравнению с прошлым периодом
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Продажи
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Категории
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Динамика продаж</CardTitle>
                <CardDescription>Продажи за последние 6 месяцев</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {/* Здесь будет график продаж */}
                  <div className="flex items-end justify-between h-full w-full px-2">
                    {salesData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="text-xs text-muted-foreground mb-1">{formatCurrency(item.sales)}</div>
                        <div
                          className="w-12 bg-primary rounded-t-md"
                          style={{ height: `${(item.sales / 35000) * 100}%` }}
                        ></div>
                        <div className="text-xs font-medium mt-2">{item.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Топ продуктов</CardTitle>
                <CardDescription>Самые популярные товары за выбранный период</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-10">Раздел в разработке. Здесь будет таблица с топовыми продуктами.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Анализ клиентов</CardTitle>
                <CardDescription>Статистика по клиентам и их активности</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-10">Раздел в разработке. Здесь будет аналитика по клиентам.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Распределение по категориям</CardTitle>
                <CardDescription>Продажи по категориям товаров</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-6">
                  <div className="w-64 h-64 rounded-full border-8 border-background relative">
                    {/* Имитация круговой диаграммы */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{totalSales.toLocaleString()} Kč</div>
                        <div className="text-sm text-muted-foreground">Общие продажи</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                        ></div>
                        <span>{category.name}</span>
                      </div>
                      <div className="font-medium">{category.value}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Reports;
