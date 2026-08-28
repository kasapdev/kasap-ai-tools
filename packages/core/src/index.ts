export { getCoreConfig } from "./config.js";
export type { CoreConfig } from "./config.js";

export {
  getAnthropicClient,
  sendMessage,
  streamMessage,
  sendStructuredMessage,
  Anthropic,
} from "./anthropic/client.js";
export type {
  ChatMessageInput,
  ChatResult,
  StreamMessageInput,
  StructuredMessageInput,
  Effort,
} from "./anthropic/client.js";

export { initDatabase, getDatabase, closeDatabase } from "./memory/db.js";
export {
  appendMessage,
  getRecentMessages,
  clearConversation,
} from "./memory/conversationStore.js";
export type { ConversationMessage, ConversationRole } from "./memory/conversationStore.js";

export { logInteraction, addCorrection, listInteractions } from "./logging/interactionLogger.js";
export type {
  InteractionLogEntry,
  InteractionRecord,
  InteractionFilters,
} from "./logging/types.js";

export { retrieveContext, indexKnowledge } from "./rag/ragService.js";
export { VoyageEmbeddingProvider } from "./rag/embeddings.js";
export { ChromaVectorStore } from "./rag/vectorStore.js";
export type { EmbeddingProvider, VectorStore, KnowledgeChunk, RetrievedChunk } from "./rag/types.js";
