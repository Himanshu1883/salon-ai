export const DASHBOARD_STALE_KEY = "salon-dashboard-stale";

export function markDashboardStale() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(DASHBOARD_STALE_KEY, "1");
  }
}
