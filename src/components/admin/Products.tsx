import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Edit,
  Trash,
  Eye,
  FileDown,
  ArrowUpDown,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { getAllProducts, getAllCategories, deleteProduct } from "@/firebase/services";
import { Product } from "../../../app/repo/apps/firestore/models/product";

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Загрузка данных
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Не удалось загрузить товары");
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Фильтрация и сортировка продуктов
  const filteredProducts = products
    .filter(product => {
      // Поиск по имени и описанию
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Фильтрация по категории
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Сортировка
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

  // Обработчик выбора товаров
  const toggleSelect = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Выбрать/отменить выбор всех товаров
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  // Удаление товара
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      toast.success("Товар успешно удален");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Не удалось удалить товар");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Массовое удаление товаров
  const handleBulkDelete = async () => {
    try {
      // В реальном приложении здесь может быть запрос на подтверждение
      await Promise.all(selectedProducts.map(id => deleteProduct(id)));
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      toast.success(`Удалено ${selectedProducts.length} товаров`);
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      toast.error("Не удалось выполнить массовое удаление");
    }
  };

  // Экспорт товаров в CSV
  const exportToCSV = () => {
    try {
      // Заголовки CSV
      const headers = ["ID", "Название", "Категория", "Цена", "В наличии", "Создан"];
      
      // Формирование данных
      const csvData = filteredProducts.map(product => [
        product.id,
        product.name,
        product.category,
        product.price,
        product.inStock ? "Да" : "Нет",
        new Date(product.createdAt).toLocaleDateString("ru-RU")
      ]);
      
      // Объединение заголовков и данных
      const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
      
      // Создание и скачивание файла
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `products_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Экспорт выполнен успешно");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Не удалось экспортировать данные");
    }
  };

  // Перевод категорий на русский
  const getCategoryName = (category: string) => {
    switch (category) {
      case "bouquets":
        return "Букеты";
      case "plants":
        return "Растения";
      case "wedding":
        return "Свадебные";
      case "gifts":
        return "Подарки";
      default:
        return category;
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="mr-2 h-8 w-8" /> Управление товарами
            </h1>
            <p className="text-muted-foreground">
              Всего товаров: {products.length}, показано: {filteredProducts.length}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" /> Добавить товар
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или описанию..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {getCategoryName(category.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">По названию (A-Z)</SelectItem>
                  <SelectItem value="name-desc">По названию (Z-A)</SelectItem>
                  <SelectItem value="price-asc">По цене (низкая-высокая)</SelectItem>
                  <SelectItem value="price-desc">По цене (высокая-низкая)</SelectItem>
                  <SelectItem value="newest">Новые сначала</SelectItem>
                  <SelectItem value="oldest">Старые сначала</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-muted p-4 rounded-md flex items-center justify-between">
            <span>{selectedProducts.length} товаров выбрано</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedProducts([])}>
                Отменить выбор
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Удалить выбранные
              </Button>
            </div>
          </div>
        )}
        
        {/* Products Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-14">Фото</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="w-24">Наличие</TableHead>
                <TableHead className="w-28">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleSelect(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="w-10 h-10 rounded-md overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryName(product.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.price} Kč
                    </TableCell>
                    <TableCell className="text-center">
                      {product.inStock ? (
                        <div className="flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/products/edit/${product.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Редактировать
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/product/${product.id}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" /> Просмотр
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setShowDeleteConfirm(product.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Delete Confirmation Modal - в реальном приложении здесь был бы модальный диалог */}
                      {showDeleteConfirm === product.id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-background p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-2">Подтверждение удаления</h3>
                            <p className="mb-4">
                              Вы уверены, что хотите удалить товар "{product.name}"?
                              Это действие невозможно отменить.
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(null)}
                              >
                                Отмена
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {searchQuery || categoryFilter !== "all" ? (
                      <div>
                        <p className="text-muted-foreground">По вашему запросу не найдено товаров</p>
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter("all");
                          }}
                        >
                          Сбросить фильтры
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Нет доступных товаров</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Export Button */}
        {filteredProducts.length > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={exportToCSV}>
              <FileDown className="mr-2 h-4 w-4" /> Экспорт в CSV
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}