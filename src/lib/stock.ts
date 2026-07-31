export type StockStatus = "in_stock" | "low" | "out";

export function getStockStatus(item: {
  quantityOnHand: number;
  reorderLevel: number | null;
}): StockStatus {
  if (item.quantityOnHand <= 0) return "out";
  if (
    item.reorderLevel != null &&
    item.quantityOnHand <= item.reorderLevel
  ) {
    return "low";
  }
  return "in_stock";
}

export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case "in_stock":
      return "In stock";
    case "low":
      return "Low stock";
    case "out":
      return "Out of stock";
  }
}

export function getBillAttachmentUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `/api/uploads/${path}`;
}
