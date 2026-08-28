import { describe, expect, it } from "vitest";
import { isPricingQuestion } from "../src/knowledge/pricingBlock.js";

describe("isPricingQuestion", () => {
  it("matches common Turkish pricing questions", () => {
    expect(isPricingQuestion("paket fiyatları nedir?")).toBe(true);
    expect(isPricingQuestion("aylık ücret ne kadar?")).toBe(true);
    expect(isPricingQuestion("hangi özellikler dahil?")).toBe(true);
    expect(isPricingQuestion("Kaç TL bu paket?")).toBe(true);
  });

  it("does not match unrelated technical questions", () => {
    expect(isPricingQuestion("sitem 502 hatası veriyor")).toBe(false);
    expect(isPricingQuestion("DNS kaydı nasıl eklerim")).toBe(false);
    expect(isPricingQuestion("SSL sertifikam süresi doldu")).toBe(false);
  });
});
