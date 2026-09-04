import { describe, expect, it } from "vitest";
import { extractLeadingCommentsFromSource } from "../src/repo/extractComments.js";

describe("extractLeadingCommentsFromSource", () => {
  it("extracts a leading JSDoc-style block comment", () => {
    const source = `/**\n * This module does X.\n * It also does Y.\n */\nexport function foo() {}`;
    const result = extractLeadingCommentsFromSource(source);
    expect(result).toContain("This module does X.");
    expect(result).toContain("It also does Y.");
  });

  it("extracts a leading run of // comments", () => {
    const source = `// This file does X\n// and Y\nconst z = 1;`;
    const result = extractLeadingCommentsFromSource(source);
    expect(result).toBe("This file does X\nand Y");
  });

  it("returns empty string when there is no leading comment", () => {
    const source = `const z = 1;\n// a trailing comment`;
    expect(extractLeadingCommentsFromSource(source)).toBe("");
  });

  it("returns empty string for an empty file", () => {
    expect(extractLeadingCommentsFromSource("")).toBe("");
  });
});
