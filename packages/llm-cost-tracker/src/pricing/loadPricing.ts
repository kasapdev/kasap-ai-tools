import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface ModelRate {
  inputPerMillion: number;
  outputPerMillion: number;
}

export interface PricingTable {
  asOf: string;
  note: string;
  providers: Record<string, Record<string, ModelRate>>;
}

const DEFAULT_PRICING_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../data/pricing.json",
);

/** Loads the $/token pricing table. Defaults to the bundled snapshot
 * (data/pricing.json) - see the README for the "verify before trusting"
 * caveat. Pass customPath (e.g. from --pricing) to use your own table. */
export function loadPricingTable(customPath?: string): PricingTable {
  const path = customPath ?? DEFAULT_PRICING_PATH;
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as PricingTable;
}
