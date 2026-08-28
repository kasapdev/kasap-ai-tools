# Berilis Support Agent

Discord destek botu. Ticket kanallarında (veya bota mention atıldığında) gelen teknik
sorulara Claude ile cevap verir, fiyat/paket sorularını sabit bir bilgi bloğundan
yanıtlar, ve emin olamadığı durumlarda **Sistem Yöneticisi** rolünü etiketleyerek
escalate eder. Her etkileşim `@kasap/core` üzerinden SQLite'a loglanır.

## Nasıl çalışır

1. Mesaj gelir (`messageHandler.ts` → `shouldRespond`): bot, şu kanallarda cevap verir:
   - `.env`'deki `SUPPORT_CHANNEL_IDS` listesindeki kanallar,
   - adı `TICKET_CHANNEL_PREFIX` ile başlayan kanallar (varsayılan `ticket-`),
   - bota `@mention` atılan her yerde.
2. Soru fiyat/paket ile ilgiliyse (`knowledge/pricingBlock.ts` içindeki anahtar
   kelimelerle eşleşiyorsa) Claude'a hiç gitmeden sabit bilgi bloğundan cevap verilir.
3. Aksi halde Claude'a yapılandırılmış bir istek atılır (`agent/respond.ts`) - model
   Türkçe bir cevap, bir kategori (`502_hata`, `cpanel`, `dns`, `ssl`, ...) ve
   `needs_escalation` bayrağı döner (zorunlu tool-calling ile, serbest metin
   ayrıştırma değil).
4. `needs_escalation=true` ise sadece **Sistem Yöneticisi** rolü etiketlenir (CEO/Yönetici
   değil) - Berilis'in hiyerarşisine saygı gösterir.
5. Her adım `logInteraction` ile kaydedilir - soru, cevap, kategori, escalate edildi mi,
   hangi model. İleride bir insan `addCorrection(id, doğruCevap)` ile düzeltme eklerse bu
   satır RAG'in en değerli eğitim verisi olur.

## Kurulum

### 1. Discord Developer Portal

1. https://discord.com/developers/applications → **New Application**.
2. **Bot** sekmesi → **Reset Token** ile bir token al, `.env`'e `DISCORD_TOKEN` olarak koy.
3. Aynı sayfada **Privileged Gateway Intents** altında **Message Content Intent**'i aç
   (bu kapalıyken bot mesaj içeriğini asla göremez).
4. **OAuth2 → URL Generator**: scope `bot`, permission en az `Send Messages`,
   `Read Message History`, `View Channels`, ve Sistem Yöneticisi rolünü etiketleyebilmesi
   için `Mention @everyone, @here, and All Roles` (ya da o rolü Discord tarafında
   "mentionable" yap). Oluşan linkle botu sunucuna davet et.

### 2. Discord sunucu tarafı

- **Sistem Yöneticisi** rolünün tam olarak bu isimde var olduğundan emin ol (ya da
  `.env`'de `ADMIN_ROLE_NAME` ile gerçek adını belirt). Bot sadece bu role escalate eder,
  CEO/Yönetici gibi üst rollere değil.
- Botun cevap vereceği ticket kanallarının ID'lerini (Developer Mode açıkken sağ tık →
  Copy Channel ID) `SUPPORT_CHANNEL_IDS` içine virgülle ayırarak ekle, ya da ticket
  sisteminiz kanal isimlerini bir önekle oluşturuyorsa `TICKET_CHANNEL_PREFIX`'i ona göre
  ayarla.

### 3. Anthropic

`ANTHROPIC_API_KEY` - https://console.anthropic.com/settings/keys üzerinden al.

### 4. .env dosyası

```bash
cp .env.example .env
```

sonra `.env` içindeki değerleri doldur (bkz. [.env.example](.env.example) - her satırda
açıklama var).

### 5. Fiyat/paket bilgisini doldur

[src/knowledge/pricingBlock.ts](src/knowledge/pricingBlock.ts) içindeki
`PRICING_INFO_BLOCK` sabitini gerçek Berilis paket adları, fiyatları ve özellikleriyle
doldur - bot fiyat sorularına burayı **olduğu gibi** yanıt olarak gönderir.

### 6. Çalıştır

Kök dizinden:

```bash
pnpm install
pnpm --filter @kasap/core build   # core önce derlenmeli
pnpm dev:berilis                   # tsx watch ile geliştirme modu
```

Prod için:

```bash
pnpm --filter @kasap/berilis-agent build
pnpm --filter @kasap/berilis-agent start
```

## Test

```bash
pnpm --filter @kasap/berilis-agent test
```

Discord'a veya Anthropic'e gerçek bağlantı gerektirmeyen saf mantık (kanal/escalation
seçimi, fiyat sorusu tespiti) test edilir.
