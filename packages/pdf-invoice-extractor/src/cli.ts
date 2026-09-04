#!/usr/bin/env node
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { Command } from "commander";
import { initDatabase, logInteraction } from "@kasap/core";
import { extractInvoiceFromPdf } from "./extractInvoice.js";
import { withErrorHandling } from "./utils/cli.js";

initDatabase(process.env.CORE_DB_PATH ?? "./data/pdf-invoice-extractor.sqlite");

const program = new Command();

program
  .name("pdf-invoice-extractor")
  .description("PDF faturadan yapılandırılmış veri çıkarır (metin katmanı + Claude, deterministik toplam doğrulaması)")
  .version("0.1.0");

program
  .command("extract <pdfDosyasi>")
  .description("Bir PDF faturadan alanları çıkarır ve toplamları doğrular")
  .option("-o, --output <dosya>", "Sonucu JSON olarak bir dosyaya yaz")
  .action(
    withErrorHandling(async (pdfPath: string, opts: { output?: string }) => {
      const { invoice, validation } = await extractInvoiceFromPdf(pdfPath);
      const json = JSON.stringify(invoice, null, 2);

      if (opts.output) {
        await writeFile(opts.output, json, "utf8");
        console.log(`Sonuç yazıldı: ${opts.output}`);
      } else {
        console.log(json);
      }

      if (validation.warnings.length > 0) {
        console.log("\nUyarılar (toplamlar tutmuyor olabilir, kaynak PDF'i kontrol edin):");
        for (const warning of validation.warnings) {
          console.log(`  - ${warning}`);
        }
      } else {
        console.log("\nToplamlar tutarlı görünüyor (kalem/ara toplam/genel toplam).");
      }

      logInteraction({
        project: "pdf-invoice-extractor",
        question: pdfPath,
        answer: `${invoice.vendorName} - ${invoice.invoiceNumber} - ${invoice.grandTotal} ${invoice.currency}`,
        category: "invoice_extraction",
        metadata: { warnings: validation.warnings },
      });
    }),
  );

await program.parseAsync(process.argv);
