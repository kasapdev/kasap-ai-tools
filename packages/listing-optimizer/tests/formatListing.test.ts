import { describe, expect, it } from "vitest";
import { formatListing } from "../src/seo/formatListing.js";
import { PLATFORM_SPECS } from "../src/seo/platforms.js";
import type { ListingOptimization } from "../src/seo/schema.js";

describe("formatListing", () => {
  it("renders every section including the optional category", () => {
    const listing: ListingOptimization = {
      title: "Kablosuz Kulaklık Bluetooth 5.3",
      description: "Uzun pil ömürlü, gürültü önleyici kablosuz kulaklık.",
      bulletPoints: ["30 saat pil ömrü", "Aktif gürültü önleme"],
      keywords: ["kablosuz kulaklık", "bluetooth kulaklık"],
      suggestedCategory: "Elektronik > Kulaklık",
    };

    const output = formatListing(listing, PLATFORM_SPECS.trendyol);

    expect(output).toContain("# Kablosuz Kulaklık Bluetooth 5.3");
    expect(output).toContain(`(${listing.title.length}/100 karakter - Trendyol)`);
    expect(output).toContain("- 30 saat pil ömrü");
    expect(output).toContain("kablosuz kulaklık, bluetooth kulaklık");
    expect(output).toContain("Elektronik > Kulaklık");
  });

  it("omits the category section when not provided", () => {
    const listing: ListingOptimization = {
      title: "Test",
      description: "Açıklama",
      bulletPoints: [],
      keywords: [],
    };

    expect(formatListing(listing, PLATFORM_SPECS.ebay)).not.toContain("Önerilen Kategori");
  });
});
