import type {
  IncludedItem,
  NormalizedImportRecord,
  RawExtractedRow,
  SourceRef,
} from "./types";
import { parsePrice } from "./parse-price";
import {
  duplicateKey,
  normalizeAudience,
  normalizeCategoryName,
  normalizeServiceName,
} from "./normalize";
import {
  hasBlankPriceContinuation,
  isComplimentaryText,
  isPackageTotalName,
  mergeItemQuantities,
  shouldTreatGroupAsPackage,
  splitPackageItems,
  stripComplimentaryPrefix,
} from "./package-rules";
import { collapseWhitespace } from "./sanitize";

let recordSeq = 0;

function nextId(): string {
  recordSeq += 1;
  return `imp-${recordSeq}`;
}

export function resetImportRecordIds() {
  recordSeq = 0;
}

function sourceFromRow(
  row: RawExtractedRow,
  filename: string,
  fileType: SourceRef["fileType"]
): SourceRef {
  return {
    filename,
    fileType,
    page: row.page,
    row: row.row,
    section: row.section,
    originalCategory: row.category,
    originalName: row.name,
    originalAudience: row.audience,
    originalPrice: row.price,
  };
}

function confidenceFromSource(
  fileType: SourceRef["fileType"],
  extra: { missing?: boolean; guessedAudience?: boolean; package?: boolean }
): { confidence: NormalizedImportRecord["confidence"]; confidenceScore: number } {
  if (extra.missing) return { confidence: "LOW", confidenceScore: 35 };
  if (fileType === "csv" || fileType === "xlsx") {
    if (extra.guessedAudience) return { confidence: "MEDIUM", confidenceScore: 70 };
    return { confidence: "HIGH", confidenceScore: extra.package ? 92 : 96 };
  }
  if (extra.guessedAudience) return { confidence: "MEDIUM", confidenceScore: 62 };
  return { confidence: extra.package ? "HIGH" : "MEDIUM", confidenceScore: extra.package ? 84 : 72 };
}

function toIncluded(
  name: string,
  options?: { complimentary?: boolean; unitPrice?: number | null; originalText?: string }
): IncludedItem {
  return {
    name: normalizeServiceName(name),
    quantity: 1,
    complimentary: Boolean(options?.complimentary),
    unitPrice: options?.unitPrice ?? null,
    originalText: options?.originalText ?? name,
  };
}

function buildItemsFromPackageRows(rows: RawExtractedRow[]): IncludedItem[] {
  const collected: IncludedItem[] = [];
  for (const row of rows) {
    const name = normalizeServiceName(row.name);
    if (!name || isPackageTotalName(name)) continue;
    const complimentary = isComplimentaryText(name);
    const itemText = complimentary ? stripComplimentaryPrefix(name) : name;
    const price = parsePrice(row.price);
    const parts = splitPackageItems(itemText);
    for (const part of parts) {
      collected.push(
        toIncluded(part, {
          complimentary,
          unitPrice: parts.length === 1 ? price.amount : null,
          originalText: row.name,
        })
      );
    }
  }
  return mergeItemQuantities(collected);
}

function notesFrom(rowNotes: string[], extras: string[]): string {
  return [...rowNotes, ...extras]
    .map((note) => collapseWhitespace(note))
    .filter(Boolean)
    .filter((note, index, all) => all.findIndex((n) => n.toLowerCase() === note.toLowerCase()) === index)
    .join(". ");
}

export function classifyRawRows(
  rows: RawExtractedRow[],
  filename: string,
  fileType: SourceRef["fileType"]
): NormalizedImportRecord[] {
  resetImportRecordIds();
  const records: NormalizedImportRecord[] = [];
  const packageTotals = new Map<string, { amount: number; row: RawExtractedRow }>();
  const working: RawExtractedRow[] = [];

  for (const row of rows) {
    const name = normalizeServiceName(row.name);
    const price = parsePrice(row.price);
    if (isPackageTotalName(name) || price.isPackageTotal) {
      const audience = normalizeAudience(row.audience);
      const key = duplicateKey([audience.audience ?? row.audience, row.category]);
      if (price.amount != null) {
        packageTotals.set(key, { amount: price.amount, row });
      }
      continue;
    }
    working.push(row);
  }

  const groups = new Map<string, RawExtractedRow[]>();
  const order: string[] = [];
  for (const row of working) {
    const audience = normalizeAudience(row.audience);
    const key = duplicateKey([audience.audience ?? row.audience, row.category]);
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(row);
  }

  for (const key of order) {
    const group = groups.get(key) ?? [];
    const usable = group.filter((row) => collapseWhitespace(row.name) || collapseWhitespace(row.price));
    if (usable.length === 0) continue;
    const sample = usable[0];
    const audienceInfo = normalizeAudience(sample.audience);
    const category = normalizeCategoryName(sample.category);
    const total = packageTotals.get(key);
    const asPackage = shouldTreatGroupAsPackage(
      sample.category,
      usable,
      Boolean(total)
    );

    if (asPackage) {
      const items = buildItemsFromPackageRows(usable);
      const firstPriced = usable
        .map((row) => parsePrice(row.price))
        .find((price) => price.amount != null && !price.isPackageTotal);
      const price = total?.amount ?? firstPriced?.amount ?? null;
      const starting =
        !total && Boolean(firstPriced?.isStartingPrice);
      const blankFollowers = hasBlankPriceContinuation(usable);
      const conf = confidenceFromSource(fileType, {
        package: true,
        guessedAudience: audienceInfo.needsReview,
        missing: !price || items.length === 0 || !category,
      });
      const problems = [];
      if (!category) {
        problems.push({
          code: "missing_category",
          message: "Missing category",
          suggestion: "Add a category before importing this package.",
        });
      }
      if (!normalizeServiceName(category) && !sample.category) {
        problems.push({
          code: "missing_name",
          message: "Missing package name",
          suggestion: "Enter a package name.",
        });
      }
      if (price == null) {
        problems.push({
          code: "missing_price",
          message: "Package price is missing",
          suggestion: "Enter the package price or skip this row.",
        });
      }
      if (audienceInfo.needsReview) {
        problems.push({
          code: "audience_review",
          message: "Could not confidently determine audience",
          suggestion: "Choose Women, Men, Unisex, Couples, or Kids.",
        });
      }
      const warnings = [];
      if (blankFollowers) {
        warnings.push("Blank prices were treated as included package items, not ₹0 services.");
      }
      if (items.some((item) => item.quantity > 1)) {
        warnings.push("Repeated package items were kept as quantity instead of being dropped.");
      }
      const complimentary = items.filter((item) => item.complimentary);
      if (complimentary.length) {
        warnings.push("Complimentary items were kept as package inclusions, not ₹0 services.");
      }
      records.push({
        id: nextId(),
        audience: audienceInfo.audience,
        audienceNeedsReview: audienceInfo.needsReview,
        category: category || "Packages",
        name: category || "Package",
        type: "PACKAGE",
        price,
        pricingType: starting ? "STARTING_FROM" : price != null ? "FIXED" : "UNKNOWN",
        isStartingPrice: starting,
        notes: notesFrom(
          usable.map((row) => row.notes).filter(Boolean),
          complimentary.map((item) => `Complimentary: ${item.name}`)
        ),
        includedItems: items,
        source: sourceFromRow(sample, filename, fileType),
        confidence: conf.confidence,
        confidenceScore: conf.confidenceScore,
        warnings,
        problems,
      });
      continue;
    }

    for (const row of usable) {
      const name = normalizeServiceName(row.name);
      const price = parsePrice(row.price);
      const rowAudience = normalizeAudience(row.audience);
      const rowCategory = normalizeCategoryName(row.category);
      const complimentary = isComplimentaryText(name);
      const problems = [];
      if (!rowCategory) {
        problems.push({
          code: "missing_category",
          message: "Missing category",
          suggestion: "Add a category for this service.",
        });
      }
      if (!name) {
        problems.push({
          code: "missing_name",
          message: "Missing service name",
          suggestion: "Add the service name.",
        });
      }
      if (collapseWhitespace(row.price) && price.amount == null) {
        problems.push({
          code: "invalid_price",
          message: "Invalid price",
          suggestion: "Use a numeric price such as 700, ₹700, or 700+.",
        });
      } else if (price.amount == null) {
        problems.push({
          code: "missing_price",
          message: "Missing price",
          suggestion: "Enter a price or skip this row.",
        });
      }
      if (rowAudience.needsReview) {
        problems.push({
          code: "audience_review",
          message: "Could not confidently determine audience",
          suggestion: "Choose Women, Men, Unisex, Couples, or Kids.",
        });
      }
      if (complimentary) {
        problems.push({
          code: "complimentary",
          message: "This looks like a complimentary item, not a priced service",
          suggestion: "Attach it to a package or skip creating a ₹0 service.",
        });
      }
      const conf = confidenceFromSource(fileType, {
        guessedAudience: rowAudience.needsReview,
        missing: problems.length > 0,
      });
      records.push({
        id: nextId(),
        audience: rowAudience.audience,
        audienceNeedsReview: rowAudience.needsReview,
        category: rowCategory,
        name: complimentary ? stripComplimentaryPrefix(name) : name,
        type: "SERVICE",
        price: price.amount,
        pricingType: price.pricingType,
        isStartingPrice: price.isStartingPrice,
        notes: row.notes,
        includedItems: [],
        source: sourceFromRow(row, filename, fileType),
        confidence: conf.confidence,
        confidenceScore: conf.confidenceScore,
        warnings: complimentary
          ? ["Complimentary lines should not be imported as ₹0 services."]
          : [],
        problems,
      });
    }
  }

  return records;
}
