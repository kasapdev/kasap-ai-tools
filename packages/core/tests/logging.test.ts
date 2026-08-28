import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { initDatabase, closeDatabase } from "../src/memory/db.js";
import { addCorrection, listInteractions, logInteraction } from "../src/logging/interactionLogger.js";

describe("interactionLogger", () => {
  beforeEach(() => {
    initDatabase(":memory:");
  });

  afterEach(() => {
    closeDatabase();
  });

  it("logs an interaction and lists it back", () => {
    const id = logInteraction({
      project: "berilis-agent",
      question: "502 hatası alıyorum",
      answer: "cPanel'de PHP-FPM servisini yeniden başlatmayı deneyin.",
      category: "502_hata",
      escalated: false,
      model: "claude-opus-5",
    });

    const rows = listInteractions({ project: "berilis-agent" });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(id);
    expect(rows[0]?.category).toBe("502_hata");
    expect(rows[0]?.escalated).toBe(false);
    expect(rows[0]?.correction).toBeNull();
  });

  it("filters by escalated and category", () => {
    logInteraction({
      project: "berilis-agent",
      question: "sunucu tamamen erişilemez durumda",
      answer: "Sistem yöneticisine yönlendiriliyorum.",
      category: "outage",
      escalated: true,
    });
    logInteraction({
      project: "berilis-agent",
      question: "paket fiyatları nedir",
      answer: "Başlangıç paketi ...",
      category: "paket_fiyat",
      escalated: false,
    });

    expect(listInteractions({ escalated: true })).toHaveLength(1);
    expect(listInteractions({ category: "paket_fiyat" })).toHaveLength(1);
  });

  it("attaches a human correction, which is queryable via hasCorrection", () => {
    const id = logInteraction({
      project: "berilis-agent",
      question: "DNS kaydı nasıl eklenir",
      answer: "Yanlış cevap",
    });

    expect(listInteractions({ hasCorrection: true })).toHaveLength(0);

    addCorrection(id, "Doğrusu: cPanel > Zone Editor üzerinden A kaydı eklenir.");

    const corrected = listInteractions({ hasCorrection: true });
    expect(corrected).toHaveLength(1);
    expect(corrected[0]?.correction).toContain("Zone Editor");
  });
});
