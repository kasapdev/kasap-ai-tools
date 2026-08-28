import { z } from "zod";

export const ListingOptimizationSchema = z.object({
  title: z.string().describe("Platforma uygun, SEO odaklı ürün başlığı"),
  description: z.string().describe("Tam ürün açıklaması"),
  bulletPoints: z.array(z.string()).describe("Kısa, taranabilir özellik/fayda maddeleri"),
  keywords: z.array(z.string()).describe("Arama için hedeflenen anahtar kelimeler/etiketler"),
  suggestedCategory: z.string().optional().describe("Önerilen platform kategorisi (varsa)"),
});

export type ListingOptimization = z.infer<typeof ListingOptimizationSchema>;
