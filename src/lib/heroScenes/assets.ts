/** URL картинок слоёв сцен (src/assets/hero-scenes/*.webp) — Vite подставляет имена с хешем. */
const ASSET_URLS = import.meta.glob<string>('@/assets/hero-scenes/*.webp', { eager: true, import: 'default' });

export function sceneAssetUrl(asset: string): string | undefined {
  return Object.entries(ASSET_URLS).find(([path]) => path.endsWith(`/${asset}.webp`))?.[1];
}
