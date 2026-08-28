import { z } from "zod";
import { sendStructuredMessage } from "@kasap/core";
import { BERILIS_SYSTEM_PROMPT } from "./systemPrompt.js";

export const TICKET_CATEGORIES = [
  "502_hata",
  "cpanel",
  "dns",
  "ssl",
  "performans",
  "erisim_sorunu",
  "genel_teknik",
  "diger",
] as const;

export const TicketResponseSchema = z.object({
  answer: z.string().describe("Kullanıcıya Discord'da gönderilecek Türkçe yanıt"),
  category: z.enum(TICKET_CATEGORIES),
  needs_escalation: z
    .boolean()
    .describe("Sistem Yöneticisi rolünün incelemesi gerekiyor mu"),
  escalation_reason: z
    .string()
    .optional()
    .describe("needs_escalation true ise kısa gerekçe"),
});

export type TicketResponse = z.infer<typeof TicketResponseSchema>;

export async function generateTicketResponse(question: string): Promise<TicketResponse> {
  return sendStructuredMessage({
    schema: TicketResponseSchema,
    system: BERILIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
  });
}
