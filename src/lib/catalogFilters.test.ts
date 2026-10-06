import { describe, expect, it } from 'vitest';
import { countBy, resolveCategorySlug, filtersToParams, matchesFilters, priceCeiling, productsLabel, readFilters, sortProducts, type CatalogProduct } from './catalogFilters';

const categories = [
  { id: 'c1', slug: 'kytice', name: 'Kytice' },
  { id: 'c2', slug: 'darky', name: 'Dárky' },
];

const products: CatalogProduct[] = [
  { id: '1', name: 'Růžový sen', price: 1290, category: 'c1', occasions: ['birthday'], featured: true },
  { id: '2', name: 'Slunečnice', price: 790, category: 'c1' },
  { id: '3', name: 'Dárkový koš', price: 2490, category: 'c2', occasions: ['thanks', 'birthday'] },
];

const base = readFilters(undefined, new URLSearchParams());

describe('catalog filters', () => {
  it('reads new and legacy query parameters', () => {
    const filters = readFilters('kytice', new URLSearchParams('occasion=Birthday&sort=price-asc&cena=500-1500&q=ruze'));
    expect(filters).toEqual({ category: 'kytice', occasion: 'birthday', query: 'ruze', sort: 'price-asc', priceMin: 500, priceMax: 1500 });
    expect(readFilters(undefined, new URLSearchParams('razeni=nonsense&cena=abc-')).sort).toBe('featured');
    expect(readFilters(undefined, new URLSearchParams('cena=-800')).priceMin).toBeNull();
  });

  it('writes only non-default parameters', () => {
    expect(filtersToParams({ ...base }).toString()).toBe('');
    expect(filtersToParams({ ...base, occasion: 'wedding', priceMax: 900, sort: 'name' }).toString()).toBe('prilezitost=wedding&cena=-900&razeni=name');
  });

  it('does not hide products above 2000 Kč', () => {
    expect(priceCeiling(products)).toBe(2500);
    expect(products.filter(product => matchesFilters(product, base, { categories }))).toHaveLength(3);
  });

  it('filters strictly by occasion and ignores diacritics in search', () => {
    const byOccasion = products.filter(product => matchesFilters(product, { ...base, occasion: 'birthday' }, { categories }));
    expect(byOccasion.map(product => product.id)).toEqual(['1', '3']);
    const search = products.filter(product => matchesFilters(product, { ...base, query: 'ruzovy' }, { categories }));
    expect(search.map(product => product.id)).toEqual(['1']);
  });

  it('counts per category and occasion with the other filters applied', () => {
    const counts = countBy(products, { ...base, occasion: 'birthday' }, categories);
    expect(counts.categories).toEqual({ kytice: 1, darky: 1 });
    expect(counts.occasions.thanks).toBe(1);
    expect(counts.all).toBe(2);
  });

  it('sorts and pluralises', () => {
    expect(sortProducts(products, 'price-desc')[0].id).toBe('3');
    expect(sortProducts(products, 'featured')[0].id).toBe('1');
    expect(productsLabel(1)).toBe('1 produkt');
    expect(productsLabel(3)).toBe('3 produkty');
    expect(productsLabel(8)).toBe('8 produktů');
  });

  it('resolves categories by slug or Czech name', () => {
    const cats = [{ id: 'c1', slug: 'bouquets', name: 'Kytice' }, { id: 'c2', slug: 'plants', name: 'Pokojové rostliny' }];
    expect(resolveCategorySlug('bouquets', cats)).toBe('bouquets');
    expect(resolveCategorySlug('kytice', cats)).toBe('bouquets');
    expect(resolveCategorySlug('pokojove-rostliny', cats)).toBe('plants');
    expect(resolveCategorySlug('neznamo', cats)).toBe('neznamo');
  });
});
