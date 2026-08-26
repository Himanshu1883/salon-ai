import { prisma } from "@/lib/prisma";
import { salonCacheTag } from "@/lib/salon-cache";
import { cachedRead } from "@/lib/memory-cache";
import { unstable_cache } from "next/cache";
import {
  startOfDay,
  endOfDay,
  subDays,
  format,
} from "date-fns";
import { getBillingStatsForSalon, getTopEarnersForSalon } from "@/actions/billing";
import { getPendingSmsCountForSalon } from "@/actions/sms";
import { getCustomerCountForSalon, getRecentCustomersForSalon } from "@/actions/customers";
import { getLowStockCountForSalon } from "@/actions/stock";
import { getOverduePlatformInvoiceReadOnly } from "@/actions/subscription";
import { formatCurrency } from "@/lib/currency";
import type {
  DashboardActivity,
  RevenueDay,
  TeamMemberStatus,
} from "@/actions/dashboard";

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

export async function fetchDashboardPageData(salonId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const weekStart = startOfDay(subDays(now, 6));

  const [
    queueGroups,
    billingStats,
    lowStockCount,
    weekPaidInvoices,
    employeesOnDuty,
    todayAppointments,
    totalCustomers,
    yesterdayPaid,
    pendingSms,
    topEarners,
    recentCustomers,
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
    getLowStockCountForSalon(salonId),
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: weekStart, lte: todayEnd },
      },
      select: { paidAt: true, total: true },
    }),
    prisma.employee.count({ where: { salonId, status: "active" } }),
    prisma.appointment.count({
      where: {
        salonId,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { not: "cancelled" },
      },
    }),
    getCustomerCountForSalon(salonId),
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      _sum: { total: true },
    }),
    getPendingSmsCountForSalon(salonId),
    getTopEarnersForSalon(salonId, 3),
    getRecentCustomersForSalon(salonId, 5),
    prisma.shift.findMany({
      where: {
        salonId,
        date: { gte: todayStart, lte: todayEnd },
        isWorking: true,
      },
      select: {
        employeeId: true,
        startTime: true,
        endTime: true,
        employee: { select: { id: true, name: true, role: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    getOverduePlatformInvoiceReadOnly(salonId),
    prisma.salonSubscription.findUnique({ where: { salonId } }),
    prisma.queueEntry.findMany({
      where: {
        salonId,
        status: { in: ["waiting", "assigned", "in_progress"] },
      },
      select: {
        id: true,
        status: true,
        employeeId: true,
        position: true,
        customer: { select: { name: true } },
        employee: { select: { name: true } },
        services: { select: { service: { select: { name: true } } } },
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
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        customer: { select: { name: true } },
        service: { select: { name: true, duration: true } },
        employee: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.queueEntry.findMany({
      where: { salonId, checkedInAt: { gte: todayStart } },
      select: {
        id: true,
        checkedInAt: true,
        customer: { select: { name: true } },
      },
      orderBy: { checkedInAt: "desc" },
      take: 5,
    }),
    prisma.queueEntry.findMany({
      where: { salonId, completedAt: { gte: todayStart, not: null } },
      select: {
        id: true,
        completedAt: true,
        customer: { select: { name: true } },
        services: { select: { service: { select: { name: true } } } },
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

  const queueCounts = queueGroups.map(
    (g: { status: string; _count: { _all: number } }) => ({
      status: g.status,
      _count: g._count._all,
    })
  );

  const waitingCount = countQueueStatus(queueCounts, "waiting");
  const activeQueue = queueCounts.reduce((sum, g) => sum + g._count, 0);
  const revenueByDay = buildRevenueByDay(weekPaidInvoices, now);
  const revenueToday = billingStats.revenueToday;
  const revenueYesterday = yesterdayPaid._sum.total ?? 0;
  const revenueTrend =
    revenueYesterday > 0
      ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100)
      : revenueToday > 0
        ? 100
        : 0;

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
      select: { id: true, name: true, role: true },
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
      subtitle:
        entry.services.map((s) => s.service.name).join(", ") || undefined,
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
    kpis: {
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
    },
    widgets: {
      waitingCount,
      recentQueue,
      upcomingAppointments,
      revenueToday,
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
    },
  };
}

export function getCachedDashboardPageData(salonId: string) {
  return cachedRead(`salon-cache:dashboard-page:${salonId}`, 30, () =>
    unstable_cache(
      () => fetchDashboardPageData(salonId),
      ["dashboard-page", salonId],
      {
        revalidate: 30,
        tags: [
          salonCacheTag(salonId, "dashboard-kpis"),
          salonCacheTag(salonId, "dashboard-widgets"),
        ],
      }
    )()
  );
}
