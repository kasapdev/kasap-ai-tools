#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { Command } from "commander";
import { parseUsageLog } from "./usage/parseUsageLog.js";
import { loadPricingTable } from "./pricing/loadPricing.js";
import { aggregateUsage } from "./report/aggregate.js";
import { withErrorHandling } from "./utils/cli.js";

const program = new Command();

program
  .name("llm-cost-tracker")
  .description("JSONL kullanım loglarından LLM API maliyetini hesaplar (yerel, dahili fiyat tablosu ile)")
  .version("0.1.0");

program
  .command("report <logDosyasi>")
  .description("Bir kullanım log dosyasından maliyet raporu üretir")
  .option("--json", "Sonucu JSON olarak yazdır", false)
  .option("--pricing <dosya>", "Özel fiyat tablosu dosyası")
  .action(
    withErrorHandling(async (logPath: string, opts: { json: boolean; pricing?: string }) => {
      const content = readFileSync(logPath, "utf8");
      const { records, skipped } = parseUsageLog(content);

      if (skipped > 0) {
        console.error(`${skipped} satır ayrıştırılamadı, atlandı.`);
      }

      const pricing = loadPricingTable(opts.pricing);
      const report = aggregateUsage(records, pricing);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log(`Toplam maliyet: $${report.totalCost.toFixed(4)}`);
      if (report.unpriced.count > 0) {
        console.log(
          `Uyarı: ${report.unpriced.count} kayıt için fiyat tablosunda eşleşme bulunamadı, toplama dahil edilmedi.`,
        );
      }

      console.log("\nSağlayıcıya göre:");
      for (const [provider, cost] of Object.entries(report.byProvider)) {
        console.log(`  ${provider}: $${cost.toFixed(4)}`);
      }

      console.log("\nModele göre:");
      for (const [model, cost] of Object.entries(report.byModel)) {
        console.log(`  ${model}: $${cost.toFixed(4)}`);
      }

      console.log("\nGüne göre:");
      for (const [date, cost] of Object.entries(report.byDay).sort(([a], [b]) => a.localeCompare(b))) {
        console.log(`  ${date}: $${cost.toFixed(4)}`);
      }
    }),
  );

await program.parseAsync(process.argv);
