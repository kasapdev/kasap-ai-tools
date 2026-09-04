import { describe, expect, it } from "vitest";
import { colorDistance } from "../src/image/colorDistance.js";

describe("colorDistance", () => {
  it("returns 0 for identical colors", () => {
    expect(colorDistance([10, 20, 30], [10, 20, 30])).toBe(0);
  });

  it("computes Euclidean distance correctly", () => {
    expect(colorDistance([0, 0, 0], [3, 4, 0])).toBeCloseTo(5, 5);
  });

  it("is symmetric", () => {
    const a: [number, number, number] = [10, 200, 50];
    const b: [number, number, number] = [90, 30, 128];
    expect(colorDistance(a, b)).toBeCloseTo(colorDistance(b, a), 8);
  });
});
