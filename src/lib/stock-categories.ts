export const DEFAULT_STOCK_CATEGORY_NAMES = [
  "shampoo",
  "color",
  "tools",
  "supplies",
  "other",
] as const;

export type DefaultStockCategoryName =
  (typeof DEFAULT_STOCK_CATEGORY_NAMES)[number];
