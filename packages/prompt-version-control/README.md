# prompt-version-control

LLM promptlarını (bu monorepodaki `system` promptları, `.prompt`/`.md` dosyaları olarak
saklanan herhangi bir proje promptu) yerel dosya sisteminde tutup, git benzeri içerik adresli
bir SQLite deposunda versiyonlayan ve versiyonlar arası gerçek satır bazlı diff (Myers
algoritması) üreten bir CLI.

## Neden ayrı bir araç

Bir prompt dosyasını değiştirdiğinizde "ne değişti, ne zaman değişti, eski hâli neydi"
sorularını cevaplamak için tam bir git deposu kurmak fazla ağır kalabiliyor - özellikle tek
bir `prompts/` klasörünü izlemek istediğinizde. Bu araç aynı fikri (içerik hash'i, versiyon
geçmişi, diff) minimal ve bağımsız bir SQLite dosyasında sunar.

**Kasıtlı olarak sağlayıcıdan bağımsızdır** - bu paket hiçbir zaman Anthropic'e ya da başka
bir LLM API'sine istek atmaz, `@kasap/core`'a bağımlı değildir. Sadece yerel dosya + SQLite
üzerinde çalışan saf bir versiyonlama aracıdır.

## İçerik adresleme ve dedup

Her versiyon, içeriğin SHA-256 hash'i ile saklanır. Aynı içeriği tekrar `save` etmeye
çalışırsanız (dosya hiç değişmemişse) yeni bir versiyon oluşturulmaz - git'in "nothing to
commit, working tree clean" davranışının bir benzeri:

```
$ prompt-version-control save sistem-promptu prompts/sistem.md
"sistem-promptu" için versiyon 1 kaydedildi (hash: 3f2a1c9d8b7e).
$ prompt-version-control save sistem-promptu prompts/sistem.md
İçerik değişmedi, yeni versiyon oluşturulmadı ("sistem-promptu" hâlâ versiyon 1).
```

## Kullanım

```bash
pnpm --filter @kasap/prompt-version-control build

# bir versiyon kaydet
node dist/cli.js save sistem-promptu prompts/sistem.md -m "İlk versiyon"

# prompt dosyasını değiştirin, tekrar kaydedin
node dist/cli.js save sistem-promptu prompts/sistem.md -m "Ton daha resmi yapıldı"

# geçmişi listele
node dist/cli.js log sistem-promptu

# son iki versiyon arasındaki farkı göster
node dist/cli.js diff sistem-promptu

# belirli iki versiyonu karşılaştır
node dist/cli.js diff sistem-promptu 1 3

# bir versiyonun ham içeriğini yazdır
node dist/cli.js show sistem-promptu latest
node dist/cli.js show sistem-promptu 2
```

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/prompt-version-control build
```

`.env` gerekmez - opsiyonel `PROMPT_VC_DB_PATH` dışında hiçbir ortam değişkeni okunmaz (bkz.
[.env.example](.env.example)).

## Diff algoritması

[`src/diff/myersDiff.ts`](src/diff/myersDiff.ts) gerçek bir Myers O(ND) en kısa düzenleme
mesafesi (shortest edit script) algoritması uygular - satır satır naif karşılaştırma değil.
Bu, ortadaki tek bir satır değiştiğinde bile öncesi/sonrası ortak satırların "equal" olarak
tanınmasını sağlar (naif bir karşılaştırma her şeyi "değişti" olarak işaretlerdi).

## Test

```bash
pnpm --filter @kasap/prompt-version-control test
```

`myersDiff` için doğruluk özellikleri test edilir (üretilen diff'ten hem `a`'nın hem `b`'nin
tam olarak yeniden inşa edilebildiği, ekleme/silme/karışık değişiklik senaryoları), artı
`promptStore`'un versiyon numaralandırma/dedup/log/show mantığı `:memory:` SQLite ile - hepsi
gerçek dosya sistemi ya da ağ çağrısı olmadan.
