import { describe, expect, it } from "vitest";
import { chunkText } from "../src/repo/chunk.js";

describe("chunkText", () => {
  it("returns [] for empty text", () => {
    expect(chunkText("")).toEqual([]);
  });

  it("returns a single chunk when text is shorter than chunkSize", () => {
    const result = chunkText("hello world", 800, 100);
    expect(result).toEqual(["hello world"]);
  });

  it("splits long text into overlapping windows", () => {
    const text = "a".repeat(1000);
    const result = chunkText(text, 300, 50);
    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(300);
    }
    // Reconstructing from stride-sized non-overlapping slices should cover the whole text.
    const stride = 300 - 50;
    expect(result[1]!.slice(0, 50)).toBe(result[0]!.slice(stride));
  });

  it("does not infinite-loop when overlap >= chunkSize", () => {
    const text = "b".repeat(500);
    const result = chunkText(text, 100, 100);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(1000);
  });

  it("skips empty/whitespace-only chunks", () => {
    const result = chunkText("   ", 800, 100);
    expect(result).toEqual([]);
  });
});
