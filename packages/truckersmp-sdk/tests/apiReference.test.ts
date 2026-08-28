import { describe, expect, it } from "vitest";
import { API_REFERENCE, formatApiReferenceAsText } from "../src/docs/apiReference.js";

describe("API_REFERENCE", () => {
  it("has unique, non-empty ids and paths", () => {
    expect(API_REFERENCE.length).toBeGreaterThan(0);
    const ids = API_REFERENCE.map((e) => e.id);
    const paths = API_REFERENCE.map((e) => e.path);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
    for (const entry of API_REFERENCE) {
      expect(entry.summary.length).toBeGreaterThan(0);
    }
  });
});

describe("formatApiReferenceAsText", () => {
  it("includes every documented endpoint path", () => {
    const text = formatApiReferenceAsText();
    for (const entry of API_REFERENCE) {
      expect(text).toContain(entry.path);
    }
  });
});
