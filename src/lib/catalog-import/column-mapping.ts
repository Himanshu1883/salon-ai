import type { ColumnMapping, RawExtractedRow } from "./types";
import { collapseWhitespace } from "./sanitize";

const FIELD_SYNONYMS: Record<keyof ColumnMapping, string[]> = {
  audience: ["audience", "gender", "for", "section", "client type", "client", "group"],
  category: ["category", "category name", "type", "service type", "group name"],
  name: [
    "service / item",
    "service/item",
    "service name",
    "service",
    "item",
    "name",
    "package",
    "treatment",
  ],
  price: ["price", "rate", "amount", "cost", "rs", "inr", "mrp"],
  notes: ["notes", "note", "remark", "remarks", "description", "comment", "comments"],
};

function normalizeHeader(header: string): string {
  return collapseWhitespace(header).toLowerCase().replace(/[_]+/g, " ");
}

export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const normalized = headers.map((header) => ({ raw: header, key: normalizeHeader(header) }));
  (Object.keys(FIELD_SYNONYMS) as Array<keyof ColumnMapping>).forEach((field) => {
    const synonyms = FIELD_SYNONYMS[field];
    const match = normalized.find((header) => synonyms.includes(header.key));
    if (match) mapping[field] = match.raw;
  });
  return mapping;
}

export function mappingIsComplete(mapping: ColumnMapping): boolean {
  return Boolean(mapping.category && mapping.name);
}

export function applyColumnMapping(
  headers: string[],
  table: string[][],
  mapping: ColumnMapping
): RawExtractedRow[] {
  const index = (field: keyof ColumnMapping) => {
    const header = mapping[field];
    if (!header) return -1;
    return headers.findIndex((h) => h === header);
  };
  const audienceIdx = index("audience");
  const categoryIdx = index("category");
  const nameIdx = index("name");
  const priceIdx = index("price");
  const notesIdx = index("notes");

  return table.map((row, i) => ({
    audience: audienceIdx >= 0 ? row[audienceIdx] ?? "" : "",
    category: categoryIdx >= 0 ? row[categoryIdx] ?? "" : "",
    name: nameIdx >= 0 ? row[nameIdx] ?? "" : "",
    price: priceIdx >= 0 ? row[priceIdx] ?? "" : "",
    notes: notesIdx >= 0 ? row[notesIdx] ?? "" : "",
    row: i + 2,
  }));
}
