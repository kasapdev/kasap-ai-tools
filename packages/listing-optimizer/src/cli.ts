#!/usr/bin/env node
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import { initDatabase } from "@kasap/core";
import { runOptimize } from "./commands/optimize.js";
import { runComparePrices } from "./commands/comparePrice.js";
import { withErrorHandling } from "./utils/cli.js";
import { PLATFORM_SPECS, type Platform } from "./seo/platforms.js";
import type { ScrapeTarget } from "./scraping/priceScraper.js";

initDatabase(process.env.CORE_DB_PATH ?? "./data/listing-optimizer.sqlite");

const program = new Command();

program
  .name("listing-optimizer")
  .description("E-ticaret ürün listesi SEO optimizasyonu ve rakip fiyat karşılaştırma aracı")
  .version("0.1.0");

program
  .command("optimize <urunAciklamasi>")
  .description("Ham ürün bilgisinden platforma özel, SEO uyumlu bir ürün listesi üretir")
  .option("-p, --platform <platform>", "trendyol | n11 | hepsiburada | ebay", "trendyol")
  .option("-o, --output <dosya>", "Sonucu bir dosyaya yaz")
  .action(
    withErrorHandling(async (productInfo: string, opts: { platform: string; output?: string }) => {
      if (!(opts.platform in PLATFORM_SPECS)) {
        throw new Error(
          `Geçersiz --platform: "${opts.platform}". Şunlardan biri olmalı: ${Object.keys(PLATFORM_SPECS).join(", ")}`,
        );
      }
      await runOptimize(productInfo, opts.platform as Platform, opts.output);
    }),
  );

program
  .command("compare-price <ownPrice>")
  .description("Bir JSON dosyasındaki rakip ürün sayfalarını tarayıp fiyatınızla karşılaştırır")
  .requiredOption(
    "-t, --targets-file <dosya>",
    'Taranacak hedefleri içeren JSON dosyası: [{"url","priceSelector","titleSelector?"}]',
  )
  .action(
    withErrorHandling(async (ownPriceRaw: string, opts: { targetsFile: string }) => {
      const ownPrice = Number(ownPriceRaw);
      if (!Number.isFinite(ownPrice) || ownPrice <= 0) {
        throw new Error("ownPrice pozitif bir sayı olmalı.");
      }
      const raw = await readFile(opts.targetsFile, "utf8");
      const targets = JSON.parse(raw) as ScrapeTarget[];
      await runComparePrices(ownPrice, targets);
    }),
  );

await program.parseAsync(process.argv);
