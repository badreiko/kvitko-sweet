import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Filter, X, Grid3X3, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";

// Импортируем функции для работы с Firebase
import {
  getAllProducts,
  Product
} from "@/firebase/services/productService";
import { Category, getAllCategories } from "@/firebase/services/categoryService";

// Определение диапазонов цен - используется в UI

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation(); // Получаем текущий URL
  const navigate = useNavigate(); // Для навигации без перезагрузки страницы
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Определяем категорию из URL-пути или параметров запроса
  const getCategoryFromUrl = () => {
    // Проверяем, есть ли категория в пути URL (например, /catalog/bouquets)
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'catalog') {
      return pathParts[2]; // Возвращаем категорию из пути
    }

    // Если нет в пути, проверяем параметры запроса
    return searchParams.get("category") || "";
  };

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsData = await getAllProducts();
        const categoriesData = await getAllCategories();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Получение категории по ID
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // Получение названия категории по ID
  const getCategoryName = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    if (category) {
      // Возвращаем оригинальное название из базы данных
      return category.name;
    }
    return categoryId;
  };

  // Получение названия категории по slug
  const getCategoryNameBySlug = (slug: string) => {
    const category = categories.find(cat => cat.slug === slug);
    return category ? category.name : slug;
  };

  // Получение slug категории по ID
  const getCategorySlug = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    return category?.slug || categoryId;
  };

  // Get current filters from URL
  const categoryFilter = getCategoryFromUrl();
  const sortBy = searchParams.get("sort") || "featured";

  // Если категория изменилась, обновляем URL-параметры
  useEffect(() => {
    const currentCategory = searchParams.get("category") || "";
    const urlCategory = getCategoryFromUrl();

    // Если категория в URL-пути отличается от параметра запроса, обновляем параметры
    if (urlCategory && urlCategory !== currentCategory) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("category", urlCategory);
      setSearchParams(newParams);
    }
  }, [location.pathname, searchParams, setSearchParams]);

  // Update filters
  const updateFilters = (key: string, value: string) => {
    if (key === "category") {
      // Для категорий обновляем путь URL
      if (value) {
        // Переходим на /catalog/category-slug
        navigate(`/catalog/${value}`);
      } else {
        // Переходим на общий каталог
        navigate('/catalog');
      }
    } else {
      // Для остальных фильтров обновляем только параметры запроса
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      setSearchParams(newParams);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    // Переходим на общий каталог без фильтров
    navigate('/catalog');
    setPriceRange([0, 2000]);
  };

  // Filter products based on URL parameters
  const filteredProducts = products.filter((product: Product) => {
    // Фильтрация по категории - сравниваем slug категории товара с фильтром
    if (categoryFilter && categories.length > 0) {
      const productCategorySlug = getCategorySlug(product.category);
      if (productCategorySlug !== categoryFilter) return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    // Default: featured first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Отображение индикатора загрузки, если данные еще загружаются
  if (loading) {
    return (
      <Layout>
        <section className="py-12">
          <div className="container-custom text-center">
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3 text-lg">Загрузка...</span>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-muted py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Katalog produktů</h1>
          <p className="text-muted-foreground max-w-2xl">
            Prohlédněte si naši nabídku čerstvých květin, pokojových rostlin a dárkových předmětů.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters - Desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg">Filtry</h2>
                  {(categoryFilter || sortBy !== "featured" || priceRange[0] > 0 || priceRange[1] < 2000) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Vymazat
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Kategorie</h3>
                  <div className="space-y-2">
                    {categories.map((category: Category) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={categoryFilter === category.slug}
                          onCheckedChange={(checked) => {
                            updateFilters("category", checked ? category.slug : "");
                          }}
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="ml-2 text-sm font-normal cursor-pointer"
                        >
                          {getCategoryName(category.id)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Cena</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 2000]}
                      value={priceRange}
                      max={2000}
                      step={100}
                      onValueChange={(value) => {
                        setPriceRange(value as [number, number]);
                      }}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span>{priceRange[0]} Kč</span>
                      <span>{priceRange[1]} Kč</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Sort By */}
                <div>
                  <h3 className="font-medium mb-3">Řadit podle</h3>
                  <RadioGroup
                    defaultValue="featured"
                    value={sortBy}
                    onValueChange={(value) => updateFilters("sort", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="featured" id="featured" />
                      <Label htmlFor="featured">Doporučené</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price-asc" id="price-asc" />
                      <Label htmlFor="price-asc">Cena (nejnižší)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price-desc" id="price-desc" />
                      <Label htmlFor="price-desc">Cena (nejvyšší)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="name" id="name" />
                      <Label htmlFor="name">Název (A-Z)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtry
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-semibold text-lg">Filtry</h2>
                        {(categoryFilter || sortBy !== "featured" || priceRange[0] > 0 || priceRange[1] < 2000) && (
                          <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" />
                            Vymazat
                          </Button>
                        )}
                      </div>

                      {/* Categories */}
                      <div className="mb-6">
                        <h3 className="font-medium mb-3">Kategorie</h3>
                        <div className="space-y-2">
                          {categories.map((category: Category) => (
                            <div key={category.id} className="flex items-center">
                              <Checkbox
                                id={`mobile-category-${category.id}`}
                                checked={categoryFilter === category.slug}
                                onCheckedChange={(checked) => {
                                  updateFilters("category", checked ? category.slug : "");
                                }}
                              />
                              <Label
                                htmlFor={`mobile-category-${category.id}`}
                                className="ml-2 text-sm font-normal cursor-pointer"
                              >
                                {getCategoryName(category.id)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Price Range */}
                      <div className="mb-6">
                        <h3 className="font-medium mb-3">Cena</h3>
                        <div className="px-2">
                          <Slider
                            defaultValue={[0, 2000]}
                            value={priceRange}
                            max={2000}
                            step={100}
                            onValueChange={(value) => {
                              setPriceRange(value as [number, number]);
                            }}
                            className="mb-6"
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span>{priceRange[0]} Kč</span>
                            <span>{priceRange[1]} Kč</span>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Sort By */}
                      <div>
                        <h3 className="font-medium mb-3">Řadit podle</h3>
                        <RadioGroup
                          defaultValue="featured"
                          value={sortBy}
                          onValueChange={(value) => updateFilters("sort", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="featured" id="mobile-featured" />
                            <Label htmlFor="mobile-featured">Doporučené</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price-asc" id="mobile-price-asc" />
                            <Label htmlFor="mobile-price-asc">Cena (nejnižší)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price-desc" id="mobile-price-desc" />
                            <Label htmlFor="mobile-price-desc">Cena (nejvyšší)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="name" id="mobile-name" />
                            <Label htmlFor="mobile-name">Název (A-Z)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {(categoryFilter || sortBy !== "featured" || priceRange[0] > 0 || priceRange[1] < 2000) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categoryFilter && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getCategoryNameBySlug(categoryFilter)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => updateFilters("category", "")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}

                  {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {priceRange[0]} Kč - {priceRange[1]} Kč
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setPriceRange([0, 2000])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}

                  {sortBy !== "featured" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {sortBy === "price-asc" && "Cena (nejnižší)"}
                      {sortBy === "price-desc" && "Cena (nejvyšší)"}
                      {sortBy === "name" && "Název (A-Z)"}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => updateFilters("sort", "featured")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Products */}
            <div className="flex-1">
              {/* Desktop Sort and View Toggle */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Zobrazeno {sortedProducts.length} produktů
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Zobrazení:</span>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters - Desktop */}
              <div className="hidden lg:block">
                {(categoryFilter || sortBy !== "featured" || priceRange[0] > 0 || priceRange[1] < 2000) && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm text-muted-foreground mr-2 pt-0.5">Aktivní filtry:</span>
                    {categoryFilter && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getCategoryNameBySlug(categoryFilter)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => updateFilters("category", "")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}

                    {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {priceRange[0]} Kč - {priceRange[1]} Kč
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => setPriceRange([0, 2000])}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}

                    {sortBy !== "featured" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {sortBy === "price-asc" && "Cena (nejnižší)"}
                        {sortBy === "price-desc" && "Cena (nejvyšší)"}
                        {sortBy === "name" && "Název (A-Z)"}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => updateFilters("sort", "featured")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Product Grid */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden border-border card-hover">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover aspect-square md:aspect-auto"
                          />
                          {product.featured && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-primary text-primary-foreground">
                                Oblíbené
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6 md:w-2/3 flex flex-col">
                          <h3 className="font-semibold text-xl mb-2">
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {product.description}
                          </p>
                          <div className="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <p className="font-semibold text-lg">{product.price} Kč</p>
                            <div className="flex gap-3">
                              <Button variant="outline" asChild>
                                <Link to={`/product/${product.slug || product.id}`}>
                                  Detail
                                </Link>
                              </Button>
                              <Button>
                                Do košíku
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Žádné produkty nenalezeny</h3>
                  <p className="text-muted-foreground mb-6">
                    Zkuste upravit filtry nebo vyhledat jiné produkty.
                  </p>
                  <Button onClick={clearFilters}>
                    Vymazat filtry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}