import { prisma } from "@/lib/prisma";
import { salonCacheTag } from "@/lib/salon-cache";
import { cachedRead } from "@/lib/memory-cache";
import { unstable_cache } from "next/cache";
import { startOfDay, endOfDay, format, subDays } from "date-fns";
import { getPendingSmsCountForSalon } from "@/actions/sms";
import { getCustomerCountForSalon, getRecentCustomersForSalon } from "@/actions/customers";
import { getLowStockCountForSalon } from "@/actions/stock";
import { getOverduePlatformInvoiceReadOnly } from "@/actions/subscription";
import { getTopEarnersForSalon } from "@/actions/billing";
import { fetchDashboardBillingMetrics } from "@/lib/dashboard/billing-metrics";
import { formatCurrency } from "@/lib/currency";
import { getUpcomingTodayAppointments } from "@/lib/appointments/upcoming-today";
import { getStockStatus } from "@/lib/stock";
import type {
  CustomerDay,
  DashboardActivity,
  DashboardLowStockItem,
  TeamMemberStatus,
} from "@/actions/dashboard";

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

  const [
    billingMetrics,
    activeQueueEntries,
    employeesOnDuty,
    todayAppointments,
    totalCustomers,
    pendingSms,
    topEarners,
    recentCustomers,
    todayShifts,
    overduePlatformInvoice,
    subscription,
    recentCheckIns,
    completedServices,
    lowStockCount,
    completedCheckInsToday,
    customerDailyRows,
    lowStockItemRows,
    totalStockItems,
  ] = await Promise.all([
    fetchDashboardBillingMetrics(salonId, now),
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
    }),
    prisma.employee.count({ where: { salonId, status: "active" } }),
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
        notes: true,
      },
      orderBy: { scheduledAt: "asc" },
    }),
    getCustomerCountForSalon(salonId),
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
    getLowStockCountForSalon(salonId),
    prisma.queueEntry.count({
      where: {
        salonId,
        status: "completed",
        completedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.$queryRaw<{ day: Date; count: bigint | number }[]>`
      SELECT
        date_trunc('day', "createdAt")::date AS day,
        COUNT(*)::int AS count
      FROM "Customer"
      WHERE "salonId" = ${salonId}
        AND "createdAt" >= ${startOfDay(subDays(now, 6))}
        AND "createdAt" <= ${todayEnd}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<
      {
        id: string;
        name: string;
        sku: string | null;
        unit: string;
        quantityOnHand: number;
        reorderLevel: number | null;
      }[]
    >`
      SELECT
        id,
        name,
        sku,
        unit,
        "quantityOnHand",
        "reorderLevel"
      FROM "StockItem"
      WHERE "salonId" = ${salonId}
        AND status = 'active'
        AND (
          "quantityOnHand" <= 0
          OR ("reorderLevel" IS NOT NULL AND "quantityOnHand" <= "reorderLevel")
        )
      ORDER BY "quantityOnHand" ASC, name ASC
      LIMIT 50
    `,
    prisma.stockItem.count({ where: { salonId, status: "active" } }),
  ]);

  const queueCounts = (["waiting", "assigned", "in_progress"] as const).map(
    (status) => ({
      status,
      _count: activeQueueEntries.filter((e) => e.status === status).length,
    })
  );

  const recentQueue = activeQueueEntries.slice(0, 5);
  const upcomingAppointments = getUpcomingTodayAppointments(
    todayAppointments
  ).items;
  const pendingAppointmentsToday = todayAppointments.filter(
    (appointment) => appointment.status === "scheduled"
  ).length;
  const completedAppointmentsToday = completedCheckInsToday;
  const waitingCount = countQueueStatus(queueCounts, "waiting");
  const activeQueue = activeQueueEntries.length;

  const newByDay = new Map<string, number>();
  for (const row of customerDailyRows) {
    newByDay.set(
      format(startOfDay(row.day), "yyyy-MM-dd"),
      Number(row.count ?? 0)
    );
  }
  const weekNewCustomers = [...newByDay.values()].reduce(
    (sum, count) => sum + count,
    0
  );
  let runningTotal = Math.max(0, totalCustomers - weekNewCustomers);
  const customersByDay: CustomerDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(subDays(now, i));
    const key = format(day, "yyyy-MM-dd");
    const newCount = newByDay.get(key) ?? 0;
    runningTotal += newCount;
    customersByDay.push({
      date: key,
      label: format(day, "EEE"),
      newCount,
      total: runningTotal,
    });
  }

  const lowStockItems: DashboardLowStockItem[] = lowStockItemRows.map((row) => {
    const quantityOnHand = Number(row.quantityOnHand ?? 0);
    const reorderLevel =
      row.reorderLevel == null ? null : Number(row.reorderLevel);
    const status = getStockStatus({ quantityOnHand, reorderLevel });
    return {
      id: row.id,
      name: row.name,
      sku: row.sku,
      unit: row.unit,
      quantityOnHand,
      reorderLevel,
      status: status === "out" ? "out" : "low",
    };
  });

  const {
    revenueToday,
    revenueMonth,
    unpaidCount,
    revenueYesterday,
    revenueTrend,
    revenueByDay,
    recentSales,
  } = billingMetrics;

  const busyEmployeeIds = new Set(
    activeQueueEntries
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
      timestamp: sale.paidAt,
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
      todayAppointments: todayAppointments.length,
      pendingAppointmentsToday,
      completedAppointmentsToday,
      waitingCount,
      revenueToday,
      revenueMonth,
      unpaidInvoices: unpaidCount,
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
      todayAppointmentList: todayAppointments,
      revenueToday,
      revenueMonth,
      todayAppointments: upcomingAppointments.length,
      pendingSms,
      topEarners,
      recentCustomers,
      lowStockCount,
      lowStockItems,
      totalStockItems,
      revenueByDay,
      customersByDay,
      totalCustomers,
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
      unpaidInvoices: unpaidCount,
    },
  };
}

export function getCachedDashboardPageData(salonId: string) {
  return cachedRead(`salon-cache:dashboard-page:v3:${salonId}`, 15, () =>
    unstable_cache(
      () => fetchDashboardPageData(salonId),
      ["dashboard-page", salonId, "v3"],
      {
        revalidate: 15,
        tags: [
          salonCacheTag(salonId, "dashboard-kpis"),
          salonCacheTag(salonId, "dashboard-widgets"),
        ],
      }
    )()
  );
}
