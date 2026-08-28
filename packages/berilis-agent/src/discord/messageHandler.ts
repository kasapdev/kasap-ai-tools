import { Events, type Client, type Message } from "discord.js";
import { getCoreConfig, logInteraction } from "@kasap/core";
import type { BerilisConfig } from "../config.js";
import { isPricingQuestion, PRICING_INFO_BLOCK } from "../knowledge/pricingBlock.js";
import { generateTicketResponse } from "../agent/respond.js";
import { escalateToAdmin } from "./escalate.js";

export function shouldRespond(message: Message, config: BerilisConfig): boolean {
  if (message.author.bot) return false;
  if (config.supportChannelIds.includes(message.channelId)) return true;
  if ("name" in message.channel && typeof message.channel.name === "string") {
    if (message.channel.name.startsWith(config.ticketChannelPrefix)) return true;
  }
  const botId = message.client.user?.id;
  if (botId && message.mentions.has(botId)) return true;
  return false;
}

export function registerMessageHandler(client: Client, config: BerilisConfig): void {
  client.on(Events.MessageCreate, async (message) => {
    if (!shouldRespond(message, config)) return;

    const question = message.content.trim();
    if (!question) return;

    try {
      if (isPricingQuestion(question)) {
        await message.reply(PRICING_INFO_BLOCK);
        logInteraction({
          project: "berilis-agent",
          question,
          answer: PRICING_INFO_BLOCK,
          category: "paket_fiyat",
          escalated: false,
          userId: message.author.id,
          channelId: message.channelId,
        });
        return;
      }

      const result = await generateTicketResponse(question);
      await message.reply(result.answer);

      logInteraction({
        project: "berilis-agent",
        question,
        answer: result.answer,
        category: result.category,
        escalated: result.needs_escalation,
        model: getCoreConfig().anthropicModel,
        userId: message.author.id,
        channelId: message.channelId,
      });

      if (result.needs_escalation) {
        await escalateToAdmin(
          message,
          config.adminRoleName,
          result.escalation_reason ?? "Model belirsizlik bildirdi.",
        );
      }
    } catch (error) {
      console.error("Mesaj işlenirken hata oluştu:", error);
      await message
        .reply("Şu anda bir teknik sorun yaşıyorum, kısa süre sonra tekrar dener misin?")
        .catch(() => {});
    }
  });
}
