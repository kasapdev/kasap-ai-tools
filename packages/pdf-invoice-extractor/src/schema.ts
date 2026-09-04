import { z } from "zod";

export const InvoiceLineItemSchema = z.object({
  description: z.string().describe("Kalem açıklaması"),
  quantity: z.number().describe("Miktar"),
  unitPrice: z.number().describe("Birim fiyat"),
  total: z.number().describe("Bu kalemin toplam tutarı (quantity * unitPrice olmalı)"),
});

export const InvoiceSchema = z.object({
  vendorName: z.string().describe("Faturayı kesen satıcı/tedarikçi adı"),
  invoiceNumber: z.string().describe("Fatura numarası"),
  invoiceDate: z.string().describe("Fatura tarihi, belgede yazdığı gibi"),
  currency: z.string().describe("Para birimi (ISO kodu veya sembol, belgede geçtiği gibi)"),
  lineItems: z.array(InvoiceLineItemSchema).describe("Fatura kalemleri"),
  subtotal: z.number().describe("Ara toplam (vergi hariç)"),
  tax: z.number().describe("Vergi tutarı"),
  grandTotal: z.number().describe("Genel toplam (vergi dahil)"),
});

export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
