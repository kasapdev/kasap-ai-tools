import { describe, expect, it } from "vitest";
import { HostRateLimiter } from "../src/scraping/rateLimiter.js";

describe("HostRateLimiter", () => {
  it("does not delay the first request to a host", async () => {
    const limiter = new HostRateLimiter(200);
    const start = Date.now();
    await limiter.wait("example.com");
    expect(Date.now() - start).toBeLessThan(50);
  });

  it("delays a second request to the same host until the interval elapses", async () => {
    const limiter = new HostRateLimiter(150);
    await limiter.wait("example.com");

    const start = Date.now();
    await limiter.wait("example.com");
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(130); // small tolerance for timer jitter
  });

  it("tracks hosts independently", async () => {
    const limiter = new HostRateLimiter(150);
    await limiter.wait("a.example.com");

    const start = Date.now();
    await limiter.wait("b.example.com");
    expect(Date.now() - start).toBeLessThan(50);
  });
});
