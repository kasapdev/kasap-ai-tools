import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { initDatabase, closeDatabase } from "../src/memory/db.js";
import {
  appendMessage,
  clearConversation,
  getRecentMessages,
} from "../src/memory/conversationStore.js";

describe("conversationStore", () => {
  beforeEach(() => {
    initDatabase(":memory:");
  });

  afterEach(() => {
    closeDatabase();
  });

  it("returns messages oldest-first, capped at the limit", () => {
    for (let i = 0; i < 5; i++) {
      appendMessage("channel-1", i % 2 === 0 ? "user" : "assistant", `msg-${i}`);
    }

    const recent = getRecentMessages("channel-1", 3);
    expect(recent.map((m) => m.content)).toEqual(["msg-2", "msg-3", "msg-4"]);
  });

  it("keeps conversations isolated by conversationId", () => {
    appendMessage("channel-a", "user", "hello from a");
    appendMessage("channel-b", "user", "hello from b");

    expect(getRecentMessages("channel-a")).toHaveLength(1);
    expect(getRecentMessages("channel-b")).toHaveLength(1);
  });

  it("clears a conversation's history", () => {
    appendMessage("channel-1", "user", "hi");
    clearConversation("channel-1");
    expect(getRecentMessages("channel-1")).toHaveLength(0);
  });
});
