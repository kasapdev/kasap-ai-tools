import { readFile } from "node:fs/promises";
import { getDocumentProxy, extractText } from "unpdf";

/** Extracts the real text layer of a PDF invoice. Does not OCR - a scanned/
 * image-only PDF with no text layer will return little or no text. */
export async function extractPdfText(filePath: string): Promise<string> {
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch (error) {
    throw new Error(
      `PDF dosyası okunamadı: ${filePath} (${error instanceof Error ? error.message : error})`,
    );
  }

  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  } catch (error) {
    throw new Error(
      `PDF metni ayrıştırılamadı: ${filePath} (${error instanceof Error ? error.message : error})`,
    );
  }
}
