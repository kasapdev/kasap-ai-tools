export interface UsageRecord {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: string;
}

export interface ParseUsageLogResult {
  records: UsageRecord[];
  skipped: number;
}

/** Log lines use the on-disk JSONL schema (snake_case: input_tokens/output_tokens,
 * matching how usage records are conventionally appended by scripts/SDKs) and are
 * mapped here to the camelCase UsageRecord shape used internally. */
function parseRecord(value: unknown): UsageRecord | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const inputTokens = record.input_tokens;
  const outputTokens = record.output_tokens;
  const valid =
    typeof record.provider === "string" &&
    record.provider.length > 0 &&
    typeof record.model === "string" &&
    record.model.length > 0 &&
    typeof inputTokens === "number" &&
    Number.isFinite(inputTokens) &&
    inputTokens >= 0 &&
    typeof outputTokens === "number" &&
    Number.isFinite(outputTokens) &&
    outputTokens >= 0 &&
    typeof record.timestamp === "string" &&
    record.timestamp.length > 0;

  if (!valid) return null;
  return {
    provider: record.provider as string,
    model: record.model as string,
    inputTokens: inputTokens as number,
    outputTokens: outputTokens as number,
    timestamp: record.timestamp as string,
  };
}

/** Parses a JSONL usage log (one UsageRecord per line). Lenient by design -
 * this ingests an append-only log a human/script wrote; a malformed or
 * incomplete line is skipped (counted in `skipped`), not fatal. */
export function parseUsageLog(jsonlContent: string): ParseUsageLogResult {
  const records: UsageRecord[] = [];
  let skipped = 0;

  for (const line of jsonlContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      skipped++;
      continue;
    }

    const record = parseRecord(parsed);
    if (record) {
      records.push(record);
    } else {
      skipped++;
    }
  }

  return { records, skipped };
}

/** Strict variant - throws on the first malformed/invalid line instead of
 * skipping it. Useful for validating a log before ingesting it elsewhere. */
export function parseUsageLogStrict(jsonlContent: string): UsageRecord[] {
  const records: UsageRecord[] = [];
  const lines = jsonlContent.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim();
    if (trimmed.length === 0) continue;

    const parsed: unknown = JSON.parse(trimmed);
    const record = parseRecord(parsed);
    if (!record) {
      throw new Error(`Geçersiz kullanım kaydı (satır ${i + 1}): ${trimmed}`);
    }
    records.push(record);
  }

  return records;
}
