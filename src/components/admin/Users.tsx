// src/components/admin/Users.tsx
import { FC, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Users as UsersIcon,
  Mail,
  Shield,
  ShieldAlert,
  Loader2,
  RefreshCw
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
import { toast } from "sonner";
import {
  User,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from "@/firebase/services/userService";

// Форматирование даты
const formatDate = (date: Date | undefined) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
};

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "blocked">("all");

  // Загрузка пользователей
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    // Фильтр по поиску
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!user.displayName.toLowerCase().includes(searchLower) &&
        !user.email.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Фильтр по статусу
    if (filterStatus !== "all" && user.status !== filterStatus) {
      return false;
    }

    return true;
  });

  // Изменение статуса админа
  const handleToggleAdminStatus = async (user: User) => {
    try {
      await updateUserRole(user.id, !user.isAdmin);
      toast.success(
        user.isAdmin
          ? `${user.displayName} больше не администратор`
          : `${user.displayName} теперь администратор`
      );
      loadUsers();
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Не удалось изменить роль пользователя");
    }
  };

  // Изменение статуса блокировки
  const handleToggleBlockStatus = async (user: User) => {
    try {
      const newStatus = user.status === "active" ? "blocked" : "active";
      await updateUserStatus(user.id, newStatus);
      toast.success(
        newStatus === "blocked"
          ? `${user.displayName} заблокирован`
          : `${user.displayName} разблокирован`
      );
      loadUsers();
    } catch (error) {
      console.error("Error toggling block status:", error);
      toast.error("Не удалось изменить статус пользователя");
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${user.displayName}"?`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      toast.success(`Пользователь ${user.displayName} удален`);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Не удалось удалить пользователя");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Пользователи</h2>
            <p className="text-muted-foreground">
              Управление пользователями и их правами доступа ({users.length} всего)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по имени или email..."
                className="pl-8 w-full md:w-[300px]"
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
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  Все пользователи
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                  Только активные
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("blocked")}>
                  Только заблокированные
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={loadUsers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">
              Список пользователей
              {filterStatus !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {filterStatus === "active" ? "Активные" : "Заблокированные"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Пользователи не найдены</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || filterStatus !== "all"
                    ? "Попробуйте изменить параметры поиска или фильтра"
                    : "В системе пока нет зарегистрированных пользователей"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead className="hidden md:table-cell">Дата регистрации</TableHead>
                    <TableHead className="hidden md:table-cell">Последний вход</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <UsersIcon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.displayName}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>
                        {user.status === "active" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Активен</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Заблокирован</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Администратор
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Пользователь
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">Действия</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Управление пользователем</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleAdminStatus(user)}>
                              {user.isAdmin ? "Снять права админа" : "Сделать админом"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleBlockStatus(user)}>
                              {user.status === "active" ? "Заблокировать" : "Разблокировать"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                            >
                              Удалить пользователя
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Users;
