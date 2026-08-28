export interface CoreConfig {
  anthropicModel: string;
  coreDbPath: string;
  ragEnabled: boolean;
  chromaUrl?: string;
  chromaCollection: string;
  voyageApiKey?: string;
  voyageModel: string;
}

/**
 * Reads shared core settings from process.env on every call (not cached at
 * import time) so tests and multi-project processes can vary env safely.
 * Each app is responsible for loading its own .env (via dotenv) before
 * calling into core - core itself never calls dotenv.config().
 */
export function getCoreConfig(): CoreConfig {
  return {
    anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-opus-5",
    coreDbPath: process.env.CORE_DB_PATH ?? "./data/core.sqlite",
    ragEnabled: process.env.RAG_ENABLED === "true",
    chromaUrl: process.env.CHROMA_URL,
    chromaCollection: process.env.CHROMA_COLLECTION ?? "kasap-knowledge",
    voyageApiKey: process.env.VOYAGE_API_KEY,
    voyageModel: process.env.VOYAGE_MODEL ?? "voyage-3.5",
  };
}
