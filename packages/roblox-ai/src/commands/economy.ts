import type { Command } from "commander";
import { logInteraction, sendMessage } from "@kasap/core";
import {
  DEFAULT_ROBUX_ECONOMY_CONFIG,
  buildPriceTier,
  calculatePriceBreakdown,
  suggestPriceForTargetUsd,
} from "../economy/robuxCalculator.js";
import { withErrorHandling } from "../utils/cli.js";

function printBreakdown(price: number): void {
  const breakdown = calculatePriceBreakdown(price);
  console.log(`Liste fiyatı: ${breakdown.listedPriceRobux} Robux`);
  console.log(
    `Marketplace payı (~%${DEFAULT_ROBUX_ECONOMY_CONFIG.marketplaceCutPercent}): ${breakdown.marketplaceCutRobux} Robux`,
  );
  console.log(`Geliştirici payı: ${breakdown.developerShareRobux} Robux`);
  console.log(
    `DevEx tahmini (~$${DEFAULT_ROBUX_ECONOMY_CONFIG.devExRatePerRobux}/Robux): $${breakdown.developerShareUsdViaDevEx.toFixed(2)}`,
  );
  console.log(
    "\nNot: Oranlar Roblox'un güncel geliştirici sözleşmesine göre değişebilir - " +
      "kullanmadan önce doğrulayın (bkz. src/economy/robuxCalculator.ts).",
  );
}

export function registerEconomyCommand(program: Command): void {
  const economy = program.command("economy").description("Robux ekonomi dengeleme hesaplamaları");

  economy
    .command("price <robuxAmount>")
    .description("Bir Robux fiyatının marketplace payı sonrası geliştirici kazancını gösterir")
    .action(
      withErrorHandling(async (robuxAmount: string) => {
        printBreakdown(Number(robuxAmount));
      }),
    );

  economy
    .command("target <usdAmount>")
    .description("Hedeflenen geliştirici kazancı (USD) için önerilen Robux fiyatını hesaplar")
    .action(
      withErrorHandling(async (usdAmount: string) => {
        const price = suggestPriceForTargetUsd(Number(usdAmount));
        console.log(`Önerilen liste fiyatı: ${price} Robux\n`);
        printBreakdown(price);
      }),
    );

  economy
    .command("tiers <baseRobux>")
    .description("Kademeli fiyatlandırma (ör. küçük/orta/büyük paket) önerisi üretir")
    .option("-s, --steps <n>", "Kademe sayısı", "4")
    .option("-m, --multiplier <n>", "Her kademede çarpan", "2.2")
    .action(
      withErrorHandling(async (baseRobux: string, opts: { steps: string; multiplier: string }) => {
        const tiers = buildPriceTier(Number(baseRobux), Number(opts.steps), Number(opts.multiplier));
        tiers.forEach((price, i) => console.log(`Kademe ${i + 1}: ${price} Robux`));
      }),
    );

  economy
    .command("advise <description>")
    .description("Mevcut ekonomi tasarımını Claude'a değerlendirtir (dengeleme önerileri)")
    .action(
      withErrorHandling(async (description: string) => {
        const result = await sendMessage({
          system:
            "Sen bir oyun ekonomisti/monetizasyon uzmanısın. Verilen Roblox oyun ekonomisi " +
            "açıklamasını değerlendir, dengesizlikleri belirt ve somut fiyat/oran önerileri " +
            "ver. Türkçe yanıt ver.",
          messages: [{ role: "user", content: description }],
        });
        console.log(result.text);
        logInteraction({
          project: "roblox-ai",
          question: description,
          answer: result.text,
          category: "economy_advise",
          model: result.message.model,
        });
      }),
    );
}
