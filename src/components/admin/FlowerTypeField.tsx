// src/components/admin/FlowerTypeField.tsx
import { useState } from "react";
import { Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

// Базовые типы цветов. Свои типы хранятся в самом цветке (поле type) как
// введённое название и попадают в список из уже сохранённых цветов.
export const PRESET_FLOWER_TYPES = [
  { value: "rose", label: "Роза" },
  { value: "tulip", label: "Тюльпан" },
  { value: "lily", label: "Лилия" },
  { value: "peony", label: "Пион" },
  { value: "sunflower", label: "Подсолнух" },
  { value: "orchid", label: "Орхидея" },
  { value: "chrysanthemum", label: "Хризантема" },
  { value: "gerbera", label: "Гербера" },
  { value: "eustoma", label: "Эустома" },
  { value: "other", label: "Другое" },
];

const CUSTOM_OPTION = "__custom__";

const key = (s: string) => s.trim().toLocaleLowerCase();

/** Название типа для отображения: метка базового типа или сам свой тип. */
export function flowerTypeLabel(type?: string): string {
  if (!type) return "";
  return PRESET_FLOWER_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Все свои типы, уже сохранённые у цветов (без базовых и без дублей по регистру). */
export function collectCustomFlowerTypes(flowers: { type?: string }[]): string[] {
  const seen = new Set(PRESET_FLOWER_TYPES.flatMap((t) => [key(t.value), key(t.label)]));
  const result: string[] = [];
  for (const { type } of flowers) {
    if (!type?.trim() || seen.has(key(type))) continue;
    seen.add(key(type));
    result.push(type.trim());
  }
  return result.sort((a, b) => a.localeCompare(b, "cs"));
}

/**
 * Приводит введённый тип к уже существующему написанию: «роза» → rose,
 * «пивоня» → «Пивоня», если такой тип уже есть. Иначе — обрезанный ввод.
 */
export function normalizeFlowerType(input: string, customTypes: string[]): string {
  const k = key(input);
  const preset = PRESET_FLOWER_TYPES.find((t) => key(t.value) === k || key(t.label) === k);
  if (preset) return preset.value;
  return customTypes.find((t) => key(t) === k) ?? input.trim();
}

interface FlowerTypeFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Свои типы из уже сохранённых цветов (collectCustomFlowerTypes). */
  customTypes: string[];
  className?: string;
}

/** Выбор типа цветка: базовые + сохранённые свои типы + ввод нового. */
export function FlowerTypeField({ id, value, onChange, customTypes, className }: FlowerTypeFieldProps) {
  const [adding, setAdding] = useState(false);

  // Текущее значение всегда есть в списке — даже если цветок с этим типом
  // ещё не сохранён (например, только что введённый свой тип).
  const options = [...customTypes];
  if (value && !PRESET_FLOWER_TYPES.some((t) => t.value === value) && !options.includes(value)) {
    options.push(value);
  }

  if (adding) {
    return (
      <div className={`flex gap-2 ${className ?? ""}`}>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(normalizeFlowerType(e.target.value, customTypes))}
          placeholder="Введите свой тип, например Pivoňka"
          autoFocus
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Выбрать из списка"
          onClick={() => {
            onChange(normalizeFlowerType(value, customTypes));
            setAdding(false);
          }}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => {
        if (v === CUSTOM_OPTION) {
          onChange("");
          setAdding(true);
        } else {
          onChange(v);
        }
      }}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Выберите тип цветка" />
      </SelectTrigger>
      <SelectContent>
        {PRESET_FLOWER_TYPES.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            {t.label}
          </SelectItem>
        ))}
        {options.length > 0 && <SelectSeparator />}
        {options.map((t) => (
          <SelectItem key={t} value={t}>
            {t}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value={CUSTOM_OPTION}>
          <span className="flex items-center gap-1.5 text-primary">
            <Plus className="h-3.5 w-3.5" />
            Свой тип…
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default FlowerTypeField;
