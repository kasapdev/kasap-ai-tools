import { describe, expect, it, vi, beforeEach } from "vitest";

const retrieveContextMock = vi.fn();
const sendMessageMock = vi.fn();
const indexKnowledgeMock = vi.fn();

vi.mock("@kasap/core", () => ({
  retrieveContext: (...args: unknown[]) => retrieveContextMock(...args),
  sendMessage: (...args: unknown[]) => sendMessageMock(...args),
  indexKnowledge: (...args: unknown[]) => indexKnowledgeMock(...args),
}));

const { askAboutRepo } = await import("../src/repo/askRepo.js");
const { fileURLToPath } = await import("node:url");
const { dirname, join } = await import("node:path");

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..", "..");

beforeEach(() => {
  retrieveContextMock.mockReset();
  sendMessageMock.mockReset();
});

describe("askAboutRepo", () => {
  it("uses the RAG path when retrieveContext returns chunks", async () => {
    retrieveContextMock.mockResolvedValue([{ id: "a", text: "RAG chunk content", distance: 0.1 }]);
    sendMessageMock.mockResolvedValue({ text: "cevap", message: {} });

    const result = await askAboutRepo(repoRoot, "Bu proje ne yapıyor?");

    expect(result.usedRag).toBe(true);
    expect(result.answer).toBe("cevap");
    const callArgs = sendMessageMock.mock.calls[0]![0] as { system: string };
    expect(callArgs.system).toContain("RAG chunk content");
  });

  it("falls back to real file excerpts when retrieveContext returns []", async () => {
    retrieveContextMock.mockResolvedValue([]);
    sendMessageMock.mockResolvedValue({ text: "cevap2", message: {} });

    const result = await askAboutRepo(repoRoot, "Bu proje ne yapıyor?");

    expect(result.usedRag).toBe(false);
    const callArgs = sendMessageMock.mock.calls[0]![0] as { system: string };
    // The fallback should have pulled in real content from this repo's own README.
    expect(callArgs.system).toContain("README.md");
    expect(callArgs.system.length).toBeGreaterThan(200);
  });
});
