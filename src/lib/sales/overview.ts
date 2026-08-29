import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { cachedRead } from "@/lib/memory-cache";
import { unstable_cache } from "next/cache";
import { salonCacheTag } from "@/lib/salon-cache";
import {
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import type { DataScopeContext } from "@/lib/permissions/data-scope";
import { paidSalesActivityOr } from "@/lib/sales/dates";
import {
  PAGE_SIZE,
  PAYMENT_LABELS,
  type Sale,
  type SalesStats,
} from "@/components/sales/types";

export type SalesOverviewFilters = {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  paymentMethod?: string;
  stylist?: string;
  page?: number;
  pageSize?: number;
};

export type SalesOverview = {
  stats: SalesStats;
  sales: Sale[];
  stylists: string[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const paidSalesSelect = {
  id: true,
  customerName: true,
  customerPhone: true,
  status: true,
  total: true,
  amountPaid: true,
  paidAt: true,
  createdAt: true,
  paymentMethod: true,
  lineItems: { select: { description: true } },
  employee: { select: { name: true } },
} as const;

function employeeScopeSql(ctx: DataScopeContext): Prisma.Sql {
  if (ctx.dataScope !== "own") return Prisma.empty;
  const employeeId = ctx.employeeId ?? "__unlinked__";
  return Prisma.sql`AND (
    i."employeeId" = ${employeeId}
    OR EXISTS (
      SELECT 1 FROM "InvoiceLineItem" li
      WHERE li."invoiceId" = i.id AND li."employeeId" = ${employeeId}
    )
  )`;
}

function searchSql(search?: string): Prisma.Sql {
  const q = search?.trim();
  if (!q) return Prisma.empty;
  const like = `%${q}%`;
  return Prisma.sql`AND (
    i."customerName" ILIKE ${like}
    OR COALESCE(i."customerPhone", '') ILIKE ${like}
  )`;
}

function dateSql(dateFrom?: string, dateTo?: string): Prisma.Sql {
  const range = paidSalesActivityOr(dateFrom, dateTo);
  if (!range) return Prisma.empty;
  const paidRange = range[0].paidAt;
  const from = paidRange?.gte;
  const to = paidRange?.lte;
  if (from && to) {
    return Prisma.sql`AND (
      (i.status = 'paid' AND i."paidAt" >= ${from} AND i."paidAt" <= ${to})
      OR (i.status = 'partial' AND i."createdAt" >= ${from} AND i."createdAt" <= ${to})
    )`;
  }
  if (from) {
    return Prisma.sql`AND (
      (i.status = 'paid' AND i."paidAt" >= ${from})
      OR (i.status = 'partial' AND i."createdAt" >= ${from})
    )`;
  }
  if (to) {
    return Prisma.sql`AND (
      (i.status = 'paid' AND i."paidAt" <= ${to})
      OR (i.status = 'partial' AND i."createdAt" <= ${to})
    )`;
  }
  return Prisma.empty;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function buildListWhere(
  ctx: DataScopeContext,
  filters: SalesOverviewFilters
): Prisma.InvoiceWhereInput {
  const dateOr = paidSalesActivityOr(filters.dateFrom, filters.dateTo);
  const search = filters.search?.trim();
  const paymentMethod = filters.paymentMethod;
  const stylist = filters.stylist;

  const and: Prisma.InvoiceWhereInput[] = [];
  if (dateOr) and.push({ OR: dateOr });
  if (search) {
    and.push({
      OR: [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (paymentMethod && paymentMethod !== "all") {
    if (paymentMethod === "partial") {
      and.push({ status: "partial" });
    } else {
      and.push({ paymentMethod });
    }
  }
  if (stylist && stylist !== "all") {
    and.push({ employee: { name: stylist } });
  }

  return {
    salonId: ctx.salonId,
    status: { in: ["paid", "partial"] },
    ...(ctx.dataScope === "own"
      ? {
          OR: [
            { employeeId: ctx.employeeId ?? "__unlinked__" },
            {
              lineItems: {
                some: { employeeId: ctx.employeeId ?? "__unlinked__" },
              },
            },
          ],
        }
      : {}),
    ...(and.length > 0 ? { AND: and } : {}),
  };
}

async function querySalesOverview(
  ctx: DataScopeContext,
  filters: SalesOverviewFilters
): Promise<SalesOverview> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? PAGE_SIZE));
  const salonId = ctx.salonId;
  const employeeSql = employeeScopeSql(ctx);
  const textSql = searchSql(filters.search);
  const rangeSql = dateSql(filters.dateFrom, filters.dateTo);

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthSameDay = endOfDay(subMonths(now, 1));
  const weekStart = startOfDay(subDays(now, 6));
  const prevWeekStart = startOfDay(subDays(now, 13));
  const prevWeekEnd = endOfDay(subDays(now, 7));

  const listWhere = buildListWhere(ctx, filters);
  const statsWhere = buildListWhere(ctx, {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    search: filters.search,
  });

  const [
    kpiRows,
    dailyRows,
    paymentRows,
    stylistRows,
    topServiceRows,
    stylistNames,
    sales,
    totalCount,
  ] = await Promise.all([
    prisma.$queryRaw<
      {
        total_revenue: number;
        transaction_count: number;
        today_revenue: number;
        today_count: number;
        month_revenue: number;
        month_count: number;
        last_month_revenue: number;
        last_month_count: number;
        week_revenue: number;
        prev_week_revenue: number;
      }[]
    >(Prisma.sql`
      WITH sales AS (
        SELECT
          CASE WHEN i.status = 'paid' THEN i.total ELSE COALESCE(i."amountPaid", 0) END AS collected,
          CASE WHEN i.status = 'paid' THEN i."paidAt" ELSE i."createdAt" END AS activity_at
        FROM "Invoice" i
        WHERE i."salonId" = ${salonId}
          AND i.status IN ('paid', 'partial')
          ${employeeSql}
          ${textSql}
          ${rangeSql}
      )
      SELECT
        COALESCE(SUM(collected), 0)::float AS total_revenue,
        COUNT(*)::int AS transaction_count,
        COALESCE(SUM(collected) FILTER (
          WHERE activity_at >= ${todayStart} AND activity_at <= ${todayEnd}
        ), 0)::float AS today_revenue,
        COUNT(*) FILTER (
          WHERE activity_at >= ${todayStart} AND activity_at <= ${todayEnd}
        )::int AS today_count,
        COALESCE(SUM(collected) FILTER (
          WHERE activity_at >= ${monthStart} AND activity_at <= ${todayEnd}
        ), 0)::float AS month_revenue,
        COUNT(*) FILTER (
          WHERE activity_at >= ${monthStart} AND activity_at <= ${todayEnd}
        )::int AS month_count,
        COALESCE(SUM(collected) FILTER (
          WHERE activity_at >= ${lastMonthStart} AND activity_at <= ${lastMonthSameDay}
        ), 0)::float AS last_month_revenue,
        COUNT(*) FILTER (
          WHERE activity_at >= ${lastMonthStart} AND activity_at <= ${lastMonthSameDay}
        )::int AS last_month_count,
        COALESCE(SUM(collected) FILTER (
          WHERE activity_at >= ${weekStart} AND activity_at <= ${todayEnd}
        ), 0)::float AS week_revenue,
        COALESCE(SUM(collected) FILTER (
          WHERE activity_at >= ${prevWeekStart} AND activity_at <= ${prevWeekEnd}
        ), 0)::float AS prev_week_revenue
      FROM sales
    `),
    prisma.$queryRaw<{ day: Date; revenue: number }[]>(Prisma.sql`
      WITH sales AS (
        SELECT
          CASE WHEN i.status = 'paid' THEN i.total ELSE COALESCE(i."amountPaid", 0) END AS collected,
          CASE WHEN i.status = 'paid' THEN i."paidAt" ELSE i."createdAt" END AS activity_at
        FROM "Invoice" i
        WHERE i."salonId" = ${salonId}
          AND i.status IN ('paid', 'partial')
          ${employeeSql}
          ${textSql}
          ${rangeSql}
      ),
      days AS (
        SELECT generate_series(${weekStart}::date, ${todayEnd}::date, interval '1 day')::date AS day
      )
      SELECT
        d.day,
        COALESCE(SUM(s.collected), 0)::float AS revenue
      FROM days d
      LEFT JOIN sales s ON s.activity_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day
    `),
    prisma.$queryRaw<{ method: string; count: number; total: number }[]>(
      Prisma.sql`
        SELECT
          COALESCE(i."paymentMethod", 'other') AS method,
          COUNT(*)::int AS count,
          COALESCE(SUM(
            CASE WHEN i.status = 'paid' THEN i.total ELSE COALESCE(i."amountPaid", 0) END
          ), 0)::float AS total
        FROM "Invoice" i
        WHERE i."salonId" = ${salonId}
          AND i.status IN ('paid', 'partial')
          ${employeeSql}
          ${textSql}
          ${rangeSql}
        GROUP BY 1
        ORDER BY total DESC
      `
    ),
    prisma.$queryRaw<{ name: string; revenue: number; count: number }[]>(
      Prisma.sql`
        SELECT
          e.name,
          COALESCE(SUM(
            CASE WHEN i.status = 'paid' THEN i.total ELSE COALESCE(i."amountPaid", 0) END
          ), 0)::float AS revenue,
          COUNT(*)::int AS count
        FROM "Invoice" i
        JOIN "Employee" e ON e.id = i."employeeId"
        WHERE i."salonId" = ${salonId}
          AND i.status IN ('paid', 'partial')
          AND i."employeeId" IS NOT NULL
          ${employeeSql}
          ${textSql}
          ${rangeSql}
        GROUP BY e.name
        ORDER BY revenue DESC
        LIMIT 1
      `
    ),
    prisma.$queryRaw<{ name: string; count: number; revenue: number }[]>(
      Prisma.sql`
        SELECT
          li.description AS name,
          COUNT(*)::int AS count,
          COALESCE(SUM(
            (CASE WHEN i.status = 'paid' THEN i.total ELSE COALESCE(i."amountPaid", 0) END)
            / GREATEST(
              (SELECT COUNT(*) FROM "InvoiceLineItem" x WHERE x."invoiceId" = i.id),
              1
            )
          ), 0)::float AS revenue
        FROM "Invoice" i
        JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
        WHERE i."salonId" = ${salonId}
          AND i.status IN ('paid', 'partial')
          ${employeeSql}
          ${textSql}
          ${rangeSql}
        GROUP BY li.description
        ORDER BY COUNT(*) DESC
        LIMIT 1
      `
    ),
    prisma.invoice.findMany({
      where: statsWhere,
      distinct: ["employeeId"],
      select: {
        employeeId: true,
        employee: { select: { name: true } },
      },
    }),
    prisma.invoice.findMany({
      where: listWhere,
      select: paidSalesSelect,
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where: listWhere }),
  ]);

  const kpi = kpiRows[0];
  const totalRevenue = kpi?.total_revenue ?? 0;
  const transactionCount = kpi?.transaction_count ?? 0;
  const monthCount = kpi?.month_count ?? 0;
  const lastMonthCount = kpi?.last_month_count ?? 0;
  const monthRevenue = kpi?.month_revenue ?? 0;
  const lastMonthRevenue = kpi?.last_month_revenue ?? 0;
  const monthAov = monthCount > 0 ? Math.round(monthRevenue / monthCount) : 0;
  const lastMonthAov =
    lastMonthCount > 0 ? Math.round(lastMonthRevenue / lastMonthCount) : 0;

  const stats: SalesStats = {
    totalRevenue,
    transactionCount,
    revenueTrend: pctChange(kpi?.week_revenue ?? 0, kpi?.prev_week_revenue ?? 0),
    avgOrderValue:
      transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0,
    aovTrend: pctChange(monthAov, lastMonthAov),
    todayRevenue: kpi?.today_revenue ?? 0,
    todayCount: kpi?.today_count ?? 0,
    monthRevenue,
    revenueByDay: dailyRows.map((row) => ({
      label: format(new Date(row.day), "EEE"),
      revenue: row.revenue ?? 0,
    })),
    paymentBreakdown: paymentRows.map((row) => ({
      method: row.method,
      label: PAYMENT_LABELS[row.method] ?? row.method,
      count: row.count,
      total: row.total,
    })),
    topStylist: stylistRows[0]
      ? {
          name: stylistRows[0].name,
          revenue: stylistRows[0].revenue,
          count: stylistRows[0].count,
        }
      : null,
    topService: topServiceRows[0]
      ? {
          name: topServiceRows[0].name,
          count: topServiceRows[0].count,
          revenue: topServiceRows[0].revenue,
        }
      : null,
  };

  const stylists = Array.from(
    new Set(
      stylistNames
        .map((row) => row.employee?.name)
        .filter((name): name is string => Boolean(name))
    )
  ).sort();

  return {
    stats,
    sales,
    stylists,
    totalCount,
    page,
    pageSize,
  };
}

export async function fetchSalesOverview(
  ctx: DataScopeContext,
  filters: SalesOverviewFilters = {}
): Promise<SalesOverview> {
  const cacheKey = JSON.stringify({
    employeeId: ctx.dataScope === "own" ? ctx.employeeId : "all",
    ...filters,
    page: Math.max(1, filters.page ?? 1),
    pageSize: Math.min(50, Math.max(1, filters.pageSize ?? PAGE_SIZE)),
  });

  return cachedRead(
    `salon-cache:sales:overview:${ctx.salonId}:${cacheKey}`,
    30,
    () =>
      unstable_cache(
        () => querySalesOverview(ctx, filters),
        ["sales", "overview", ctx.salonId, cacheKey],
        { revalidate: 30, tags: [salonCacheTag(ctx.salonId, "billing")] }
      )()
  );
}
