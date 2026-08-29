import type { ColumnMapping, ExistingCatalogRef, ImportPreview } from "./types";
import { classifyRawRows } from "./grouping";
import { detectDuplicates } from "./duplicates";
import { parseImportFile } from "./parsers";
import { buildImportPreview } from "./preview";
import { ImportFileError } from "./file-validation";

export async function analyzePriceList(options: {
  buffer: Buffer;
  filename: string;
  fileType: "csv" | "xlsx" | "pdf";
  salonName: string;
  existing: ExistingCatalogRef[];
  mapping?: ColumnMapping;
}): Promise<
  | { preview: ImportPreview; needsMapping?: false }
  | {
      needsMapping: true;
      headers: string[];
      sampleRows: string[][];
      filename: string;
      fileType: "csv" | "xlsx" | "pdf";
      warnings: string[];
    }
> {
  const parsed = await parseImportFile(
    options.buffer,
    options.filename,
    options.fileType,
    options.mapping
  );

  if (parsed.needsMapping) {
    return {
      needsMapping: true,
      headers: parsed.headers,
      sampleRows: parsed.sampleRows,
      filename: parsed.filename,
      fileType: parsed.fileType,
      warnings: parsed.warnings,
    };
  }

  if (parsed.rows.length === 0) {
    throw new ImportFileError(
      parsed.warnings[0] ?? "File could not be parsed. No services were found."
    );
  }

  const normalized = classifyRawRows(parsed.rows, parsed.filename, parsed.fileType);
  const previewRecords = detectDuplicates(normalized, options.existing);
  return {
    preview: buildImportPreview(
      parsed.filename,
      parsed.fileType,
      options.salonName,
      previewRecords,
      parsed.warnings,
      parsed.imageOnlyPages
    ),
  };
}
