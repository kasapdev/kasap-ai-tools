import { sendStructuredMessage } from "@kasap/core";
import { extractPdfText } from "./extractPdfText.js";
import { InvoiceSchema, type Invoice } from "./schema.js";
import { validateInvoiceTotals, type InvoiceValidation } from "./validateInvoice.js";

const SYSTEM_PROMPT = `Sen fatura verisi çıkarma konusunda uzman bir asistansın. Sana bir PDF
faturadan çıkarılmış ham metin verilecek. Bu metne dayanarak yapılandırılmış fatura alanlarını
doldur. SADECE metinde gerçekten geçen bilgileri kullan, hiçbir değeri uydurma. Bir sayısal alan
metinde gerçekten yoksa 0 kullan, tahmin etme.`;

export interface ExtractInvoiceResult {
  invoice: Invoice;
  validation: InvoiceValidation;
}

/** Extracts invoice text from `text` (already pulled from a PDF) via Claude,
 * then runs deterministic arithmetic validation on the result. Kept separate
 * from `extractInvoiceFromPdf` so the LLM-wiring logic is testable without a
 * real PDF file. */
export async function extractInvoiceFromText(text: string): Promise<ExtractInvoiceResult> {
  const invoice = await sendStructuredMessage({
    schema: InvoiceSchema,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  return { invoice, validation: validateInvoiceTotals(invoice) };
}

/** Reads and extracts a PDF invoice from disk, end to end. */
export async function extractInvoiceFromPdf(filePath: string): Promise<ExtractInvoiceResult> {
  const text = await extractPdfText(filePath);
  return extractInvoiceFromText(text);
}
