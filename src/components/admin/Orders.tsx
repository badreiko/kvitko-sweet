// src/components/admin/Orders.tsx
import { FC, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Package,
  Loader2,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Order,
  getAllOrders,
  updateOrderStatus
} from "@/firebase/services/orderService";

// Форматирование даты
const formatDate = (date: Date | undefined) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

// Форматирование цены
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0
  }).format(price);
};

// Получение информации о статусе
const getStatusInfo = (status: Order['status'], deliveryType?: string) => {
  switch (status) {
    case 'pending':
      return { label: 'Ожидает', color: 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: Clock };
    case 'processing':
      return { label: 'Обработка', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Package };
    case 'ready':
      return { label: 'Готов к выдаче', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: Package };
    case 'shipped':
      return { label: 'Отправлен', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: Truck };
    case 'delivered':
      return { label: deliveryType === 'pickup' ? 'Выдан' : 'Доставлен', color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2 };
    case 'cancelled':
      return { label: 'Отменен', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle };
    default:
      return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-200', icon: Package };
  }
};

const Orders: FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Order['status'] | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Загрузка заказов
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    // Фильтр по поиску
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!order.id.toLowerCase().includes(searchLower) &&
        !order.userId?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Фильтр по статусу
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }

    return true;
  });

  // Изменение статуса заказа
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Статус заказа изменен на "${getStatusInfo(newStatus).label}"`);
      loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Не удалось изменить статус заказа");
    }
  };

  // Открытие деталей заказа
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  // Подсчет статистики
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Заголовок и статистика */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Заказы</h2>
            <p className="text-muted-foreground">
              Всего: {stats.total} | Ожидают: {stats.pending} | В обработке: {stats.processing} | Доставлено: {stats.delivered}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по ID заказа..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Фильтр по статусу</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>Все заказы</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Ожидают</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("processing")}>В обработке</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("shipped")}>Отправлены</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("delivered")}>Доставлены</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>Отменены</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Таблица заказов */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Список заказов
              {filterStatus !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {getStatusInfo(filterStatus).label}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Заказы не найдены</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || filterStatus !== "all"
                    ? "Попробуйте изменить параметры поиска или фильтра"
                    : "В системе пока нет заказов"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID заказа</TableHead>
                    <TableHead className="hidden md:table-cell">Дата</TableHead>
                    <TableHead>Товаров</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status, order.delivery?.type);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <span className="font-mono text-sm">{order.orderNumber || order.id.slice(0, 8)}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>{order.items?.length || 0}</TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(order.totalPrice || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">Статус</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Изменить статус</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'pending')}>
                                  <Clock className="h-4 w-4 mr-2" /> Ожидает
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'processing')}>
                                  <Package className="h-4 w-4 mr-2" /> В обработке
                                </DropdownMenuItem>
                                {order.delivery?.type === 'pickup' ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'ready')}>
                                      <Package className="h-4 w-4 mr-2" /> Готов к выдаче
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivered')}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" /> Выдан
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'shipped')}>
                                      <Truck className="h-4 w-4 mr-2" /> Отправлен
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivered')}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" /> Доставлен
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleStatusChange(order.id, 'cancelled')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" /> Отменить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог деталей заказа */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Детали заказа</DialogTitle>
            <DialogDescription>
              ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Статус и дата */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getStatusInfo(selectedOrder.status).color}>
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              {/* Товары */}
              <div>
                <h4 className="font-medium mb-2">Товары</h4>
                {selectedOrder.items?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover" />
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">x{item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Нет товаров</p>
                )}
              </div>

              {/* Доставка */}
              <div>
                <h4 className="font-medium mb-2">Доставка</h4>
                {selectedOrder.delivery?.type === 'pickup' ? (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        Самовывоз
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">
                      {selectedOrder.delivery?.zoneName || 'Магазин не указан'}
                    </p>
                  </div>
                ) : selectedOrder.shippingAddress ? (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Доставка
                      </Badge>
                      {selectedOrder.delivery?.zoneName && (
                        <span className="text-sm text-muted-foreground">
                          ({selectedOrder.delivery.zoneName})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}<br />
                      {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
                    </p>
                    {selectedOrder.delivery?.price !== undefined && (
                      <p className="text-sm font-medium mt-1">
                        Цена доставки: {selectedOrder.delivery.price === 0 ? 'Бесплатно' : formatPrice(selectedOrder.delivery.price)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Адрес не указан</p>
                )}
              </div>

              {/* Способ оплаты */}
              {selectedOrder.payment && (
                <div>
                  <h4 className="font-medium mb-2">Оплата</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{selectedOrder.payment.methodName || 'Не указан'}</p>
                  </div>
                </div>
              )}

              {/* Контакт клиента */}
              {selectedOrder.customerInfo && (
                <div>
                  <h4 className="font-medium mb-2">Контакт</h4>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p><strong>{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</strong></p>
                    <p>{selectedOrder.customerInfo.email}</p>
                    <p>{selectedOrder.customerInfo.phone}</p>
                    {selectedOrder.customerInfo.note && (
                      <p className="mt-2 text-muted-foreground italic">"{selectedOrder.customerInfo.note}"</p>
                    )}
                  </div>
                </div>
              )}

              {/* Итого */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Итого:</span>
                  <span>{formatPrice(selectedOrder.totalPrice || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Orders;
