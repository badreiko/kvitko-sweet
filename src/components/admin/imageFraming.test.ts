import { describe, it, expect } from "vitest";
import { visibleWindow, fitZoom, framingFromWindow, resizeWindow } from "./FocalPointPicker";
import { findPaletteColor, colorSwatchCss } from "./FlowerColorField";

const center = { x: 0.5, y: 0.5 };

describe("visibleWindow", () => {
  it("квадратное фото в квадратном окне видно целиком", () => {
    expect(visibleWindow(1, 1, center, 1)).toEqual({ left: 0, top: 0, width: 1, height: 1 });
  });

  it("уменьшение (zoom 0.5) — окно вдвое больше фото, по краям поля", () => {
    const w = visibleWindow(1, 1, center, 0.5);
    expect(w.width).toBe(2);
    expect(w.left).toBe(-0.5);
  });

  it("горизонтальное фото в квадрате обрезается по бокам и сдвигается точкой фокуса", () => {
    const left = visibleWindow(2, 1, { x: 0, y: 0.5 }, 1);
    expect(left).toMatchObject({ left: 0, width: 0.5, height: 1 });
    const right = visibleWindow(2, 1, { x: 1, y: 0.5 }, 1);
    expect(right.left).toBeCloseTo(0.5);
  });
});

describe("fitZoom", () => {
  it("масштаб, при котором фото целиком помещается в окно", () => {
    expect(fitZoom(1, 1)).toBe(1);
    expect(fitZoom(2, 1)).toBe(0.5);
    expect(fitZoom(1, 4 / 5)).toBeCloseTo(0.8);
  });
});

describe("палитра цветов", () => {
  it("узнаёт сохранённые названия на разных языках", () => {
    expect(findPaletteColor("Розовый")?.name).toBe("Růžová");
    expect(findPaletteColor(" růžová ")?.name).toBe("Růžová");
    expect(findPaletteColor("Meruňková")).toBeUndefined();
  });

  it("свой оттенок важнее образца палитры", () => {
    expect(colorSwatchCss("Růžová", "#ff0000")).toBe("#ff0000");
    expect(colorSwatchCss("Růžová")).toBe("#EE8FB0");
    expect(colorSwatchCss("Meruňková")).toBeUndefined();
  });
});

describe("рамка кадрирования: перетаскивание и размер", () => {
  it("framingFromWindow — обратная к visibleWindow", () => {
    const focal = { x: 0.3, y: 0.7 };
    const win = visibleWindow(1.83, 1, focal, 1.4);
    const back = framingFromWindow(1.83, 1, win, { x: 0.5, y: 0.5 });
    expect(back.zoom).toBeCloseTo(1.4);
    expect(back.focal.x).toBeCloseTo(0.3);
    expect(back.focal.y).toBeCloseTo(0.7);
  });

  it("сдвиг рамки за край фото упирается в край", () => {
    // широкое фото в квадратном окне: рамка 1,83 раза уже фото
    const win = visibleWindow(1.83, 1, { x: 0.5, y: 0.5 }, 1);
    const moved = framingFromWindow(1.83, 1, { ...win, left: win.left + 5 }, { x: 0.5, y: 0.5 });
    expect(moved.focal.x).toBe(1);
  });

  it("если рамка по оси равна фото, положение по этой оси не меняется", () => {
    const win = visibleWindow(1.83, 1, { x: 0.5, y: 0.2 }, 1); // по высоте рамка = фото
    const back = framingFromWindow(1.83, 1, win, { x: 0.5, y: 0.2 });
    expect(back.focal.y).toBe(0.2);
  });

  it("угол тянется, противоположный угол стоит на месте", () => {
    const start = { left: 0.2, top: 0, width: 0.5, height: 1 };
    const r = resizeWindow(start, "nw", { x: 0.4, y: 0.4 }); // тянем левый верхний внутрь
    expect(r.left + r.width).toBeCloseTo(0.7);
    expect(r.top + r.width * 2).toBeCloseTo(1);
    expect(r.width).toBeCloseTo(0.3);
  });

  it("размер ограничен масштабом 50–200%", () => {
    const tiny = framingFromWindow(1, 1, { left: 0.45, top: 0.45, width: 0.01 }, { x: 0.5, y: 0.5 });
    expect(tiny.zoom).toBe(2);
    const huge = framingFromWindow(1, 1, { left: -2, top: -2, width: 5 }, { x: 0.5, y: 0.5 });
    expect(huge.zoom).toBe(0.5);
  });
});
