import { getCoreConfig } from "../config.js";
import type { KnowledgeChunk, RetrievedChunk, VectorStore } from "./types.js";

interface ChromaCollection {
  add(args: {
    ids: string[];
    embeddings: number[][];
    documents: string[];
    metadatas?: Record<string, string | number | boolean>[];
  }): Promise<void>;
  query(args: {
    queryEmbeddings: number[][];
    nResults: number;
  }): Promise<{
    ids: string[][];
    documents: (string | null)[][];
    distances: (number | null)[][];
    metadatas: (Record<string, string | number | boolean> | null)[][];
  }>;
}

interface ChromaClientLike {
  getOrCreateCollection(args: { name: string }): Promise<ChromaCollection>;
}

/**
 * Chroma-backed vector store. Not a package.json dependency - RAG is inactive
 * until there is data to index. Activate with:
 *
 *   pnpm add chromadb --filter @kasap/core
 *
 * and set CHROMA_URL (and RAG_ENABLED=true) in the consuming project's .env.
 * Run a Chroma server yourself (see https://docs.trychroma.com/guides) - this
 * class is only the client.
 */
export class ChromaVectorStore implements VectorStore {
  private collectionPromise: Promise<ChromaCollection> | null = null;

  private async getCollection(): Promise<ChromaCollection> {
    if (!this.collectionPromise) {
      const config = getCoreConfig();
      if (!config.chromaUrl) {
        throw new Error(
          "CHROMA_URL tanımlı değil. RAG'i aktifleştirmek için .env dosyasına ekleyin.",
        );
      }

      // Non-literal specifier: keeps tsc from requiring the module to be
      // installed/resolvable until RAG is actually activated.
      const moduleName = "chromadb";
      let chromaModule: { ChromaClient: new (args: { path: string }) => ChromaClientLike };
      try {
        chromaModule = await import(moduleName);
      } catch {
        throw new Error(
          "'chromadb' paketi kurulu değil. RAG'i aktifleştirmek için: pnpm add chromadb --filter @kasap/core",
        );
      }

      const client = new chromaModule.ChromaClient({ path: config.chromaUrl });
      this.collectionPromise = client.getOrCreateCollection({ name: config.chromaCollection });
    }
    return this.collectionPromise;
  }

  async upsert(chunks: KnowledgeChunk[], embeddings: number[][]): Promise<void> {
    const collection = await this.getCollection();
    await collection.add({
      ids: chunks.map((c) => c.id),
      embeddings,
      documents: chunks.map((c) => c.text),
      metadatas: chunks.map((c) => c.metadata ?? {}),
    });
  }

  async query(embedding: number[], topK: number): Promise<RetrievedChunk[]> {
    const collection = await this.getCollection();
    const result = await collection.query({ queryEmbeddings: [embedding], nResults: topK });

    const ids = result.ids[0] ?? [];
    const documents = result.documents[0] ?? [];
    const distances = result.distances[0] ?? [];
    const metadatas = result.metadatas[0] ?? [];

    return ids.map((id, i) => ({
      id,
      text: documents[i] ?? "",
      distance: distances[i] ?? null,
      metadata: metadatas[i] ?? undefined,
    }));
  }
}
