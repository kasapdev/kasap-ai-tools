/** Parses a scraped price string in either Turkish (1.234,90) or US
 * (1,234.90) format - whichever separator appears last is treated as the
 * decimal point, the other is stripped as a thousands separator. */
export function parsePriceText(text: string): number | null {
  const cleaned = text.replace(/[^\d.,-]/g, "");
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized: string;
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export type PricePosition = "en_ucuz" | "ortalama_alti" | "ortalama_ustu" | "en_pahali" | "tek_veri";

export interface PriceComparison {
  ownPrice: number;
  competitorPrices: number[];
  min: number;
  max: number;
  average: number;
  position: PricePosition;
  recommendation: string;
}

export function compareToCompetitors(ownPrice: number, competitorPrices: number[]): PriceComparison {
  if (!Number.isFinite(ownPrice) || ownPrice <= 0) {
    throw new Error("ownPrice pozitif bir sayı olmalı.");
  }

  const valid = competitorPrices.filter((p) => Number.isFinite(p) && p > 0);

  if (valid.length === 0) {
    return {
      ownPrice,
      competitorPrices: [],
      min: ownPrice,
      max: ownPrice,
      average: ownPrice,
      position: "tek_veri",
      recommendation: "Karşılaştırma için geçerli rakip fiyatı bulunamadı.",
    };
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const average = valid.reduce((sum, p) => sum + p, 0) / valid.length;

  let position: PricePosition;
  let recommendation: string;

  if (ownPrice <= min) {
    position = "en_ucuz";
    recommendation = `Fiyatınız (${ownPrice}) rakiplerin en düşüğü ya da altında - iyi konumdasınız.`;
  } else if (ownPrice >= max) {
    position = "en_pahali";
    recommendation =
      `Fiyatınız (${ownPrice}) rakiplerin en yükseği ya da üstünde - rekabetçi olmak için ` +
      `${min}-${average.toFixed(2)} aralığını değerlendirin.`;
  } else if (ownPrice < average) {
    position = "ortalama_alti";
    recommendation = `Fiyatınız (${ownPrice}) ortalamanın (${average.toFixed(2)}) altında - rekabetçi bir konumdasınız.`;
  } else {
    position = "ortalama_ustu";
    recommendation = `Fiyatınız (${ownPrice}) ortalamanın (${average.toFixed(2)}) üstünde - fiyatı gözden geçirmeyi düşünebilirsiniz.`;
  }

  return { ownPrice, competitorPrices: valid, min, max, average, position, recommendation };
}
