export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

export interface KnowledgeChunk {
  id: string;
  text: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RetrievedChunk extends KnowledgeChunk {
  /** Lower is more similar (raw distance from the vector store). */
  distance: number | null;
}

export interface VectorStore {
  upsert(chunks: KnowledgeChunk[], embeddings: number[][]): Promise<void>;
  query(embedding: number[], topK: number): Promise<RetrievedChunk[]>;
}
