// src/components/admin/DepthEffectEditor.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { Info, Upload, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DepthImage } from "@/components/DepthImage";
import { DEPTH_CORRECTION_LIMITS } from "@/config/depthEffect";
import type { ProductDepthEffect } from "@/firebase/services";

/** Черновик эффекта в форме: сохранённые настройки + ещё не загруженные файлы. */
export interface DepthEffectDraft {
  settings: ProductDepthEffect;
  foregroundFile: File | null;
  backgroundFile: File | null;
}

export const emptyDepthDraft = (settings?: ProductDepthEffect): DepthEffectDraft => ({
  settings: settings ?? { enabled: false },
  foregroundFile: null,
  backgroundFile: null,
});

interface DepthEffectEditorProps {
  value: DepthEffectDraft;
  onChange: (next: DepthEffectDraft) => void;
  productName: string;
  /** Обычное фото товара — запасной вариант в предпросмотре. */
  imageUrl: string | null;
  focalPoint?: { x: number; y: number };
}

// Шахматка под слоем товара — видно прозрачность и ореолы.
const CHECKERBOARD = {
  backgroundImage: "repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "16px 16px",
};

/** objectURL для выбранного файла, освобождается при замене/размонтировании. */
function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

export function DepthEffectEditor({
  value,
  onChange,
  productName,
  imageUrl,
  focalPoint,
}: DepthEffectEditorProps) {
  const { settings } = value;
  const fgFileUrl = useObjectUrl(value.foregroundFile);
  const bgFileUrl = useObjectUrl(value.backgroundFile);
  const fgUrl = fgFileUrl ?? settings.foregroundUrl ?? null;
  const bgUrl = bgFileUrl ?? settings.backgroundUrl ?? null;

  const setSettings = (patch: Partial<ProductDepthEffect>) =>
    onChange({ ...value, settings: { ...settings, ...patch } });

  const pickFile = (layer: "foreground" | "background") => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onChange(
      layer === "foreground"
        ? { ...value, foregroundFile: file }
        : { ...value, backgroundFile: file }
    );
  };

  const removeLayer = (layer: "foreground" | "background") =>
    onChange(
      layer === "foreground"
        ? { ...value, foregroundFile: null, settings: { ...settings, foregroundUrl: undefined } }
        : { ...value, backgroundFile: null, settings: { ...settings, backgroundUrl: undefined } }
    );

  const { scale, offset } = DEPTH_CORRECTION_LIMITS;
  const fgScale = settings.fgScale ?? 1;
  const fgOffsetX = settings.fgOffsetX ?? 0;
  const fgOffsetY = settings.fgOffsetY ?? 0;
  const corrected = fgScale !== 1 || fgOffsetX !== 0 || fgOffsetY !== 0;

  const layerTile = (layer: "foreground" | "background", label: string, url: string | null) => {
    const inputId = `depth-${layer}`;
    return (
      <div className="space-y-2">
        <Label htmlFor={inputId} className="text-xs">{label}</Label>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-md border border-border"
          style={layer === "foreground" ? CHECKERBOARD : undefined}
        >
          {url ? (
            <>
              <img src={url} alt="" className="absolute inset-0 w-full h-full object-contain" />
              <Button
                variant="destructive"
                size="icon"
                type="button"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => removeLayer(layer)}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById(inputId)?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/70 text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              <Upload className="h-5 w-5" />
              Vybrat
            </button>
          )}
        </div>
        {url && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => document.getElementById(inputId)?.click()}
          >
            Nahradit
          </Button>
        )}
        <Input
          id={inputId}
          type="file"
          accept="image/png,image/webp"
          className="hidden"
          onChange={pickFile(layer)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="depthEnabled"
          checked={settings.enabled}
          onCheckedChange={(checked) => setSettings({ enabled: checked })}
        />
        <Label htmlFor="depthEnabled">Zapnout efekt hloubky</Label>
      </div>

      <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-foreground/80">
          <p>
            <span className="font-medium text-foreground">Товар без фона</span> — PNG или WebP с
            прозрачностью: лепестки, листья, стебли и упаковка целиком, без ореолов.
          </p>
          <p>
            <span className="font-medium text-foreground">Фон</span> — тот же кадр, но товар убран и
            место под ним восстановлено. Оба слоя — в одном размере и кадре с основным фото.
          </p>
          <p>Без фона можно задать цвет или градиент. Без слоя товара карточка покажет обычное фото.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {layerTile("foreground", "Produkt bez pozadí", fgUrl)}
        {layerTile("background", "Pozadí", bgUrl)}
      </div>

      <div className="space-y-2">
        <Label htmlFor="depthBgColor" className="text-xs">
          Barva pozadí (pokud není obrázek)
        </Label>
        <div className="flex gap-2">
          <input
            type="color"
            aria-label="Vybrat barvu pozadí"
            value={/^#[0-9a-f]{6}$/i.test(settings.backgroundColor ?? "") ? settings.backgroundColor : "#f5efe9"}
            onChange={(e) => setSettings({ backgroundColor: e.target.value })}
            className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
          />
          <Input
            id="depthBgColor"
            placeholder="#f5efe9 nebo linear-gradient(...)"
            value={settings.backgroundColor ?? ""}
            onChange={(e) => setSettings({ backgroundColor: e.target.value || undefined })}
          />
        </div>
      </div>

      {/* Индивидуальная коррекция слоя товара относительно фона */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Zarovnání produktu</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            disabled={!corrected}
            onClick={() => setSettings({ fgScale: undefined, fgOffsetX: undefined, fgOffsetY: undefined })}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Výchozí
          </Button>
        </div>
        {[
          { key: "fgScale" as const, label: "Měřítko", value: fgScale, limits: scale, unit: "×" },
          { key: "fgOffsetX" as const, label: "Posun X", value: fgOffsetX, limits: offset, unit: "%" },
          { key: "fgOffsetY" as const, label: "Posun Y", value: fgOffsetY, limits: offset, unit: "%" },
        ].map((s) => (
          <div key={s.key} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-mono tabular-nums">
                {s.key === "fgScale" ? s.value.toFixed(2) : s.value.toFixed(1)}
                {s.unit}
              </span>
            </div>
            <Slider
              min={s.limits.min}
              max={s.limits.max}
              step={s.limits.step}
              value={[s.value]}
              onValueChange={([v]) => setSettings({ [s.key]: v })}
              aria-label={s.label}
            />
          </div>
        ))}
      </div>

      {/* Живой предпросмотр — тот же компонент, что и в карточке на сайте */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <p className="text-sm font-medium">Náhled</p>
        <p className="text-xs text-muted-foreground -mt-1">
          Наведите курсор. В покое слои должны совпадать без видимого разделения.
        </p>
        {fgUrl ? (
          <div className="px-4 pt-5 pb-1">
            <div className="relative aspect-[4/5] rounded-t-[24px]">
              <DepthImage
                foregroundUrl={fgUrl}
                backgroundUrl={bgUrl ?? undefined}
                backgroundColor={settings.backgroundColor}
                alt={productName || "Náhled"}
                focalPoint={focalPoint}
                fgScale={fgScale}
                fgOffsetX={fgOffsetX}
                fgOffsetY={fgOffsetY}
                radius="24px 24px 0 0"
                loading="eager"
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center rounded-t-[24px] bg-destructive/10 p-4 text-center text-xs text-destructive">
                    Слой не загрузился — на сайте будет показано обычное фото.
                    {imageUrl ? null : " Основное фото тоже не задано."}
                  </div>
                }
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground rounded-md border border-dashed p-3 text-center">
            Загрузите слой товара, чтобы увидеть эффект.
          </p>
        )}
        {settings.enabled && !fgUrl && (
          <p className="text-xs text-amber-700">
            Эффект включён, но слой товара не загружен — карточка покажет обычное фото.
          </p>
        )}
      </div>
    </div>
  );
}

export default DepthEffectEditor;
