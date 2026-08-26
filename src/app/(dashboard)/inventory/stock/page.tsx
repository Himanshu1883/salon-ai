import { Suspense } from "react";
import { getStockCategories } from "@/actions/stock-categories";
import { InventoryStockContent } from "./inventory-stock-content";

function StockTableSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-xl bg-[#ECECEC]" />
        <div className="h-10 w-40 rounded-xl bg-[#ECECEC]" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-[#F7F8FC]" />
        ))}
      </div>
    </div>
  );
}

export default async function InventoryStockPage() {
  const categories = await getStockCategories();

  return (
    <Suspense fallback={<StockTableSkeleton />}>
      <InventoryStockContent
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
      />
    </Suspense>
  );
}
