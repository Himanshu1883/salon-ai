import { getStockItems } from "@/actions/stock";
import { StockClient } from "../../stock/stock-client";

export async function InventoryStockContent({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const items = await getStockItems();
  return <StockClient items={items} categories={categories} />;
}
