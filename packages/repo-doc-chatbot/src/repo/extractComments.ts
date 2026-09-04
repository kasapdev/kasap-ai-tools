import { readFileSync } from "node:fs";

/** Pulls the leading block comment (/** ... *\/) or a leading run of //
 * lines off the top of a source file's text. Intentionally light - a
 * line-scan, not a real parser - good enough for "what does this file say
 * about itself at the top" style grounding. Returns "" if none found. */
export function extractLeadingCommentsFromSource(source: string): string {
  const trimmed = source.replace(/^﻿/, "");
  const blockMatch = /^\s*\/\*\*?([\s\S]*?)\*\//.exec(trimmed);
  if (blockMatch) {
    return blockMatch[1]!
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, "").trimEnd())
      .join("\n")
      .trim();
  }

  const lines = trimmed.split("\n");
  const leadingLineComments: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("//")) {
      leadingLineComments.push(t.replace(/^\/\/\s?/, ""));
    } else if (t.length === 0 && leadingLineComments.length === 0) {
      continue;
    } else {
      break;
    }
  }
  return leadingLineComments.join("\n").trim();
}

export function extractLeadingComments(filePath: string): string {
  const source = readFileSync(filePath, "utf8");
  return extractLeadingCommentsFromSource(source);
}
