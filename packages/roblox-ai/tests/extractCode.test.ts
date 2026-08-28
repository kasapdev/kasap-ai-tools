import { describe, expect, it } from "vitest";
import { extractCodeBlock } from "../src/codegen/extractCode.js";

describe("extractCodeBlock", () => {
  it("extracts a single fenced code block", () => {
    const markdown = [
      "İşte kod:",
      "",
      "```lua",
      "local function greet()",
      "  print('hello')",
      "end",
      "```",
    ].join("\n");

    expect(extractCodeBlock(markdown)).toBe("local function greet()\n  print('hello')\nend");
  });

  it("picks the longest block when there are several", () => {
    const markdown = [
      "Kısa örnek:",
      "```lua",
      "print('short')",
      "```",
      "Asıl dosya:",
      "```lua",
      "local M = {}",
      "function M.init()",
      "  print('longer block')",
      "end",
      "return M",
      "```",
    ].join("\n");

    const result = extractCodeBlock(markdown);
    expect(result).toContain("return M");
    expect(result).not.toContain("short");
  });

  it("falls back to the raw trimmed text when there is no fenced block", () => {
    expect(extractCodeBlock("  sadece düz metin  \n")).toBe("sadece düz metin");
  });
});
