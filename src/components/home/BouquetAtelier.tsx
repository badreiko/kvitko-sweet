import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Minus, RotateCcw, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllFlowers } from '@/firebase/services/flowerService';
import { useSiteTheme } from '@/context/SiteThemeContext';
import {
  encodeStems,
  fanLayout,
  makeStem,
  randomBouquet,
  seasonalBouquet,
  type AtelierFlower,
  type AtelierStem,
} from '@/lib/bouquetAtelier';

const MAX_STEMS = 15;

function displayName(name: unknown): string {
  if (typeof name === 'string') return name;
  if (name && typeof name === 'object') {
    const value = name as Record<string, string>;
    return value.cs || value.en || Object.values(value)[0] || '';
  }
  return '';
}

/** Короткое имя для подписи: «Šater / Gypsophila» → «Šater». */
const shortName = (name: string) => name.split('/')[0].trim();

/**
 * Обёртка, лента и связка букета. Рисуется двумя слоями: задний лист —
 * под стеблями, передний — поверх, чтобы стебли «сидели» в бумаге.
 */
function PaperBack() {
  return (
    <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="atelier-kraft-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6c9a3" />
          <stop offset="1" stopColor="#c9a074" />
        </linearGradient>
      </defs>
      <path d="M58 196 C 110 150, 160 176, 200 150 C 240 176, 292 150, 342 196 L 224 392 L 176 392 Z" fill="url(#atelier-kraft-back)" />
      <path d="M58 196 C 110 150, 160 176, 200 150 C 240 176, 292 150, 342 196" fill="none" stroke="#b78b5e" strokeOpacity=".35" strokeWidth="2" />
    </svg>
  );
}

function PaperFront() {
  return (
    <svg viewBox="0 0 400 500" className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 40 }} aria-hidden="true">
      <defs>
        <linearGradient id="atelier-kraft-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dcb889" />
          <stop offset="1" stopColor="#b98d5f" />
        </linearGradient>
      </defs>
      {/* Передний лист с загибом */}
      <path d="M108 292 C 160 322, 240 322, 292 292 L 230 438 L 170 438 Z" fill="url(#atelier-kraft-front)" />
      <path d="M108 292 C 150 312, 178 316, 200 316 L 186 438 L 170 438 Z" fill="#fff" fillOpacity=".12" />
      {/* Лента в цвете темы */}
      <g fill="var(--theme-clay)">
        <rect x="168" y="384" width="64" height="14" rx="5" />
        <path d="M200 391 C 168 360, 132 372, 150 398 C 162 414, 186 402, 200 391 Z" />
        <path d="M200 391 C 232 360, 268 372, 250 398 C 238 414, 214 402, 200 391 Z" />
        <path d="M194 394 C 184 430, 170 452, 150 476 L 166 480 C 182 458, 196 432, 202 398 Z" />
        <path d="M206 394 C 218 428, 236 448, 260 470 L 246 478 C 226 456, 210 432, 198 398 Z" />
        <circle cx="200" cy="391" r="9" />
      </g>
    </svg>
  );
}

export function BouquetAtelier() {
  const { themeId } = useSiteTheme();
  const reduceMotion = useReducedMotion();
  const [flowers, setFlowers] = useState<AtelierFlower[]>([]);
  const [loading, setLoading] = useState(true);
  const [stems, setStems] = useState<AtelierStem[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllFlowers()
      .then(items => {
        if (cancelled) return;
        setFlowers(items
          .filter(item => (item.itemType ?? 'flower') === 'flower')
          .filter(item => item.forCustomBouquet !== false && item.inStock !== false)
          .filter(item => item.imageUrl && item.price > 0)
          .map(item => ({
            id: item.id,
            name: displayName(item.name),
            price: item.price,
            imageUrl: item.imageUrl!,
            colorHex: item.colorHex,
            color: item.color,
          })));
      })
      .catch(error => console.error('BouquetAtelier: failed to load flowers', error))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Пока посетитель ничего не трогал — показываем сезонный букет текущей темы.
  useEffect(() => {
    if (!touched && flowers.length) setStems(seasonalBouquet(flowers, themeId));
  }, [flowers, themeId, touched]);

  const byId = useMemo(() => new Map(flowers.map(flower => [flower.id, flower])), [flowers]);
  const layout = fanLayout(stems.length);
  const total = stems.reduce((sum, stem) => sum + (byId.get(stem.flowerId)?.price ?? 0), 0);
  const countOf = (id: string) => stems.filter(stem => stem.flowerId === id).length;
  const full = stems.length >= MAX_STEMS;

  const add = (id: string) => {
    if (full) return;
    setTouched(true);
    setStems(prev => [...prev, makeStem(id)]);
  };
  const removeOne = (id: string) => {
    setTouched(true);
    setStems(prev => {
      const index = prev.map(stem => stem.flowerId).lastIndexOf(id);
      return index < 0 ? prev : [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };
  const surprise = () => { setTouched(true); setStems(randomBouquet(flowers)); };
  const reset = () => { setTouched(true); setStems([]); };

  const configuratorUrl = stems.length ? `/custom-bouquet?flowers=${encodeURIComponent(encodeStems(stems))}` : '/custom-bouquet';
  const spring = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 170, damping: 18 };

  return (
    <section className="season-band py-14 md:py-20 overflow-hidden">
      <div className="container-custom">
        {/* Телефон: текст → букет → выбор цветов. Компьютер: слева текст и выбор, справа букет. */}
        <div className="grid gap-6 lg:gap-x-14 lg:gap-y-2 [grid-template-areas:'text'_'stage'_'picker'] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:[grid-template-areas:'text_stage'_'picker_stage']">
          {/* ── Текст и выбор цветов ─────────────────────────────── */}
          <div className="[grid-area:text] min-w-0 lg:self-end">
            <p className="season-eyebrow mb-4">Ateliér · vlastní kytice</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-[1.08] mb-4">
              Poskládejte si kytici.
              <span className="block font-normal italic text-season-accent">Hned tady.</span>
            </h2>
            <p className="text-muted-foreground md:text-lg max-w-lg">
              Klepněte na květiny a sledujte, jak kytice roste. Balení a vzkaz doladíte v konfigurátoru — kytici pak svážeme ručně a doručíme.
            </p>

          </div>

          <div className="[grid-area:picker] min-w-0 lg:self-start lg:pt-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">Dnes v ateliéru</p>
              {full && <p className="text-xs text-season-clay">Maximálně {MAX_STEMS} stonků — zbytek přidáte v konfigurátoru.</p>}
            </div>

            {loading ? (
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, index) => <div key={index} className="aspect-square rounded-2xl bg-background/60 animate-pulse" />)}
              </div>
            ) : (
              /* Телефон: лента с прокруткой; компьютер: сетка в 7 колонок. */
              <div className="-mx-4 px-4 pt-2 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {flowers.map(flower => {
                  const count = countOf(flower.id);
                  return (
                    <div key={flower.id} className="relative shrink-0 w-[76px] sm:w-auto">
                      <button
                        type="button"
                        onClick={() => add(flower.id)}
                        disabled={full}
                        title={`${flower.name} · ${flower.price} Kč / ks`}
                        className={`group w-full rounded-2xl border bg-background/80 p-1.5 pb-2 text-center transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 ${count ? 'border-season-clay' : 'border-season-line'}`}
                      >
                        <img src={flower.imageUrl} alt="" loading="lazy" className="mx-auto aspect-square w-full object-contain transition-transform group-hover:scale-110" />
                        <span className="mt-1 block truncate text-[11px] font-medium leading-tight">{shortName(flower.name)}</span>
                        <span className="block text-[10px] text-muted-foreground">{flower.price} Kč</span>
                      </button>
                      {count > 0 && (
                        <>
                          <span className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-season-clay px-1 text-[11px] font-bold text-white">{count}</span>
                          <button
                            type="button"
                            onClick={() => removeOne(flower.id)}
                            aria-label={`Odebrat ${flower.name}`}
                            className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-season-line bg-background text-foreground shadow-sm hover:text-season-clay"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Итог и действия */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div>
                <p className="text-2xl font-serif font-bold leading-none">
                  {total} Kč
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stems.length} {stems.length === 1 ? 'stonek' : stems.length >= 2 && stems.length <= 4 ? 'stonky' : 'stonků'} · bez balení
                </p>
              </div>
              <div className="flex w-full sm:w-auto sm:flex-1 flex-wrap items-center gap-2 sm:justify-end lg:justify-start [&>a]:flex-1 sm:[&>a]:flex-none">
                <Button size="lg" className="rounded-full px-6" asChild>
                  <Link to={configuratorUrl}>
                    Dokončit kytici
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button type="button" variant="outline" size="lg" className="rounded-full border-season-line bg-background/60 px-5 hover:text-season-accent" onClick={surprise} disabled={!flowers.length}>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Překvapte mě
                </Button>
                {stems.length > 0 && (
                  <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 px-2 text-sm text-muted-foreground hover:text-foreground">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Začít znovu
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Сцена с букетом ──────────────────────────────────── */}
          <div className="[grid-area:stage] lg:self-center">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[460px]">
              <div className="absolute inset-[4%] rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--theme-warm) 85%, transparent) 0%, transparent 68%)' }} aria-hidden="true" />
              <div className="absolute inset-x-[16%] top-[8%] bottom-[10%] rounded-t-full border" style={{ borderColor: 'color-mix(in srgb, var(--theme-clay) 22%, transparent)' }} aria-hidden="true" />
              <PaperBack />
              <AnimatePresence>
                {stems.map((stem, index) => {
                  const flower = byId.get(stem.flowerId);
                  const place = layout[index];
                  if (!flower || !place) return null;
                  return (
                    <motion.img
                      key={stem.key}
                      src={flower.imageUrl}
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute left-[19%] bottom-[36%] w-[62%] select-none object-contain drop-shadow-[0_8px_10px_rgba(80,50,20,0.18)]"
                      // Все стебли поворачиваются вокруг одной точки — связки под лентой.
                      style={{ zIndex: place.zIndex, transformOrigin: '50% 117%' }}
                      initial={{ opacity: 0, y: '45%', scale: 0.5, rotate: place.rotate }}
                      animate={{ opacity: 1, y: `${-place.lift * 200}%`, scale: place.scale, rotate: place.rotate }}
                      exit={{ opacity: 0, y: '35%', scale: 0.6, transition: { duration: reduceMotion ? 0 : 0.25 } }}
                      transition={spring}
                    />
                  );
                })}
              </AnimatePresence>
              <PaperFront />
              {!touched && stems.length > 0 && (
                <span className="absolute left-0 top-[6%] z-50 rounded-full border border-season-line bg-background/90 px-3 py-1 text-xs font-medium text-season-clay shadow-sm">
                  Sezónní návrh
                </span>
              )}
              {!loading && stems.length === 0 && (
                <p className="absolute inset-x-0 top-[30%] z-50 text-center text-sm text-muted-foreground">
                  Vyberte první květinu ✿
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BouquetAtelier;
