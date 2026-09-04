import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdtempSync, rmSync, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import PDFDocument from "pdfkit";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { extractPdfText } from "../src/extractPdfText.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let fixtureDir: string;
let fixture: string;

// Generated with the real `pdfkit` library rather than hand-written PDF
// bytes, so the fixture is guaranteed to be a spec-valid PDF (a hand-rolled
// xref table is easy to get subtly wrong in ways pdf.js's strict reader
// rejects, since it doesn't fall back to recovery mode for every error).
function writeFixturePdf(filePath: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(12).text(text, 10, 100);
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

beforeAll(async () => {
  fixtureDir = mkdtempSync(path.join(tmpdir(), "pdf-invoice-extractor-test-"));
  fixture = path.join(fixtureDir, "sample-invoice.pdf");
  await writeFixturePdf(fixture, "Invoice INV-100 Total 55.00");
});

afterAll(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

describe("extractPdfText", () => {
  it("extracts the real text layer of a minimal PDF fixture", async () => {
    const text = await extractPdfText(fixture);
    expect(text).toContain("Invoice INV-100 Total 55.00");
  });

  it("throws a clear error for a missing file", async () => {
    await expect(extractPdfText(path.join(__dirname, "fixtures", "does-not-exist.pdf"))).rejects.toThrow(
      /PDF dosyası okunamadı/,
    );
  });
});
