import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { getCoreConfig } from "../config.js";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

let cachedClient: Anthropic | null = null;

/** Lazily creates a singleton Anthropic client. Credentials resolve from the
 * environment (ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN) - never hardcode a key. */
export function getAnthropicClient(): Anthropic {
  if (!cachedClient) {
    cachedClient = new Anthropic();
  }
  return cachedClient;
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export interface ChatMessageInput {
  system?: string;
  messages: Anthropic.MessageParam[];
  model?: string;
  maxTokens?: number;
  effort?: Effort;
}

export interface ChatResult {
  text: string;
  message: Anthropic.Message;
}

export async function sendMessage(input: ChatMessageInput): Promise<ChatResult> {
  const config = getCoreConfig();
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: input.model ?? config.anthropicModel,
    max_tokens: input.maxTokens ?? 4096,
    thinking: { type: "adaptive" },
    output_config: { effort: input.effort ?? "medium" },
    system: input.system,
    messages: input.messages,
  });
  return { text: extractText(message.content), message };
}

export interface StreamMessageInput extends ChatMessageInput {
  /** Called with each incremental text chunk as it streams in. */
  onDelta?: (text: string) => void;
}

export async function streamMessage(input: StreamMessageInput): Promise<ChatResult> {
  const config = getCoreConfig();
  const client = getAnthropicClient();
  const stream = client.messages.stream({
    model: input.model ?? config.anthropicModel,
    max_tokens: input.maxTokens ?? 4096,
    thinking: { type: "adaptive" },
    output_config: { effort: input.effort ?? "medium" },
    system: input.system,
    messages: input.messages,
  });
  if (input.onDelta) {
    stream.on("text", input.onDelta);
  }
  const message = await stream.finalMessage();
  return { text: extractText(message.content), message };
}

export interface StructuredMessageInput<T extends z.ZodTypeAny> {
  schema: T;
  system?: string;
  messages: Anthropic.MessageParam[];
  model?: string;
  maxTokens?: number;
}

/** Forces Claude to answer as validated JSON matching `schema` (via output_config.format). */
export async function sendStructuredMessage<T extends z.ZodTypeAny>(
  input: StructuredMessageInput<T>,
): Promise<z.infer<T>> {
  const config = getCoreConfig();
  const client = getAnthropicClient();
  const response = await client.messages.parse({
    model: input.model ?? config.anthropicModel,
    max_tokens: input.maxTokens ?? 2048,
    system: input.system,
    messages: input.messages,
    output_config: {
      format: zodOutputFormat(input.schema),
    },
  });
  if (!response.parsed_output) {
    throw new Error("Claude yapılandırılmış çıktı döndürmedi (parsed_output boş).");
  }
  return response.parsed_output;
}

export { Anthropic };
