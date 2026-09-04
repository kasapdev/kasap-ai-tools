import type { DiffOp } from "./myersDiff.js";

/** Renders a Myers diff op list as simple unified-style text for CLI display. */
export function formatUnifiedDiff(ops: DiffOp[]): string {
  return ops
    .map((op) => {
      const prefix = op.type === "add" ? "+" : op.type === "remove" ? "-" : " ";
      return `${prefix} ${op.line}`;
    })
    .join("\n");
}
