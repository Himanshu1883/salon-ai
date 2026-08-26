import { prisma } from "@/lib/prisma";
import { cachedRead } from "@/lib/memory-cache";
import { getCachedBillingStats } from "@/lib/billing/stats-cache";
import { getOverduePlatformInvoiceReadOnly } from "@/actions/subscription";

export type LayoutAlertMetrics = {
  alertCount: number;
  showUpgrade: boolean;
};

async function fetchLowStockAndPendingSms(salonId: string) {
  const rows = await prisma.$queryRaw<
    { low_stock: bigint; pending_sms: bigint }[]
  >`
    SELECT
      (
        SELECT COUNT(*)::bigint
        FROM "StockItem"
        WHERE "salonId" = ${salonId}
          AND (
            "quantityOnHand" <= 0
            OR ("reorderLevel" IS NOT NULL AND "quantityOnHand" <= "reorderLevel")
          )
      ) AS low_stock,
      (
        SELECT COUNT(*)::bigint
        FROM "SmsReminder"
        WHERE "salonId" = ${salonId}
          AND status = 'pending'
      ) AS pending_sms
  `;
  const row = rows[0];
  return {
    lowStockCount: Number(row?.low_stock ?? 0),
    pendingSms: Number(row?.pending_sms ?? 0),
  };
}

/** Cached header alert metrics — 3 DB round-trips max (billing cache, counts SQL, overdue). */
export async function fetchLayoutAlertMetrics(
  salonId: string
): Promise<LayoutAlertMetrics> {
  return cachedRead(`layout-alerts:${salonId}`, 30, async () => {
    const now = new Date();

    const [billingStats, counts, subscription, overduePlatformInvoice] =
      await Promise.all([
        getCachedBillingStats(salonId),
        fetchLowStockAndPendingSms(salonId),
        prisma.salonSubscription.findUnique({
          where: { salonId },
          select: { status: true, trialEndsAt: true },
        }),
        getOverduePlatformInvoiceReadOnly(salonId),
      ]);

    let alertCount = 0;
    if (counts.lowStockCount > 0) alertCount += counts.lowStockCount;
    if (billingStats.unpaidCount > 0) alertCount += billingStats.unpaidCount;
    if (counts.pendingSms > 0) alertCount += counts.pendingSms;
    if (overduePlatformInvoice) alertCount += 1;

    const trialEndingSoon =
      subscription?.status === "trial" &&
      subscription.trialEndsAt &&
      subscription.trialEndsAt.getTime() - now.getTime() <=
        7 * 24 * 60 * 60 * 1000;
    if (trialEndingSoon) alertCount += 1;

    return {
      alertCount,
      showUpgrade:
        subscription?.status === "trial" ||
        subscription?.status === "past_due",
    };
  });
}
