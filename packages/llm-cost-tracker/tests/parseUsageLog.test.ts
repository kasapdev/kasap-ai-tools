import { describe, expect, it } from "vitest";
import { parseUsageLog, parseUsageLogStrict } from "../src/usage/parseUsageLog.js";

describe("parseUsageLog", () => {
  it("parses valid lines (on-disk schema is snake_case, mapped to camelCase)", () => {
    const jsonl = [
      '{"provider":"anthropic","model":"claude-opus-5","input_tokens":100,"output_tokens":50,"timestamp":"2026-09-01T00:00:00Z"}',
      '{"provider":"openai","model":"gpt-4o","input_tokens":10,"output_tokens":5,"timestamp":"2026-09-02T00:00:00Z"}',
    ].join("\n");

    const { records, skipped } = parseUsageLog(jsonl);
    expect(records).toHaveLength(2);
    expect(skipped).toBe(0);
    expect(records[0]).toEqual({
      provider: "anthropic",
      model: "claude-opus-5",
      inputTokens: 100,
      outputTokens: 50,
      timestamp: "2026-09-01T00:00:00Z",
    });
  });

  it("skips malformed JSON and missing-field lines, counting them", () => {
    const jsonl = [
      "{not valid json",
      '{"provider":"anthropic","model":"claude-opus-5","input_tokens":100}', // missing output_tokens/timestamp
      '{"provider":"anthropic","model":"claude-opus-5","input_tokens":100,"output_tokens":50,"timestamp":"2026-09-01T00:00:00Z"}',
    ].join("\n");

    const { records, skipped } = parseUsageLog(jsonl);
    expect(records).toHaveLength(1);
    expect(skipped).toBe(2);
  });

  it("ignores blank/whitespace-only lines", () => {
    const jsonl = "\n   \n\n";
    const { records, skipped } = parseUsageLog(jsonl);
    expect(records).toHaveLength(0);
    expect(skipped).toBe(0);
  });

  it("rejects negative token counts", () => {
    const jsonl =
      '{"provider":"anthropic","model":"claude-opus-5","input_tokens":-1,"output_tokens":50,"timestamp":"2026-09-01T00:00:00Z"}';
    const { records, skipped } = parseUsageLog(jsonl);
    expect(records).toHaveLength(0);
    expect(skipped).toBe(1);
  });
});

describe("parseUsageLogStrict", () => {
  it("throws on the first malformed line", () => {
    const jsonl =
      'not valid json\n{"provider":"a","model":"b","input_tokens":1,"output_tokens":1,"timestamp":"2026-09-01T00:00:00Z"}';
    expect(() => parseUsageLogStrict(jsonl)).toThrow();
  });

  it("returns all records when every line is valid", () => {
    const jsonl =
      '{"provider":"anthropic","model":"claude-opus-5","input_tokens":1,"output_tokens":1,"timestamp":"2026-09-01T00:00:00Z"}';
    expect(parseUsageLogStrict(jsonl)).toHaveLength(1);
  });
});
