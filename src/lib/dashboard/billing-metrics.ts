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

const UNPAID_STATUSES = ["draft", "sent", "overdue", "partial"] as const;

/** Collected revenue = paid invoice totals + partial invoice amounts received. */
async function getRevenueCollectedInRange(
  salonId: string,
  rangeStart: Date,
  rangeEnd: Date
) {
  const [paid, partial] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: rangeStart, lte: rangeEnd },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "partial",
        createdAt: { gte: rangeStart, lte: rangeEnd },
      },
      _sum: { amountPaid: true },
    }),
  ]);

  return (paid._sum.total ?? 0) + (partial._sum.amountPaid ?? 0);
}

/** One round-trip bundle for billing KPIs, trend, chart data, and recent sales. */
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

  const [
    revenueToday,
    revenueMonth,
    revenueYesterday,
    unpaidCount,
    paidDailyRows,
    partialDailyRows,
    recentPaid,
    recentPartial,
  ] = await Promise.all([
    getRevenueCollectedInRange(salonId, todayStart, todayEnd),
    getRevenueCollectedInRange(salonId, monthStart, monthEnd),
    getRevenueCollectedInRange(salonId, yesterdayStart, yesterdayEnd),
    prisma.invoice.count({
      where: {
        salonId,
        status: { in: [...UNPAID_STATUSES] },
      },
    }),
    prisma.$queryRaw<{ day: Date; revenue: number | null }[]>`
      SELECT
        date_trunc('day', "paidAt")::date AS day,
        COALESCE(SUM(total), 0)::float AS revenue
      FROM "Invoice"
      WHERE "salonId" = ${salonId}
        AND status = 'paid'
        AND "paidAt" IS NOT NULL
        AND "paidAt" >= ${weekStart}
        AND "paidAt" <= ${todayEnd}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<{ day: Date; revenue: number | null }[]>`
      SELECT
        date_trunc('day', "createdAt")::date AS day,
        COALESCE(SUM("amountPaid"), 0)::float AS revenue
      FROM "Invoice"
      WHERE "salonId" = ${salonId}
        AND status = 'partial'
        AND "amountPaid" > 0
        AND "createdAt" >= ${weekStart}
        AND "createdAt" <= ${todayEnd}
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
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "partial",
        amountPaid: { gt: 0 },
        createdAt: { gte: recentSalesSince },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        customerName: true,
        amountPaid: true,
        createdAt: true,
      },
    }),
  ]);

  const revenueTrend =
    revenueYesterday > 0
      ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100)
      : revenueToday > 0
        ? 100
        : 0;

  const dailyMap = new Map<string, number>();
  for (const row of [...paidDailyRows, ...partialDailyRows]) {
    const key = format(startOfDay(row.day), "yyyy-MM-dd");
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + (row.revenue ?? 0));
  }

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

  const recentSales = [
    ...recentPaid
      .filter((sale) => sale.paidAt)
      .map((sale) => ({
        id: sale.id,
        customerName: sale.customerName,
        total: sale.total,
        paidAt: sale.paidAt!,
      })),
    ...recentPartial.map((sale) => ({
      id: sale.id,
      customerName: sale.customerName,
      total: sale.amountPaid,
      paidAt: sale.createdAt,
    })),
  ]
    .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
    .slice(0, 5);

  return {
    revenueToday,
    revenueMonth,
    unpaidCount,
    revenueYesterday,
    revenueTrend,
    revenueByDay,
    recentSales,
  };
}
