import { getStockItems } from "@/actions/stock";
import { getStockCategories } from "@/actions/stock-categories";
import { StockClient } from "../../stock/stock-client";

export default async function InventoryStockPage() {
  const [items, categories] = await Promise.all([
    getStockItems(),
    getStockCategories(),
  ]);
  return (
    <StockClient
      items={items}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
