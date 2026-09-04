export { initPromptDb, getPromptDb, closePromptDb } from "./store/db.js";
export {
  hashContent,
  saveVersion,
  getLog,
  getVersionContent,
  listPromptNames,
} from "./store/promptStore.js";
export type { SaveResult, PromptLogEntry, PromptVersionRecord } from "./store/promptStore.js";

export { myersDiff } from "./diff/myersDiff.js";
export type { DiffOp } from "./diff/myersDiff.js";
export { formatUnifiedDiff } from "./diff/formatDiff.js";
