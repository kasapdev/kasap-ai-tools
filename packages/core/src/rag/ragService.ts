import { getCoreConfig } from "../config.js";
import { VoyageEmbeddingProvider } from "./embeddings.js";
import { ChromaVectorStore } from "./vectorStore.js";
import type { EmbeddingProvider, KnowledgeChunk, RetrievedChunk, VectorStore } from "./types.js";

let embeddingProvider: EmbeddingProvider | null = null;
let vectorStore: VectorStore | null = null;

function getProvider(): EmbeddingProvider {
  if (!embeddingProvider) embeddingProvider = new VoyageEmbeddingProvider();
  return embeddingProvider;
}

function getStore(): VectorStore {
  if (!vectorStore) vectorStore = new ChromaVectorStore();
  return vectorStore;
}

/**
 * Retrieves relevant knowledge chunks for a query. Returns [] whenever
 * RAG_ENABLED is not "true" - safe to call unconditionally from any agent
 * even before there is any knowledge indexed. Flip RAG_ENABLED on once
 * enough logged interactions/corrections have been indexed into Chroma.
 */
export async function retrieveContext(query: string, topK = 5): Promise<RetrievedChunk[]> {
  const config = getCoreConfig();
  if (!config.ragEnabled) return [];

  const [embedding] = await getProvider().embed([query]);
  if (!embedding) return [];
  return getStore().query(embedding, topK);
}

export async function indexKnowledge(chunks: KnowledgeChunk[]): Promise<void> {
  const config = getCoreConfig();
  if (!config.ragEnabled) {
    throw new Error("RAG_ENABLED=true değilken indexKnowledge çağrılamaz.");
  }
  if (chunks.length === 0) return;

  const embeddings = await getProvider().embed(chunks.map((c) => c.text));
  await getStore().upsert(chunks, embeddings);
}
