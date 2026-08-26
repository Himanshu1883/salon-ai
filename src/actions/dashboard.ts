"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, getAuthSession } from "@/lib/auth";
import { cachedBySalon, salonCacheTag } from "@/lib/salon-cache";
import {
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { getBillingStatsForSalon } from "@/actions/billing";
import { getPendingSmsCountForSalon } from "@/actions/sms";
import { getLowStockCountForSalon } from "@/actions/stock";
import { getOverduePlatformInvoiceReadOnly } from "@/actions/subscription";
import { getCachedDashboardPageData } from "@/lib/dashboard/page-data";

export type RevenueDay = {
  date: string;
  label: string;
  revenue: number;
};

export type DashboardActivity = {
  id: string;
  type: "check_in" | "completed" | "new_customer" | "sale";
  title: string;
  subtitle?: string;
  timestamp: Date;
  href?: string;
};

export type TeamMemberStatus = {
  id: string;
  name: string;
  role: string;
  startTime: string | null;
  endTime: string | null;
  status: "on_shift" | "busy" | "available";
};

export async function getDashboardKpis() {
  const session = await requireSession();
  const data = await getCachedDashboardPageData(session.user.salonId);
  return data.kpis;
}

export async function getDashboardWidgets() {
  const session = await requireSession();
  const data = await getCachedDashboardPageData(session.user.salonId);
  return data.widgets;
}

/** Full stats — used by reports; merges cached KPI + widget fetches. */
export async function getDashboardStats() {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const now = new Date();

  const [pageData, seats, staffEarningsMonthResult] = await Promise.all([
    getCachedDashboardPageData(salonId),
    prisma.seat.findMany({
      where: { salonId },
      select: { status: true },
    }),
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "paid",
        paidAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
        employeeId: { not: null },
      },
      _sum: { total: true },
    }),
  ]);

  const seatsInUse = seats.filter((s) => s.status === "occupied").length;
  const seatsAvailable = seats.filter((s) => s.status === "available").length;

  const { kpis, widgets } = pageData;

  return {
    ...kpis,
    ...widgets,
    todayAppointments: kpis.todayAppointments,
    seatsInUse,
    seatsAvailable,
    totalSeats: seats.length,
    staffEarningsMonth: staffEarningsMonthResult._sum.total ?? 0,
  };
}

export async function getLayoutHeaderData() {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return { alertCount: 0, showUpgrade: false };
  }
  return getCachedLayoutHeaderData(session.user.salonId);
}

export async function getLayoutHeaderDataForSalon(salonId: string) {
  return getCachedLayoutHeaderData(salonId);
}

function getCachedLayoutHeaderData(salonId: string) {
  return getLayoutHeaderDataCached(salonId);
}

const getLayoutHeaderDataCached = cachedBySalon(
  "layout-alerts",
  async (salonId: string) => {
      const now = new Date();

      const [lowStockCount, billingStats, pendingSms, subscription, overduePlatformInvoice] =
        await Promise.all([
          getLowStockCountForSalon(salonId),
          getBillingStatsForSalon(salonId),
          getPendingSmsCountForSalon(salonId),
          prisma.salonSubscription.findUnique({ where: { salonId } }),
          getOverduePlatformInvoiceReadOnly(salonId),
        ]);

      let alertCount = 0;
      if (lowStockCount > 0) alertCount += lowStockCount;
      if (billingStats.unpaidCount > 0) alertCount += billingStats.unpaidCount;
      if (pendingSms > 0) alertCount += pendingSms;
      if (overduePlatformInvoice) alertCount += 1;

      const trialEndingSoon =
        subscription?.status === "trial" &&
        subscription.trialEndsAt &&
        subscription.trialEndsAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (trialEndingSoon) alertCount += 1;

      return {
        alertCount,
        subscriptionStatus: subscription?.status ?? null,
        showUpgrade:
          subscription?.status === "trial" || subscription?.status === "past_due",
      };
  },
  { revalidate: 30 }
);

export { salonCacheTag };
