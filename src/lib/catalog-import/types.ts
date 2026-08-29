export const IMPORT_AUDIENCES = [
  "MEN",
  "WOMEN",
  "UNISEX",
  "KIDS",
  "COUPLES",
] as const;

export type ImportAudience = (typeof IMPORT_AUDIENCES)[number];

export type ImportFileType = "csv" | "xlsx" | "pdf";
export type ImportRecordType = "SERVICE" | "PACKAGE";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type PricingType = "FIXED" | "STARTING_FROM" | "UNKNOWN";
export type ImportRowAction = "CREATE" | "SKIP" | "UPDATE" | "REVIEW";
export type ImportRowStatus =
  | "READY"
  | "NEEDS_REVIEW"
  | "DUPLICATE"
  | "INVALID"
  | "SKIPPED";

export type ParsedPrice = {
  amount: number | null;
  pricingType: PricingType;
  isStartingPrice: boolean;
  isFixedPrice: boolean;
  isPackageTotal: boolean;
  original: string;
};

export type IncludedItem = {
  name: string;
  quantity: number;
  complimentary: boolean;
  unitPrice: number | null;
  originalText: string;
};

export type SourceRef = {
  filename: string;
  fileType: ImportFileType;
  page?: number;
  row?: number;
  section?: string;
  originalCategory?: string;
  originalName?: string;
  originalAudience?: string;
  originalPrice?: string;
};

export type ImportProblem = {
  code: string;
  message: string;
  suggestion: string;
};

export type RawExtractedRow = {
  audience: string;
  category: string;
  name: string;
  price: string;
  notes: string;
  page?: number;
  row?: number;
  section?: string;
};

export type FileParserResult = {
  fileType: ImportFileType;
  filename: string;
  headers: string[];
  rows: RawExtractedRow[];
  needsMapping: boolean;
  sampleRows: string[][];
  imageOnlyPages: number[];
  pageCount?: number;
  warnings: string[];
};

export type ColumnMapping = {
  audience?: string;
  category?: string;
  name?: string;
  price?: string;
  notes?: string;
};

export type NormalizedImportRecord = {
  id: string;
  audience: ImportAudience | null;
  audienceNeedsReview: boolean;
  category: string;
  name: string;
  type: ImportRecordType;
  price: number | null;
  pricingType: PricingType;
  isStartingPrice: boolean;
  notes: string;
  includedItems: IncludedItem[];
  source: SourceRef;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  warnings: string[];
  problems: ImportProblem[];
};

export type ExistingCatalogRef = {
  id: string;
  name: string;
  categoryName: string | null;
  audience: string;
  price: number;
  catalogType: string;
};

export type PreviewRecord = NormalizedImportRecord & {
  status: ImportRowStatus;
  action: ImportRowAction;
  duplicateOf?: ExistingCatalogRef;
};

export type CategoryPreview = {
  audience: string;
  name: string;
  serviceCount: number;
  packageCount: number;
};

export type ImportPreview = {
  filename: string;
  fileType: ImportFileType;
  salonName: string;
  records: PreviewRecord[];
  categories: CategoryPreview[];
  audiences: string[];
  counts: {
    services: number;
    packages: number;
    categories: number;
    audiences: number;
    ready: number;
    needsReview: number;
    duplicates: number;
    invalid: number;
  };
  warnings: string[];
  imageOnlyPages: number[];
};

export type CommitImportRecord = {
  id: string;
  action: "CREATE" | "SKIP" | "UPDATE";
  audience: ImportAudience | null;
  category: string;
  name: string;
  type: ImportRecordType;
  price: number | null;
  isStartingPrice: boolean;
  notes: string;
  includedItems: IncludedItem[];
  existingServiceId?: string;
};

export type ImportCommitResult = {
  importId: string;
  servicesCreated: number;
  packagesCreated: number;
  categoriesCreated: number;
  servicesReused: number;
  duplicatesSkipped: number;
  skipped: number;
  failed: number;
  warnings: string[];
  problems: Array<{ name: string; reason: string }>;
};
