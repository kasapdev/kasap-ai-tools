const CODE_BLOCK_RE = /```[a-zA-Z0-9_+-]*\n([\s\S]*?)```/g;

/** Pulls the fenced code block out of a markdown response. If the model
 * returned several blocks, keeps the longest one (heuristically the actual
 * generated file, as opposed to a short inline snippet in an explanation).
 * Falls back to the raw trimmed text if no fenced block is present. */
export function extractCodeBlock(markdown: string): string {
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = CODE_BLOCK_RE.exec(markdown)) !== null) {
    const content = match[1];
    if (content !== undefined) blocks.push(content.trimEnd());
  }

  if (blocks.length === 0) return markdown.trim();

  return blocks.reduce((longest, current) =>
    current.split("\n").length > longest.split("\n").length ? current : longest,
  );
}
