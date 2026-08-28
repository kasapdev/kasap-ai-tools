import { describe, expect, it } from "vitest";
import { formatLevelDesign, type LevelDesign } from "../src/design/levelDesign.js";

describe("formatLevelDesign", () => {
  it("renders a design object as readable markdown", () => {
    const design: LevelDesign = {
      title: "Terkedilmiş Maden",
      theme: "Karanlık, klostrofobik bir maden ocağı",
      objectives: ["Ana asansöre ulaş", "3 anahtar topla"],
      difficultyCurve: "Yavaş başlar, son bölümde yoğunlaşır",
      keyAreas: [
        { name: "Giriş Tüneli", purpose: "Oyuncuyu mekaniklerle tanıştırır" },
        { name: "Çöküntü Alanı", purpose: "Zamanlamalı platform bölümü", notes: "Zor" },
      ],
      pacingNotes: "İki savaş arasına bir keşif molası eklendi",
    };

    const output = formatLevelDesign(design);

    expect(output).toContain("# Terkedilmiş Maden");
    expect(output).toContain("- Ana asansöre ulaş");
    expect(output).toContain("### Çöküntü Alanı");
    expect(output).toContain("_Zor_");
    expect(output).toContain("## Tempo Notları");
  });
});
