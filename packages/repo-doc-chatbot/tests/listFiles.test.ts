import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { listTrackedDocFiles, listTrackedSourceFilesForComments } from "../src/repo/listFiles.js";

// This package lives at packages/repo-doc-chatbot - the repo root is two
// levels up. Real integration test against this actual monorepo (a real git
// repo), no mocking needed.
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..", "..");

describe("listTrackedDocFiles", () => {
  it("finds README.md at the repo root and excludes .ts source files", () => {
    const docs = listTrackedDocFiles(repoRoot);
    expect(docs).toContain("README.md");
    expect(docs.some((f) => f.endsWith(".ts"))).toBe(false);
  });

  it("throws a clear error for a non-git directory", () => {
    // Must be a directory that isn't tracked by (or nested inside) this
    // repo's own git tree, otherwise `git ls-files` happily succeeds.
    const outsideGitDir = mkdtempSync(join(tmpdir(), "repo-doc-chatbot-test-"));
    try {
      expect(() => listTrackedDocFiles(outsideGitDir)).toThrow();
    } finally {
      rmSync(outsideGitDir, { recursive: true, force: true });
    }
  });
});

describe("listTrackedSourceFilesForComments", () => {
  it("finds .ts source files under packages/", () => {
    const sourceFiles = listTrackedSourceFilesForComments(repoRoot, [".ts"]);
    expect(sourceFiles.length).toBeGreaterThan(0);
    expect(sourceFiles.every((f) => f.endsWith(".ts"))).toBe(true);
  });
});
