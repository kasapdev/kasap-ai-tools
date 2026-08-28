import { describe, expect, it } from "vitest";
import {
  buildPriceTier,
  calculatePriceBreakdown,
  suggestPriceForTargetUsd,
} from "../src/economy/robuxCalculator.js";

describe("calculatePriceBreakdown", () => {
  it("applies the default 30% marketplace cut", () => {
    const breakdown = calculatePriceBreakdown(100);
    expect(breakdown.marketplaceCutRobux).toBe(30);
    expect(breakdown.developerShareRobux).toBe(70);
    expect(breakdown.developerShareUsdViaDevEx).toBeCloseTo(70 * 0.0035, 5);
  });

  it("respects a custom config", () => {
    const breakdown = calculatePriceBreakdown(200, {
      marketplaceCutPercent: 50,
      devExRatePerRobux: 0.01,
    });
    expect(breakdown.marketplaceCutRobux).toBe(100);
    expect(breakdown.developerShareRobux).toBe(100);
    expect(breakdown.developerShareUsdViaDevEx).toBeCloseTo(1, 5);
  });

  it("rejects a non-positive price", () => {
    expect(() => calculatePriceBreakdown(0)).toThrow();
    expect(() => calculatePriceBreakdown(-5)).toThrow();
  });
});

describe("suggestPriceForTargetUsd", () => {
  it("round-trips through calculatePriceBreakdown at or above the target", () => {
    const price = suggestPriceForTargetUsd(10);
    const breakdown = calculatePriceBreakdown(price);
    expect(breakdown.developerShareUsdViaDevEx).toBeGreaterThanOrEqual(10 - 1e-9);
  });
});

describe("buildPriceTier", () => {
  it("builds an increasing ladder of the requested length", () => {
    const tiers = buildPriceTier(100, 4, 2);
    expect(tiers).toHaveLength(4);
    expect(tiers[0]).toBe(100);
    expect(tiers[1]).toBe(200);
    expect(tiers[2]).toBe(400);
    expect(tiers[3]).toBe(800);
  });

  it("rejects an invalid step count", () => {
    expect(() => buildPriceTier(100, 0)).toThrow();
  });
});
