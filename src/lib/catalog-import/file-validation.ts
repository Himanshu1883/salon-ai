import type { FileParserResult, ImportFileType } from "./types";
import { safeFilename } from "./sanitize";

export const MAX_CSV_XLSX_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const MAX_IMPORT_RECORDS = 5000;

const CSV_TYPES = new Set(["text/csv", "application/csv", "text/plain"]);
const XLSX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream",
]);
const PDF_TYPES = new Set(["application/pdf", "application/octet-stream"]);

export class ImportFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportFileError";
  }
}

export function detectFileType(filename: string, mime: string): ImportFileType {
  const lower = filename.toLowerCase();
  const type = mime.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".xlsx")) return "xlsx";
  if (lower.endsWith(".pdf")) return "pdf";
  if (CSV_TYPES.has(type) && !lower.endsWith(".pdf") && !lower.endsWith(".xlsx")) {
    return "csv";
  }
  if (XLSX_TYPES.has(type) && lower.endsWith(".xlsx")) return "xlsx";
  if (PDF_TYPES.has(type)) return "pdf";
  throw new ImportFileError("Unsupported file type. Upload a CSV, Excel (.xlsx), or PDF file.");
}

export function validateImportFile(file: {
  name: string;
  type: string;
  size: number;
}): { filename: string; fileType: ImportFileType } {
  const filename = safeFilename(file.name);
  if (!filename) {
    throw new ImportFileError("The uploaded filename is invalid.");
  }
  const fileType = detectFileType(filename, file.type || "");
  const max = fileType === "pdf" ? MAX_PDF_BYTES : MAX_CSV_XLSX_BYTES;
  if (file.size <= 0) {
    throw new ImportFileError("The uploaded file is empty.");
  }
  if (file.size > max) {
    const limitMb = Math.round(max / (1024 * 1024));
    throw new ImportFileError(`File is too large. Maximum size is ${limitMb}MB.`);
  }
  if (fileType === "csv" && !filename.toLowerCase().endsWith(".csv")) {
    throw new ImportFileError("CSV files must use a .csv extension.");
  }
  if (fileType === "xlsx" && !filename.toLowerCase().endsWith(".xlsx")) {
    throw new ImportFileError("Excel files must use a .xlsx extension.");
  }
  if (fileType === "pdf" && !filename.toLowerCase().endsWith(".pdf")) {
    throw new ImportFileError("PDF files must use a .pdf extension.");
  }
  return { filename, fileType };
}

export function emptyParserResult(
  filename: string,
  fileType: ImportFileType,
  warnings: string[] = []
): FileParserResult {
  return {
    fileType,
    filename,
    headers: [],
    rows: [],
    needsMapping: false,
    sampleRows: [],
    imageOnlyPages: [],
    warnings,
  };
}
