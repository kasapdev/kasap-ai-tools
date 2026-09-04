import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadPricingTable } from "../src/pricing/loadPricing.js";

describe("loadPricingTable", () => {
  it("loads the real bundled pricing.json with at least one anthropic and one openai entry", () => {
    const pricing = loadPricingTable();
    expect(pricing.asOf).toBe("2026-09-04");
    expect(Object.keys(pricing.providers.anthropic ?? {}).length).toBeGreaterThan(0);
    expect(Object.keys(pricing.providers.openai ?? {}).length).toBeGreaterThan(0);
    expect(pricing.providers.anthropic?.["claude-opus-5"]).toEqual({
      inputPerMillion: 5,
      outputPerMillion: 25,
    });
  });

  it("loads a custom pricing file when a path is given", () => {
    const customPath = fileURLToPath(new URL("./fixtures/custom-pricing.json", import.meta.url));
    const pricing = loadPricingTable(customPath);
    expect(pricing.providers.anthropic?.["fake-model"]).toEqual({
      inputPerMillion: 1,
      outputPerMillion: 2,
    });
  });
});
