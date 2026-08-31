"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, getAuthSession } from "@/lib/auth";
import {
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { salonCacheTag } from "@/lib/salon-cache";
import { fetchLayoutAlertMetrics } from "@/lib/layout/alert-metrics";
import { getCachedDashboardPageData } from "@/lib/dashboard/page-data";
import { requireSalonWidePermission } from "@/lib/permissions/data-scope";

export type RevenueDay = {
  date: string;
  label: string;
  revenue: number;
  salesCount: number;
};

export type CustomerDay = {
  date: string;
  label: string;
  newCount: number;
  total: number;
};

export type DashboardLowStockItem = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number | null;
  status: "low" | "out";
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
  await requireSalonWidePermission("reports.view");
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
  return getLayoutHeaderDataForSalon(session.user.salonId);
}

export async function getLayoutHeaderDataForSalon(salonId: string) {
  const metrics = await fetchLayoutAlertMetrics(salonId);
  return {
    alertCount: metrics.alertCount,
    showUpgrade: metrics.showUpgrade,
    subscriptionStatus: null,
  };
}

export { salonCacheTag };
