export type Platform = "trendyol" | "n11" | "hepsiburada" | "ebay";

export interface PlatformSpec {
  id: Platform;
  displayName: string;
  language: "tr" | "en";
  titleMaxLength: number;
  /** Style/format guidance fed into the system prompt for this platform. */
  styleGuide: string;
}

/**
 * Karakter limitleri ve format kuralları, satıcı merkezlerinde yaygın olarak
 * belgelenen genel rakamlara dayalı VARSAYILANLARDIR. Platformlar bu kuralları
 * zaman zaman günceller - üretimde kullanmadan önce her platformun güncel
 * satıcı kılavuzundan doğrulayın (eBay'in 80 karakterlik başlık limiti uzun
 * süredir sabit ve iyi belgelenmiş; Trendyol/N11/Hepsiburada için değerler
 * yaklaşık/tipik kabul edilen değerlerdir).
 */
export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  trendyol: {
    id: "trendyol",
    displayName: "Trendyol",
    language: "tr",
    titleMaxLength: 100,
    styleGuide:
      "Başlık formatı: Marka + Ürün Tipi + Ayırt Edici Özellik (ör. 'XYZ Marka Kablosuz " +
      "Kulaklık Bluetooth 5.3 Gürültü Önleyici'). Emoji veya ALL CAPS kullanma. Açıklamada " +
      "kısa paragraflar ve madde işaretli özellikler kullan, anahtar kelimeleri doğal " +
      "şekilde geçir (SEO için tekrar spam'i yapma).",
  },
  n11: {
    id: "n11",
    displayName: "N11",
    language: "tr",
    titleMaxLength: 100,
    styleGuide:
      "Başlık formatı Trendyol'a benzer (Marka + Ürün + Özellik). Açıklamada teknik " +
      "özellikleri bir tablo/madde listesi gibi net şekilde sırala, kullanım senaryolarını " +
      "kısaca anlat.",
  },
  hepsiburada: {
    id: "hepsiburada",
    displayName: "Hepsiburada",
    language: "tr",
    titleMaxLength: 100,
    styleGuide:
      "Başlıkta marka önce gelir, ardından model/tip, sonra en güçlü satış noktası. " +
      "Açıklamada garanti/kutu içeriği gibi güven artırıcı bilgilere de kısaca değin.",
  },
  ebay: {
    id: "ebay",
    displayName: "eBay",
    language: "en",
    titleMaxLength: 80,
    styleGuide:
      "Title: front-load the most-searched keywords (brand, model, key spec) - eBay's " +
      "search weighs early title words more. Avoid ALL CAPS and excessive punctuation. " +
      "Description can use short HTML-safe paragraphs and a bullet list of item specifics " +
      "(condition, dimensions, compatibility).",
  },
};

export function getPlatformSpec(platform: Platform): PlatformSpec {
  return PLATFORM_SPECS[platform];
}

/** Enforces the platform's title length limit in code - never trust the model
 * alone to respect a hard numeric constraint. Truncates on a word boundary
 * where possible. */
export function enforceTitleLength(title: string, platform: Platform): string {
  const { titleMaxLength } = PLATFORM_SPECS[platform];
  if (title.length <= titleMaxLength) return title;

  const truncated = title.slice(0, titleMaxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > titleMaxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated).trim();
}
