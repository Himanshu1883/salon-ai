import ExcelJS from "exceljs";
import { sanitizeImportText } from "../sanitize";

export async function parseXlsxBuffer(buffer: Buffer): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    rows.push(
      values.map((value) => {
        if (value == null) return "";
        if (typeof value === "object" && "text" in value) {
          return sanitizeImportText(String((value as { text: string }).text));
        }
        if (typeof value === "object" && "result" in value) {
          return sanitizeImportText(String((value as { result: unknown }).result ?? ""));
        }
        return sanitizeImportText(String(value));
      })
    );
  });
  return rows;
}
