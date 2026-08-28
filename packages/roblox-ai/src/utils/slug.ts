const TR_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/** Locale-independent slugify (doesn't rely on ICU/toLocaleLowerCase("tr") being
 * available in the running Node build). */
export function slugify(text: string): string {
  const asciiish = Array.from(text)
    .map((ch) => TR_CHAR_MAP[ch] ?? ch)
    .join("");
  const slug = asciiish
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "generated";
}
