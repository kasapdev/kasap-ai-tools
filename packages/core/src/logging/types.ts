export interface InteractionLogEntry {
  /** Which project logged this, e.g. "berilis-agent", "roblox-ai". */
  project: string;
  question: string;
  answer: string;
  /** Free-form category assigned by the agent (e.g. "dns", "cpanel", "paket_fiyat"). */
  category?: string;
  /** Whether this interaction was escalated to a human. */
  escalated?: boolean;
  /** The Claude model that produced the answer. */
  model?: string;
  userId?: string;
  channelId?: string;
  /** Any extra structured context worth keeping (JSON-serializable). */
  metadata?: Record<string, unknown>;
}

export interface InteractionRecord extends InteractionLogEntry {
  id: string;
  createdAt: string;
  escalated: boolean;
  correction: string | null;
}

export interface InteractionFilters {
  project?: string;
  category?: string;
  escalated?: boolean;
  /** Only rows with a human correction attached - this is the RAG training set. */
  hasCorrection?: boolean;
  limit?: number;
}
