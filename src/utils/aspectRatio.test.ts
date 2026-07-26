import { describe, it, expect } from "vitest";
import { checkAspect, TARGET_ASPECTS } from "./aspectRatio";

describe("checkAspect", () => {
  it("принимает картинку с точным целевым соотношением", () => {
    const result = checkAspect(4 / 5, "product", "portrait");
    expect(result.ok).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it("принимает небольшое отклонение в пределах 8%", () => {
    // 4:5 = 0.8, отклонение 5% → 0.84
    const result = checkAspect(0.84, "product", "portrait");
    expect(result.ok).toBe(true);
  });

  it("отклоняет landscape для портретного target", () => {
    const result = checkAspect(16 / 9, "product", "landscape");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("4:5");
    expect(result.message).toContain("16:9");
  });

  it("отклоняет портрет для квадратного target", () => {
    const result = checkAspect(3 / 4, "category", "portrait");
    expect(result.ok).toBe(false);
  });

  it("возвращает локализованное сообщение по-русски", () => {
    const result = checkAspect(16 / 9, "product", "landscape");
    expect(result.message).toMatch(/Рекомендуемое|соотношение/);
  });

  it("покрывает все известные target'ы", () => {
    for (const key of Object.keys(TARGET_ASPECTS)) {
      const spec = TARGET_ASPECTS[key];
      const result = checkAspect(spec.ratio, key, spec.orientation);
      expect(result.ok, `${key} должен пройти на целевом соотношении`).toBe(true);
    }
  });
});
