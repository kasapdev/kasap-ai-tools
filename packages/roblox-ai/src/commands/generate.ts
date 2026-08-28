import { join } from "node:path";
import { logInteraction, streamMessage } from "@kasap/core";
import { buildCodegenSystemPrompt, ENGINE_FILE_EXTENSION, type Engine } from "../codegen/systemPrompts.js";
import { extractCodeBlock } from "../codegen/extractCode.js";
import { writeGeneratedFile } from "../utils/fs.js";
import { slugify } from "../utils/slug.js";

export interface GenerateOptions {
  engine: Engine;
  output?: string;
  name?: string;
}

export async function runGenerate(description: string, options: GenerateOptions): Promise<void> {
  const system = buildCodegenSystemPrompt(options.engine);

  process.stdout.write(`\n[${options.engine}] "${description}" için kod üretiliyor...\n\n`);

  const result = await streamMessage({
    system,
    messages: [{ role: "user", content: description }],
    effort: "high",
    maxTokens: 8000,
    onDelta: (text) => process.stdout.write(text),
  });

  process.stdout.write("\n\n");

  logInteraction({
    project: "roblox-ai",
    question: `[${options.engine}] ${description}`,
    answer: result.text,
    category: `generate_${options.engine}`,
    model: result.message.model,
  });

  if (options.output) {
    const code = extractCodeBlock(result.text);
    const baseName = slugify(options.name ?? description);
    const filePath = join(options.output, `${baseName}.${ENGINE_FILE_EXTENSION[options.engine]}`);
    await writeGeneratedFile(filePath, code);
    console.log(`Kaydedildi: ${filePath}`);
  }
}
