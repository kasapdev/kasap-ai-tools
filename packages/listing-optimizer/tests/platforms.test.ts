import { describe, expect, it } from "vitest";
import { enforceTitleLength, PLATFORM_SPECS } from "../src/seo/platforms.js";

describe("enforceTitleLength", () => {
  it("leaves a title under the limit untouched", () => {
    expect(enforceTitleLength("Kısa başlık", "trendyol")).toBe("Kısa başlık");
  });

  it("truncates eBay's 80-character title on a word boundary", () => {
    const longTitle =
      "Brand New Wireless Bluetooth Headphones Noise Cancelling Over Ear Studio Monitor Extra Long Title";
    const result = enforceTitleLength(longTitle, "ebay");

    expect(result.length).toBeLessThanOrEqual(PLATFORM_SPECS.ebay.titleMaxLength);
    expect(result.endsWith(" ")).toBe(false);
    expect(longTitle.startsWith(result)).toBe(true);
  });

  it("hard-truncates when there's no reasonable word boundary", () => {
    const noSpaces = "a".repeat(200);
    const result = enforceTitleLength(noSpaces, "ebay");
    expect(result.length).toBe(PLATFORM_SPECS.ebay.titleMaxLength);
  });
});
