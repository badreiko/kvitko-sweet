import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CalendarDays, ExternalLink, Image as ImageIcon, Sparkles, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type {
  HeroHolidayId,
  HeroImageRatio,
  HeroHolidayPeriod,
  HeroSettings,
  HeroThemeContent,
  HeroThemeId,
} from '@/firebase/services/settingsService';
import {
  HERO_HOLIDAY_IDS,
  HERO_RATIO_OPTIONS,
  HERO_SEASON_HINTS,
  HERO_SEASON_IDS,
  HERO_THEME_DEFAULTS,
  HERO_THEME_IDS,
  HERO_THEME_LABELS,
  THEME_PREVIEW_PARAM,
  formatDayMonth,
  heroRatio,
  heroSceneOf,
  isHeroThemeReady,
  nearestHeroRatio,
  parseDayMonth,
  resolveHeroTheme,
} from '@/lib/heroTheme';
import { HeroArt } from '@/components/HeroArt';
import { SpringBouquet } from '@/assets';
import { HERO_SCENE_IDS, HERO_SCENES, sceneRatio, type HeroSceneId } from '@/lib/heroScenes';

// Сцена грузится только когда её открыли в предпросмотре.
const HeroScene = lazy(() => import('@/components/home/HeroScene'));

type ImageField = 'desktopImage' | 'mobileImage';

interface HeroSettingsEditorProps {
  value: HeroSettings;
  legacyImages: string[];
  uploadingSlot: string | null;
  onChange: (next: HeroSettings) => void;
  onUpload: (theme: HeroThemeId, field: ImageField, file: File) => void;
  onRemove: (theme: HeroThemeId, field: ImageField) => void;
}

function ImageSlot({
  label, hint, image, busy, onUpload, onRemove,
}: {
  label: string;
  hint: string;
  image?: string;
  busy: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {image && (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" title={`Удалить ${label.toLowerCase()}`} onClick={onRemove} disabled={busy}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {/* Шахматка показывает, сохранилась ли прозрачность фона после загрузки. */}
      <div className="aspect-[4/3] overflow-hidden rounded-md border flex items-center justify-center bg-[length:16px_16px] bg-[linear-gradient(45deg,hsl(var(--muted))_25%,transparent_25%,transparent_75%,hsl(var(--muted))_75%),linear-gradient(45deg,hsl(var(--muted))_25%,transparent_25%,transparent_75%,hsl(var(--muted))_75%)] bg-[position:0_0,8px_8px]">
        {image ? <img src={image} alt={label} className="h-full w-full object-contain" /> : <ImageIcon className="h-7 w-7 text-muted-foreground/50" />}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.target.value = '';
        }}
      />
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => inputRef.current?.click()} disabled={busy}>
        <Upload className="mr-2 h-4 w-4" />{busy ? 'Загрузка...' : image ? 'Заменить' : 'Загрузить'}
      </Button>
    </div>
  );
}

/** Поле «ДД.ММ»: хранит черновик, в настройки уходит только валидная дата. */
function DayMonthInput({ id, value, disabled, onCommit }: {
  id: string;
  value: string;
  disabled?: boolean;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(formatDayMonth(value));
  useEffect(() => setDraft(formatDayMonth(value)), [value]);
  const parsed = parseDayMonth(draft);
  return (
    <Input
      id={id}
      value={draft}
      disabled={disabled}
      inputMode="numeric"
      placeholder="ДД.ММ"
      aria-invalid={!parsed}
      className={`h-9 w-[5.5rem] text-center ${parsed ? '' : 'border-destructive focus-visible:ring-destructive'}`}
      onChange={event => {
        setDraft(event.target.value);
        const next = parseDayMonth(event.target.value);
        if (next) onCommit(next);
      }}
      onBlur={() => { if (!parsed) setDraft(formatDayMonth(value)); }}
    />
  );
}

function themeStatus(value: HeroSettings, id: HeroThemeId, legacyImages: string[]): string {
  const scene = heroSceneOf({ ...HERO_THEME_DEFAULTS[id], ...value.themes[id] });
  if (scene) return `Сцена «${HERO_SCENES[scene].label}»`;
  if (isHeroThemeReady(value, id)) return 'Изображение готово';
  if (id === 'default') return legacyImages.length ? 'Старое изображение' : 'Стандартный букет';
  return 'Без изображения — не показывается';
}

export function HeroSettingsEditor({ value, legacyImages, uploadingSlot, onChange, onUpload, onRemove }: HeroSettingsEditorProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const active = resolveHeroTheme(value, { heroSection: legacyImages });
  const [editingTheme, setEditingTheme] = useState<HeroThemeId>(active.themeId);
  const defaults = HERO_THEME_DEFAULTS[editingTheme];
  const content = { ...defaults, ...value.themes[editingTheme] };
  const fallbackImage = (editingTheme === 'default' ? legacyImages[0] : undefined) || SpringBouquet;
  // Одна картинка на все экраны; старая mobileImage показывается, только если другой нет.
  const themeImage = content.desktopImage || content.mobileImage;
  const previewImage = themeImage || fallbackImage;
  const scene = heroSceneOf(content);

  const updateField = <K extends keyof HeroThemeContent>(field: K, fieldValue: HeroThemeContent[K]) => {
    onChange({
      ...value,
      themes: {
        ...value.themes,
        [editingTheme]: { ...value.themes[editingTheme], [field]: fieldValue },
      },
    });
  };

  const updateHoliday = (id: HeroHolidayId, patch: Partial<HeroHolidayPeriod>) => {
    onChange({ ...value, holidays: { ...value.holidays, [id]: { ...value.holidays[id], ...patch } } });
  };

  const [ratioHint, setRatioHint] = useState<string | null>(null);
  useEffect(() => setRatioHint(null), [editingTheme]);

  /** Подбирает ближайшую пропорцию по реальным размерам картинки темы. */
  const fitRatioToImage = () => {
    if (!themeImage) { setRatioHint('Сначала загрузите изображение темы.'); return; }
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const aspect = img.naturalWidth / img.naturalHeight;
      const ratio = nearestHeroRatio(aspect);
      updateField('imageRatio', ratio);
      setRatioHint(`Изображение ${img.naturalWidth}×${img.naturalHeight} → ${ratio}`);
    };
    img.src = themeImage;
  };

  const resetText = () => {
    const { desktopImage: keepDesktop, mobileImage: keepMobile } = value.themes[editingTheme] ?? {};
    // Картинки при сбросе не трогаем — они уже сохранены в базе.
    onChange({
      ...value,
      themes: { ...value.themes, [editingTheme]: { desktopImage: keepDesktop, mobileImage: keepMobile } },
    });
  };

  return (
    <div className="space-y-8">
      {/* ── 1. Когда какая тема показывается ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Когда показывать</h3>
          <p className="text-sm text-muted-foreground">
            Сейчас на главной: <strong className="text-foreground">{HERO_THEME_LABELS[active.themeId]}</strong>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-md border p-4">
            <div className="inline-flex rounded-md border bg-muted/40 p-1 text-sm">
              <button type="button" aria-pressed={value.mode === 'auto'} onClick={() => onChange({ ...value, mode: 'auto' })} className={`rounded px-3 py-1.5 ${value.mode === 'auto' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>По сезону</button>
              <button type="button" aria-pressed={value.mode === 'manual'} onClick={() => onChange({ ...value, mode: 'manual' })} className={`rounded px-3 py-1.5 ${value.mode === 'manual' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Одна тема</button>
            </div>

            {value.mode === 'auto' ? (
              <ul className="space-y-1.5 text-sm">
                {HERO_SEASON_IDS.map(id => {
                  const ready = isHeroThemeReady(value, id);
                  return (
                    <li key={id} className="flex items-center justify-between gap-3">
                      <span><span className="font-medium">{HERO_THEME_LABELS[id]}</span> <span className="text-muted-foreground">· {HERO_SEASON_HINTS[id]}</span></span>
                      <span className={`text-xs ${ready ? 'text-primary' : 'text-muted-foreground'}`}>{ready ? 'готова' : 'нет изображения → базовая'}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="active-hero-theme">Тема на главной</Label>
                <select id="active-hero-theme" value={value.selectedTheme} onChange={event => onChange({ ...value, selectedTheme: event.target.value as HeroThemeId })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {HERO_THEME_IDS.map(id => (
                    <option key={id} value={id}>
                      {HERO_THEME_LABELS[id]}{id !== 'default' && !isHeroThemeReady(value, id) ? ' (нет изображения)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Тема без изображения не показывается — вместо неё будет базовая.</p>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor="hero-holidays" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Праздничные темы</Label>
                <p className="mt-1 text-xs text-muted-foreground">В свои даты заменяют и сезонную, и выбранную вручную тему (по времени Праги).</p>
              </div>
              <Switch id="hero-holidays" checked={value.holidaysEnabled} onCheckedChange={checked => onChange({ ...value, holidaysEnabled: checked })} />
            </div>
            <div className="space-y-3">
              {HERO_HOLIDAY_IDS.map(id => {
                const period = value.holidays[id];
                const disabled = !value.holidaysEnabled;
                return (
                  <div key={id} className={`flex flex-wrap items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
                    <Switch id={`holiday-${id}`} checked={period.enabled} disabled={disabled} onCheckedChange={checked => updateHoliday(id, { enabled: checked })} />
                    <Label htmlFor={`holiday-${id}`} className="w-24">{HERO_THEME_LABELS[id]}</Label>
                    <DayMonthInput id={`holiday-${id}-start`} value={period.start} disabled={disabled || !period.enabled} onCommit={start => updateHoliday(id, { start })} />
                    <span className="text-muted-foreground">–</span>
                    <DayMonthInput id={`holiday-${id}-end`} value={period.end} disabled={disabled || !period.enabled} onCommit={end => updateHoliday(id, { end })} />
                    {!isHeroThemeReady(value, id) && <span className="text-xs text-muted-foreground">нет изображения</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Период может переходить через Новый год, например 20.12 – 06.01.</p>
          </div>
        </div>
      </section>

      {/* ── 2. Выбор темы для редактирования ─────────────────────────── */}
      <section className="space-y-3 border-t pt-6">
        <h3 className="font-semibold">Темы</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {HERO_THEME_IDS.map(id => (
            <button key={id} type="button" aria-pressed={editingTheme === id} onClick={() => setEditingTheme(id)} className={`min-h-14 rounded-md border px-3 py-2 text-left text-sm transition-colors ${editingTheme === id ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
              <span className="flex items-center gap-1.5 font-medium">
                {HERO_THEME_LABELS[id]}
                {active.themeId === id && <span className="rounded bg-primary px-1.5 text-[10px] font-semibold uppercase text-primary-foreground">на сайте</span>}
              </span>
              <span className="block text-xs">{themeStatus(value, id, legacyImages)}</span>
            </button>
          ))}
        </div>

        {/* Карточка темы только открывает её для редактирования — включение на сайте отдельно. */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed px-4 py-3">
          {active.themeId === editingTheme ? (
            <p className="text-sm">«{HERO_THEME_LABELS[editingTheme]}» сейчас <strong>показывается на главной</strong>.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Вы редактируете «{HERO_THEME_LABELS[editingTheme]}», а на главной сейчас «{HERO_THEME_LABELS[active.themeId]}».
                {editingTheme !== 'default' && !isHeroThemeReady(value, editingTheme) && ' Чтобы включить тему, загрузите для неё изображение или выберите сцену.'}
              </p>
              <Button
                type="button"
                size="sm"
                disabled={editingTheme !== 'default' && !isHeroThemeReady(value, editingTheme)}
                onClick={() => onChange({ ...value, mode: 'manual', selectedTheme: editingTheme })}
              >
                Выбрать для главной
              </Button>
            </>
          )}
        </div>
      </section>

      {/* ── 3. Содержимое и изображения выбранной темы ──────────────── */}
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <h3 className="font-semibold">{HERO_THEME_LABELS[editingTheme]} · текст</h3>
          <div className="space-y-2"><Label htmlFor="hero-eyebrow">Надпись над заголовком</Label><Input id="hero-eyebrow" value={content.eyebrow} onChange={event => updateField('eyebrow', event.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="hero-title">Заголовок</Label><Input id="hero-title" value={content.title} onChange={event => updateField('title', event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="hero-highlight">Выделенная строка (курсив)</Label><Input id="hero-highlight" value={content.highlight} onChange={event => updateField('highlight', event.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="hero-description">Описание</Label><Textarea id="hero-description" rows={3} value={content.description} onChange={event => updateField('description', event.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="hero-primary">Кнопка каталога</Label><Input id="hero-primary" value={content.primaryLabel} onChange={event => updateField('primaryLabel', event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="hero-secondary">Ссылка конструктора</Label><Input id="hero-secondary" value={content.secondaryLabel} onChange={event => updateField('secondaryLabel', event.target.value)} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="hero-signature-kicker">Подпись · строка</Label><Input id="hero-signature-kicker" value={content.signatureKicker} placeholder="Sezónní inspirace" onChange={event => updateField('signatureKicker', event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="hero-signature-title">Подпись · название</Label><Input id="hero-signature-title" value={content.signatureTitle} placeholder="Podzimní harmonie" onChange={event => updateField('signatureTitle', event.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-closing">Финальная фраза внизу главной</Label>
            <Input id="hero-closing" value={content.closingLine} placeholder="Podzim / v každé / kytici" onChange={event => updateField('closingLine', event.target.value)} />
            <p className="text-xs text-muted-foreground">Строки через «/». Вторая строка выводится курсивом в цвете темы.</p>
          </div>
          <div className="space-y-2"><Label htmlFor="hero-alt">Описание изображения (alt)</Label><Input id="hero-alt" value={content.imageAlt} onChange={event => updateField('imageAlt', event.target.value)} /></div>
          <Button type="button" variant="ghost" size="sm" onClick={resetText}>Вернуть стандартный текст и вид</Button>
        </div>

        <div className="min-w-0 space-y-5">
          <div className="space-y-3">
            <h3 className="font-semibold">Оформление справа от текста</h3>
            <div className="inline-flex rounded-md border bg-muted/40 p-1 text-sm">
              <button type="button" aria-pressed={!scene} onClick={() => updateField('artMode', 'image')} className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 ${!scene ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}><ImageIcon className="h-4 w-4" />Картинка</button>
              <button type="button" aria-pressed={Boolean(scene)} onClick={() => updateField('artMode', 'scene')} className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 ${scene ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}><Sparkles className="h-4 w-4" />Живая сцена</button>
            </div>
          </div>
          {scene ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Сцена собрана из отдельных цветов, листьев и декора: каждый цветок отталкивается от курсора или пальца, при наведении на кнопку по сцене проходит волна. Картинки уже встроены в сайт — загружать ничего не нужно.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {HERO_SCENE_IDS.map(id => (
                  <button key={id} type="button" aria-pressed={content.scene === id} onClick={() => updateField('scene', id)} className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${content.scene === id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <span className="block font-medium">{HERO_SCENES[id].label}</span>
                    <span className="block text-xs text-muted-foreground">{HERO_SCENES[id].hint}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">«Подпись · строка» и «Подпись · название» выводятся под кнопками, например «Halloween edition» и «31. října · Kvitko Sweet».</p>
            </div>
          ) : (
          <>
          <p className="text-xs text-muted-foreground">Одна картинка на все экраны. Лучше всего — букет на прозрачном фоне (PNG/WebP), как в осеннем примере. Сохраняется сразу при загрузке.</p>
          <div className="max-w-sm">
            <ImageSlot
              label="Картинка темы"
              hint="От 1200 px по высоте"
              image={themeImage}
              busy={uploadingSlot !== null}
              onUpload={file => onUpload(editingTheme, 'desktopImage', file)}
              onRemove={() => onRemove(editingTheme, content.desktopImage ? 'desktopImage' : 'mobileImage')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hero-fit">Размещение</Label>
              <select id="hero-fit" value={content.imageFit} onChange={event => updateField('imageFit', event.target.value as 'cover' | 'contain')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="contain">Букет целиком (прозрачный фон)</option>
                <option value="cover">Фото на всю область</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
              <div>
                <Label htmlFor="hero-decor">Декор</Label>
                <p className="text-xs text-muted-foreground">Свечение, арка, подпись, наклон</p>
              </div>
              <Switch id="hero-decor" checked={content.decorations} disabled={content.imageFit === 'cover'} onCheckedChange={checked => updateField('decorations', checked)} />
            </div>
          </div>
          <div className="space-y-3 rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Пропорция области</p>
                <p className="text-xs text-muted-foreground">«Авто» — ширина колонки и высота по экрану, как раньше.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={fitRatioToImage}>По изображению</Button>
            </div>
            <select id="hero-ratio" aria-label="Пропорция области" value={content.imageRatio} onChange={event => updateField('imageRatio', event.target.value as HeroImageRatio)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {HERO_RATIO_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {ratioHint && <p className="text-xs text-muted-foreground">{ratioHint}</p>}
            {content.imageFit === 'cover' && <p className="text-xs text-muted-foreground">В режиме «Фото на всю область» картинка обрежется по краям, если её пропорция отличается от выбранной.</p>}
          </div>
          {editingTheme === 'default' && legacyImages.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Ранее загруженные изображения</p>
              <div className="flex flex-wrap gap-2">
                {legacyImages.map((url, index) => (
                  <button key={`${url}-${index}`} type="button" title="Использовать как desktop изображение" onClick={() => updateField('desktopImage', url)} className="h-16 w-20 overflow-hidden rounded border hover:border-primary focus-visible:outline-primary">
                    <img src={url} alt={`Ранее загруженное ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </section>

      {/* ── 4. Предпросмотр: те же стили и компонент букета, что на сайте ── */}
      <section className="space-y-3 border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Предпросмотр · {HERO_THEME_LABELS[editingTheme]}</h3>
          <div className="flex flex-wrap items-center gap-3">
          <a href={`/?${THEME_PREVIEW_PARAM}=${editingTheme}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <ExternalLink className="h-4 w-4" />Открыть на сайте
          </a>
          <div className="inline-flex rounded-md border bg-muted/40 p-1 text-sm">
            <button type="button" aria-pressed={previewDevice === 'desktop'} onClick={() => setPreviewDevice('desktop')} className={`rounded px-3 py-1 ${previewDevice === 'desktop' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Desktop</button>
            <button type="button" aria-pressed={previewDevice === 'mobile'} onClick={() => setPreviewDevice('mobile')} className={`rounded px-3 py-1 ${previewDevice === 'mobile' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Mobile</button>
          </div>
          </div>
        </div>
        {scene ? (
          <ScenePreview themeId={editingTheme} content={content} scene={scene} device={previewDevice} />
        ) : (
        <div
          data-theme-palette={editingTheme}
          className={`hero-theme ${editingTheme === 'default' ? 'mesh-gradient' : ''} ${previewDevice === 'mobile' ? 'max-w-[380px]' : ''} overflow-hidden rounded-md border`}
        >
          <div className={`grid items-center gap-4 p-6 sm:p-8 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            <div className="min-w-0 space-y-4">
              <p className="hero-eyebrow">{content.eyebrow}</p>
              <p className="text-3xl font-bold leading-tight">
                {content.title}
                <span className="block font-serif italic font-normal" style={{ color: 'var(--theme-accent)' }}>{content.highlight}</span>
              </p>
              <p className="text-sm text-muted-foreground">{content.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-block rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground">{content.primaryLabel}</span>
                <span className="text-xs text-muted-foreground underline underline-offset-4">{content.secondaryLabel}</span>
              </div>
            </div>
            <HeroArt
              desktopImage={previewImage}
              alt={content.imageAlt}
              fit={content.imageFit}
              decorations={content.decorations}
              signatureKicker={content.signatureKicker}
              signatureTitle={content.signatureTitle}
              ratio={heroRatio(content)}
              preview={{ device: previewDevice, height: previewDevice === 'mobile' ? 300 : 360 }}
            />
          </div>
        </div>
        )}
        <p className="text-xs text-muted-foreground">«Открыть на сайте» показывает <strong>сохранённую</strong> версию темы в новой вкладке — посетители её не видят.</p>
        {!isHeroThemeReady(value, editingTheme) && editingTheme !== 'default' && (
          <p className="text-xs text-muted-foreground">Пока показана запасная картинка. Тема попадёт на главную, когда у неё будет изображение.</p>
        )}
      </section>
    </div>
  );
}

/** Предпросмотр темы со сценой: на компьютере текст поверх сцены, на телефоне — над ней. */
function ScenePreview({ themeId, content, scene, device }: {
  themeId: HeroThemeId;
  content: HeroThemeContent;
  scene: HeroSceneId;
  device: 'desktop' | 'mobile';
}) {
  const copy = (
    <div className="space-y-3">
      <p className="hero-eyebrow">{content.eyebrow}</p>
      <p className="font-serif text-3xl leading-[1.02] text-foreground">
        {content.title}
        <span className="block italic" style={{ color: 'var(--theme-accent)' }}>{content.highlight}</span>
      </p>
      {content.description?.trim() && <p className="text-xs text-muted-foreground">{content.description}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-block rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">{content.primaryLabel}</span>
        <span className="text-xs text-muted-foreground underline underline-offset-4">{content.secondaryLabel}</span>
      </div>
      {(content.signatureKicker?.trim() || content.signatureTitle?.trim()) && (
        <p className="hero-scene-caption !text-[11px]">
          {content.signatureKicker?.trim() && <span className="hero-scene-kicker !text-[9px]">{content.signatureKicker}</span>}
          {content.signatureTitle}
        </p>
      )}
    </div>
  );
  const sceneEl = (
    <Suspense fallback={null}>
      <HeroScene scene={scene} />
    </Suspense>
  );
  const ratio = sceneRatio(scene);

  if (device === 'mobile') {
    return (
      <div data-theme-palette={themeId} className="hero-theme hero-theme--scene max-w-[380px] overflow-hidden rounded-md border">
        <div className="p-6 pb-2">{copy}</div>
        <div className="relative mt-4" style={{ aspectRatio: String(ratio) }}>
          {sceneEl}
        </div>
      </div>
    );
  }
  return (
    <div data-theme-palette={themeId} className="hero-theme hero-theme--scene relative aspect-[16/9] overflow-hidden rounded-md border">
      {/* Сцена целиком у правого нижнего угла, как на сайте. */}
      <div className="absolute bottom-0 right-0 h-full" style={{ aspectRatio: String(ratio) }}>{sceneEl}</div>
      <div className="pointer-events-none absolute inset-y-0 left-[4%] z-10 flex w-[34%] items-center">{copy}</div>
    </div>
  );
}
