import type { PricingTable } from "../pricing/loadPricing.js";
import type { UsageRecord } from "../usage/parseUsageLog.js";

export interface RecordCost {
  cost: number;
  rateFound: boolean;
}

/** Computes the cost of one usage record against a pricing table. Returns
 * `rateFound: false` (and cost 0) for an unknown provider/model instead of
 * throwing - callers/aggregation surface this as a coverage gap, not a crash. */
export function computeRecordCost(record: UsageRecord, pricing: PricingTable): RecordCost {
  const rate = pricing.providers[record.provider]?.[record.model];
  if (!rate) {
    return { cost: 0, rateFound: false };
  }

  const cost =
    (record.inputTokens / 1_000_000) * rate.inputPerMillion +
    (record.outputTokens / 1_000_000) * rate.outputPerMillion;

  return { cost, rateFound: true };
}
