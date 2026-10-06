/**
 * Фильтры каталога. Состояние живёт в адресе страницы, чтобы ссылкой
 * можно было поделиться и вернуться «назад»:
 *   /catalog/kytice?prilezitost=birthday&cena=500-1500&razeni=price-asc&q=růže
 * (старые ?occasion= / ?sort= тоже понимаются — на них ведут ссылки с главной).
 */

export interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  featured?: boolean;
  occasions?: string[];
  createdAt?: unknown;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
}

export type CatalogSort = 'featured' | 'price-asc' | 'price-desc' | 'name';

export const CATALOG_SORTS: { value: CatalogSort; label: string }[] = [
  { value: 'featured', label: 'Doporučené' },
  { value: 'price-asc', label: 'Od nejlevnějšího' },
  { value: 'price-desc', label: 'Od nejdražšího' },
  { value: 'name', label: 'Podle názvu' },
];

/** Поводы — те же ключи, что в форме товара (поле occasions). */
export const CATALOG_OCCASIONS: { key: string; label: string }[] = [
  { key: 'birthday', label: 'Narozeniny' },
  { key: 'wedding', label: 'Svatba' },
  { key: 'valentine', label: 'Valentýn' },
  { key: 'thanks', label: 'Poděkování' },
  { key: 'general', label: 'Univerzální' },
];

export interface CatalogFilters {
  category: string;
  occasion: string;
  query: string;
  sort: CatalogSort;
  /** null — без ограничения. */
  priceMin: number | null;
  priceMax: number | null;
}

export function readFilters(categorySlug: string | undefined, params: URLSearchParams): CatalogFilters {
  const sortParam = params.get('razeni') ?? params.get('sort') ?? 'featured';
  const sort = CATALOG_SORTS.some(item => item.value === sortParam) ? (sortParam as CatalogSort) : 'featured';
  const [rawMin, rawMax] = (params.get('cena') ?? '').split('-');
  const toPrice = (value: string | undefined) => {
    const number = Number(value);
    return value !== undefined && value !== '' && Number.isFinite(number) && number >= 0 ? number : null;
  };
  return {
    category: (categorySlug ?? params.get('category') ?? '').trim(),
    occasion: (params.get('prilezitost') ?? params.get('occasion') ?? '').trim().toLowerCase(),
    query: (params.get('q') ?? '').trim(),
    sort,
    priceMin: toPrice(rawMin),
    priceMax: toPrice(rawMax),
  };
}

/** Параметры адреса без категории (она в пути /catalog/:slug). */
export function filtersToParams(filters: Omit<CatalogFilters, 'category'>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.occasion) params.set('prilezitost', filters.occasion);
  if (filters.priceMin !== null || filters.priceMax !== null) {
    params.set('cena', `${filters.priceMin ?? ''}-${filters.priceMax ?? ''}`);
  }
  if (filters.sort !== 'featured') params.set('razeni', filters.sort);
  if (filters.query) params.set('q', filters.query);
  return params;
}

/** Верхняя граница слайдера цены: самая дорогая позиция, округлённая вверх до сотни. */
export function priceCeiling(products: Pick<CatalogProduct, 'price'>[]): number {
  const max = products.reduce((top, product) => Math.max(top, product.price || 0), 0);
  return Math.max(100, Math.ceil(max / 100) * 100);
}

const normalize = (value: string) => value.toLocaleLowerCase('cs').normalize('NFD').replace(/\p{Diacritic}/gu, '');

/** Категория по slug или по названию без диакритики: /catalog/bouquets и /catalog/kytice. */
export function resolveCategorySlug(value: string, categories: CatalogCategory[]): string {
  if (!value) return '';
  const wanted = normalize(value).replace(/\s+/g, '-');
  const found = categories.find(category =>
    category.slug === value || normalize(category.name).replace(/\s+/g, '-') === wanted);
  return found?.slug ?? value;
}

interface MatchOptions {
  categories: CatalogCategory[];
  /** Какие фильтры пропустить — для подсчёта количества в кнопках. */
  ignore?: ('category' | 'occasion')[];
}

export function matchesFilters(product: CatalogProduct, filters: CatalogFilters, { categories, ignore = [] }: MatchOptions): boolean {
  if (filters.category && !ignore.includes('category')) {
    const slug = categories.find(category => category.id === product.category)?.slug ?? product.category;
    if (slug !== filters.category) return false;
  }
  // Повод — строго: товар должен быть им отмечен в админке.
  if (filters.occasion && !ignore.includes('occasion')) {
    if (!product.occasions?.includes(filters.occasion)) return false;
  }
  if (filters.priceMin !== null && product.price < filters.priceMin) return false;
  if (filters.priceMax !== null && product.price > filters.priceMax) return false;
  if (filters.query) {
    // Без учёта регистра и диакритики: «ruze» находит «Růže».
    const haystack = normalize(`${product.name} ${product.description ?? ''}`);
    if (!haystack.includes(normalize(filters.query))) return false;
  }
  return true;
}

export function sortProducts<T extends CatalogProduct>(products: T[], sort: CatalogSort): T[] {
  const sorted = [...products];
  if (sort === 'price-asc') return sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return sorted.sort((a, b) => b.price - a.price);
  if (sort === 'name') return sorted.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  return sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

/** Сколько товаров даст каждая категория/повод при остальных текущих фильтрах. */
export function countBy(
  products: CatalogProduct[],
  filters: CatalogFilters,
  categories: CatalogCategory[],
): { categories: Record<string, number>; occasions: Record<string, number>; all: number } {
  const categoryCounts: Record<string, number> = {};
  const occasionCounts: Record<string, number> = {};
  for (const category of categories) {
    categoryCounts[category.slug] = products.filter(product =>
      matchesFilters(product, { ...filters, category: category.slug }, { categories })).length;
  }
  for (const occasion of CATALOG_OCCASIONS) {
    occasionCounts[occasion.key] = products.filter(product =>
      matchesFilters(product, { ...filters, occasion: occasion.key }, { categories })).length;
  }
  const all = products.filter(product => matchesFilters(product, filters, { categories, ignore: ['category'] })).length;
  return { categories: categoryCounts, occasions: occasionCounts, all };
}

/** «1 produkt · 2–4 produkty · 5+ produktů» */
export function productsLabel(count: number): string {
  if (count === 1) return '1 produkt';
  if (count >= 2 && count <= 4) return `${count} produkty`;
  return `${count} produktů`;
}
