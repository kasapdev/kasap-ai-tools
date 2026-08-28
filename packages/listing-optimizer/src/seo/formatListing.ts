import type { PlatformSpec } from "./platforms.js";
import type { ListingOptimization } from "./schema.js";

export function formatListing(listing: ListingOptimization, spec: PlatformSpec): string {
  const lines: string[] = [
    `# ${listing.title}`,
    `(${listing.title.length}/${spec.titleMaxLength} karakter - ${spec.displayName})`,
    "",
    listing.description,
    "",
    "## Öne Çıkan Özellikler",
    ...listing.bulletPoints.map((point) => `- ${point}`),
    "",
    `## Anahtar Kelimeler`,
    listing.keywords.join(", "),
  ];

  if (listing.suggestedCategory) {
    lines.push("", `## Önerilen Kategori`, listing.suggestedCategory);
  }

  return lines.join("\n");
}
