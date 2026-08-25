export type CatalogServiceItem = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  categoryId: string | null;
  categoryName?: string | null;
  sortOrder: number;
  catalogType: string;
  audience: string;
  status: string;
  onlineBooking: boolean;
  inStoreBooking: boolean;
  pricingStrategy?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  itemsTotal?: number | null;
  savings?: number | null;
  employees: { employee: { id: string; name: string } }[];
  packageItems: {
    id: string;
    sortOrder: number;
    quantity: number;
    includedService: { id: string; name: string; price: number; duration: number };
  }[];
  parentAddOnLinks: {
    id: string;
    sortOrder: number;
    addOnService: { id: string; name: string; price: number; duration: number; status: string };
  }[];
  addOnParentLinks: {
    id: string;
    sortOrder: number;
    parentService: { id: string; name: string };
  }[];
};

export type CategoryGroup = {
  id: string;
  name: string;
  sortOrder: number;
  categoryGroup?: string;
  services: CatalogServiceItem[];
};

export type CatalogTab = "ALL" | "SERVICE" | "PACKAGE" | "ADD_ON";

export function normalizeCatalogItem(raw: Record<string, unknown>): CatalogServiceItem {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: (raw.description as string | null) ?? null,
    duration: raw.duration as number,
    price: raw.price as number,
    categoryId: (raw.categoryId as string | null) ?? null,
    categoryName: (raw.categoryName as string | null) ?? null,
    sortOrder: raw.sortOrder as number,
    catalogType: (raw.catalogType as string) ?? "SERVICE",
    audience: (raw.audience as string) ?? "UNISEX",
    status: (raw.status as string) ?? "ACTIVE",
    onlineBooking: (raw.onlineBooking as boolean) ?? true,
    inStoreBooking: (raw.inStoreBooking as boolean) ?? true,
    pricingStrategy: (raw.pricingStrategy as string | null) ?? null,
    discountPercent: (raw.discountPercent as number | null) ?? null,
    discountAmount: (raw.discountAmount as number | null) ?? null,
    itemsTotal: (raw.itemsTotal as number | null) ?? null,
    savings: (raw.savings as number | null) ?? null,
    employees: (raw.employees as CatalogServiceItem["employees"]) ?? [],
    packageItems: (raw.packageItems as CatalogServiceItem["packageItems"]) ?? [],
    parentAddOnLinks: (raw.parentAddOnLinks as CatalogServiceItem["parentAddOnLinks"]) ?? [],
    addOnParentLinks: (raw.addOnParentLinks as CatalogServiceItem["addOnParentLinks"]) ?? [],
  };
}

export function normalizeCategory(raw: {
  id: string;
  name: string;
  sortOrder: number;
  categoryGroup?: string;
  services: Record<string, unknown>[];
}): CategoryGroup {
  return {
    id: raw.id,
    name: raw.name,
    sortOrder: raw.sortOrder,
    categoryGroup: raw.categoryGroup,
    services: raw.services.map((s) => normalizeCatalogItem(s)),
  };
}
