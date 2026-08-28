import { scrapeListing, type ScrapeTarget } from "../scraping/priceScraper.js";
import { compareToCompetitors, parsePriceText } from "../pricing/comparePrices.js";

export async function runComparePrices(ownPrice: number, targets: ScrapeTarget[]): Promise<void> {
  const competitorPrices: number[] = [];

  for (const target of targets) {
    try {
      const listing = await scrapeListing(target);
      const price = parsePriceText(listing.priceText);
      if (price === null) {
        console.warn(`Uyarı: ${target.url} - "${listing.priceText}" fiyat olarak ayrıştırılamadı.`);
        continue;
      }
      console.log(`${listing.title ?? target.url}: ${price}`);
      competitorPrices.push(price);
    } catch (error) {
      console.warn(
        `Uyarı: ${target.url} taranamadı - ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const comparison = compareToCompetitors(ownPrice, competitorPrices);
  console.log(`\nKendi fiyatınız: ${comparison.ownPrice}`);
  console.log(
    `Rakip aralığı: ${comparison.min} - ${comparison.max} (ortalama ${comparison.average.toFixed(2)})`,
  );
  console.log(comparison.recommendation);
}
