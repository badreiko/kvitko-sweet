import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("превращает строку с пробелами в дефисы", () => {
    expect(slugify("Krásná kytice")).toBe("krasna-kytice");
  });

  it("транслитерирует чешские диакритики", () => {
    expect(slugify("růžová květina")).toBe("ruzova-kvetina");
  });

  it("убирает повторяющиеся дефисы", () => {
    expect(slugify("a  --  b")).toBe("a-b");
  });

  it("обрезает дефисы по краям", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("приводит к нижнему регистру", () => {
    expect(slugify("UPPERCASE")).toBe("uppercase");
  });

  it("работает с пустой строкой", () => {
    expect(slugify("")).toBe("");
  });
});
