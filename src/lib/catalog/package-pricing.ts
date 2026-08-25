import type { PackagePricingStrategy } from "./constants";

export type PackagePricingInput = {
  itemsTotal: number;
  pricingStrategy: PackagePricingStrategy;
  customPrice?: number | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
};

export type PackagePricingResult = {
  itemsTotal: number;
  packagePrice: number;
  savings: number;
};

export function computePackageItemsTotal(
  items: { price: number; quantity?: number }[]
): number {
  return items.reduce(
    (sum, item) => sum + item.price * (item.quantity ?? 1),
    0
  );
}

export function computePackageDuration(
  items: { duration: number; quantity?: number }[]
): number {
  return items.reduce(
    (sum, item) => sum + item.duration * (item.quantity ?? 1),
    0
  );
}

export function resolvePackagePrice(
  input: PackagePricingInput
): PackagePricingResult {
  const itemsTotal = Math.max(0, input.itemsTotal);

  let packagePrice = itemsTotal;

  switch (input.pricingStrategy) {
    case "STANDARD_TOTAL":
      packagePrice = itemsTotal;
      break;
    case "CUSTOM_PRICE":
      packagePrice = Math.max(0, input.customPrice ?? itemsTotal);
      break;
    case "PERCENTAGE_DISCOUNT": {
      const pct = Math.min(100, Math.max(0, input.discountPercent ?? 0));
      packagePrice = itemsTotal * (1 - pct / 100);
      break;
    }
    case "FIXED_DISCOUNT": {
      const discount = Math.max(0, input.discountAmount ?? 0);
      packagePrice = Math.max(0, itemsTotal - discount);
      break;
    }
  }

  packagePrice = Math.round(packagePrice * 100) / 100;
  const savings = Math.max(0, Math.round((itemsTotal - packagePrice) * 100) / 100);

  return { itemsTotal, packagePrice, savings };
}
