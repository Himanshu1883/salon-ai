import type { ImportAudience } from "./types";
import { collapseWhitespace, sanitizeImportText } from "./sanitize";

const AUDIENCE_ALIASES: Record<string, ImportAudience> = {
  men: "MEN",
  man: "MEN",
  male: "MEN",
  him: "MEN",
  king: "MEN",
  groom: "MEN",
  women: "WOMEN",
  woman: "WOMEN",
  female: "WOMEN",
  her: "WOMEN",
  queen: "WOMEN",
  bride: "WOMEN",
  ladies: "WOMEN",
  unisex: "UNISEX",
  all: "UNISEX",
  everyone: "UNISEX",
  kids: "KIDS",
  kid: "KIDS",
  child: "KIDS",
  children: "KIDS",
  baby: "KIDS",
  couples: "COUPLES",
  couple: "COUPLES",
};

export function normalizeAudience(
  raw: string | null | undefined
): { audience: ImportAudience | null; original: string; needsReview: boolean } {
  const original = sanitizeImportText(raw ?? "");
  const key = collapseWhitespace(original).toLowerCase();
  if (!key) {
    return { audience: null, original, needsReview: true };
  }
  const exact = AUDIENCE_ALIASES[key];
  if (exact) return { audience: exact, original, needsReview: false };

  for (const [alias, audience] of Object.entries(AUDIENCE_ALIASES)) {
    if (key.includes(alias)) {
      return { audience, original, needsReview: false };
    }
  }
  return { audience: null, original, needsReview: true };
}

export function titleCaseName(raw: string): string {
  const cleaned = collapseWhitespace(sanitizeImportText(raw));
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .map((word) => {
      if (!word) return word;
      if (/^[A-Z0-9]+(?:[+\-/][A-Z0-9]+)+$/.test(word)) return word;
      if (/^(?:O3|VLCC|HD|D-TAN|FYC|G\.K|GK|INOA)$/i.test(word)) {
        return word.replace(/d-tan/i, "D-Tan").replace(/o3/i, "O3");
      }
      if (word.length <= 2 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\bD-tan\b/g, "D-Tan")
    .replace(/\bO3\b/g, "O3");
}

export function normalizeCategoryName(raw: string): string {
  return titleCaseName(raw.replace(/\s*&\s*/g, " & "));
}

export function normalizeServiceName(raw: string): string {
  return collapseWhitespace(sanitizeImportText(raw));
}

export function duplicateKey(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => collapseWhitespace(part ?? "").toLowerCase())
    .join("|");
}

export function audienceLabel(audience: ImportAudience | null): string {
  if (!audience) return "Needs review";
  const labels: Record<ImportAudience, string> = {
    MEN: "Men",
    WOMEN: "Women",
    UNISEX: "Unisex",
    KIDS: "Kids",
    COUPLES: "Couples",
  };
  return labels[audience];
}
