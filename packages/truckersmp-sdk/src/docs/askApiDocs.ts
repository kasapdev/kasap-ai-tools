import { indexKnowledge, retrieveContext, sendMessage } from "@kasap/core";
import { API_REFERENCE, formatApiReferenceAsText } from "./apiReference.js";

const SYSTEM_PROMPT_PREFIX = `Sen TruckersMP Web API (https://api.truckersmp.com/v2) hakkında
uzman bir asistansın. Aşağıda bu SDK'nın desteklediği endpoint referansı var. Sorulara bu
referansa dayanarak kısa ve net Türkçe cevaplar ver. Referansta olmayan bir şey soruluyorsa
bunu açıkça belirt, uydurma.

## Endpoint Referansı
`;

/**
 * Answers a question about the TruckersMP API. Always grounds the answer in
 * the static endpoint reference (works out of the box, no setup); also pulls
 * in whatever @kasap/core's RAG layer has indexed (retrieveContext() is a
 * no-op returning [] until RAG_ENABLED=true - see indexApiDocs() below and
 * packages/core/.env.example).
 */
export async function askApiDocs(question: string): Promise<string> {
  const retrieved = await retrieveContext(question);
  const retrievedText =
    retrieved.length > 0
      ? `\n\n## İlgili Ek Bağlam (RAG)\n${retrieved.map((chunk) => `- ${chunk.text}`).join("\n")}`
      : "";

  const system = `${SYSTEM_PROMPT_PREFIX}${formatApiReferenceAsText()}${retrievedText}`;

  const result = await sendMessage({
    system,
    messages: [{ role: "user", content: question }],
    effort: "low",
  });

  return result.text;
}

/** Indexes the endpoint reference into the RAG knowledge base. Requires
 * RAG_ENABLED=true and chromadb/voyageai installed (see packages/core/.env.example) -
 * throws a clear error otherwise via indexKnowledge(). */
export async function indexApiDocs(): Promise<void> {
  await indexKnowledge(
    API_REFERENCE.map((entry) => ({
      id: `truckersmp-api-${entry.id}`,
      text: `${entry.method} ${entry.path} - ${entry.summary}${entry.notes ? ` Not: ${entry.notes}` : ""}`,
      metadata: { source: "truckersmp-api-reference", endpoint: entry.path },
    })),
  );
}
