import { describe, expect, it } from "vitest";
import { aggregateUsage } from "../src/report/aggregate.js";
import type { PricingTable } from "../src/pricing/loadPricing.js";
import type { UsageRecord } from "../src/usage/parseUsageLog.js";

const FIXTURE_PRICING: PricingTable = {
  asOf: "test",
  note: "test fixture",
  providers: {
    anthropic: {
      "claude-opus-5": { inputPerMillion: 5, outputPerMillion: 25 },
    },
    openai: {
      "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10 },
    },
  },
};

const RECORDS: UsageRecord[] = [
  { provider: "anthropic", model: "claude-opus-5", inputTokens: 1_000_000, outputTokens: 0, timestamp: "2026-09-01T00:00:00Z" }, // $5
  { provider: "anthropic", model: "claude-opus-5", inputTokens: 0, outputTokens: 1_000_000, timestamp: "2026-09-01T12:00:00Z" }, // $25 (same day)
  { provider: "openai", model: "gpt-4o", inputTokens: 1_000_000, outputTokens: 0, timestamp: "2026-09-02T00:00:00Z" }, // $2.5
  { provider: "openai", model: "gpt-4o", inputTokens: 0, outputTokens: 1_000_000, timestamp: "2026-09-03T00:00:00Z" }, // $10
];

describe("aggregateUsage", () => {
  it("computes totals, byProvider, byModel, byDay consistently", () => {
    const report = aggregateUsage(RECORDS, FIXTURE_PRICING);

    expect(report.totalCost).toBeCloseTo(5 + 25 + 2.5 + 10, 8);
    expect(report.byProvider.anthropic).toBeCloseTo(30, 8);
    expect(report.byProvider.openai).toBeCloseTo(12.5, 8);
    expect(report.byModel["claude-opus-5"]).toBeCloseTo(30, 8);
    expect(report.byModel["gpt-4o"]).toBeCloseTo(12.5, 8);
    expect(report.byDay["2026-09-01"]).toBeCloseTo(30, 8);
    expect(report.byDay["2026-09-02"]).toBeCloseTo(2.5, 8);
    expect(report.byDay["2026-09-03"]).toBeCloseTo(10, 8);

    const providerSum = Object.values(report.byProvider).reduce((a, b) => a + b, 0);
    const modelSum = Object.values(report.byModel).reduce((a, b) => a + b, 0);
    const daySum = Object.values(report.byDay).reduce((a, b) => a + b, 0);
    expect(providerSum).toBeCloseTo(report.totalCost, 8);
    expect(modelSum).toBeCloseTo(report.totalCost, 8);
    expect(daySum).toBeCloseTo(report.totalCost, 8);

    expect(report.unpriced.count).toBe(0);
  });

  it("tracks unpriced records without including them in totals", () => {
    const records: UsageRecord[] = [
      ...RECORDS,
      { provider: "mystery", model: "x", inputTokens: 500, outputTokens: 250, timestamp: "2026-09-04T00:00:00Z" },
    ];
    const report = aggregateUsage(records, FIXTURE_PRICING);

    expect(report.totalCost).toBeCloseTo(5 + 25 + 2.5 + 10, 8);
    expect(report.unpriced.count).toBe(1);
    expect(report.unpriced.inputTokens).toBe(500);
    expect(report.unpriced.outputTokens).toBe(250);
    expect(report.byProvider.mystery).toBeUndefined();
  });

  it("returns an all-zero report for an empty record set", () => {
    const report = aggregateUsage([], FIXTURE_PRICING);
    expect(report.totalCost).toBe(0);
    expect(report.byProvider).toEqual({});
    expect(report.byModel).toEqual({});
    expect(report.byDay).toEqual({});
    expect(report.unpriced.count).toBe(0);
  });
});
