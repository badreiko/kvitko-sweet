// src/components/admin/FlowerColorField.tsx
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FLOWER_PALETTE, findPaletteColor } from "@/lib/flowerPalette";

export { FLOWER_PALETTE, findPaletteColor, colorSwatchCss } from "@/lib/flowerPalette";

const key = (s: string) => s.trim().toLocaleLowerCase();

interface FlowerColorFieldProps {
  id: string;
  color: string;
  colorHex?: string;
  onChange: (color: string, colorHex: string | undefined) => void;
}

/** Выбор цвета: образцы палитры + своё название и оттенок. */
export function FlowerColorField({ id, color, colorHex, onChange }: FlowerColorFieldProps) {
  const selected = findPaletteColor(color);
  const pickerHex =
    colorHex && /^#[0-9a-f]{6}$/i.test(colorHex) ? colorHex : selected?.hex ?? "#EE8FB0";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Палитра цветов">
        {FLOWER_PALETTE.map((c) => {
          const active = selected?.name === c.name;
          return (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={active}
              title={c.name}
              onClick={() => onChange(c.name, c.hex ?? undefined)}
              className={cn(
                "relative h-7 w-7 rounded-full border border-black/15 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                active && "ring-2 ring-primary ring-offset-2"
              )}
              style={{ background: c.swatch }}
            >
              {active && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-3.5 w-3.5",
                    c.hex && ["#FFFFFF", "#F3E9D2", "#F8CFDC", "#F6D04D"].includes(c.hex) ? "text-black/70" : "text-white"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Свой цвет: название + оттенок. Совпадение с палитрой подсветится выше. */}
      <div className="flex gap-2">
        <input
          type="color"
          aria-label="Свой оттенок"
          value={pickerHex}
          onChange={(e) => onChange(color, e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
        />
        <Input
          id={id}
          value={color}
          onChange={(e) => {
            const match = findPaletteColor(e.target.value);
            onChange(e.target.value, match ? match.hex ?? undefined : colorHex);
          }}
          placeholder="Выберите в палитре или впишите свой, например Meruňková"
        />
      </div>
      {selected && key(selected.name) !== key(color) && (
        <p className="text-xs text-muted-foreground">
          Похоже на «{selected.name}».{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-2"
            onClick={() => onChange(selected.name, selected.hex ?? undefined)}
          >
            Заменить на название из палитры
          </button>
        </p>
      )}
    </div>
  );
}

export default FlowerColorField;
