import type { CategoryPreview, ImportPreview, PreviewRecord } from "./types";
import { audienceLabel } from "./normalize";
import { MAX_IMPORT_RECORDS } from "./file-validation";

export function buildImportPreview(
  filename: string,
  fileType: ImportPreview["fileType"],
  salonName: string,
  records: PreviewRecord[],
  extraWarnings: string[],
  imageOnlyPages: number[]
): ImportPreview {
  const limited = records.slice(0, MAX_IMPORT_RECORDS);
  const warnings = [...extraWarnings];
  if (records.length > MAX_IMPORT_RECORDS) {
    warnings.push(
      `Only the first ${MAX_IMPORT_RECORDS} records will be imported. Split larger files.`
    );
  }

  const categoryMap = new Map<string, CategoryPreview>();
  for (const record of limited) {
    const audience = audienceLabel(record.audience);
    const key = `${audience}|${record.category || "Uncategorized"}`;
    const current = categoryMap.get(key) ?? {
      audience,
      name: record.category || "Uncategorized",
      serviceCount: 0,
      packageCount: 0,
    };
    if (record.type === "PACKAGE") current.packageCount += 1;
    else current.serviceCount += 1;
    categoryMap.set(key, current);
  }

  const audiences = [...new Set(limited.map((record) => audienceLabel(record.audience)))];

  return {
    filename,
    fileType,
    salonName,
    records: limited,
    categories: [...categoryMap.values()],
    audiences,
    counts: {
      services: limited.filter((record) => record.type === "SERVICE").length,
      packages: limited.filter((record) => record.type === "PACKAGE").length,
      categories: categoryMap.size,
      audiences: audiences.length,
      ready: limited.filter((record) => record.status === "READY").length,
      needsReview: limited.filter((record) => record.status === "NEEDS_REVIEW").length,
      duplicates: limited.filter((record) => record.status === "DUPLICATE").length,
      invalid: limited.filter((record) => record.status === "INVALID").length,
    },
    warnings,
    imageOnlyPages,
  };
}

export const CSV_TEMPLATE = `Audience,Category,Service / Item,Price,Notes
Women,Hair,Hair Cut,500,
Men,Hair,Beard Trim,250,
Women,Facials,Hydra Facial,5000,
Women,COMBO PACKAGE 1,"Fruit Facial, Bleach, Clean Up",700,
Women,COMBO PACKAGE 1,Threading & Upperlips,,
`;
