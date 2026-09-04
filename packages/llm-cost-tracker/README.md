# llm-cost-tracker

Yerel bir JSONL kullanım logundan (Anthropic/OpenAI çağrılarının token sayıları) gerçek
maliyet raporu üreten bir CLI. Hiçbir API'ye istek atmaz - `@kasap/core` bile bu pakette
kullanılmaz, çünkü hesaplama bir LLM etkileşimi değil, saf yerel veri işleme/toplama.

## ÖNEMLİ - fiyat tablosu bir anlık görüntüdür, üretimde kullanmadan önce doğrulayın

[`data/pricing.json`](data/pricing.json) içindeki $/milyon-token oranları **2026-09-04
tarihli bir anlık görüntüdür** (Anthropic satırları `claude-api` skill'inin referans
tablosundan alınmıştır; OpenAI satırları ise doğrulanmamış, iyi bilinen genel değerlerdir).
Gerçek muhasebe/faturalama için kullanmadan önce **mutlaka** her sağlayıcının güncel
fiyatlandırma sayfasından doğrulayın:

- Anthropic: https://www.anthropic.com/pricing
- OpenAI: https://openai.com/api/pricing

Bu, `CONTRIBUTING.md`'nin "belirsiz/doğrulanamayan dış gerçekleri kod içinde sabit değer
olarak gömmeyin" ilkesiyle aynı desen - `roblox-ai`'daki Robux DevEx oranı ve
`listing-optimizer`'daki platform karakter limitleri gibi, ayrı bir veri dosyasında ve açıkça
"doğrulayın" notuyla tutulur. Bilinmeyen bir sağlayıcı/model için oran bulunamazsa o kayıt
toplam maliyete **sessizce dahil edilmez** - `unpriced` alanında ayrıca sayılır ve rapor bunu
açıkça belirtir.

## Kullanım log formatı

`report` komutu, her satırında bir JSON nesnesi olan bir `.jsonl` dosyası bekler:

```jsonl
{"provider":"anthropic","model":"claude-opus-5","input_tokens":1200,"output_tokens":340,"timestamp":"2026-09-01T10:15:00Z"}
{"provider":"openai","model":"gpt-4o-mini","input_tokens":500,"output_tokens":120,"timestamp":"2026-09-02T08:00:00Z"}
```

Alanlar: `provider`, `model`, `input_tokens`, `output_tokens`, `timestamp` (ISO 8601). Bozuk
veya eksik alanlı satırlar sessizce atlanır (hata vermez) ve rapor sonunda kaç satırın
atlandığı bildirilir - bu, elle/scriptle büyütülen bir append-only log dosyasını işlemek için
kasıtlı olarak hoşgörülü bir davranıştır.

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/llm-cost-tracker build
```

Gerekli bir ortam değişkeni yok - bkz. [.env.example](.env.example).

## Kullanım

```bash
node packages/llm-cost-tracker/dist/cli.js report usage.jsonl
node packages/llm-cost-tracker/dist/cli.js report usage.jsonl --json
node packages/llm-cost-tracker/dist/cli.js report usage.jsonl --pricing ./ozel-fiyatlar.json
```

`--json` çıktısı doğrudan bir `AggregateReport` nesnesidir (atlanan satır sayısı ayrıca
stderr'e yazılır, JSON çıktısını kirletmez); şu alanları içerir: `totalCost`, `byProvider`, `byModel`, `byDay`
(gün başına toplam, UTC takvim günü) ve `unpriced` (fiyat tablosunda karşılığı bulunamayan
kayıtların sayısı + toplam giriş/çıkış token sayısı - bu kayıtlar `totalCost`'a dahil
edilmez, raporun kapsam boşluklarını gizlemeden göstermesi için).

## Test

```bash
pnpm --filter @kasap/llm-cost-tracker test
```

Log ayrıştırma (geçerli/bozuk satırlar), tekil kayıt maliyet hesaplama ve toplama matematiği
(sağlayıcı/model/gün kırılımları, `unpriced` sayacı) sabit bir test fiyat tablosuna karşı
doğrulanır - gerçek `data/pricing.json` sadece kendi yükleme testinde kullanılır. Hiçbir
Claude/Anthropic API çağrısı yapılmadığı için mock'lanacak bir şey yok.
