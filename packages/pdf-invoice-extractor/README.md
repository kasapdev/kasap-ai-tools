# pdf-invoice-extractor

PDF faturalardan (Sadakat Logistics / eBay muhasebesi için) yapılandırılmış veri çıkaran bir
CLI. [`unpdf`](https://www.npmjs.com/package/unpdf) (güncel bir pdf.js derlemesi üzerine kurulu,
sunucusuz/Node ortamları için tasarlanmış) ile PDF'in gerçek metin katmanını çıkarır, ardından
`@kasap/core`'un `sendStructuredMessage`'ı ile bu metne dayanarak (uydurmadan) yapılandırılmış
fatura alanlarını doldurur.

**Sınırlama:** Bu araç OCR yapmaz. Sadece PDF'in gömülü metin katmanını okur - taranmış
(image-only) bir fatura PDF'inde metin katmanı olmadığından çok az ya da hiç metin dönmez ve
çıkarım da buna bağlı olarak zayıf/boş olur.

## Deterministik toplam doğrulaması

`CONTRIBUTING.md`'deki "hard constraint'lere modelin uyacağına güvenmeyin" ilkesiyle aynı
şekilde ([bkz. `listing-optimizer`'ın `enforceTitleLength`'i](../listing-optimizer/README.md)):
Claude'un çıkardığı sayılara körü körüne güvenilmez. [`src/validateInvoice.ts`](src/validateInvoice.ts)
çıkarım sonrası saf kod tarafında şunları kontrol eder:

- Kalem toplamlarının (`lineItems[].total`) toplamı `subtotal` ile tutarlı mı?
- `subtotal + tax`, `grandTotal`'a eşit mi?
- Her kalemde `quantity * unitPrice`, o kalemin `total`'ına eşit mi?

Küçük bir tolerans (0.01) payı bırakılır. Uyuşmazlık **hata değil, uyarıdır** - PDF'ten
çıkarılan bir faturanın toplamları tutmasa bile çıkarılan veri yine de faydalı olabilir; karar
kullanıcıya bırakılır.

## Kurulum

```bash
pnpm install
pnpm --filter @kasap/core build
cp packages/pdf-invoice-extractor/.env.example packages/pdf-invoice-extractor/.env
pnpm --filter @kasap/pdf-invoice-extractor build
```

## Kullanım

```bash
node packages/pdf-invoice-extractor/dist/cli.js extract fatura.pdf
node packages/pdf-invoice-extractor/dist/cli.js extract fatura.pdf -o fatura.json
```

## Test

```bash
pnpm --filter @kasap/pdf-invoice-extractor test
```

Toplam doğrulama mantığı saf birim testleriyle (tolerans dahil), PDF metin çıkarma gerçek bir
minimal PDF fixture'ıyla, Claude çağrısı ise `@kasap/core` mock'lanarak test edilir - gerçek
ağ çağrısı yapılmaz.
