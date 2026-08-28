# Katkıda Bulunma

Bu repo bir pnpm workspace monorepo'su. `packages/core` (`@kasap/core`) paylaşılan altyapıyı
sağlar, diğer her paket onu `workspace:*` ile kullanan ayrı bir araç/uygulamadır.

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/core build   # diğer paketler @kasap/core'u dist/ üzerinden import eder
```

Değişiklik yapmadan önce (ve PR açmadan önce) her zaman şu sırayla çalıştırın:

```bash
pnpm build       # tüm paketlerde tsc build (önce - typecheck buna bağımlı, aşağı bakın)
pnpm typecheck   # tüm paketlerde tsc --noEmit
pnpm test        # tüm paketlerde vitest
```

`build` önce gelmeli: `@kasap/core`'a bağımlı her paket onu derlenmiş `dist/` çıktısı
üzerinden import eder, temiz bir checkout'ta `dist/` yoksa `typecheck` `@kasap/core` modülünü
bulamaz. CI (`.github/workflows/ci.yml`) her push/PR'da aynı üç komutu bu sırayla çalıştırır -
hepsi geçmeden PR merge edilmemeli.

## Konvansiyonlar

- **TypeScript strict + ESM.** Her paket `tsconfig.base.json`'ı extend eder
  (`module`/`moduleResolution: NodeNext`, `strict: true`, `noUncheckedIndexedAccess: true`).
  `.js` uzantılı relative import'lar kullanın (`./foo.js`, `.ts` dosyası olsa bile - NodeNext
  bunu gerektirir).
- **Anthropic çağrıları sadece `@kasap/core` üzerinden.** `sendMessage`/`streamMessage`
  serbest metin için, `sendStructuredMessage` (Zod şema + zorunlu tool-calling) yapılandırılmış
  çıktı gerektiğinde. Varsayılan model `claude-opus-5` - başka bir model sabitlemeyin, `.env`
  üzerinden `ANTHROPIC_MODEL` ile değiştirilebilir bırakın.
- **Depolama sadece `node:sqlite` üzerinden (native bağımlılık yok).** Yeni bir tablo/şema
  gerekiyorsa `packages/core/src/memory/db.ts`'e ekleyin, `initDatabase()` her zaman tüm
  şemayı `CREATE TABLE IF NOT EXISTS` ile kurar.
- **Her Claude etkileşimini logla.** Bir komut Claude'a gidiyorsa, sonucu
  `logInteraction({ project, question, answer, category, ... })` ile kaydedin - bu veri
  ileride RAG'in ham materyali olacak.
- **Hard constraint'lere modelin uyacağına güvenmeyin, kod tarafında da zorunlu kılın.**
  Örnek: `listing-optimizer`'da platform başlık karakter limiti hem promptta istenir hem
  `enforceTitleLength()` ile kod tarafında kesilir.
- **Belirsiz/doğrulanamayan dış gerçekleri (ücret oranları, karakter limitleri vb.) sabit
  değer olarak gömmeyin - `DEFAULT_*` sabiti yapıp yorum/README'de "üretimde kullanmadan
  önce doğrulayın" notu bırakın.** Örnek: `roblox-ai`'daki Robux DevEx oranı,
  `listing-optimizer`'daki platform karakter limitleri.
- **CLI paketleri** (`roblox-ai`, `truckersmp-sdk`, `listing-optimizer`) aynı iskeleti
  paylaşır: `src/cli.ts` (commander, `#!/usr/bin/env node`, `initDatabase()` en başta),
  `src/utils/cli.ts` içinde bir `withErrorHandling()` sarmalayıcı (hatalar temiz mesajla
  basılsın, stack trace ile değil).
- **Kullanıcıya görünen metin Türkçe, kod/yorum/commit mesajları İngilizce.**
- Scraping/dış API modüllerinde: **fail closed** (belirsizken izin verildiğini varsaymayın),
  rate-limit uygulayın, hataları anlamlı/eyleme geçirilebilir mesajlarla fırlatın.

## Yeni bir paket eklemek

1. `packages/<isim>/` altında `package.json` (`name: "@kasap/<isim>"`, `private: true`,
   `license: "MIT"`), `tsconfig.json` (`../../tsconfig.base.json`'ı extend eden), `src/`,
   `tests/`, `.env.example`, `README.md` oluşturun.
2. `@kasap/core`'u `"@kasap/core": "workspace:*"` olarak dependencies'e ekleyin.
3. Kök `pnpm install` çalıştırın (pnpm workspace'i otomatik tanır).
4. Kök [README.md](README.md)'deki paket tablosuna ve proje listesine ekleyin.

## Sorular / güvenlik

Bir güvenlik açığı bulduysanız lütfen public bir issue açmadan önce repo sahibiyle iletişime
geçin.
