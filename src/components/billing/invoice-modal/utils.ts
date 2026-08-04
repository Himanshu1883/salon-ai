export type LineItem = {
  key: string;
  itemType: "SERVICE" | "PRODUCT";
  serviceId: string;
  stockItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: "percent" | "fixed";
  taxRate: number;
};

export function newLineItem(): LineItem {
  return {
    key: crypto.randomUUID(),
    itemType: "SERVICE",
    serviceId: "",
    stockItemId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    discountType: "percent",
    taxRate: 0.18,
  };
}

export function lineGross(item: LineItem) {
  return item.quantity * item.unitPrice;
}

export function lineDiscount(item: LineItem) {
  const gross = lineGross(item);
  if (item.discountType === "percent") {
    return Math.min(gross, gross * (item.discount / 100));
  }
  return Math.min(gross, item.discount);
}

export function lineNet(item: LineItem) {
  return Math.max(0, lineGross(item) - lineDiscount(item));
}

export function lineTax(item: LineItem, gstIncluded: boolean, gstEnabled = true) {
  if (!gstEnabled) return 0;
  const net = lineNet(item);
  if (gstIncluded) {
    return net - net / (1 + item.taxRate);
  }
  return net * item.taxRate;
}

export function lineTotal(item: LineItem, gstIncluded: boolean, gstEnabled = true) {
  const net = lineNet(item);
  if (!gstEnabled) return net;
  return gstIncluded ? net : net + lineTax(item, gstIncluded, gstEnabled);
}

export function formatInvoiceNumber(id: string, createdAt = new Date()) {
  const year = createdAt.getFullYear();
  const suffix = id.replace(/\D/g, "").slice(-6).padStart(6, "0");
  return `INV-${year}-${suffix}`;
}
