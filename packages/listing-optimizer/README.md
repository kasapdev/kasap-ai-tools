# listing-optimizer

Ham ürün bilgisinden SEO uyumlu, platforma özel ürün listeleri (başlık, açıklama, özellik
maddeleri, anahtar kelimeler) üreten bir agent; artı rakip fiyat karşılaştırması için
robots.txt'e saygılı, hız sınırlamalı basit bir tarama modülü.

## `optimize` - SEO listesi üretimi

```bash
node dist/cli.js optimize "kablosuz bluetooth kulaklık, 30 saat pil ömrü, ANC" --platform trendyol
node dist/cli.js optimize "vintage leather wallet, handmade, 6 card slots" --platform ebay -o listing.md
```

Desteklenen `--platform` değerleri: `trendyol`, `n11`, `hepsiburada` (Türkçe), `ebay`
(İngilizce). Her platformun kendi başlık karakter limiti ve format kuralı vardır -
bkz. [src/seo/platforms.ts](src/seo/platforms.ts). **Bu limitler ve stil kuralları satıcı
merkezlerinde yaygın belgelenen genel değerlerdir** (eBay'in 80 karakterlik başlık limiti
uzun süredir sabit ve iyi belgelenmiş; Trendyol/N11/Hepsiburada değerleri tipik kabul edilen
rakamlardır) - üretimde kullanmadan önce her platformun güncel satıcı kılavuzundan doğrulayın.
Başlık uzunluğu Claude'un talimata uyup uymadığına bakılmaksızın **kod tarafında da**
zorunlu kılınır (`enforceTitleLength`).

## `compare-price` - rakip fiyat karşılaştırma

```bash
node dist/cli.js compare-price 349.90 --targets-file targets.json
```

`targets.json`:

```json
[
  { "url": "https://ornek-site.com/urun/123", "priceSelector": ".price", "titleSelector": "h1" },
  { "url": "https://baska-site.com/p/456", "priceSelector": "[data-testid=price]" }
]
```

**Önemli - bu modülün ne olduğu ve ne olmadığı:** [src/scraping/priceScraper.ts](src/scraping/priceScraper.ts)
Trendyol/N11/Hepsiburada/eBay için önceden hazırlanmış bir kazıyıcı DEĞİLDİR - bu sitelerin
güncel HTML yapısını ya da hizmet şartlarını bilmiyoruz/varsaymıyoruz. Bunun yerine genel,
kurallara uyan bir "URL + CSS seçici getir" aracıdır: hedef URL'yi ve fiyatın/başlığın
hangi CSS seçicisinde olduğunu siz belirtirsiniz, ve o sayfayı taramanın izinli olduğunu
teyit etmek size aittir. Modül kendiliğinden şunları zorunlu kılar:

- **robots.txt'e saygı:** İlgili yol için user-agent'ımıza izin verilmiyorsa taramayı
  reddeder. robots.txt hiç alınamazsa/doğrulanamazsa da (ağ hatası, 5xx) **"izin var"
  varsaymaz, taramayı reddeder** (fail-closed) - sadece gerçek bir 404 "robots.txt yok"
  olarak (izinli) kabul edilir.
- **Hız sınırlama:** Aynı host'a art arda istekler arasında en az 2 saniye (`HostRateLimiter`,
  ayarlanabilir) bırakır.

Gerçek dünyada doğrulandı: Wikipedia'ya karşı normal bir sayfa başarıyla çekildi, robots.txt
tarafından yasaklanmış bir `/wiki/Special:` yolu ise doğru şekilde reddedildi (bkz. test
çıktıları / commit geçmişi).

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/core build
cp packages/listing-optimizer/.env.example packages/listing-optimizer/.env
pnpm --filter @kasap/listing-optimizer build
```

`ANTHROPIC_API_KEY` sadece `optimize` için gerekli - `compare-price` Claude'a hiç gitmez.

## Test

```bash
pnpm --filter @kasap/listing-optimizer test
```

Başlık kırpma, SEO çıktısı formatlama, robots.txt ayrıştırma (izin/yasak kuralları, `*`/`$`
joker karakterleri), hız sınırlayıcı zamanlaması ve TR/US fiyat metni ayrıştırma/karşılaştırma
- hepsi ağ çağrısı olmadan test edilir.
