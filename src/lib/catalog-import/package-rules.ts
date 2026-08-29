import { collapseWhitespace } from "./sanitize";
import type { RawExtractedRow } from "./types";
import { parsePrice } from "./parse-price";

const PACKAGE_NAME =
  /\b(?:pre[-\s]?bridal|bridal|groom|couple'?s?|makeover)?\s*(?:combo\s+)?packages?\b|\bcombo\s+package\b|\bmakeover\s+package\b|\boffer\s+package\b/i;

const STRONG_PACKAGE =
  /\bpackages?\b/i;

const COMBO_ONLY = /\bcombo\b/i;

export function isPackageCategoryName(name: string): boolean {
  const text = collapseWhitespace(name);
  if (!text) return false;
  if (PACKAGE_NAME.test(text)) return true;
  if (STRONG_PACKAGE.test(text) && !/^packages?$/i.test(text)) return true;
  return false;
}

export function isStandaloneComboCategory(name: string): boolean {
  const text = collapseWhitespace(name);
  return COMBO_ONLY.test(text) && !isPackageCategoryName(text);
}

export function isPackageTotalName(name: string): boolean {
  return /^\s*(?:package\s*)?total\b/i.test(collapseWhitespace(name));
}

export function isComplimentaryText(name: string): boolean {
  return /^\s*free[\s\-:]/i.test(collapseWhitespace(name));
}

export function stripComplimentaryPrefix(name: string): string {
  return collapseWhitespace(name.replace(/^\s*free[\s\-:]+\s*/i, ""));
}

export function hasBlankPriceContinuation(rows: RawExtractedRow[]): boolean {
  const parsed = rows.filter((row) => collapseWhitespace(row.name));
  if (parsed.length < 2) return false;
  const priced = parsed.filter((row) => parsePrice(row.price).amount != null);
  const blank = parsed.filter((row) => parsePrice(row.price).amount == null);
  return priced.length >= 1 && blank.length >= 1;
}

export function shouldTreatGroupAsPackage(
  category: string,
  _rows: RawExtractedRow[],
  hasPackageTotal: boolean
): boolean {
  if (isPackageCategoryName(category) || hasPackageTotal) return true;
  if (isStandaloneComboCategory(category)) return false;
  return false;
}

export function splitPackageItems(text: string): string[] {
  const cleaned = collapseWhitespace(text);
  if (!cleaned) return [];
  if (!/[,/]/.test(cleaned)) return [cleaned];
  const parts = cleaned
    .split(/\s*,\s*|\s*\/\s*/)
    .map((part) => collapseWhitespace(part))
    .filter((part) => part && !/^and$/i.test(part));
  return parts.length > 0 ? parts : [cleaned];
}

export function mergeItemQuantities(
  names: Array<{ name: string; complimentary?: boolean; unitPrice?: number | null; originalText?: string }>
) {
  const merged: Array<{
    name: string;
    quantity: number;
    complimentary: boolean;
    unitPrice: number | null;
    originalText: string;
  }> = [];
  for (const item of names) {
    const name = collapseWhitespace(item.name);
    if (!name) continue;
    const existing = merged.find(
      (row) =>
        row.name.toLowerCase() === name.toLowerCase() &&
        row.complimentary === Boolean(item.complimentary)
    );
    if (existing) {
      existing.quantity += 1;
      continue;
    }
    merged.push({
      name,
      quantity: 1,
      complimentary: Boolean(item.complimentary),
      unitPrice: item.unitPrice ?? null,
      originalText: item.originalText ?? name,
    });
  }
  return merged;
}
