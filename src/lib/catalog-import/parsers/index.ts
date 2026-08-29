import type { ColumnMapping, FileParserResult } from "../types";
import { applyColumnMapping, autoMapColumns, mappingIsComplete } from "../column-mapping";
import { emptyParserResult, ImportFileError } from "../file-validation";
import { parseCsvText, looksLikeHeaderRow } from "./csv";
import { parseXlsxBuffer } from "./xlsx";
import { extractPdfRows } from "./pdf";
import { collapseWhitespace, stripBom } from "../sanitize";

function tableToParserResult(
  filename: string,
  fileType: "csv" | "xlsx",
  table: string[][],
  mapping?: ColumnMapping
): FileParserResult {
  if (table.length === 0) {
    throw new ImportFileError("The spreadsheet does not contain any rows.");
  }
  const headerRow = looksLikeHeaderRow(table[0]) ? table[0] : [];
  const data = headerRow.length ? table.slice(1) : table;
  const headers = (headerRow.length ? headerRow : table[0]).map((h) => collapseWhitespace(h));
  const auto = autoMapColumns(headers);
  const resolved = { ...auto, ...mapping };
  const needsMapping = !mappingIsComplete(resolved);
  return {
    fileType,
    filename,
    headers,
    rows: needsMapping ? [] : applyColumnMapping(headers, data, resolved),
    needsMapping,
    sampleRows: data.slice(0, 8),
    imageOnlyPages: [],
    warnings: needsMapping
      ? ["Could not recognize all columns. Map Audience, Category, Service / Item, and Price to continue."]
      : [],
  };
}

export async function parseImportFile(
  buffer: Buffer,
  filename: string,
  fileType: "csv" | "xlsx" | "pdf",
  mapping?: ColumnMapping
): Promise<FileParserResult> {
  if (fileType === "csv") {
    const text = stripBom(buffer.toString("utf8"));
    return tableToParserResult(filename, "csv", parseCsvText(text), mapping);
  }
  if (fileType === "xlsx") {
    const table = await parseXlsxBuffer(buffer);
    return tableToParserResult(filename, "xlsx", table, mapping);
  }
  const pdf = await extractPdfRows(buffer);
  if (pdf.rows.length === 0) {
    const result = emptyParserResult(filename, "pdf", pdf.warnings);
    result.imageOnlyPages = pdf.imageOnlyPages;
    result.pageCount = pdf.pageCount;
    if (pdf.imageOnlyPages.length === pdf.pageCount) {
      result.warnings = [
        "This PDF contains image-based pages. OCR is required for these pages.",
      ];
    } else {
      result.warnings.push("No services could be extracted from this PDF.");
    }
    return result;
  }
  return {
    fileType: "pdf",
    filename,
    headers: ["Audience", "Category", "Service / Item", "Price", "Notes"],
    rows: pdf.rows,
    needsMapping: false,
    sampleRows: pdf.rows.slice(0, 8).map((row) => [
      row.audience,
      row.category,
      row.name,
      row.price,
      row.notes,
    ]),
    imageOnlyPages: pdf.imageOnlyPages,
    pageCount: pdf.pageCount,
    warnings: pdf.warnings,
  };
}
