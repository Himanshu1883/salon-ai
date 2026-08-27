"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_STALE_KEY } from "@/lib/dashboard/stale-refresh";

/** Refetches dashboard server data after billing/payment mutations elsewhere in the app. */
export function DashboardStaleRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem(DASHBOARD_STALE_KEY) !== "1") return;
    sessionStorage.removeItem(DASHBOARD_STALE_KEY);
    router.refresh();
  }, [router]);

  return null;
}
