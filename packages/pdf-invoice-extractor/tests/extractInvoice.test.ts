import { describe, expect, it, vi } from "vitest";
import { extractInvoiceFromText } from "../src/extractInvoice.js";
import type { Invoice } from "../src/schema.js";

const canned = vi.hoisted(
  (): Invoice => ({
    vendorName: "Acme Corp",
    invoiceNumber: "INV-001",
    invoiceDate: "2026-01-01",
    currency: "USD",
    lineItems: [{ description: "Widget", quantity: 2, unitPrice: 10, total: 20 }],
    subtotal: 20,
    tax: 0,
    grandTotal: 999, // deliberately wrong, to prove validation runs on the real result
  }),
);

vi.mock("@kasap/core", () => ({
  sendStructuredMessage: vi.fn().mockResolvedValue(canned),
}));

describe("extractInvoiceFromText", () => {
  it("wires extracted text into sendStructuredMessage and validates the result", async () => {
    const { sendStructuredMessage } = await import("@kasap/core");
    const result = await extractInvoiceFromText("some raw invoice text");

    expect(sendStructuredMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "some raw invoice text" }],
      }),
    );
    expect(result.invoice).toEqual(canned);
    expect(result.validation.valid).toBe(false);
    expect(result.validation.warnings.length).toBeGreaterThan(0);
  });
});
