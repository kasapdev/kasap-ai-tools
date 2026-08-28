/**
 * Sabit bilgi bloğu - paket fiyatları ve özellikleri.
 * TODO(Kayra): Aşağıyı gerçek Berilis paket bilgileriyle doldur.
 * Bu metin, fiyat/paket sorularına Claude'a hiç gitmeden doğrudan cevap olarak
 * kullanılır (hem tutarlı hem ücretsiz).
 */
export const PRICING_INFO_BLOCK = `**Berilis Paketleri** _(güncellenmeyi bekliyor - lütfen destek ekibiyle teyit edin)_

- Paket adları, fiyatları ve özellikleri henüz bu bloğa eklenmedi.
- Güncel fiyatlandırma için lütfen https://berilis.com adresini ziyaret edin ya da bir yetkiliyle iletişime geçin.`;

const PRICING_KEYWORDS = [
  "fiyat",
  "ücret",
  "ucret",
  "paket",
  "ne kadar",
  "kaç tl",
  "kac tl",
  "kaç lira",
  "kac lira",
  "özellik",
  "ozellik",
  "plan",
];

export function isPricingQuestion(text: string): boolean {
  const lower = text.toLocaleLowerCase("tr");
  return PRICING_KEYWORDS.some((keyword) => lower.includes(keyword));
}
