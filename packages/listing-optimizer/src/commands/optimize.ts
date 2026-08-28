import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { logInteraction } from "@kasap/core";
import { generateListing } from "../seo/generateListing.js";
import { formatListing } from "../seo/formatListing.js";
import { getPlatformSpec, type Platform } from "../seo/platforms.js";

export async function runOptimize(
  productInfo: string,
  platform: Platform,
  output?: string,
): Promise<void> {
  const listing = await generateListing(productInfo, platform);
  const formatted = formatListing(listing, getPlatformSpec(platform));

  console.log(formatted);

  logInteraction({
    project: "listing-optimizer",
    question: `[${platform}] ${productInfo}`,
    answer: formatted,
    category: `listing_${platform}`,
  });

  if (output) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, formatted, "utf8");
    console.log(`\nKaydedildi: ${output}`);
  }
}
