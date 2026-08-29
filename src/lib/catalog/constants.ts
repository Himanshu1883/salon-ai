export const SERVICE_CATALOG_TYPES = ["SERVICE", "PACKAGE", "ADD_ON"] as const;
export type ServiceCatalogType = (typeof SERVICE_CATALOG_TYPES)[number];

export const SERVICE_AUDIENCES = ["MEN", "WOMEN", "UNISEX", "KIDS", "COUPLES"] as const;
export type ServiceAudience = (typeof SERVICE_AUDIENCES)[number];

export const SERVICE_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const PACKAGE_PRICING_STRATEGIES = [
  "STANDARD_TOTAL",
  "CUSTOM_PRICE",
  "PERCENTAGE_DISCOUNT",
  "FIXED_DISCOUNT",
] as const;
export type PackagePricingStrategy = (typeof PACKAGE_PRICING_STRATEGIES)[number];

export const SERVICE_CATEGORY_GROUPS = ["SERVICES", "PACKAGES", "ADDONS"] as const;
export type ServiceCategoryGroup = (typeof SERVICE_CATEGORY_GROUPS)[number];

export const AUDIENCE_LABELS: Record<ServiceAudience, string> = {
  MEN: "Men",
  WOMEN: "Women",
  UNISEX: "Unisex",
  KIDS: "Kids",
  COUPLES: "Couples",
};

export const CATALOG_TYPE_LABELS: Record<ServiceCatalogType, string> = {
  SERVICE: "Service",
  PACKAGE: "Package",
  ADD_ON: "Add-on",
};

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export const PRICING_STRATEGY_LABELS: Record<PackagePricingStrategy, string> = {
  STANDARD_TOTAL: "Standard total",
  CUSTOM_PRICE: "Custom package price",
  PERCENTAGE_DISCOUNT: "Percentage discount",
  FIXED_DISCOUNT: "Fixed discount",
};

export const CATEGORY_GROUP_LABELS: Record<ServiceCategoryGroup, string> = {
  SERVICES: "Categories",
  PACKAGES: "Packages",
  ADDONS: "Add-ons",
};
