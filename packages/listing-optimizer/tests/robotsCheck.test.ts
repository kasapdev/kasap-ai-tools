import { describe, expect, it } from "vitest";
import { isPathAllowed } from "../src/scraping/robotsCheck.js";

describe("isPathAllowed", () => {
  it("allows everything when robots.txt is empty", () => {
    expect(isPathAllowed("", "KasapBot", "/urun/123").allowed).toBe(true);
  });

  it("disallows a path matched under the wildcard user-agent group", () => {
    const robots = ["User-agent: *", "Disallow: /admin", "Disallow: /search"].join("\n");
    expect(isPathAllowed(robots, "KasapBot", "/admin/panel").allowed).toBe(false);
    expect(isPathAllowed(robots, "KasapBot", "/urun/123").allowed).toBe(true);
  });

  it("prefers a more specific Allow rule over a shorter Disallow", () => {
    const robots = ["User-agent: *", "Disallow: /urun", "Allow: /urun/public"].join("\n");
    expect(isPathAllowed(robots, "KasapBot", "/urun/private").allowed).toBe(false);
    expect(isPathAllowed(robots, "KasapBot", "/urun/public/123").allowed).toBe(true);
  });

  it("uses the user-agent-specific group over the wildcard when both exist", () => {
    const robots = [
      "User-agent: KasapBot",
      "Disallow: /only-blocks-kasapbot",
      "",
      "User-agent: *",
      "Disallow: /",
    ].join("\n");

    // KasapBot's own group has no rule for /urun, so it's allowed even
    // though the wildcard group blocks everything.
    expect(isPathAllowed(robots, "KasapBot", "/urun/123").allowed).toBe(true);
    expect(isPathAllowed(robots, "KasapBot", "/only-blocks-kasapbot").allowed).toBe(false);
    expect(isPathAllowed(robots, "OtherBot", "/urun/123").allowed).toBe(false);
  });

  it("supports $ end-anchored patterns", () => {
    const robots = ["User-agent: *", "Disallow: /urun/*.pdf$"].join("\n");
    expect(isPathAllowed(robots, "KasapBot", "/urun/kilavuz.pdf").allowed).toBe(false);
    expect(isPathAllowed(robots, "KasapBot", "/urun/kilavuz.pdf.html").allowed).toBe(true);
  });
});
