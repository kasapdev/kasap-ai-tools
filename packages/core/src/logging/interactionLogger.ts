import { randomUUID } from "node:crypto";
import type { SQLInputValue } from "node:sqlite";
import { getDatabase } from "../memory/db.js";
import type { InteractionFilters, InteractionLogEntry, InteractionRecord } from "./types.js";

interface InteractionRow {
  id: string;
  project: string;
  created_at: string;
  user_id: string | null;
  channel_id: string | null;
  question: string;
  answer: string;
  category: string | null;
  escalated: number;
  model: string | null;
  correction: string | null;
  metadata: string | null;
}

function rowToRecord(row: InteractionRow): InteractionRecord {
  return {
    id: row.id,
    project: row.project,
    createdAt: row.created_at,
    userId: row.user_id ?? undefined,
    channelId: row.channel_id ?? undefined,
    question: row.question,
    answer: row.answer,
    category: row.category ?? undefined,
    escalated: row.escalated === 1,
    model: row.model ?? undefined,
    correction: row.correction,
    metadata: row.metadata ? (JSON.parse(row.metadata) as Record<string, unknown>) : undefined,
  };
}

/** Records one question/answer interaction. Every agent should log every
 * interaction here - this table is the raw material for RAG once enough
 * data (and human corrections) has accumulated. */
export function logInteraction(entry: InteractionLogEntry): string {
  const db = getDatabase();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO interactions
       (id, project, created_at, user_id, channel_id, question, answer, category, escalated, model, correction, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    entry.project,
    new Date().toISOString(),
    entry.userId ?? null,
    entry.channelId ?? null,
    entry.question,
    entry.answer,
    entry.category ?? null,
    entry.escalated ? 1 : 0,
    entry.model ?? null,
    null,
    entry.metadata ? JSON.stringify(entry.metadata) : null,
  );
  return id;
}

/** Attaches a human correction to a logged interaction (e.g. a staff member
 * fixed the bot's answer). Corrected rows are the highest-value RAG data. */
export function addCorrection(id: string, correction: string): void {
  const db = getDatabase();
  db.prepare(`UPDATE interactions SET correction = ? WHERE id = ?`).run(correction, id);
}

export function listInteractions(filters: InteractionFilters = {}): InteractionRecord[] {
  const db = getDatabase();
  const clauses: string[] = [];
  const params: SQLInputValue[] = [];

  if (filters.project) {
    clauses.push("project = ?");
    params.push(filters.project);
  }
  if (filters.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }
  if (filters.escalated !== undefined) {
    clauses.push("escalated = ?");
    params.push(filters.escalated ? 1 : 0);
  }
  if (filters.hasCorrection) {
    clauses.push("correction IS NOT NULL");
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = filters.limit ?? 100;
  const rows = db
    .prepare(
      `SELECT * FROM interactions ${where} ORDER BY created_at DESC LIMIT ?`,
    )
    .all(...params, limit) as unknown as InteractionRow[];

  return rows.map(rowToRecord);
}
