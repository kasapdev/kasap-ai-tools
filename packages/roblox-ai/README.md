# roblox-ai

Roblox (Luau) ve Godot (GDScript) için AI destekli kod üretimi, seviye tasarımı önerisi ve
Robux ekonomi dengeleme hesaplamaları yapan bir CLI aracı. `@kasap/core`'daki Anthropic
sarmalayıcısını (streaming + yapılandırılmış çıktı) ve loglama katmanını kullanır.

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/core build
cp packages/roblox-ai/.env.example packages/roblox-ai/.env
# .env içine ANTHROPIC_API_KEY'ini yaz
```

Geliştirme sırasında (derlemeden, `tsx` ile doğrudan):

```bash
pnpm --filter @kasap/roblox-ai dev -- generate "basit bir envanter sistemi" --engine roblox
```

Kurulu bir komut olarak kullanmak için:

```bash
pnpm --filter @kasap/roblox-ai build
node packages/roblox-ai/dist/cli.js --help
```

## Komutlar

### `generate <açıklama>` - kod üretimi

```bash
roblox-ai generate "envanter ağırlık sistemi" --engine roblox --output ./src/server
roblox-ai generate "2D platform karakteri hareket kontrolcüsü" --engine godot --output ./scripts
```

- `--engine roblox|godot` (varsayılan `roblox`) - Luau (`.luau`) veya GDScript (`.gd`) üretir.
- `--output <klasör>` verilirse, üretilen kod bloğu ayıklanıp dosyaya yazılır (dosya adı
  `--name` ile ya da açıklamadan otomatik oluşturulur). Verilmezse sadece terminale
  stream edilir.
- Yanıt terminale gerçek zamanlı (streaming) yazdırılır.

### `design-level <açıklama>` - seviye tasarımı önerisi

```bash
roblox-ai design-level "terk edilmiş bir uzay istasyonu, korku temalı" --output level.md
```

Hedefler, zorluk eğrisi, kilit alanlar ve tempo notları içeren yapılandırılmış bir öneri
üretir (Claude'un yapılandırılmış çıktı - zorunlu tool-calling - özelliğiyle, serbest metin
ayrıştırma yapılmaz).

### `economy` - Robux ekonomi dengeleme

```bash
roblox-ai economy price 500          # 500 Robux'luk bir ürünün marketplace payı sonrası kazancı
roblox-ai economy target 20          # 20 USD geliştirici kazancı için önerilen liste fiyatı
roblox-ai economy tiers 100 -s 4     # 100 Robux'tan başlayan 4 kademeli fiyat merdiveni
roblox-ai economy advise "3 farklı gem paketimiz var: 100/500/1000 Robux..."
```

`price`/`target`/`tiers` tamamen deterministiktir - Claude'a hiç gitmez, anında ve
tekrarlanabilir sonuç verir. `advise` mevcut bir ekonomi tasarımını Claude'a
değerlendirtir. Varsayılan oranlar (%30 marketplace payı, $0.0035/Robux DevEx) genel
bilinen Roblox rakamlarıdır - üretimde kullanmadan önce
[src/economy/robuxCalculator.ts](src/economy/robuxCalculator.ts) içindeki `DEFAULT_ROBUX_ECONOMY_CONFIG`'i
güncel Roblox geliştirici sözleşmesine göre doğrulayın/güncelleyin.

## Loglama

`generate`, `design-level` ve `economy advise` komutlarının her çağrısı `@kasap/core`
üzerinden `./data/roblox-ai.sqlite` içine loglanır (soru, cevap, kategori, kullanılan
model) - ileride RAG'in ham verisi olacak, tıpkı Berilis Support Agent'ta olduğu gibi.

## Test

```bash
pnpm --filter @kasap/roblox-ai test
```

Kod bloğu ayıklama, slug üretimi, ekonomi hesaplamaları ve seviye tasarımı formatlama gibi
saf mantık; Claude/Discord'a gerçek bağlantı gerektirmez.
