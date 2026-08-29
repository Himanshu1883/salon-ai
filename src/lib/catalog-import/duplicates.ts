import type {
  ExistingCatalogRef,
  NormalizedImportRecord,
  PreviewRecord,
} from "./types";
import { duplicateKey } from "./normalize";

function recordKey(record: {
  audience: string | null;
  category: string;
  name: string;
}): string {
  return duplicateKey([record.audience, record.category, record.name]);
}

function nameCategoryKey(record: { category: string; name: string }): string {
  return duplicateKey([record.category, record.name]);
}

export function detectDuplicates(
  records: NormalizedImportRecord[],
  existing: ExistingCatalogRef[]
): PreviewRecord[] {
  const existingByFull = new Map<string, ExistingCatalogRef>();
  const existingByNameCategory = new Map<string, ExistingCatalogRef>();
  const existingByName = new Map<string, ExistingCatalogRef[]>();

  for (const item of existing) {
    existingByFull.set(
      duplicateKey([item.audience, item.categoryName, item.name]),
      item
    );
    existingByNameCategory.set(duplicateKey([item.categoryName, item.name]), item);
    const nameKey = duplicateKey([item.name]);
    const list = existingByName.get(nameKey) ?? [];
    list.push(item);
    existingByName.set(nameKey, list);
  }

  const seen = new Map<string, PreviewRecord>();

  return records.map((record) => {
    const problems = [...record.problems];
    const warnings = [...record.warnings];
    let status: PreviewRecord["status"] = "READY";
    let action: PreviewRecord["action"] = "CREATE";
    let duplicateOf: ExistingCatalogRef | undefined;

    const full = recordKey(record);
    const batchDup = seen.get(full);
    if (batchDup) {
      duplicateOf = {
        id: batchDup.id,
        name: batchDup.name,
        categoryName: batchDup.category,
        audience: batchDup.audience ?? "",
        price: batchDup.price ?? 0,
        catalogType: batchDup.type,
      };
      warnings.push("Duplicate row in this file.");
      status = "DUPLICATE";
      action = "SKIP";
    }

    const existingExact = existingByFull.get(full);
    const existingLoose =
      existingExact ??
      existingByNameCategory.get(nameCategoryKey(record)) ??
      existingByName.get(duplicateKey([record.name]))?.[0];

    if (existingExact) {
      duplicateOf = existingExact;
      warnings.push("Already exists in this salon.");
      status = "DUPLICATE";
      action = "SKIP";
    } else if (!duplicateOf && existingLoose && duplicateKey([existingLoose.name]) === duplicateKey([record.name])) {
      duplicateOf = existingLoose;
      warnings.push("Similar service already exists. Review before importing.");
      if (status === "READY") {
        status = "DUPLICATE";
        action = "SKIP";
      }
    }

    const blocking = problems.some((problem) =>
      ["missing_name", "invalid_price"].includes(problem.code)
    );
    const needsReview =
      record.confidence === "LOW" ||
      record.audienceNeedsReview ||
      problems.some((problem) =>
        [
          "missing_category",
          "missing_price",
          "audience_review",
          "complimentary",
          "price_alignment",
        ].includes(problem.code)
      );

    if (blocking) {
      status = "INVALID";
      action = "REVIEW";
    } else if (needsReview && status !== "DUPLICATE") {
      status = "NEEDS_REVIEW";
      action = "REVIEW";
    }

    const preview: PreviewRecord = {
      ...record,
      problems,
      warnings,
      status,
      action,
      duplicateOf,
    };
    if (!seen.has(full) && record.name) seen.set(full, preview);
    return preview;
  });
}
