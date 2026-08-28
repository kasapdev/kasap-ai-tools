import { sendStructuredMessage } from "@kasap/core";
import { enforceTitleLength, getPlatformSpec, type Platform } from "./platforms.js";
import { ListingOptimizationSchema, type ListingOptimization } from "./schema.js";

function buildSystemPrompt(platform: Platform): string {
  const spec = getPlatformSpec(platform);
  return `Sen bir e-ticaret SEO uzmanısın. Verilen ham ürün bilgisinden ${spec.displayName}
için satışa hazır, SEO uyumlu bir ürün listesi (başlık, açıklama, özellik maddeleri, anahtar
kelimeler) üret.

Platform kuralları (${spec.displayName}):
- Başlık en fazla ${spec.titleMaxLength} karakter olmalı.
- ${spec.styleGuide}
- Dil: ${spec.language === "tr" ? "Türkçe" : "English"}.
- Abartılı/yanıltıcı iddialarda bulunma, sadece verilen bilgilere dayan.`;
}

/** Generates a platform-optimized listing from raw product info. The title
 * length limit is also enforced in code after the call (enforceTitleLength) -
 * the system prompt asks the model to respect it, but a hard constraint like
 * a marketplace's character limit should never depend on the model alone. */
export async function generateListing(
  productInfo: string,
  platform: Platform,
): Promise<ListingOptimization> {
  const result = await sendStructuredMessage({
    schema: ListingOptimizationSchema,
    system: buildSystemPrompt(platform),
    messages: [{ role: "user", content: productInfo }],
  });

  return { ...result, title: enforceTitleLength(result.title, platform) };
}
