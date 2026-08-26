import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
} from "date-fns";
import type { RevenueDay } from "@/actions/dashboard";

export type DashboardBillingMetrics = {
  revenueToday: number;
  revenueMonth: number;
  unpaidCount: number;
  revenueYesterday: number;
  revenueTrend: number;
  revenueByDay: RevenueDay[];
  recentSales: {
    id: string;
    customerName: string;
    total: number;
    paidAt: Date;
  }[];
};

/** One round-trip for billing KPIs, trend, chart data, and recent sales. */
export async function fetchDashboardBillingMetrics(
  salonId: string,
  now = new Date()
): Promise<DashboardBillingMetrics> {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfDay(subDays(now, 6));
  const recentSalesSince = subDays(now, 7);

  const [rollup, dailyRows, recentSales] = await Promise.all([
    prisma.$queryRaw<
      {
        revenue_today: number | null;
        revenue_month: number | null;
        revenue_yesterday: number | null;
        unpaid_count: bigint;
      }[]
    >`
      SELECT
        COALESCE(SUM(CASE
          WHEN status = 'paid' AND "paidAt" >= ${todayStart} AND "paidAt" <= ${todayEnd}
          THEN total END), 0)::float AS revenue_today,
        COALESCE(SUM(CASE
          WHEN status = 'paid' AND "paidAt" >= ${monthStart} AND "paidAt" <= ${monthEnd}
          THEN total END), 0)::float AS revenue_month,
        COALESCE(SUM(CASE
          WHEN status = 'paid' AND "paidAt" >= ${yesterdayStart} AND "paidAt" <= ${yesterdayEnd}
          THEN total END), 0)::float AS revenue_yesterday,
        COUNT(CASE
          WHEN status IN ('draft', 'sent', 'overdue', 'partial') THEN 1 END)::bigint AS unpaid_count
      FROM "Invoice"
      WHERE "salonId" = ${salonId}
    `,
    prisma.$queryRaw<{ day: Date; revenue: number | null }[]>`
      SELECT
        date_trunc('day', "paidAt")::date AS day,
        COALESCE(SUM(total), 0)::float AS revenue
      FROM "Invoice"
      WHERE "salonId" = ${salonId}
        AND status = 'paid'
        AND "paidAt" >= ${weekStart}
        AND "paidAt" <= ${todayEnd}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: recentSalesSince },
      },
      orderBy: { paidAt: "desc" },
      take: 5,
      select: {
        id: true,
        customerName: true,
        total: true,
        paidAt: true,
      },
    }),
  ]);

  const row = rollup[0];
  const revenueToday = row?.revenue_today ?? 0;
  const revenueMonth = row?.revenue_month ?? 0;
  const revenueYesterday = row?.revenue_yesterday ?? 0;
  const unpaidCount = Number(row?.unpaid_count ?? 0);

  const revenueTrend =
    revenueYesterday > 0
      ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100)
      : revenueToday > 0
        ? 100
        : 0;

  const dailyMap = new Map(
    dailyRows.map((r) => [
      format(startOfDay(r.day), "yyyy-MM-dd"),
      r.revenue ?? 0,
    ])
  );

  const revenueByDay: RevenueDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(subDays(now, i));
    const key = format(day, "yyyy-MM-dd");
    revenueByDay.push({
      date: key,
      label: format(day, "EEE"),
      revenue: dailyMap.get(key) ?? 0,
    });
  }

  return {
    revenueToday,
    revenueMonth,
    unpaidCount,
    revenueYesterday,
    revenueTrend,
    revenueByDay,
    recentSales: recentSales
      .filter((s) => s.paidAt)
      .map((s) => ({
        id: s.id,
        customerName: s.customerName,
        total: s.total,
        paidAt: s.paidAt!,
      })),
  };
}
