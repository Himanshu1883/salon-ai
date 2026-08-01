"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, getAuthSession } from "@/lib/auth";
import { cachedBySalon, salonCacheTag } from "@/lib/salon-cache";
import { unstable_cache } from "next/cache";
import {
  startOfDay,
  endOfDay,
  subDays,
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { getBillingStatsForSalon, getTopEarnersForSalon } from "@/actions/billing";
import { getPendingSmsCountForSalon } from "@/actions/sms";
import { getCustomerCountForSalon, getRecentCustomersForSalon } from "@/actions/customers";
import { getLowStockCountForSalon } from "@/actions/stock";
import { getOverduePlatformInvoiceReadOnly } from "@/actions/subscription";
import { formatCurrency } from "@/lib/currency";

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

function buildRevenueByDay(
  weekPaidInvoices: { paidAt: Date | null; total: number }[],
  now: Date
): RevenueDay[] {
  const revenueByDayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(subDays(now, i));
    revenueByDayMap.set(format(day, "yyyy-MM-dd"), 0);
  }
  for (const inv of weekPaidInvoices) {
    if (!inv.paidAt) continue;
    const key = format(startOfDay(inv.paidAt), "yyyy-MM-dd");
    if (revenueByDayMap.has(key)) {
      revenueByDayMap.set(key, (revenueByDayMap.get(key) ?? 0) + inv.total);
    }
  }
  return Array.from(revenueByDayMap.entries()).map(([date, revenue]) => ({
    date,
    label: format(new Date(`${date}T00:00:00`), "EEE"),
    revenue,
  }));
}

function countQueueStatus(
  groups: { status: string; _count: number }[],
  status: string
) {
  return groups.find((g) => g.status === status)?._count ?? 0;
}

async function fetchDashboardKpis(salonId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const weekStart = startOfDay(subDays(now, 6));

  const [
    queueGroups,
    employeesOnDuty,
    todayAppointments,
    billingStats,
    totalCustomers,
    lowStockCount,
    yesterdayPaid,
    weekPaidInvoices,
  ] = await Promise.all([
    prisma.queueEntry.groupBy({
      by: ["status"],
      where: {
        salonId,
        status: { in: ["waiting", "assigned", "in_progress"] },
      },
      _count: { _all: true },
    }),
    prisma.employee.count({ where: { salonId, status: "active" } }),
    prisma.appointment.count({
      where: {
        salonId,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { not: "cancelled" },
      },
    }),
    getBillingStatsForSalon(salonId),
    getCustomerCountForSalon(salonId),
    getLowStockCountForSalon(salonId),
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      _sum: { total: true },
    }),
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: weekStart, lte: todayEnd },
      },
      select: { paidAt: true, total: true },
    }),
  ]);

  const queueCounts = queueGroups.map((g: { status: string; _count: { _all: number } }) => ({
    status: g.status,
    _count: g._count._all,
  }));
  const waitingCount = countQueueStatus(queueCounts, "waiting");
  const activeQueue = queueCounts.reduce((sum, g) => sum + g._count, 0);

  const revenueByDay = buildRevenueByDay(weekPaidInvoices, now);
  const revenueYesterday = yesterdayPaid._sum.total ?? 0;
  const revenueToday = billingStats.revenueToday;
  const revenueTrend =
    revenueYesterday > 0
      ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100)
      : revenueToday > 0
        ? 100
        : 0;

  return {
    activeQueue,
    employeesOnDuty,
    todayAppointments,
    waitingCount,
    revenueToday,
    revenueMonth: billingStats.revenueMonth,
    unpaidInvoices: billingStats.unpaidCount,
    totalCustomers,
    lowStockCount,
    revenueYesterday,
    revenueTrend,
    revenueByDay,
  };
}

async function fetchDashboardWidgets(salonId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfDay(subDays(now, 6));

  const [
    queueGroups,
    billingStats,
    pendingSms,
    topEarners,
    recentCustomers,
    lowStockCount,
    weekPaidInvoices,
    todayShifts,
    overduePlatformInvoice,
    subscription,
    recentQueue,
    upcomingAppointments,
    recentCheckIns,
    completedServices,
    recentSales,
  ] = await Promise.all([
    prisma.queueEntry.groupBy({
      by: ["status"],
      where: {
        salonId,
        status: { in: ["waiting", "assigned", "in_progress"] },
      },
      _count: { _all: true },
    }),
    getBillingStatsForSalon(salonId),
    getPendingSmsCountForSalon(salonId),
    getTopEarnersForSalon(salonId, 3),
    getRecentCustomersForSalon(salonId, 5),
    getLowStockCountForSalon(salonId),
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: weekStart, lte: todayEnd },
      },
      select: { paidAt: true, total: true },
    }),
    prisma.shift.findMany({
      where: {
        salonId,
        date: { gte: todayStart, lte: todayEnd },
        isWorking: true,
      },
      include: { employee: true },
      orderBy: { startTime: "asc" },
    }),
    getOverduePlatformInvoiceReadOnly(salonId),
    prisma.salonSubscription.findUnique({ where: { salonId } }),
    prisma.queueEntry.findMany({
      where: {
        salonId,
        status: { in: ["waiting", "assigned", "in_progress"] },
      },
      include: {
        customer: true,
        employee: true,
        services: { include: { service: true } },
      },
      orderBy: { position: "asc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: {
        salonId,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { not: "cancelled" },
      },
      include: { customer: true, service: true, employee: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.queueEntry.findMany({
      where: { salonId, checkedInAt: { gte: todayStart } },
      include: { customer: true },
      orderBy: { checkedInAt: "desc" },
      take: 5,
    }),
    prisma.queueEntry.findMany({
      where: { salonId, completedAt: { gte: todayStart, not: null } },
      include: {
        customer: true,
        services: { include: { service: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: subDays(now, 7) },
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

  const queueCounts = queueGroups.map((g: { status: string; _count: { _all: number } }) => ({
    status: g.status,
    _count: g._count._all,
  }));
  const waitingCount = countQueueStatus(queueCounts, "waiting");
  const revenueByDay = buildRevenueByDay(weekPaidInvoices, now);

  const busyEmployeeIds = new Set(
    recentQueue
      .filter((e) => e.status === "in_progress" && e.employeeId)
      .map((e) => e.employeeId as string)
  );

  const teamOnShift: TeamMemberStatus[] = todayShifts.map((shift) => ({
    id: shift.employee.id,
    name: shift.employee.name,
    role: shift.employee.role,
    startTime: shift.startTime,
    endTime: shift.endTime,
    status: busyEmployeeIds.has(shift.employeeId) ? "busy" : "on_shift",
  }));

  if (teamOnShift.length === 0) {
    const activeEmployees = await prisma.employee.findMany({
      where: { salonId, status: "active" },
      orderBy: { name: "asc" },
      take: 6,
    });
    for (const emp of activeEmployees) {
      teamOnShift.push({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        startTime: null,
        endTime: null,
        status: busyEmployeeIds.has(emp.id) ? "busy" : "available",
      });
    }
  }

  const recentActivity: DashboardActivity[] = [
    ...recentCheckIns.map((entry) => ({
      id: `checkin-${entry.id}`,
      type: "check_in" as const,
      title: `${entry.customer.name} checked in`,
      subtitle: "Walk-in arrival",
      timestamp: entry.checkedInAt,
      href: "/queue",
    })),
    ...completedServices.map((entry) => ({
      id: `completed-${entry.id}`,
      type: "completed" as const,
      title: `${entry.customer.name} — service completed`,
      subtitle: entry.services.map((s) => s.service.name).join(", ") || undefined,
      timestamp: entry.completedAt!,
      href: "/queue",
    })),
    ...recentCustomers.map((customer) => ({
      id: `customer-${customer.id}`,
      type: "new_customer" as const,
      title: `${customer.name} joined`,
      subtitle: customer.phone ?? customer.email ?? "New client",
      timestamp: customer.createdAt,
      href: `/clients/${customer.id}`,
    })),
    ...recentSales.map((sale) => ({
      id: `sale-${sale.id}`,
      type: "sale" as const,
      title: `Sale recorded — ${sale.customerName}`,
      subtitle: formatCurrency(sale.total),
      timestamp: sale.paidAt!,
      href: `/billing/${sale.id}`,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  const trialEndingSoon =
    subscription?.status === "trial" &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;

  return {
    waitingCount,
    recentQueue,
    upcomingAppointments,
    revenueToday: billingStats.revenueToday,
    revenueMonth: billingStats.revenueMonth,
    todayAppointments: upcomingAppointments.length,
    pendingSms,
    topEarners,
    recentCustomers,
    lowStockCount,
    revenueByDay,
    teamOnShift,
    recentActivity,
    subscriptionStatus: subscription?.status ?? null,
    trialEndsAt: subscription?.trialEndsAt ?? null,
    trialEndingSoon: !!trialEndingSoon,
    overduePlatformInvoice: overduePlatformInvoice
      ? {
          id: overduePlatformInvoice.id,
          total: overduePlatformInvoice.total,
          dueDate: overduePlatformInvoice.dueDate,
        }
      : null,
    unpaidInvoices: billingStats.unpaidCount,
  };
}

const getCachedDashboardKpis = cachedBySalon(
  "dashboard-kpis",
  fetchDashboardKpis,
  { revalidate: 30, key: "kpis" }
);

const getCachedDashboardWidgets = cachedBySalon(
  "dashboard-widgets",
  fetchDashboardWidgets,
  { revalidate: 30, key: "widgets" }
);

export async function getDashboardKpis() {
  const session = await requireSession();
  return getCachedDashboardKpis(session.user.salonId);
}

export async function getDashboardWidgets() {
  const session = await requireSession();
  return getCachedDashboardWidgets(session.user.salonId);
}

/** Full stats — used by reports; merges cached KPI + widget fetches. */
export async function getDashboardStats() {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const now = new Date();

  const [kpis, widgets, seats, staffEarningsMonthResult] = await Promise.all([
    getCachedDashboardKpis(salonId),
    getCachedDashboardWidgets(salonId),
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

function getCachedLayoutHeaderData(salonId: string) {
  return unstable_cache(
    async () => {
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
    ["layout-header-data", salonId],
    {
      revalidate: 30,
      tags: [salonCacheTag(salonId, "layout-alerts")],
    }
  )();
}

export { salonCacheTag };
