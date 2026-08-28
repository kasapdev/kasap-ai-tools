# truckersmp-sdk

TruckersMP Web API (https://api.truckersmp.com/v2) için tip güvenli bir SDK katmanı, artı
`@kasap/core`'un RAG modülünü kullanan bir "API dokümantasyonu hakkında soru sor" katmanı.
Hem bir kütüphane (`@kasap/truckersmp-sdk` - başka bir pakete import edilebilir) hem de hızlı
sorgular için bir CLI olarak kullanılabilir.

## Neden bu kadar dikkatli hata yönetimi var

Sadakat Logistics'in daha önce yaşadığı "universal endpoint connectivity" sorunlarından
ötürü, [`src/client.ts`](src/client.ts) her isteğe:

- **Timeout** ekler (`AbortController`, varsayılan 10sn),
- **Retry** yapar (429/5xx'te üstel geri çekilmeyle, varsayılan 3 deneme),
- ve TruckersMP API'sinin kendine özgü davranışını hesaba katar: bazı endpoint'ler
  bulunamayan kayıtlarda **HTTP 200 + `{error: true, descriptor}`** döner (404 değil) - SDK
  bunu otomatik olarak `TruckersMpNotFoundError` olarak fırlatır, ham hata gövdesini veri
  gibi döndürmez. (Gerçek API'de bazı ID'ler için düz HTTP 404 de dönebiliyor - o da ayrıca
  `TruckersMpHttpError` olarak yakalanıyor.)

Her hata, hangi endpoint'te ve neden olduğunu açıkça belirten, `instanceof` ile ayırt
edilebilir bir sınıf olarak fırlatılır (`TruckersMpNotFoundError`, `TruckersMpHttpError`,
`TruckersMpTimeoutError`, `TruckersMpNetworkError`).

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/core build
cp packages/truckersmp-sdk/.env.example packages/truckersmp-sdk/.env
```

`ANTHROPIC_API_KEY` sadece `docs ask`/`docs index` komutları için gerekli - salt SDK
çağrıları (`servers`, `player`, ...) için Anthropic'e hiç gitmez.

## CLI kullanımı

```bash
pnpm --filter @kasap/truckersmp-sdk build

node packages/truckersmp-sdk/dist/cli.js servers
node packages/truckersmp-sdk/dist/cli.js player 76561198000000000
node packages/truckersmp-sdk/dist/cli.js docs ask "Bir VTC'nin üye sayısını nasıl alırım?"
```

## Kütüphane olarak kullanım

```ts
import { TruckersMpClient, TruckersMpNotFoundError } from "@kasap/truckersmp-sdk";

const client = new TruckersMpClient();

try {
  const servers = await client.getServers();
  const onlineCount = servers.filter((s) => s.online).length;
} catch (error) {
  if (error instanceof TruckersMpNotFoundError) {
    // ...
  }
  throw error;
}
```

## Kapsanan endpoint'ler

`servers`, `player/{id}`, `bans/{id}`, `vtc/{id}`, `game_time`, `version`, `events`,
`events/{id}` - tam alan tipleri [src/types.ts](src/types.ts) içinde, OpenAPI spesine göre
(https://docs.truckersmp.com/redocusaurus/web-api-v2.yaml). Daha fazla VTC alt-endpoint'i
(roller, üyeler, haberler, partnerler) gerektiğinde aynı `requestRaw()` deseniyle kolayca
eklenebilir.

> `id` parametreleri `string` olarak alınır - bir SteamID64,
> `Number.MAX_SAFE_INTEGER`'ı aşabildiği için `number` olarak hassasiyet kaybedebilir.

## API dokümantasyonu Q&A (RAG)

[`src/docs/askApiDocs.ts`](src/docs/askApiDocs.ts) kutudan çıktığı gibi çalışır: endpoint
referansını doğrudan Claude'un sistem promptuna gömer, ekstra kurulum gerekmez.
`@kasap/core`'un RAG katmanını da (`retrieveContext`) çağırır - `RAG_ENABLED=false` iken bu
sessizce boş döner; `RAG_ENABLED=true` yapıp `chromadb`/`voyageai` kurulduğunda ve
`docs index` çalıştırıldığında, gerçek kullanım/destek loglarından biriken ek bağlam da
cevaba dahil olmaya başlar.

## Test

```bash
pnpm --filter @kasap/truckersmp-sdk test
```

`client.ts`'in retry/timeout/hata sınıflandırma mantığı `fetch` mock'lanarak test edilir
(gerçek ağ çağrısı yapılmaz).
