import { logInteraction } from "@kasap/core";
import { generateLevelDesign, formatLevelDesign } from "../design/levelDesign.js";
import { writeGeneratedFile } from "../utils/fs.js";

export async function runDesignLevel(description: string, output?: string): Promise<void> {
  process.stdout.write(`\nSeviye tasarımı öneriliyor: "${description}"...\n\n`);

  const design = await generateLevelDesign(description);
  const formatted = formatLevelDesign(design);

  console.log(formatted);

  logInteraction({
    project: "roblox-ai",
    question: description,
    answer: formatted,
    category: "level_design",
  });

  if (output) {
    await writeGeneratedFile(output, formatted);
    console.log(`\nKaydedildi: ${output}`);
  }
}
