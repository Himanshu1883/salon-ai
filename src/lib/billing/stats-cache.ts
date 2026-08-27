import { cachedRead } from "@/lib/memory-cache";
import {
  getBillingStatsForSalon,
  getDuePaymentsSummaryForSalon,
} from "@/actions/billing";

/** Shared billing stats cache for dashboard + header alerts (in-process, 30s). */
export async function getCachedBillingStats(salonId: string) {
  return cachedRead(`salon-cache:billing:stats:${salonId}`, 30, () =>
    getBillingStatsForSalon(salonId)
  );
}

export async function getCachedDuePaymentsSummary(salonId: string) {
  return cachedRead(`salon-cache:billing:due:${salonId}`, 30, () =>
    getDuePaymentsSummaryForSalon(salonId)
  );
}
