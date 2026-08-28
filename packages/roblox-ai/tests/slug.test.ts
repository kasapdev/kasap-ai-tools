import { describe, expect, it } from "vitest";
import { slugify } from "../src/utils/slug.js";

describe("slugify", () => {
  it("lowercases and hyphenates Turkish text", () => {
    expect(slugify("Silah Sistemi Ekle")).toBe("silah-sistemi-ekle");
  });

  it("transliterates Turkish-specific characters", () => {
    expect(slugify("Envanter Ağırlığı Güncelle")).toBe("envanter-agirligi-guncelle");
    expect(slugify("İstemci Doğrulama")).toBe("istemci-dogrulama");
  });

  it("falls back to a default for empty/symbol-only input", () => {
    expect(slugify("!!!")).toBe("generated");
    expect(slugify("")).toBe("generated");
  });
});
