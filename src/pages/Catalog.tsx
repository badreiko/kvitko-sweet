import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { getAllProducts, Product } from "@/firebase/services/productService";
import { Category, getActiveCategories } from "@/firebase/services/categoryService";
import {
  CATALOG_OCCASIONS,
  CATALOG_SORTS,
  countBy,
  filtersToParams,
  matchesFilters,
  priceCeiling,
  productsLabel,
  readFilters,
  resolveCategorySlug,
  sortProducts,
  type CatalogFilters,
  type CatalogSort,
} from "@/lib/catalogFilters";

/** Кнопка-«таблетка» фильтра: выбранная — в акценте темы, пустая — приглушена. */
function Pill({ active, count, disabled, onClick, children }: {
  active: boolean;
  count?: number;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "border-transparent bg-season-accent text-white shadow-sm"
          : "border-season-line bg-background/70 text-foreground hover:border-season-clay hover:text-season-clay"
      }`}
    >
      {children}
      {typeof count === "number" && (
        <span className={`text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}>{count}</span>
      )}
    </button>
  );
}

export default function Catalog() {
  const { category: categorySlug } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllProducts(), getActiveCategories()])
      .then(([productsData, categoriesData]) => {
        if (cancelled) return;
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(error => console.error("Error fetching catalog:", error))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const rawFilters = readFilters(categorySlug, searchParams);
  // Понимаем и slug, и чешское название категории в адресе.
  const filters = { ...rawFilters, category: resolveCategorySlug(rawFilters.category, categories) };
  const ceiling = priceCeiling(products);
  const activeCategory = categories.find(category => category.slug === filters.category);

  const visible = useMemo(
    () => sortProducts(products.filter(product => matchesFilters(product, filters, { categories })), filters.sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, categories, searchParams, categorySlug],
  );
  const counts = useMemo(
    () => countBy(products, filters, categories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, categories, searchParams, categorySlug],
  );

  /** Меняет фильтры, сохраняя их в адресе. Категория — в пути /catalog/:slug. */
  const update = (patch: Partial<CatalogFilters>) => {
    const next = { ...filters, ...patch };
    const params = filtersToParams(next);
    const query = params.toString();
    if (patch.category !== undefined && patch.category !== filters.category) {
      navigate(`/catalog${next.category ? `/${next.category}` : ""}${query ? `?${query}` : ""}`);
    } else {
      setSearchParams(params, { replace: true });
    }
  };

  const [searchDraft, setSearchDraft] = useState(filters.query);
  useEffect(() => setSearchDraft(filters.query), [filters.query]);

  const priceActive = filters.priceMin !== null || filters.priceMax !== null;
  const priceLabel = priceActive ? `${filters.priceMin ?? 0}–${filters.priceMax ?? ceiling} Kč` : "Cena";
  const hasFilters = Boolean(filters.category || filters.occasion || filters.query || priceActive || filters.sort !== "featured");
  const occasionLabel = CATALOG_OCCASIONS.find(item => item.key === filters.occasion)?.label;

  return (
    <Layout>
      {/* Шапка в палитре сезонной темы */}
      <section className="season-band py-10 md:py-14">
        <div className="container-custom">
          <p className="season-eyebrow mb-3">Katalog</p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-3">
            {activeCategory ? activeCategory.name : <>Naše <span className="italic font-normal text-season-accent">nabídka</span></>}
          </h1>
          <p className="text-muted-foreground max-w-2xl md:text-lg">
            {activeCategory?.description || "Čerstvé kytice, pokojové rostliny a dárky — svážeme ručně a doručíme po Praze od 90 minut."}
          </p>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="container-custom">
          {/* ── Панель фильтров ─────────────────────────────────────── */}
          <div className="space-y-3 mb-6 md:mb-8">
            {/* Категории */}
            <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Pill active={!filters.category} count={counts.all} onClick={() => update({ category: "" })}>Vše</Pill>
              {categories.map(category => (
                <Pill
                  key={category.id}
                  active={filters.category === category.slug}
                  count={counts.categories[category.slug] ?? 0}
                  onClick={() => update({ category: filters.category === category.slug ? "" : category.slug })}
                >
                  {category.name}
                </Pill>
              ))}
            </div>

            {/* Поводы — те же метки, что в карточке товара в админке */}
            <div className="-mx-4 px-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-season-clay mr-1">Příležitost</span>
              {CATALOG_OCCASIONS.map(occasion => {
                const count = counts.occasions[occasion.key] ?? 0;
                const active = filters.occasion === occasion.key;
                return (
                  <Pill
                    key={occasion.key}
                    active={active}
                    count={count}
                    disabled={!active && count === 0}
                    onClick={() => update({ occasion: active ? "" : occasion.key })}
                  >
                    {occasion.label}
                  </Pill>
                );
              })}
            </div>

            {/* Поиск, цена, сортировка */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <form
                className="relative flex-1 min-w-[200px] max-w-sm"
                onSubmit={event => { event.preventDefault(); update({ query: searchDraft.trim() }); }}
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchDraft}
                  onChange={event => setSearchDraft(event.target.value)}
                  onBlur={() => searchDraft.trim() !== filters.query && update({ query: searchDraft.trim() })}
                  placeholder="Hledat kytici…"
                  className="h-10 rounded-full pl-9 bg-background/70 border-season-line"
                  aria-label="Hledat v katalogu"
                />
              </form>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className={`h-10 rounded-full border-season-line bg-background/70 ${priceActive ? "text-season-clay border-season-clay" : ""}`}>
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {priceLabel}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Cena</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 px-1">
                    <Slider
                      value={[filters.priceMin ?? 0, filters.priceMax ?? ceiling]}
                      min={0}
                      max={ceiling}
                      step={50}
                      minStepsBetweenThumbs={1}
                      onValueChange={([min, max]) => update({
                        priceMin: min > 0 ? min : null,
                        priceMax: max < ceiling ? max : null,
                      })}
                    />
                    <div className="mt-4 flex justify-between text-sm">
                      <span>{filters.priceMin ?? 0} Kč</span>
                      <span>{filters.priceMax ?? ceiling} Kč</span>
                    </div>
                    {priceActive && (
                      <Button variant="ghost" size="sm" className="mt-6" onClick={() => update({ priceMin: null, priceMax: null })}>
                        Zrušit omezení ceny
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={filters.sort} onValueChange={value => update({ sort: value as CatalogSort })}>
                <SelectTrigger className="h-10 w-auto min-w-[170px] rounded-full border-season-line bg-background/70" aria-label="Řazení">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATALOG_SORTS.map(sort => <SelectItem key={sort.value} value={sort.value}>{sort.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <p className="ml-auto text-sm text-muted-foreground">{loading ? "Načítám…" : productsLabel(visible.length)}</p>
            </div>

            {/* Активные фильтры */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {filters.query && (
                  <button type="button" onClick={() => update({ query: "" })} className="inline-flex items-center gap-1 rounded-full bg-season-soft px-3 py-1 text-xs font-medium hover:text-season-clay">
                    „{filters.query}“ <X className="h-3 w-3" />
                  </button>
                )}
                {occasionLabel && (
                  <button type="button" onClick={() => update({ occasion: "" })} className="inline-flex items-center gap-1 rounded-full bg-season-soft px-3 py-1 text-xs font-medium hover:text-season-clay">
                    {occasionLabel} <X className="h-3 w-3" />
                  </button>
                )}
                {priceActive && (
                  <button type="button" onClick={() => update({ priceMin: null, priceMax: null })} className="inline-flex items-center gap-1 rounded-full bg-season-soft px-3 py-1 text-xs font-medium hover:text-season-clay">
                    {priceLabel} <X className="h-3 w-3" />
                  </button>
                )}
                <button type="button" onClick={() => navigate("/catalog")} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  Zrušit vše
                </button>
              </div>
            )}
          </div>

          {/* ── Товары ──────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="rounded-[24px] border border-border/40 overflow-hidden">
                  <div className="aspect-[4/5] bg-muted/50 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {visible.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: Math.min(index, 8) * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-season-line season-band-soft px-6 py-14 text-center">
              <h2 className="text-2xl font-serif font-bold mb-3">
                {occasionLabel ? `Výběr „${occasionLabel}“ právě připravujeme` : "Nic jsme nenašli"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-7">
                {occasionLabel
                  ? "Podívejte se na celou nabídku, nebo si kytici poskládejte přesně podle sebe."
                  : "Zkuste upravit filtry nebo hledaný výraz."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button className="rounded-full px-6" onClick={() => navigate("/catalog")}>Celá nabídka</Button>
                <Button variant="outline" className="rounded-full px-6 border-season-line" asChild>
                  <Link to="/custom-bouquet">
                    Vlastní kytice <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
