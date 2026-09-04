import { readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { retrieveContext, sendMessage } from "@kasap/core";
import { listTrackedDocFiles } from "./listFiles.js";

const RAG_SYSTEM_PREFIX = `Sen bir git deposunun dokümantasyonu hakkında uzman bir asistansın.
Aşağıda RAG (retrieval-augmented generation) ile bulunmuş, soruyla ilgili doküman parçaları
var. Cevabını SADECE bu parçalara dayanarak ver. Parçalarda olmayan bir şey soruluyorsa bunu
açıkça belirt, uydurma.

## İlgili Doküman Parçaları
`;

const FALLBACK_SYSTEM_PREFIX = `Sen bir git deposunun dokümantasyonu hakkında uzman bir asistansın.
RAG aktif değil (ya da henüz hiçbir şey indekslenmemiş), bu yüzden aşağıda depodan doğrudan
alınmış dosya alıntıları var. Cevabını SADECE bu alıntılara dayanarak ver. Alıntılarda olmayan
bir şey soruluyorsa bunu açıkça belirt, uydurma.

## Dosya Alıntıları
`;

const FALLBACK_CHAR_BUDGET = 6000;

function buildFallbackExcerpts(repoPath: string): string {
  const docFiles = listTrackedDocFiles(repoPath);
  // Prioritize README-named files first so the most useful context fits
  // inside the character budget.
  const sorted = [...docFiles].sort((a, b) => {
    const aIsReadme = basename(a).toLowerCase().startsWith("readme") ? 0 : 1;
    const bIsReadme = basename(b).toLowerCase().startsWith("readme") ? 0 : 1;
    return aIsReadme - bIsReadme;
  });

  let budget = FALLBACK_CHAR_BUDGET;
  const parts: string[] = [];
  for (const relPath of sorted) {
    if (budget <= 0) break;
    let text: string;
    try {
      text = readFileSync(join(repoPath, relPath), "utf8");
    } catch {
      continue;
    }
    const excerpt = text.slice(0, budget);
    parts.push(`### ${relPath}\n${excerpt}`);
    budget -= excerpt.length;
  }
  return parts.join("\n\n");
}

/** Answers a question about an arbitrary local repo. Always grounds the
 * answer in something real: retrieveContext() first (a safe no-op returning
 * [] until RAG_ENABLED=true and something has been indexed via
 * indexRepoDocs()); when that's empty, falls back to including real file
 * excerpts directly in the prompt so this always works out of the box,
 * mirroring truckersmp-sdk's askApiDocs() "always grounded" approach. */
export async function askAboutRepo(
  repoPath: string,
  question: string,
): Promise<{ answer: string; usedRag: boolean }> {
  const retrieved = await retrieveContext(question);

  let system: string;
  let usedRag: boolean;

  if (retrieved.length > 0) {
    system = `${RAG_SYSTEM_PREFIX}${retrieved.map((chunk) => `- ${chunk.text}`).join("\n")}`;
    usedRag = true;
  } else {
    system = `${FALLBACK_SYSTEM_PREFIX}${buildFallbackExcerpts(repoPath)}`;
    usedRag = false;
  }

  const result = await sendMessage({
    system,
    messages: [{ role: "user", content: question }],
    effort: "low",
  });

  return { answer: result.text, usedRag };
}
