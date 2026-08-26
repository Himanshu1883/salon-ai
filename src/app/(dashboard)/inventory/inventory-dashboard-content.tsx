import { getInventoryDashboardStats } from "@/actions/inventory/dashboard";
import { InventoryDashboardClient } from "@/components/inventory/inventory-dashboard-client";

export async function InventoryDashboardContent() {
  const stats = await getInventoryDashboardStats();
  return <InventoryDashboardClient stats={stats} />;
}
