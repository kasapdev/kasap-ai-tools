import { z } from "zod";
import { sendStructuredMessage } from "@kasap/core";

export const LevelDesignSchema = z.object({
  title: z.string(),
  theme: z.string(),
  objectives: z.array(z.string()).describe("Oyuncunun bu bölümde tamamlaması gereken hedefler"),
  difficultyCurve: z.string().describe("Zorluk eğrisinin kısa açıklaması"),
  keyAreas: z.array(
    z.object({
      name: z.string(),
      purpose: z.string(),
      notes: z.string().optional(),
    }),
  ),
  pacingNotes: z.string().describe("Tempo/akış ile ilgili notlar"),
});

export type LevelDesign = z.infer<typeof LevelDesignSchema>;

const SYSTEM_PROMPT = `Sen deneyimli bir oyun seviye tasarımcısısın (level designer). Verilen
oyun/tema açıklamasına göre somut, doğrudan uygulanabilir bir seviye tasarımı öner - soyut
tavsiyeler değil, gerçek alan/mekanik önerileri. Türkçe yanıt ver.`;

export async function generateLevelDesign(description: string): Promise<LevelDesign> {
  return sendStructuredMessage({
    schema: LevelDesignSchema,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: description }],
  });
}

export function formatLevelDesign(design: LevelDesign): string {
  const lines: string[] = [
    `# ${design.title}`,
    "",
    `**Tema:** ${design.theme}`,
    "",
    "## Hedefler",
    ...design.objectives.map((objective) => `- ${objective}`),
    "",
    "## Zorluk Eğrisi",
    design.difficultyCurve,
    "",
    "## Kilit Alanlar",
    ...design.keyAreas.flatMap((area) => [
      `### ${area.name}`,
      area.purpose,
      ...(area.notes ? [`_${area.notes}_`] : []),
      "",
    ]),
    "## Tempo Notları",
    design.pacingNotes,
  ];
  return lines.join("\n");
}
