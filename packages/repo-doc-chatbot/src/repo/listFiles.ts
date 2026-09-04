import { execFileSync } from "node:child_process";
import { basename, extname } from "node:path";

const DOC_EXTENSIONS = new Set([".md", ".mdx", ".txt", ".rst"]);

// Exact (extension-less or well-known) filenames commonly used for
// documentation - not exhaustive, just the common cases. Anything with one
// of DOC_EXTENSIONS is already covered regardless of this list.
const DOC_FILENAMES = new Set([
  "readme",
  "readme.md",
  "license",
  "changelog",
  "contributing",
  "contributing.md",
]);

function runGitLsFiles(repoPath: string): string[] {
  let output: string;
  try {
    output = execFileSync("git", ["ls-files"], { cwd: repoPath, encoding: "utf8" });
  } catch (error) {
    throw new Error(
      `"${repoPath}" bir git deposu değil ya da "git ls-files" çalıştırılamadı: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  return output.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
}

/** Lists git-tracked files that look like documentation (respects
 * .gitignore automatically, since it comes straight from `git ls-files` -
 * no gitignore parsing is reimplemented here). */
export function listTrackedDocFiles(repoPath: string): string[] {
  return runGitLsFiles(repoPath).filter((relPath) => {
    const ext = extname(relPath).toLowerCase();
    if (DOC_EXTENSIONS.has(ext)) return true;
    return DOC_FILENAMES.has(basename(relPath).toLowerCase());
  });
}

/** Lists git-tracked source files (by extension) worth pulling leading
 * comments out of. */
export function listTrackedSourceFilesForComments(
  repoPath: string,
  extensions: string[] = [".ts", ".js", ".py"],
): string[] {
  const wanted = new Set(extensions.map((e) => e.toLowerCase()));
  return runGitLsFiles(repoPath).filter((relPath) => wanted.has(extname(relPath).toLowerCase()));
}
