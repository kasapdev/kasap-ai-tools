import { beforeEach, describe, expect, it } from "vitest";
import { initPromptDb } from "../src/store/db.js";
import { getLog, getVersionContent, hashContent, listPromptNames, saveVersion } from "../src/store/promptStore.js";

beforeEach(() => {
  initPromptDb(":memory:");
});

describe("saveVersion", () => {
  it("creates version 1 on first save", () => {
    const result = saveVersion("greeting", "Merhaba");
    expect(result).toEqual({ version: 1, hash: hashContent("Merhaba"), created: true });
  });

  it("does not create a new version when content is unchanged", () => {
    saveVersion("greeting", "Merhaba");
    const second = saveVersion("greeting", "Merhaba");
    expect(second.created).toBe(false);
    expect(second.version).toBe(1);
    expect(getLog("greeting")).toHaveLength(1);
  });

  it("creates version 2 when content changes", () => {
    saveVersion("greeting", "Merhaba");
    const second = saveVersion("greeting", "Merhaba dünya");
    expect(second).toEqual({ version: 2, hash: hashContent("Merhaba dünya"), created: true });
  });
});

describe("getLog", () => {
  it("returns versions newest-first", () => {
    saveVersion("p", "v1");
    saveVersion("p", "v2");
    saveVersion("p", "v3");
    const log = getLog("p");
    expect(log.map((e) => e.version)).toEqual([3, 2, 1]);
  });

  it("returns an empty array for an unknown name", () => {
    expect(getLog("unknown")).toEqual([]);
  });
});

describe("getVersionContent", () => {
  it("resolves 'latest' to the highest version", () => {
    saveVersion("p", "v1");
    saveVersion("p", "v2");
    const record = getVersionContent("p", "latest");
    expect(record.version).toBe(2);
    expect(record.content).toBe("v2");
  });

  it("resolves an explicit version number", () => {
    saveVersion("p", "v1");
    saveVersion("p", "v2");
    const record = getVersionContent("p", 1);
    expect(record.content).toBe("v1");
  });

  it("throws for a nonexistent name", () => {
    expect(() => getVersionContent("nope", "latest")).toThrow();
  });

  it("throws for a nonexistent version of a known name", () => {
    saveVersion("p", "v1");
    expect(() => getVersionContent("p", 99)).toThrow();
  });
});

describe("listPromptNames", () => {
  it("lists distinct prompt names", () => {
    saveVersion("a", "1");
    saveVersion("b", "1");
    saveVersion("a", "2");
    expect(listPromptNames().sort()).toEqual(["a", "b"]);
  });
});
