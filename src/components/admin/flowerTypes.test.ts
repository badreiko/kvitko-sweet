import { describe, it, expect } from "vitest";
import {
  collectCustomFlowerTypes,
  flowerTypeLabel,
  normalizeFlowerType,
} from "./FlowerTypeField";

describe("collectCustomFlowerTypes", () => {
  it("собирает свои типы из цветов без базовых и без дублей по регистру", () => {
    const flowers = [
      { type: "rose" },
      { type: "Pivoňka" },
      { type: "pivoňka " },
      { type: "Роза" },
      { type: "Gypsophila" },
      { type: "" },
      {},
    ];
    expect(collectCustomFlowerTypes(flowers)).toEqual(["Gypsophila", "Pivoňka"]);
  });
});

describe("normalizeFlowerType", () => {
  it("приводит ввод к базовому типу по значению или метке", () => {
    expect(normalizeFlowerType(" роза ", [])).toBe("rose");
    expect(normalizeFlowerType("TULIP", [])).toBe("tulip");
  });

  it("приводит ввод к уже сохранённому написанию своего типа", () => {
    expect(normalizeFlowerType("pivoňka", ["Pivoňka"])).toBe("Pivoňka");
  });

  it("новый свой тип сохраняется как введён, без пробелов по краям", () => {
    expect(normalizeFlowerType("  Hortenzie ", ["Pivoňka"])).toBe("Hortenzie");
  });
});

describe("flowerTypeLabel", () => {
  it("показывает метку базового типа или сам свой тип", () => {
    expect(flowerTypeLabel("rose")).toBe("Роза");
    expect(flowerTypeLabel("Pivoňka")).toBe("Pivoňka");
    expect(flowerTypeLabel(undefined)).toBe("");
  });
});
