# repo-doc-chatbot

Herhangi bir yerel git deposunun dokümantasyonu (README, `.md` dosyaları, kaynak kod
dosyalarının en üstündeki yorum blokları) hakkında soru sormayı sağlayan, genel amaçlı bir CLI.
`@kasap/core`'un RAG katmanını kullanır - `truckersmp-sdk`'daki `askApiDocs()`'un aynı "her
zaman bir şeye dayanarak cevap ver" desenini, tek bir sabit API referansı yerine **herhangi
bir** yerel depoya genelleştirir.

## Nasıl çalışıyor

- **`index <repoPath>`** - depodaki doküman dosyalarını (`.md`, `.mdx`, `.txt`, `.rst`,
  `README`/`LICENSE`/`CHANGELOG`/`CONTRIBUTING`) ve kaynak dosyaların en üstündeki yorum
  bloklarını (`.ts`/`.js`/`.py`) `@kasap/core`'un RAG bilgi tabanına indeksler. Dosya listesi
  `git ls-files` ile alınır - bu sayede `.gitignore` otomatik olarak dikkate alınır, kendi
  gitignore ayrıştırıcımızı yazmamıza gerek kalmaz. **`RAG_ENABLED=true` ve `@kasap/core`'a
  `chromadb`/`voyageai` kurulu olmasını gerektirir** (bkz. `packages/core/.env.example`).
- **`ask <repoPath> <soru>`** - depo hakkında bir soru sorar. Önce `retrieveContext()`'i dener
  (RAG kapalıyken ya da hiçbir şey indekslenmemişken güvenle `[]` döner). RAG'den sonuç
  gelmezse, **doğrudan dosya alıntılarına düşer**: depodaki doküman dosyalarını (README'ler
  öncelikli), toplam ~6000 karakterlik bir bütçe içinde okuyup doğrudan Claude'un sistem
  promptuna gömer ve cevabı sadece bu alıntılara dayandırmasını ister. Hangi modun kullanıldığı
  hem dönen `usedRag` alanında hem de CLI çıktısında ("RAG aktif değil, doğrudan dosya
  alıntılarından cevaplanıyor.") açıkça belirtilir - `RAG_ENABLED=false` olsa bile `ask` her
  zaman çalışır, hiçbir ek kuruluma gerek yoktur.

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/core build
cp packages/repo-doc-chatbot/.env.example packages/repo-doc-chatbot/.env
pnpm --filter @kasap/repo-doc-chatbot build
```

`ANTHROPIC_API_KEY` sadece `ask` için gerekli - `index` Claude'a hiç gitmez, sadece embedding
üretir (Voyage AI üzerinden, RAG aktifken).

## Kullanım

```bash
node packages/repo-doc-chatbot/dist/cli.js ask C:\yol\baska-bir-repo "Bu proje ne yapıyor?"
node packages/repo-doc-chatbot/dist/cli.js index C:\yol\baska-bir-repo
```

## Test

```bash
pnpm --filter @kasap/repo-doc-chatbot test
```

Karakter tabanlı parçalama (chunk boyutu/overlap sınır durumları), yorum bloğu çıkarma ve
dosya listeleme mantığı (bu monorepo'nun kendisine karşı, gerçek bir git deposu olduğu için
mock'a gerek kalmadan) doğrudan test edilir. `askAboutRepo`'nun RAG/fallback dallanması ve
Claude çağrısı `@kasap/core` mock'lanarak test edilir - gerçek bir Anthropic API çağrısı
yapılmaz.
