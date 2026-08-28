import { describe, expect, it } from "vitest";
import { compareToCompetitors, parsePriceText } from "../src/pricing/comparePrices.js";

describe("parsePriceText", () => {
  it("parses Turkish-format prices (dot thousands, comma decimal)", () => {
    expect(parsePriceText("₺1.234,90")).toBeCloseTo(1234.9, 5);
    expect(parsePriceText("299,00 TL")).toBeCloseTo(299, 5);
  });

  it("parses US-format prices (comma thousands, dot decimal)", () => {
    expect(parsePriceText("$1,234.90")).toBeCloseTo(1234.9, 5);
    expect(parsePriceText("$19.99")).toBeCloseTo(19.99, 5);
  });

  it("returns null for text with no digits", () => {
    expect(parsePriceText("Stokta yok")).toBeNull();
  });
});

describe("compareToCompetitors", () => {
  it("flags the cheapest position", () => {
    const result = compareToCompetitors(100, [150, 200, 180]);
    expect(result.position).toBe("en_ucuz");
  });

  it("flags the most expensive position", () => {
    const result = compareToCompetitors(250, [150, 200, 180]);
    expect(result.position).toBe("en_pahali");
  });

  it("flags below/above average correctly for a mid-range price", () => {
    const below = compareToCompetitors(160, [100, 200, 300]); // avg = 200
    expect(below.position).toBe("ortalama_alti");

    const above = compareToCompetitors(250, [100, 200, 300]); // avg = 200
    expect(above.position).toBe("ortalama_ustu");
  });

  it("handles no valid competitor prices gracefully", () => {
    const result = compareToCompetitors(100, []);
    expect(result.position).toBe("tek_veri");
  });

  it("rejects a non-positive own price", () => {
    expect(() => compareToCompetitors(0, [10])).toThrow();
    expect(() => compareToCompetitors(-5, [10])).toThrow();
  });
});
