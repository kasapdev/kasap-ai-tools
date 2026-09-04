import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

let db: DatabaseSync | null = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS prompt_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version INTEGER NOT NULL,
    hash TEXT NOT NULL,
    content TEXT NOT NULL,
    message TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(name, version)
  );

  CREATE INDEX IF NOT EXISTS idx_prompt_versions_name
    ON prompt_versions (name, version);
`;

/** Opens (creating if needed) this package's own local SQLite store, separate
 * from @kasap/core's - this package is deliberately provider-independent and
 * has no reason to share core's interactions/conversation schema. */
export function initPromptDb(dbPath: string): DatabaseSync {
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  return db;
}

export function getPromptDb(): DatabaseSync {
  if (!db) {
    throw new Error("Veritabanı henüz başlatılmadı. Önce initPromptDb(dbPath) çağırın.");
  }
  return db;
}

export function closePromptDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
