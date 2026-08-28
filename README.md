# Kasap AI Tools Suite

Kayra Kasapoğlu'nun işlettiği projeler (Berilis hosting, Sadakat Logistics, Roblox/Godot
oyun geliştirme, eBay e-ticaret) için ortak bir çekirdek üzerine kurulu AI agent araçları.

Monorepo, pnpm workspaces ile yönetilir. Tüm projeler `packages/core` içindeki paylaşılan
Anthropic API sarmalayıcısını, SQLite tabanlı hafıza/loglama katmanını ve RAG altyapısını
kullanır.

## Yapı

```
packages/
  core/            @kasap/core   - paylaşılan agent altyapısı (kütüphane, çalıştırılamaz)
  berilis-agent/   @kasap/berilis-agent - Berilis Discord destek botu  [1. öncelik, tamamlandı]
  (roblox-ai, logistics-sdk, listing-optimizer daha sonra eklenecek)
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

### 2-4. Sıradaki projeler

Roblox/Godot AI tasarım asistanı, TruckersMP/lojistik SDK + RAG katmanı, ve e-ticaret
listing optimizer - master spesifikasyondaki sırayla, Berilis Support Agent'ın kabul
testlerinden sonra başlayacak.

## Geliştirme

```bash
pnpm typecheck   # tüm paketlerde tsc --noEmit
pnpm test        # tüm paketlerde vitest
pnpm build       # tüm paketlerde tsc build
```
