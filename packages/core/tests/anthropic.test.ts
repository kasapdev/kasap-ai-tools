import { describe, expect, it } from "vitest";
import { getAnthropicClient } from "../src/anthropic/client.js";
import { getCoreConfig } from "../src/config.js";

describe("getAnthropicClient", () => {
  it("returns a singleton instance", () => {
    const a = getAnthropicClient();
    const b = getAnthropicClient();
    expect(a).toBe(b);
  });
});

describe("getCoreConfig", () => {
  it("falls back to sane defaults when env vars are unset", () => {
    const config = getCoreConfig();
    expect(config.anthropicModel).toBe("claude-opus-5");
    expect(config.ragEnabled).toBe(false);
  });

  it("reflects RAG_ENABLED from the environment", () => {
    process.env.RAG_ENABLED = "true";
    expect(getCoreConfig().ragEnabled).toBe(true);
    delete process.env.RAG_ENABLED;
  });
});
