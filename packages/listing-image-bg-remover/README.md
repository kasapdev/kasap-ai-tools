# listing-image-bg-remover

Ürün fotoğraflarındaki düz/uniform arka planı saydam yapan bir CLI. `listing-optimizer`'ı
tamamlayan, ayrı bir araç: SEO listesi + fiyat karşılaştırması onda, "temiz arka planlı ürün
fotoğrafı" burada.

## Ne yapıyor, ne yapmıyor

Bu paket **klasik (ML olmayan) bir algoritma** kullanır: görselin dört kenarından başlayarak
flood-fill yapar, kenar piksellerinin renginden `--tolerance` kadar (RGB Euclidean mesafesi)
uzaklaşmayan bağlı bölgeleri saydam yapar (bkz. [src/image/floodFillBackground.ts](src/image/floodFillBackground.ts)).
Tam bir ML segmentasyon modeli bu depoya gömülemeyecek kadar ağır olduğundan bilinçli olarak
bu basit yaklaşım tercih edildi.

**İyi çalıştığı durum:** düz/tek renkli bir fon önünde (beyaz masa, stüdyo backdrop'u vb.)
çekilmiş tipik, basit bir ürün listesi fotoğrafı.

**Çalışmadığı/kötü çalıştığı durum:** karmaşık sahneler, birden fazla farklı renkte fon
bölgesi, güçlü gradyanlar, veya ürünün görselin dört kenarına da değdiği kadrajlar (flood-fill
kenardan başladığı için, arka planla aynı toleransta bir ürün kenara değiyorsa o da saydam
olabilir). Bu durumlarda gerçek bir ML tabanlı arka plan kaldırma servisi kullanılmalı - bu
araç onun yerine geçmez, tamamlayıcısıdır.

## Kullanım

```bash
pnpm install
pnpm --filter @kasap/listing-image-bg-remover build

node packages/listing-image-bg-remover/dist/cli.js remove-bg urun.jpg
node packages/listing-image-bg-remover/dist/cli.js remove-bg urun.jpg -o urun-temiz.png -t 30
```

`--tolerance` (`-t`, varsayılan 24): tespit edilen arka plan renginden izin verilen renk
mesafesi. Düşük değer daha az agresif (yalnızca çok benzer pikselleri saydam yapar, arka
planda gölge/gürültü varsa tam temizlemeyebilir); yüksek değer daha agresif (üründeki
arka plana yakın renkli bölgeleri de saydam yapma riski artar). `.env` üzerinden
`BG_REMOVER_DEFAULT_TOLERANCE` ile de varsayılan değiştirilebilir - bkz. [.env.example](.env.example).

Bu paket hiçbir API çağrısı yapmaz (Claude/Anthropic dahil değil) - tamamen yerel çalışır,
`.env` zorunlu değildir.

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/listing-image-bg-remover build
```

Görsel decode/encode için `sharp` kullanılır (Windows dahil önceden derlenmiş binary'lerle
gelir, ek bir native toolchain gerekmez).

## Test

```bash
pnpm --filter @kasap/listing-image-bg-remover test
```

`colorDistance`/`detectBackgroundColor` saf matematik testleri, ve asıl kritik olan
`floodFillBackground` testi: kodda üretilen sentetik bir RGBA buffer (düz beyaz arka plan +
ortada renkli bir kare) üzerinde köşelerin/kenarların saydam olduğu, karenin saydam
olmadığı ve orijinal renklerin değişmediği doğrulanır - hiçbir ağ çağrısı veya gerçek dosya
gerekmez.
