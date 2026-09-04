import { createHash } from "node:crypto";
import { getPromptDb } from "./db.js";

export interface SaveResult {
  version: number;
  hash: string;
  created: boolean;
}

export interface PromptLogEntry {
  version: number;
  hash: string;
  message: string | null;
  createdAt: string;
}

export interface PromptVersionRecord extends PromptLogEntry {
  name: string;
  content: string;
}

interface LatestRow {
  version: number;
  hash: string;
}

interface LogRow {
  version: number;
  hash: string;
  message: string | null;
  createdAt: string;
}

interface ContentRow extends LogRow {
  content: string;
}

export function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function getLatest(name: string): LatestRow | undefined {
  const db = getPromptDb();
  return db
    .prepare(`SELECT version, hash FROM prompt_versions WHERE name = ? ORDER BY version DESC LIMIT 1`)
    .get(name) as unknown as LatestRow | undefined;
}

/** Saves a new version of a prompt only if its content differs from the
 * latest stored version (content-addressed, git-like dedup - identical
 * content is a no-op, mirroring "nothing to commit, working tree clean"). */
export function saveVersion(name: string, content: string, message?: string): SaveResult {
  const db = getPromptDb();
  const hash = hashContent(content);
  const latest = getLatest(name);

  if (latest && latest.hash === hash) {
    return { version: latest.version, hash, created: false };
  }

  const version = (latest?.version ?? 0) + 1;
  db.prepare(
    `INSERT INTO prompt_versions (name, version, hash, content, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(name, version, hash, content, message ?? null, new Date().toISOString());

  return { version, hash, created: true };
}

export function getLog(name: string): PromptLogEntry[] {
  const db = getPromptDb();
  const rows = db
    .prepare(
      `SELECT version, hash, message, created_at as createdAt
       FROM prompt_versions WHERE name = ? ORDER BY version DESC`,
    )
    .all(name) as unknown as LogRow[];
  return rows;
}

export function getVersionContent(name: string, version: number | "latest"): PromptVersionRecord {
  const db = getPromptDb();
  const row = (
    version === "latest"
      ? db
          .prepare(
            `SELECT version, hash, content, message, created_at as createdAt
             FROM prompt_versions WHERE name = ? ORDER BY version DESC LIMIT 1`,
          )
          .get(name)
      : db
          .prepare(
            `SELECT version, hash, content, message, created_at as createdAt
             FROM prompt_versions WHERE name = ? AND version = ?`,
          )
          .get(name, version)
  ) as unknown as ContentRow | undefined;

  if (!row) {
    throw new Error(
      `"${name}" için versiyon bulunamadı: ${version === "latest" ? "hiç kayıt yok" : version}`,
    );
  }

  return { name, ...row };
}

export function listPromptNames(): string[] {
  const db = getPromptDb();
  const rows = db.prepare(`SELECT DISTINCT name FROM prompt_versions ORDER BY name`).all() as unknown as {
    name: string;
  }[];
  return rows.map((r) => r.name);
}
