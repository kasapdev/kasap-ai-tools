# Kasap AI Tools Suite

[![CI](https://github.com/kasapdev/kasap-ai-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/kasapdev/kasap-ai-tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[kasapdev](https://github.com/kasapdev) tarafından geliştirilen, hosting, lojistik, oyun
geliştirme (Roblox/Godot) ve e-ticaret gibi alanlarda kullanılabilecek, ortak bir çekirdek
üzerine kurulu açık kaynak AI agent araçları paketi. Herkese açık - isteyen kullanabilir,
kendi projesine uyarlayabilir.

Monorepo, pnpm workspaces ile yönetilir. Tüm projeler `packages/core` içindeki paylaşılan
Anthropic API sarmalayıcısını, SQLite tabanlı hafıza/loglama katmanını ve RAG altyapısını
kullanır.

## Yapı

```
packages/
  core/            @kasap/core          - paylaşılan agent altyapısı (kütüphane, çalıştırılamaz)
  berilis-agent/   @kasap/berilis-agent - Berilis Discord destek botu       [1. öncelik, tamamlandı]
  roblox-ai/       @kasap/roblox-ai     - Roblox/Godot AI tasarım asistanı  [2. öncelik, tamamlandı]
  truckersmp-sdk/  @kasap/truckersmp-sdk - TruckersMP API SDK + RAG doküman Q&A [3. öncelik, tamamlandı]
  listing-optimizer/ @kasap/listing-optimizer - E-ticaret SEO + fiyat karşılaştırma [4. öncelik, tamamlandı]
```

## Kurulum

```bash
pnpm install
pnpm build
```

`@kasap/core` bir kütüphane olduğu için önce derlenmesi gerekir (`pnpm build`), çünkü diğer
paketler ona `dist/` üzerinden `@kasap/core` adıyla import eder (workspace linki).

## @kasap/core neler sağlıyor

- **Anthropic API sarmalayıcısı** (`sendMessage`, `streamMessage`, `sendStructuredMessage`) -
  mesaj gönderme, streaming ve Zod şemasıyla zorunlu tool-calling tabanlı yapılandırılmış
  çıktı. Varsayılan model `claude-opus-5`, her proje kendi `.env`'inde `ANTHROPIC_MODEL` ile
  değiştirebilir.
- **Hafıza/state** (`initDatabase`, `appendMessage`, `getRecentMessages`) - Node'un yerleşik
  `node:sqlite` modülüyle (native bağımlılık yok), konuşma geçmişini saklar.
- **Loglama** (`logInteraction`, `addCorrection`, `listInteractions`) - her soru/cevabı ve
  varsa insan düzeltmesini yapılandırılmış şekilde SQLite'a yazar. Bu tablo, veri biriktikçe
  RAG'in ham verisi olacak.
- **RAG** (`retrieveContext`, `indexKnowledge`) - Voyage AI embedding + Chroma vector store
  arayüzü hazır, ama `RAG_ENABLED=true` olmadan hiçbir şey yapmaz ve `chromadb`/`voyageai`
  paketlerini kurulu gerektirmez. Veri biriktikçe aktifleştirilecek şekilde tasarlandı -
  bkz. [packages/core/.env.example](packages/core/.env.example).

Her proje kendi izole `.env` dosyasını kullanır; `@kasap/core` kendisi `dotenv.config()`
çağırmaz, sadece `process.env`'i okur - `.env`'i yükleme sorumluluğu tüketen uygulamada
(örn. `berilis-agent/src/index.ts`).

## Projeler

### 1. Berilis Support Agent (Discord bot) - tamamlandı

Bkz. [packages/berilis-agent/README.md](packages/berilis-agent/README.md).

```bash
pnpm dev:berilis
```

### 2. Roblox/Godot AI Tasarım Asistanı (CLI) - tamamlandı

Bkz. [packages/roblox-ai/README.md](packages/roblox-ai/README.md).

```bash
pnpm --filter @kasap/roblox-ai build
node packages/roblox-ai/dist/cli.js --help
```

### 3. TruckersMP/Lojistik API SDK + AI Wrapper - tamamlandı

Bkz. [packages/truckersmp-sdk/README.md](packages/truckersmp-sdk/README.md).

```bash
pnpm --filter @kasap/truckersmp-sdk build
node packages/truckersmp-sdk/dist/cli.js servers
```

### 4. E-ticaret Listing Optimizer - tamamlandı

Bkz. [packages/listing-optimizer/README.md](packages/listing-optimizer/README.md).

```bash
pnpm --filter @kasap/listing-optimizer build
node packages/listing-optimizer/dist/cli.js optimize "ürün açıklaman" --platform trendyol
```

Master spesifikasyondaki 4 proje de tamamlandı.

## Geliştirme

```bash
pnpm typecheck   # tüm paketlerde tsc --noEmit
pnpm test        # tüm paketlerde vitest
pnpm build       # tüm paketlerde tsc build
```

Katkıda bulunmak isterseniz [CONTRIBUTING.md](CONTRIBUTING.md)'e bakın (konvansiyonlar, yeni
bir paket ekleme deseni).

## Lisans

[MIT](LICENSE)
