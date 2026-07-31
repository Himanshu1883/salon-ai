import {
  startOfDay,
  endOfDay,
  startOfMonth,
  subDays,
  subMonths,
  format,
  isWithinInterval,
} from "date-fns";
import type { Sale, SalesStats } from "./types";
import { PAYMENT_LABELS } from "./types";

function sumTotals(sales: Sale[]) {
  return sales.reduce((sum, s) => sum + s.total, 0);
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function computeSalesStats(sales: Sale[]): SalesStats {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthSameDay = subMonths(now, 1);
  const weekStart = startOfDay(subDays(now, 6));
  const prevWeekStart = startOfDay(subDays(now, 13));
  const prevWeekEnd = endOfDay(subDays(now, 7));

  const todaySales = sales.filter(
    (s) =>
      s.paidAt &&
      isWithinInterval(new Date(s.paidAt), { start: todayStart, end: todayEnd })
  );
  const monthSales = sales.filter(
    (s) => s.paidAt && new Date(s.paidAt) >= monthStart
  );
  const lastMonthSales = sales.filter(
    (s) =>
      s.paidAt &&
      isWithinInterval(new Date(s.paidAt), {
        start: lastMonthStart,
        end: endOfDay(lastMonthSameDay),
      })
  );
  const thisWeekSales = sales.filter(
    (s) =>
      s.paidAt &&
      isWithinInterval(new Date(s.paidAt), { start: weekStart, end: todayEnd })
  );
  const prevWeekSales = sales.filter(
    (s) =>
      s.paidAt &&
      isWithinInterval(new Date(s.paidAt), {
        start: prevWeekStart,
        end: prevWeekEnd,
      })
  );

  const totalRevenue = sumTotals(sales);
  const transactionCount = sales.length;
  const avgOrderValue =
    transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;

  const weekRevenue = sumTotals(thisWeekSales);
  const prevWeekRevenue = sumTotals(prevWeekSales);
  const revenueTrend = pctChange(weekRevenue, prevWeekRevenue);

  const monthAov =
    monthSales.length > 0
      ? Math.round(sumTotals(monthSales) / monthSales.length)
      : 0;
  const lastMonthAov =
    lastMonthSales.length > 0
      ? Math.round(sumTotals(lastMonthSales) / lastMonthSales.length)
      : 0;
  const aovTrend = pctChange(monthAov, lastMonthAov);

  const revenueByDayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(subDays(now, i));
    revenueByDayMap.set(format(day, "yyyy-MM-dd"), 0);
  }
  for (const sale of sales) {
    if (!sale.paidAt) continue;
    const key = format(startOfDay(new Date(sale.paidAt)), "yyyy-MM-dd");
    if (revenueByDayMap.has(key)) {
      revenueByDayMap.set(key, (revenueByDayMap.get(key) ?? 0) + sale.total);
    }
  }
  const revenueByDay = Array.from(revenueByDayMap.entries()).map(
    ([date, revenue]) => ({
      label: format(new Date(date), "EEE"),
      revenue,
    })
  );

  const paymentMap = new Map<
    string,
    { method: string; label: string; count: number; total: number }
  >();
  for (const sale of sales) {
    const method = sale.paymentMethod ?? "other";
    const existing = paymentMap.get(method) ?? {
      method,
      label: PAYMENT_LABELS[method] ?? method,
      count: 0,
      total: 0,
    };
    existing.count += 1;
    existing.total += sale.total;
    paymentMap.set(method, existing);
  }
  const paymentBreakdown = Array.from(paymentMap.values()).sort(
    (a, b) => b.total - a.total
  );

  const stylistMap = new Map<string, { revenue: number; count: number }>();
  for (const sale of sales) {
    const name = sale.employee?.name;
    if (!name) continue;
    const existing = stylistMap.get(name) ?? { revenue: 0, count: 0 };
    existing.revenue += sale.total;
    existing.count += 1;
    stylistMap.set(name, existing);
  }
  let topStylist: SalesStats["topStylist"] = null;
  for (const [name, data] of stylistMap) {
    if (!topStylist || data.revenue > topStylist.revenue) {
      topStylist = { name, ...data };
    }
  }

  const serviceMap = new Map<string, { count: number; revenue: number }>();
  for (const sale of sales) {
    for (const item of sale.lineItems) {
      const name = item.description;
      const existing = serviceMap.get(name) ?? { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += sale.total / Math.max(sale.lineItems.length, 1);
      serviceMap.set(name, existing);
    }
  }
  let topService: SalesStats["topService"] = null;
  for (const [name, data] of serviceMap) {
    if (!topService || data.count > topService.count) {
      topService = { name, ...data };
    }
  }

  return {
    totalRevenue,
    transactionCount,
    revenueTrend,
    avgOrderValue,
    aovTrend,
    todayRevenue: sumTotals(todaySales),
    todayCount: todaySales.length,
    monthRevenue: sumTotals(monthSales),
    revenueByDay,
    paymentBreakdown,
    topStylist,
    topService,
  };
}

export function filterSalesClientSide(
  sales: Sale[],
  paymentMethod: string,
  stylist: string
): Sale[] {
  return sales.filter((sale) => {
    if (paymentMethod && paymentMethod !== "all") {
      const method = sale.paymentMethod ?? "other";
      if (method !== paymentMethod) return false;
    }
    if (stylist && stylist !== "all") {
      if (sale.employee?.name !== stylist) return false;
    }
    return true;
  });
}

export function getUniqueStylists(sales: Sale[]): string[] {
  const names = new Set<string>();
  for (const sale of sales) {
    if (sale.employee?.name) names.add(sale.employee.name);
  }
  return Array.from(names).sort();
}
