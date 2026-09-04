import { describe, expect, it } from "vitest";
import { computeRecordCost } from "../src/cost/computeCost.js";
import type { PricingTable } from "../src/pricing/loadPricing.js";
import type { UsageRecord } from "../src/usage/parseUsageLog.js";

const FIXTURE_PRICING: PricingTable = {
  asOf: "test",
  note: "test fixture",
  providers: {
    anthropic: {
      "claude-opus-5": { inputPerMillion: 5, outputPerMillion: 25 },
    },
  },
};

describe("computeRecordCost", () => {
  it("computes exact cost for known token counts", () => {
    const record: UsageRecord = {
      provider: "anthropic",
      model: "claude-opus-5",
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
      timestamp: "2026-09-01T00:00:00Z",
    };
    const result = computeRecordCost(record, FIXTURE_PRICING);
    expect(result.rateFound).toBe(true);
    expect(result.cost).toBeCloseTo(30, 8); // 5 (input) + 25 (output)
  });

  it("computes fractional cost correctly for partial million-token counts", () => {
    const record: UsageRecord = {
      provider: "anthropic",
      model: "claude-opus-5",
      inputTokens: 200_000,
      outputTokens: 40_000,
      timestamp: "2026-09-01T00:00:00Z",
    };
    const result = computeRecordCost(record, FIXTURE_PRICING);
    // 200000/1e6 * 5 = 1, 40000/1e6 * 25 = 1 -> total 2
    expect(result.cost).toBeCloseTo(2, 8);
  });

  it("returns rateFound false and cost 0 for an unknown provider/model", () => {
    const record: UsageRecord = {
      provider: "openai",
      model: "gpt-unknown",
      inputTokens: 100,
      outputTokens: 100,
      timestamp: "2026-09-01T00:00:00Z",
    };
    const result = computeRecordCost(record, FIXTURE_PRICING);
    expect(result.rateFound).toBe(false);
    expect(result.cost).toBe(0);
  });
});
