import { describe, expect, it } from "vitest";
import { formatUnifiedDiff } from "../src/diff/formatDiff.js";

describe("formatUnifiedDiff", () => {
  it("renders add/remove/equal lines with the right prefixes", () => {
    const text = formatUnifiedDiff([
      { type: "equal", line: "a" },
      { type: "remove", line: "b" },
      { type: "add", line: "x" },
    ]);
    const lines = text.split("\n");
    expect(lines).toEqual(["  a", "- b", "+ x"]);
  });

  it("returns an empty string for no ops", () => {
    expect(formatUnifiedDiff([])).toBe("");
  });
});
