import { parsePrice } from "../parse-price";
import { collapseWhitespace, sanitizeImportText, stripBom } from "../sanitize";

export function parseCsvText(text: string): string[][] {
  const input = stripBom(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => collapseWhitespace(cell))) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  row.push(field);
  if (row.some((cell) => collapseWhitespace(cell))) rows.push(row);
  return rows.map((cells) => cells.map((cell) => sanitizeImportText(cell)));
}

export function looksLikeHeaderRow(row: string[]): boolean {
  const joined = row.map((cell) => cell.toLowerCase()).join(" ");
  return /audience|category|service|price|item|name/.test(joined);
}

export function emptyRow(row: string[]): boolean {
  return row.every((cell) => !collapseWhitespace(cell));
}

export function rowHasInvalidPrice(price: string): boolean {
  const text = collapseWhitespace(price);
  if (!text) return false;
  return parsePrice(text).amount == null;
}
