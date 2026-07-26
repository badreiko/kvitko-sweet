import { describe, it, expect } from "vitest";
import { mergeCartItems } from "./cartMerge";

describe("mergeCartItems", () => {
  it("оставляет пустой массив пустым", () => {
    expect(mergeCartItems([])).toEqual([]);
  });

  it("сохраняет уникальные позиции без изменений", () => {
    const items = [
      { id: "a", quantity: 1, name: "Роза" },
      { id: "b", quantity: 2, name: "Тюльпан" },
    ];
    const merged = mergeCartItems(items);
    expect(merged).toHaveLength(2);
    expect(merged.find(i => i.id === "a")?.quantity).toBe(1);
    expect(merged.find(i => i.id === "b")?.quantity).toBe(2);
  });

  it("суммирует quantity для дубликатов по id", () => {
    const items = [
      { id: "rose", quantity: 1 },
      { id: "rose", quantity: 3 },
      { id: "rose", quantity: 2 },
    ];
    const merged = mergeCartItems(items);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(6);
  });

  it("корректно сливает серверную и гостевую корзины", () => {
    const server = [
      { id: "rose", quantity: 1, name: "Роза" },
      { id: "lily", quantity: 2, name: "Лилия" },
    ];
    const guest = [
      { id: "rose", quantity: 1, name: "Роза" },
      { id: "tulip", quantity: 1, name: "Тюльпан" },
    ];
    const merged = mergeCartItems([...server, ...guest]);
    expect(merged).toHaveLength(3);
    expect(merged.find(i => i.id === "rose")?.quantity).toBe(2);
    expect(merged.find(i => i.id === "lily")?.quantity).toBe(2);
    expect(merged.find(i => i.id === "tulip")?.quantity).toBe(1);
  });

  it("не мутирует исходный массив", () => {
    const items = [{ id: "a", quantity: 1 }];
    const before = JSON.stringify(items);
    mergeCartItems(items);
    expect(JSON.stringify(items)).toBe(before);
  });
});
