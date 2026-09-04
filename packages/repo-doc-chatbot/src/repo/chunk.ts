/** Splits text into overlapping character-window chunks, sliding forward by
 * (chunkSize - overlap) each step. Guards against a non-positive stride
 * (overlap >= chunkSize) by falling back to no overlap, so this never loops
 * forever. Empty/whitespace-only chunks are dropped. */
export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  if (text.length === 0) return [];
  const stride = overlap >= chunkSize ? chunkSize : chunkSize - overlap;

  const chunks: string[] = [];
  for (let start = 0; start < text.length; start += stride) {
    const chunk = text.slice(start, start + chunkSize);
    if (chunk.trim().length > 0) chunks.push(chunk);
    if (start + chunkSize >= text.length) break;
  }
  return chunks;
}
