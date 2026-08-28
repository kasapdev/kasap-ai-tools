import { getDatabase } from "./db.js";

export type ConversationRole = "user" | "assistant";

export interface ConversationMessage {
  role: ConversationRole;
  content: string;
  createdAt: string;
}

/** Appends one turn to a conversation's history (identified by an arbitrary id,
 * e.g. a Discord channel/thread id). */
export function appendMessage(
  conversationId: string,
  role: ConversationRole,
  content: string,
): void {
  const db = getDatabase();
  db.prepare(
    `INSERT INTO conversation_messages (conversation_id, role, content, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(conversationId, role, content, new Date().toISOString());
}

/** Returns the most recent `limit` messages for a conversation, oldest first -
 * ready to feed straight into an Anthropic.MessageParam[] messages array. */
export function getRecentMessages(
  conversationId: string,
  limit = 20,
): ConversationMessage[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT role, content, created_at as createdAt
       FROM conversation_messages
       WHERE conversation_id = ?
       ORDER BY id DESC
       LIMIT ?`,
    )
    .all(conversationId, limit) as unknown as ConversationMessage[];
  return rows.reverse();
}

export function clearConversation(conversationId: string): void {
  const db = getDatabase();
  db.prepare(`DELETE FROM conversation_messages WHERE conversation_id = ?`).run(
    conversationId,
  );
}
