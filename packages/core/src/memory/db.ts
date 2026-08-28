import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

let db: DatabaseSync | null = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS interactions (
    id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    created_at TEXT NOT NULL,
    user_id TEXT,
    channel_id TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    escalated INTEGER NOT NULL DEFAULT 0,
    model TEXT,
    correction TEXT,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS conversation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv
    ON conversation_messages (conversation_id, id);

  CREATE INDEX IF NOT EXISTS idx_interactions_project
    ON interactions (project, created_at);
`;

/** Opens (creating if needed) the shared SQLite store and ensures the schema exists.
 * Call once per process at startup; every project keeps its own db file via CORE_DB_PATH. */
export function initDatabase(dbPath: string): DatabaseSync {
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  return db;
}

export function getDatabase(): DatabaseSync {
  if (!db) {
    throw new Error("Veritabanı henüz başlatılmadı. Önce initDatabase(dbPath) çağırın.");
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
