import { looksLikePriceToken, parsePrice } from "../parse-price";
import type { ImportAudience, RawExtractedRow } from "../types";
import {
  isComplimentaryText,
  isPackageCategoryName,
  isPackageTotalName,
  stripComplimentaryPrefix,
} from "../package-rules";
import { collapseWhitespace, sanitizeImportText } from "../sanitize";
import { normalizeCategoryName } from "../normalize";

type PdfItem = { str: string; x: number; y: number; w: number; h: number };
type PdfLine = { page: number; y: number; items: PdfItem[] };

const JUNK =
  /^(?:leave us|thank you|google|instagram|facebook|canva|price list|blushberry|email us|a review|for any suggestion)/i;
const DURATION = /^\(?\s*duration/i;
const COMBO_OFFER = /^combo\s+offer$/i;

function isJunkText(text: string): boolean {
  const value = collapseWhitespace(text);
  if (!value) return true;
  if (JUNK.test(value)) return true;
  if (/blushberrysalon@/i.test(value)) return true;
  return false;
}

function lineText(line: PdfLine): string {
  return collapseWhitespace(line.items.map((item) => item.str).join(" "));
}

function coalesceLineItems(items: PdfItem[]): PdfItem[] {
  const output: PdfItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const next = items[i + 1];
    if (next) {
      const combined = collapseWhitespace(`${items[i].str} ${next.str}`).replace(
        /(\d)\s+(\d)/g,
        "$1$2"
      );
      if (looksLikePriceToken(combined) || /total[-:\s]*\d/i.test(combined)) {
        output.push({ ...items[i], str: combined });
        i += 1;
        continue;
      }
    }
    output.push(items[i]);
  }
  return output;
}

function splitLine(line: PdfLine): { names: string; prices: string[] } {
  const prices: string[] = [];
  const names: string[] = [];
  for (const item of coalesceLineItems(line.items)) {
    if (looksLikePriceToken(item.str) || /^total[-:\s]*\d/i.test(item.str)) {
      prices.push(item.str);
    } else {
      names.push(item.str);
    }
  }
  if (prices.length === 0) {
    const combined = lineText(line);
    const collapsed = combined.replace(/(\d)\s+(\d)/g, "$1$2");
    if (looksLikePriceToken(collapsed) || /total[-:\s]*\d/i.test(collapsed)) {
      return { names: "", prices: [collapsed] };
    }
  }
  return { names: collapseWhitespace(names.join(" ")), prices };
}

function isSubheading(text: string): boolean {
  const value = collapseWhitespace(text);
  if (!value || /\d/.test(value) || /[&,]/.test(value)) return false;
  if (
    /^(silver|gold|platinum|normal|brazilian|combo|complete|makeover|women|men)$/i.test(
      value
    )
  ) {
    return true;
  }
  if (/^makeover\s+package$/i.test(value)) return true;
  return value.length <= 12 && value === value.toUpperCase();
}

function isHeadingLine(text: string, y: number, hasPrice: boolean): boolean {
  if (hasPrice || !text) return false;
  if (COMBO_OFFER.test(text) || DURATION.test(text) || isComplimentaryText(text)) return false;
  if (isPackageTotalName(text)) return false;
  if (isPackageCategoryName(text)) return true;
  if (y <= 550) return false;
  if (/cuts?\s*&\s*styling/i.test(text) || /chocolate\s*\/?\s*aloevera/i.test(text)) return true;
  const words = text.split(/\s+/).filter((word) => word && word !== "-" && word !== "&");
  if (
    words.length >= 3 &&
    /(bleach|facial|wax|wash|threading|pedicure|manicure)/i.test(text)
  ) {
    return false;
  }
  return text.length <= 42;
}

function mergeHeading(current: string, next: string): string {
  const a = collapseWhitespace(current);
  const b = collapseWhitespace(next);
  if (!a) return b;
  if (!b) return a;
  if (a.toLowerCase().includes(b.toLowerCase())) return a;
  if (b.toLowerCase().includes(a.toLowerCase())) return b;
  return `${a} ${b}`;
}

function detectAudienceToken(text: string): ImportAudience | "CLEAR" | null {
  const value = collapseWhitespace(text).toLowerCase();
  if (value === "queen" || value === "for her" || value === "women") return "WOMEN";
  if (value === "king" || value === "for him" || value === "men") return "MEN";
  if (/^for\s+groom$/.test(value) || value === "groom") return "COUPLES";
  if (/^for\s+bride$/.test(value) || value === "bride") return "COUPLES";
  if (value.includes("couple")) return "COUPLES";
  return null;
}

export async function extractPdfRows(buffer: Buffer): Promise<{
  rows: RawExtractedRow[];
  imageOnlyPages: number[];
  pageCount: number;
  warnings: string[];
}> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(buffer);
  const pdf = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableWorker: true,
  } as Parameters<typeof pdfjs.getDocument>[0]).promise;

  const imageOnlyPages: number[] = [];
  const warnings: string[] = [];
  const allLines: PdfLine[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items: PdfItem[] = content.items
      .map((item) => {
        const textItem = item as {
          str?: string;
          transform?: number[];
          width?: number;
          height?: number;
        };
        return {
          str: sanitizeImportText(textItem.str ?? ""),
          x: textItem.transform?.[4] ?? 0,
          y: textItem.transform?.[5] ?? 0,
          w: textItem.width ?? 0,
          h: textItem.height ?? 0,
        };
      })
      .filter((item) => item.str);

    if (items.length <= 1) {
      const only = items[0]?.str ?? "";
      if (!only || /^(queen|king)$/i.test(only)) {
        if (items.length === 0) imageOnlyPages.push(pageNum);
        if (/^queen$/i.test(only) || /^king$/i.test(only)) {
          allLines.push({
            page: pageNum,
            y: items[0]?.y ?? 0,
            items: items.length ? items : [{ str: only || " ", x: 0, y: 0, w: 0, h: 0 }],
          });
        }
        continue;
      }
    }

    const lines: PdfLine[] = [];
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    for (const item of sorted) {
      const line = lines.find((entry) => Math.abs(entry.y - item.y) <= 8);
      if (line) {
        line.items.push(item);
      } else {
        lines.push({ page: pageNum, y: item.y, items: [item] });
      }
    }
    lines.sort((a, b) => b.y - a.y);
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);
    }
    allLines.push(...lines);
  }

  const rows: RawExtractedRow[] = [];
  let audience: ImportAudience | null = null;
  let audienceLocked = false;
  let category = "";
  let section = "";
  let pendingPackageName = "";
  let lastServiceIndex = -1;

  const flushHeading = (text: string, page: number) => {
    const merged = mergeHeading(pendingPackageName, text);
    pendingPackageName = "";
    category = normalizeCategoryName(merged);
    section = category;
    return category;
  };

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const rawText = lineText(line);
    if (!rawText) continue;
    if (isJunkText(rawText)) {
      continue;
    }

    const audienceToken = detectAudienceToken(rawText);
    if (/^(queen\s*)+$/i.test(rawText)) {
      audience = "WOMEN";
      audienceLocked = true;
      continue;
    }
    if (/^(king\s*)+$/i.test(rawText)) {
      audience = "MEN";
      audienceLocked = true;
      continue;
    }
    if (
      audienceToken === "COUPLES" &&
      !isPackageCategoryName(rawText) &&
      !isHeadingLine(rawText, line.y, false)
    ) {
      audience = "COUPLES";
      continue;
    }

    const split = splitLine(line);
    const joinedPrices = split.prices.join(" ").replace(/(\d)\s+(\d)/g, "$1$2");
    const priceText = joinedPrices;
    const hasPrice = Boolean(priceText) && parsePrice(priceText).amount != null;
    const text = split.names || (!hasPrice ? rawText : "");

    if (COMBO_OFFER.test(text)) {
      continue;
    }
    if (DURATION.test(text)) {
      continue;
    }

    if (isComplimentaryText(text) && !hasPrice) {
      const complimentary = stripComplimentaryPrefix(text);
      if (lastServiceIndex >= 0 && rows[lastServiceIndex]) {
        const target = rows[lastServiceIndex];
        target.notes = [target.notes, `Complimentary: ${complimentary}`]
          .filter(Boolean)
          .join(". ");
      } else {
        rows.push({
          audience: audience ?? "",
          category: category || section,
          name: text,
          price: "",
          notes: "Complimentary item",
          page: line.page,
          section,
        });
      }
      continue;
    }

    if (isHeadingLine(text, line.y, hasPrice)) {
      const next = allLines[i + 1];
      const nextText = next && next.page === line.page ? lineText(next) : "";
      const nextSplit = next ? splitLine(next) : { names: "", prices: [] };
      const nextIsSubheading =
        next &&
        next.page === line.page &&
        next.y > 540 &&
        !nextSplit.prices.length &&
        isHeadingLine(nextText, next.y, false) &&
        isSubheading(nextText);
      if (nextIsSubheading) {
        pendingPackageName = mergeHeading(pendingPackageName, text);
        continue;
      }
      flushHeading(text, line.page);
      if (isPackageCategoryName(category) && audience === null && /couple/i.test(category)) {
        audience = "COUPLES";
      }
      continue;
    }

    if (pendingPackageName) {
      flushHeading(pendingPackageName, line.page);
    }

    if (!text && hasPrice) {
      const packagePrice =
        /total/i.test(priceText) || isPackageCategoryName(category);
      if (packagePrice) {
        rows.push({
          audience: audience ?? "",
          category,
          name: "Package Total",
          price: priceText,
          notes: "",
          page: line.page,
          section,
        });
      } else if (lastServiceIndex >= 0 && !rows[lastServiceIndex]?.price) {
        rows[lastServiceIndex].price = priceText;
      }
      continue;
    }

    if (isPackageTotalName(text) || (hasPrice && parsePrice(priceText).isPackageTotal)) {
      rows.push({
        audience: audience ?? "",
        category,
        name: text || "Package Total",
        price: priceText,
        notes: "",
        page: line.page,
        section,
      });
      continue;
    }

    if (hasPrice && text) {
      rows.push({
        audience: audience ?? "",
        category,
        name: text,
        price: priceText,
        notes: "",
        page: line.page,
        section,
      });
      lastServiceIndex = rows.length - 1;
      continue;
    }

    if (!hasPrice && text && category) {
      rows.push({
        audience: audience ?? "",
        category,
        name: text,
        price: "",
        notes: "",
        page: line.page,
        section,
      });
      lastServiceIndex = rows.length - 1;
    }
  }

  if (imageOnlyPages.length > 0) {
    warnings.push(
      `This PDF contains image-based pages (${imageOnlyPages.join(", ")}). OCR is required for these pages.`
    );
  }
  if (!audienceLocked && rows.some((row) => !row.audience)) {
    warnings.push("Audience was left as needs review where the PDF had no Women/Men/Couples section marker.");
  }

  return { rows, imageOnlyPages, pageCount: pdf.numPages, warnings };
}
