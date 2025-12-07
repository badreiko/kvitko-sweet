import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import {
  getProductById,
  getAllCategories,
  addProduct,
  updateProduct,
  Product
} from "@/firebase/services";

// Определение интерфейса Product для решения проблемы с импортом
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   imageUrl: string;
//   category: string;
//   inStock: boolean;
//   featured?: boolean;
//   tags?: string[];
//   createdAt: Date;
// }

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  
  // Форма продукта
  const [productData, setProductData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    inStock: true,
    featured: false,
    tags: [],
    imageUrl: ""
  });

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Загрузка категорий
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        // Если редактирование, загружаем данные продукта
        if (isEditing && id) {
          const product = await getProductById(id);
          
          if (product) {
            setProductData({
              name: product.name,
              description: product.description,
              price: product.price,
              category: product.category,
              inStock: product.inStock,
              featured: product.featured || false,
              tags: product.tags || [],
              imageUrl: product.imageUrl
            });
            
            setTags(product.tags || []);
            setImagePreview(product.imageUrl);
          } else {
            toast.error("Produkt nebyl nalezen");
            navigate("/admin/products");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Chyba při načítání dat");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditing, navigate]);

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData((prev: Partial<Product>) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  // Обработка переключателей
  const handleSwitchChange = (name: string, checked: boolean) => {
    setProductData((prev: Partial<Product>) => ({
      ...prev,
      [name]: checked
    }));
  };

  // Обработка выбора изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Создаем предпросмотр
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление изображения
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setProductData((prev: Partial<Product>) => ({
      ...prev,
      imageUrl: ""
    }));
  };

  // Добавление тега
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      
      if (!tags.includes(newTag.trim())) {
        const updatedTags = [...tags, newTag.trim()];
        setTags(updatedTags);
        setProductData((prev: Partial<Product>) => ({
          ...prev,
          tags: updatedTags
        }));
      }
      
      setNewTag("");
    }
  };

  // Удаление тега
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setProductData((prev: Partial<Product>) => ({
      ...prev,
      tags: updatedTags
    }));
  };

  // Сохранение продукта
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productData.name || !productData.category) {
      toast.error("Vyplňte všechna povinná pole");
      return;
    }
    
    setSaving(true);
    try {
      // Подготавливаем данные для сохранения, убеждаемся что featured имеет значение по умолчанию
      const dataToSave = {
        ...productData,
        featured: productData.featured || false,
        tags: tags
      };

      if (isEditing && id) {
        await updateProduct(id, dataToSave, imageFile || undefined);
        toast.success("Produkt byl úspěšně aktualizován");
      } else {
        await addProduct(dataToSave as Omit<Product, 'id'>, imageFile || undefined);
        toast.success("Produkt byl úspěšně přidán");
      }
      
      // Перенаправляем на страницу списка товаров
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Chyba při ukládání produktu");
    } finally {
      setSaving(false);
    }
  };

  // Получение названия категории
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link to="/admin/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Úprava produktu" : "Přidání produktu"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/products">
                Zrušit
              </Link>
            </Button>
            <Button 
              type="submit" 
              form="product-form" 
              disabled={saving}
            >
              {saving ? "Ukládání..." : "Uložit"}
            </Button>
          </div>
        </div>
        
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Основная информация */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Základní informace</CardTitle>
                  <CardDescription>Vyplňte základní údaje o produktu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Název*</Label>
                    <Input
                      id="name"
                      name="name"
                      value={productData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Popis</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={productData.description}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Cena (Kč)*</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="1"
                        value={productData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategorie*</Label>
                      <Select
                        value={productData.category}
                        onValueChange={(value) => setProductData((prev: Partial<Product>) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Vyberte kategorii" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {getCategoryName(category.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tagy</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      id="tags"
                      placeholder="Zadejte tag a stiskněte Enter"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                    <p className="text-xs text-muted-foreground">
                      Zadejte tag a stiskněte Enter pro přidání
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="inStock"
                        checked={productData.inStock}
                        onCheckedChange={(checked) => handleSwitchChange('inStock', checked)}
                      />
                      <Label htmlFor="inStock">Skladem</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={productData.featured}
                        onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                      />
                      <Label htmlFor="featured">Doporučený produkt</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Изображение */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Obrázek produktu</CardTitle>
                  <CardDescription>Nahrajte obrázek produktu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imagePreview ? (
                    <div className="relative aspect-square overflow-hidden rounded-md">
                      <img
                        src={imagePreview}
                        alt="Náhled produktu"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full"
                        onClick={handleRemoveImage}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-md flex flex-col items-center justify-center p-12 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                      <div className="mb-4">
                        <p className="text-sm font-medium">
                          Přetáhněte obrázek sem nebo klikněte pro výběr
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG nebo WEBP, maximálně 5MB
                        </p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('image')?.click()}
                        type="button"
                      >
                        Vybrat obrázek
                      </Button>
                    </div>
                  )}
                  
                  {!imagePreview && !isEditing && (
                    <div className="p-3 bg-amber-50 text-amber-800 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                      <p className="text-sm">
                        Doporučuje se přidat obrázek produktu. Produkty s obrázky přitahují více pozornosti.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Дополнительные опции */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Zobrazení produktu</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    {isEditing ? (
                      <Link to={`/product/${id}`} target="_blank">
                        Otevřít stránku produktu
                      </Link>
                    ) : (
                      <span className="opacity-50 cursor-not-allowed">
                        Nejprve uložte produkt
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}