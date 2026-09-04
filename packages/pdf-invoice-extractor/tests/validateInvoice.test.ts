import { describe, expect, it } from "vitest";
import { validateInvoiceTotals } from "../src/validateInvoice.js";
import type { Invoice } from "../src/schema.js";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    vendorName: "Acme Corp",
    invoiceNumber: "INV-001",
    invoiceDate: "2026-01-01",
    currency: "USD",
    lineItems: [
      { description: "Widget", quantity: 2, unitPrice: 10, total: 20 },
      { description: "Gadget", quantity: 1, unitPrice: 30, total: 30 },
    ],
    subtotal: 50,
    tax: 5,
    grandTotal: 55,
    ...overrides,
  };
}

describe("validateInvoiceTotals", () => {
  it("reports no warnings for a well-formed invoice", () => {
    const result = validateInvoiceTotals(makeInvoice());
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("flags when line items don't sum to subtotal", () => {
    const result = validateInvoiceTotals(makeInvoice({ subtotal: 999 }));
    expect(result.valid).toBe(false);
    expect(result.warnings.some((w) => w.includes("Kalem toplamları"))).toBe(true);
  });

  it("flags when subtotal + tax != grandTotal", () => {
    const result = validateInvoiceTotals(makeInvoice({ grandTotal: 999 }));
    expect(result.valid).toBe(false);
    expect(result.warnings.some((w) => w.includes("Ara toplam + vergi"))).toBe(true);
  });

  it("tolerates a tiny rounding difference", () => {
    const result = validateInvoiceTotals(makeInvoice({ grandTotal: 55.001 }));
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("flags a single line item whose quantity * unitPrice mismatches its total", () => {
    const result = validateInvoiceTotals(
      makeInvoice({
        lineItems: [
          { description: "Widget", quantity: 2, unitPrice: 10, total: 999 },
          { description: "Gadget", quantity: 1, unitPrice: 30, total: 30 },
        ],
        subtotal: 1029,
        grandTotal: 1034,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.warnings.some((w) => w.includes("Kalem 1"))).toBe(true);
  });
});
