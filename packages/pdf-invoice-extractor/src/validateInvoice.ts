import type { Invoice } from "./schema.js";

export interface InvoiceValidation {
  valid: boolean;
  warnings: string[];
}

// Absolute tolerance in currency units - PDF-extracted numbers can carry tiny
// rounding noise, but this is not meant to hide a real mismatch.
const TOLERANCE = 0.01;

function approxEqual(a: number, b: number, tolerance = TOLERANCE): boolean {
  return Math.abs(a - b) <= tolerance;
}

/** Deterministic (non-LLM) sanity check on invoice arithmetic. Never trust
 * the model's own math - it can misread digits from noisy PDF text. Mismatches
 * are reported as warnings, not thrown errors: the extraction itself may still
 * be useful even when the totals don't perfectly reconcile. */
export function validateInvoiceTotals(invoice: Invoice, tolerance = TOLERANCE): InvoiceValidation {
  const warnings: string[] = [];

  const lineItemSum = invoice.lineItems.reduce((sum, item) => sum + item.total, 0);
  if (!approxEqual(lineItemSum, invoice.subtotal, tolerance)) {
    warnings.push(
      `Kalem toplamları (${lineItemSum.toFixed(2)}) ara toplamla (${invoice.subtotal.toFixed(2)}) uyuşmuyor.`,
    );
  }

  const expectedGrandTotal = invoice.subtotal + invoice.tax;
  if (!approxEqual(expectedGrandTotal, invoice.grandTotal, tolerance)) {
    warnings.push(
      `Ara toplam + vergi (${expectedGrandTotal.toFixed(2)}) genel toplamla (${invoice.grandTotal.toFixed(2)}) uyuşmuyor.`,
    );
  }

  invoice.lineItems.forEach((item, index) => {
    const expectedTotal = item.quantity * item.unitPrice;
    if (!approxEqual(expectedTotal, item.total, tolerance)) {
      warnings.push(
        `Kalem ${index + 1} ("${item.description}"): miktar * birim fiyat = ${expectedTotal.toFixed(2)}, ` +
          `ancak yazan toplam ${item.total.toFixed(2)}.`,
      );
    }
  });

  return { valid: warnings.length === 0, warnings };
}
