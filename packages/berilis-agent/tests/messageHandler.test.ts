import { describe, expect, it } from "vitest";
import type { Message } from "discord.js";
import { shouldRespond } from "../src/discord/messageHandler.js";
import type { BerilisConfig } from "../src/config.js";

const baseConfig: BerilisConfig = {
  discordToken: "test-token",
  adminRoleName: "Sistem Yöneticisi",
  supportChannelIds: ["support-channel-id"],
  ticketChannelPrefix: "ticket-",
};

function fakeMessage(overrides: {
  bot?: boolean;
  channelId?: string;
  channelName?: string;
  mentionsBot?: boolean;
}): Message {
  return {
    author: { bot: overrides.bot ?? false },
    channelId: overrides.channelId ?? "other-channel-id",
    channel: { name: overrides.channelName ?? "genel" },
    client: { user: { id: "bot-id" } },
    mentions: { has: () => overrides.mentionsBot ?? false },
  } as unknown as Message;
}

describe("shouldRespond", () => {
  it("ignores messages from other bots", () => {
    expect(shouldRespond(fakeMessage({ bot: true }), baseConfig)).toBe(false);
  });

  it("responds in configured support channels", () => {
    const msg = fakeMessage({ channelId: "support-channel-id" });
    expect(shouldRespond(msg, baseConfig)).toBe(true);
  });

  it("responds in channels matching the ticket prefix", () => {
    const msg = fakeMessage({ channelName: "ticket-1234" });
    expect(shouldRespond(msg, baseConfig)).toBe(true);
  });

  it("responds when the bot is mentioned", () => {
    const msg = fakeMessage({ mentionsBot: true });
    expect(shouldRespond(msg, baseConfig)).toBe(true);
  });

  it("ignores ordinary messages in unrelated channels", () => {
    const msg = fakeMessage({ channelName: "genel-sohbet" });
    expect(shouldRespond(msg, baseConfig)).toBe(false);
  });
});
