import { getInventoryDashboardStats } from "@/actions/inventory/dashboard";
import { InventoryDashboardClient } from "@/components/inventory/inventory-dashboard-client";

export default async function InventoryDashboardPage() {
  const stats = await getInventoryDashboardStats();
  return <InventoryDashboardClient stats={stats} />;
}
