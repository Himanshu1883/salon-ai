import { getStockAvailability } from "@/actions/stock";
import { getStockCategories } from "@/actions/stock-categories";
import { PurchaseFormClient } from "@/app/(dashboard)/stock/purchases/new/purchase-form-client";

export default async function InventoryNewPurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>;
}) {
  const { itemId } = await searchParams;
  const [stockItems, categories] = await Promise.all([
    getStockAvailability(),
    getStockCategories(),
  ]);

  return (
    <PurchaseFormClient
      stockItems={stockItems.map((item) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        quantityOnHand: item.quantityOnHand,
      }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      preselectedItemId={itemId}
    />
  );
}
