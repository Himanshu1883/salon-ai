export const MOVEMENT_TYPES = [
  "purchase",
  "grn",
  "consumption",
  "issue",
  "return",
  "adjustment",
  "sale",
  "transfer_out",
  "transfer_in",
  "expired",
  "damaged",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  purchase: "Purchase",
  grn: "Goods Received",
  consumption: "Service Consumption",
  issue: "Staff Issue",
  return: "Staff Return",
  adjustment: "Adjustment",
  sale: "Retail Sale",
  transfer_out: "Transfer Out",
  transfer_in: "Transfer In",
  expired: "Expired",
  damaged: "Damaged",
};

export const ADJUSTMENT_REASONS = [
  "count_correction",
  "damaged",
  "expired",
  "theft",
  "sample",
  "other",
] as const;

export const PO_STATUSES = ["draft", "ordered", "partial", "received", "cancelled"] as const;
export const TRANSFER_STATUSES = ["pending", "in_transit", "received", "cancelled"] as const;

export const INVENTORY_NAV = [
  { href: "/inventory", label: "Dashboard", exact: true },
  { href: "/inventory/products", label: "Products" },
  { href: "/inventory/categories", label: "Categories" },
  { href: "/inventory/brands", label: "Brands" },
  { href: "/inventory/vendors", label: "Vendors" },
  { href: "/inventory/purchase-orders", label: "Purchase Orders" },
  { href: "/inventory/grn", label: "GRN" },
  { href: "/inventory/adjustments", label: "Adjustments" },
  { href: "/inventory/staff-issue", label: "Staff Issue" },
  { href: "/inventory/service-recipes", label: "Service Recipes" },
  { href: "/inventory/consumption", label: "Consumption" },
  { href: "/inventory/transfers", label: "Transfers" },
  { href: "/inventory/retail-sales", label: "Retail Sales" },
  { href: "/inventory/expiry", label: "Expiry" },
  { href: "/inventory/low-stock", label: "Low Stock" },
  { href: "/inventory/ledger", label: "Ledger" },
  { href: "/inventory/reports", label: "Reports" },
] as const;
