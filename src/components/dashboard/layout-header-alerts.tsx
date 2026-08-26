import { fetchLayoutAlertMetrics } from "@/lib/layout/alert-metrics";
import { HeaderAlertBadge } from "@/components/dashboard/header-alert-badge";

export async function LayoutHeaderAlerts({ salonId }: { salonId: string }) {
  const { alertCount } = await fetchLayoutAlertMetrics(salonId);
  return <HeaderAlertBadge count={alertCount} />;
}
