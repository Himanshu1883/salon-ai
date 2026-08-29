import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { cachedRead } from "@/lib/memory-cache";
import { unstable_cache } from "next/cache";
import { salonCacheTag } from "@/lib/salon-cache";
import { formatCurrency } from "@/lib/currency";
import { getSalonPlan } from "@/lib/plan-access";
import { isBasicPlan } from "@/lib/plans";
import type { DataScopeContext } from "@/lib/permissions/data-scope";
import { salesInvoiceScopeWhere } from "@/lib/permissions/data-scope-core";
import {
  BILLING_PAGE_SIZE,
  buildInvoiceListWhere,
  fetchInvoicePage,
} from "@/lib/billing/invoice-list-query";
import type {
  BillingEmployee,
  BillingInvoice,
  BillingStats,
} from "@/components/billing/types";

export type BillingOverviewFilters = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  page?: number;
  pageSize?: number;
};

export type BillingOverviewStats = BillingStats & {
  revenueTodayLabel: string;
  revenueMonthLabel: string;
  unpaidSublabel: string;
};

export type BillingOverview = {
  stats: BillingOverviewStats;
  invoices: BillingInvoice[];
  employees: BillingEmployee[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  start: number;
  end: number;
  isBasicPlan: boolean;
};

async function queryScopedBillingStats(ctx: DataScopeContext) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const scope =
    ctx.dataScope === "own" ? salesInvoiceScopeWhere(ctx) : { salonId: ctx.salonId };

  const [todayPaid, todayPartial, monthPaid, monthPartial, unpaidCount] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: {
          ...scope,
          status: "paid",
          paidAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          ...scope,
          status: "partial",
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { amountPaid: true },
      }),
      prisma.invoice.aggregate({
        where: {
          ...scope,
          status: "paid",
          paidAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          ...scope,
          status: "partial",
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amountPaid: true },
      }),
      prisma.invoice.count({
        where: {
          ...scope,
          status: { in: ["draft", "sent", "overdue", "partial"] },
        },
      }),
    ]);

  const revenueToday =
    (todayPaid._sum.total ?? 0) + (todayPartial._sum.amountPaid ?? 0);
  const revenueMonth =
    (monthPaid._sum.total ?? 0) + (monthPartial._sum.amountPaid ?? 0);

  return {
    revenueToday,
    revenueMonth,
    unpaidCount,
    revenueTodayLabel: formatCurrency(revenueToday),
    revenueMonthLabel: formatCurrency(revenueMonth),
    unpaidSublabel: unpaidCount > 0 ? "Awaiting payment" : "All clear",
  };
}

async function queryBillingOverview(
  ctx: DataScopeContext,
  filters: BillingOverviewFilters
): Promise<BillingOverview> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    100,
    Math.max(1, filters.pageSize ?? BILLING_PAGE_SIZE)
  );
  const listEmployeeId =
    ctx.dataScope === "own" ? undefined : filters.employeeId;
  const where = {
    ...buildInvoiceListWhere(ctx.salonId, {
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      employeeId: listEmployeeId,
    }),
    ...(ctx.dataScope === "own" ? salesInvoiceScopeWhere(ctx) : {}),
  };

  const [stats, pageData, employees, plan] = await Promise.all([
    queryScopedBillingStats(ctx),
    fetchInvoicePage(where, page, pageSize),
    prisma.employee.findMany({
      where: { salonId: ctx.salonId, status: { not: "inactive" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getSalonPlan(ctx.salonId),
  ]);

  return {
    stats,
    invoices: pageData.invoices,
    employees,
    totalCount: pageData.totalCount,
    page: pageData.page,
    pageSize: pageData.pageSize,
    totalPages: pageData.totalPages,
    start: pageData.start,
    end: pageData.end,
    isBasicPlan: isBasicPlan(plan),
  };
}

export async function fetchBillingOverview(
  ctx: DataScopeContext,
  filters: BillingOverviewFilters = {}
): Promise<BillingOverview> {
  const cacheKey = JSON.stringify({
    employeeId: ctx.dataScope === "own" ? ctx.employeeId : "all",
    ...filters,
    page: Math.max(1, filters.page ?? 1),
    pageSize: Math.min(100, Math.max(1, filters.pageSize ?? BILLING_PAGE_SIZE)),
  });

  return cachedRead(
    `salon-cache:billing:overview:${ctx.salonId}:${cacheKey}`,
    15,
    () =>
      unstable_cache(
        () => queryBillingOverview(ctx, filters),
        ["billing", "overview", ctx.salonId, cacheKey],
        { revalidate: 15, tags: [salonCacheTag(ctx.salonId, "billing")] }
      )()
  );
}
