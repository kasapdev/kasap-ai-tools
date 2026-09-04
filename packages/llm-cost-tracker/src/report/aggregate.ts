import { computeRecordCost } from "../cost/computeCost.js";
import type { PricingTable } from "../pricing/loadPricing.js";
import type { UsageRecord } from "../usage/parseUsageLog.js";

export interface AggregateReport {
  totalCost: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  byDay: Record<string, number>;
  unpriced: { count: number; inputTokens: number; outputTokens: number };
}

function dayKey(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Geçersiz zaman damgası (ISO 8601 bekleniyor): "${timestamp}"`);
  }
  return date.toISOString().slice(0, 10);
}

function addTo(bucket: Record<string, number>, key: string, amount: number): void {
  bucket[key] = (bucket[key] ?? 0) + amount;
}

/** Real aggregation math over a set of usage records: total cost plus
 * breakdowns by provider, model, and UTC calendar day. Records with no
 * matching pricing row still count toward `unpriced` so the report is honest
 * about coverage gaps instead of silently omitting them. */
export function aggregateUsage(records: UsageRecord[], pricing: PricingTable): AggregateReport {
  const report: AggregateReport = {
    totalCost: 0,
    byProvider: {},
    byModel: {},
    byDay: {},
    unpriced: { count: 0, inputTokens: 0, outputTokens: 0 },
  };

  for (const record of records) {
    const { cost, rateFound } = computeRecordCost(record, pricing);

    if (!rateFound) {
      report.unpriced.count++;
      report.unpriced.inputTokens += record.inputTokens;
      report.unpriced.outputTokens += record.outputTokens;
      continue;
    }

    report.totalCost += cost;
    addTo(report.byProvider, record.provider, cost);
    addTo(report.byModel, record.model, cost);
    addTo(report.byDay, dayKey(record.timestamp), cost);
  }

  return report;
}
