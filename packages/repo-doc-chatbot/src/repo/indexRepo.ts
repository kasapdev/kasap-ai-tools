import { readFileSync } from "node:fs";
import { join } from "node:path";
import { indexKnowledge } from "@kasap/core";
import { listTrackedDocFiles, listTrackedSourceFilesForComments } from "./listFiles.js";
import { extractLeadingCommentsFromSource } from "./extractComments.js";
import { chunkText } from "./chunk.js";

/** Indexes an arbitrary local git repo's docs + leading source comments into
 * @kasap/core's RAG layer. Requires RAG_ENABLED=true (indexKnowledge throws
 * otherwise - that error is intentionally left to propagate to the caller). */
export async function indexRepoDocs(
  repoPath: string,
): Promise<{ filesIndexed: number; chunksIndexed: number }> {
  const docFiles = listTrackedDocFiles(repoPath);
  const sourceFiles = listTrackedSourceFilesForComments(repoPath);

  let filesIndexed = 0;
  let chunksIndexed = 0;

  for (const relPath of docFiles) {
    const text = readFileSync(join(repoPath, relPath), "utf8");
    const chunks = chunkText(text);
    if (chunks.length === 0) continue;
    await indexKnowledge(
      chunks.map((chunk, i) => ({
        id: `${relPath}#${i}`,
        text: chunk,
        metadata: { source: relPath, repo: repoPath },
      })),
    );
    filesIndexed++;
    chunksIndexed += chunks.length;
  }

  for (const relPath of sourceFiles) {
    const source = readFileSync(join(repoPath, relPath), "utf8");
    const comment = extractLeadingCommentsFromSource(source);
    if (comment.length === 0) continue;
    await indexKnowledge([
      { id: `${relPath}#comment`, text: comment, metadata: { source: relPath, repo: repoPath } },
    ]);
    filesIndexed++;
    chunksIndexed += 1;
  }

  return { filesIndexed, chunksIndexed };
}
