import { Suspense } from "react";
import { InventoryDashboardSkeleton } from "@/components/inventory/inventory-dashboard-skeleton";
import { InventoryDashboardContent } from "./inventory-dashboard-content";

export default async function InventoryDashboardPage() {
  return (
    <Suspense fallback={<InventoryDashboardSkeleton />}>
      <InventoryDashboardContent />
    </Suspense>
  );
}
