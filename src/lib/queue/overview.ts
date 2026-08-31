import { differenceInMinutes, subDays } from "date-fns";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/currency";
import {
  appointmentScopeWhere,
  salesInvoiceScopeWhere,
  type DataScopeContext,
} from "@/lib/permissions/data-scope";
import {
  currentSalonDayBounds,
  getBusinessDateKey,
  salonDayBounds,
} from "@/lib/attendance/business-day";
import { attachAppointmentStaffToQueueServices } from "@/lib/queue/appointment-staff";
import type {
  AppointmentSnapshot,
  CompletedEntry,
  Employee,
  QueueDashboardStats,
  QueueEntry,
  QueueTab,
  Seat,
  ServiceOption,
} from "@/components/queue/types";
import type {
  CheckInOverview,
  QueueKpiPayload,
  QueueOverview,
  QueueSidebarPayload,
} from "@/lib/queue/overview-types";

export type {
  CheckInDashboardPayload,
  CheckInOverview,
  QueueKpiIconKey,
  QueueKpiPayload,
  QueueOverview,
  QueueSidebarCompleted,
  QueueSidebarPayload,
  QueueSidebarPerson,
  QueueSidebarStaff,
} from "@/lib/queue/overview-types";
export {
  EMPTY_QUEUE_OVERVIEW,
  EMPTY_QUEUE_STATS,
  normalizeQueueOverview,
} from "@/lib/queue/overview-types";

const CHART_COLORS = ["#6C3BFF", "#3B82F6", "#10B981", "#EF4444"] as const;

const appointmentServiceStaffSelect = {
  select: {
    id: true,
    serviceItems: {
      where: { status: { notIn: ["cancelled", "no_show"] } },
      orderBy: [{ sortOrder: "asc" as const }, { scheduledAt: "asc" as const }],
      select: { id: true, serviceId: true, employeeId: true },
    },
  },
} as const;

const QUEUE_ENTRY_INCLUDE = {
  customer: { select: { name: true, phone: true } },
  employee: { select: { id: true, name: true } },
  seat: { select: { id: true, number: true } },
  appointment: appointmentServiceStaffSelect,
  services: {
    select: {
      service: {
        select: { id: true, name: true, duration: true, price: true },
      },
    },
  },
} as const;

const COMPLETED_INCLUDE = {
  customer: { select: { name: true, phone: true } },
  appointment: appointmentServiceStaffSelect,
  services: {
    select: {
      service: {
        select: { id: true, name: true, duration: true, price: true },
      },
    },
  },
  invoices: {
    select: { id: true, status: true, paymentMethod: true, total: true },
  },
} as const;

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function generateSparkline(value: number, points = 7): { v: number }[] {
  const base = Math.max(value, 1);
  return Array.from({ length: points }, (_, i) => {
    const factor = 0.65 + (i / (points - 1)) * 0.35;
    const jitter = 0.9 + ((i * 17) % 20) / 100;
    return { v: Math.round(base * factor * jitter) };
  });
}

function computeTrend(current: number, previous: number): number | undefined {
  if (previous === 0 && current === 0) return undefined;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

function serviceNames(
  services: { service: { name: string } }[]
): string {
  return services.map((s) => s.service.name).join(", ");
}

function serviceTotal(services: { service: { price: number } }[]): number {
  return services.reduce((sum, s) => sum + s.service.price, 0);
}

function serviceDuration(
  services: { service: { duration: number } }[]
): number {
  return services.reduce((sum, s) => sum + s.service.duration, 0);
}

function waitMinutes(
  checkedInAt: Date,
  startedAt: Date | null,
  now: Date
): number {
  const end = startedAt ?? now;
  return Math.max(0, differenceInMinutes(end, checkedInAt));
}

function mapQueueEntry(
  e: {
    id: string;
    position: number;
    status: string;
    checkedInAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    customerId: string;
    appointmentId?: string | null;
    customer: { name: string; phone: string | null };
    employee: { id: string; name: string } | null;
    seat: { id: string; number: number } | null;
    appointment?: {
      id: string;
      serviceItems: { id: string; serviceId: string; employeeId: string | null }[];
    } | null;
    services: {
      service: { id: string; name: string; duration: number; price: number };
    }[];
  },
  now: Date
): QueueEntry {
  return {
    id: e.id,
    position: e.position,
    status: e.status,
    checkedInAt: e.checkedInAt,
    startedAt: e.startedAt,
    completedAt: e.completedAt,
    customerId: e.customerId,
    appointmentId: e.appointmentId ?? e.appointment?.id ?? null,
    customer: { name: e.customer.name, phone: e.customer.phone },
    employee: e.employee,
    seat: e.seat,
    services: attachAppointmentStaffToQueueServices(
      e.services.map((qs) => ({
        service: {
          id: qs.service.id,
          name: qs.service.name,
          duration: qs.service.duration,
          price: qs.service.price,
        },
      })),
      e.appointment?.serviceItems,
      e.employee?.id ?? null
    ),
    waitMinutes: waitMinutes(e.checkedInAt, e.startedAt, now),
    serviceNames: serviceNames(e.services),
    serviceDuration: serviceDuration(e.services),
    serviceTotal: serviceTotal(e.services),
  };
}

function mapCompleted(
  e: {
    id: string;
    completedAt: Date | null;
    employeeId: string | null;
    seatId: string | null;
    appointmentId?: string | null;
    customer: { name: string; phone: string | null };
    appointment?: {
      id: string;
      serviceItems: { id: string; serviceId: string; employeeId: string | null }[];
    } | null;
    services: {
      service: { id: string; name: string; duration: number; price: number };
    }[];
    invoices: {
      id: string;
      status: string;
      paymentMethod: string | null;
      total: number;
    }[];
  }
): CompletedEntry {
  return {
    id: e.id,
    completedAt: e.completedAt,
    employeeId: e.employeeId,
    seatId: e.seatId,
    appointmentId: e.appointmentId ?? e.appointment?.id ?? null,
    customer: { name: e.customer.name, phone: e.customer.phone },
    services: attachAppointmentStaffToQueueServices(
      e.services.map((qs) => ({
        service: {
          id: qs.service.id,
          name: qs.service.name,
          price: qs.service.price,
        },
      })),
      e.appointment?.serviceItems,
      e.employeeId
    ),
    invoices: e.invoices.map((inv) => ({
      id: inv.id,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      total: inv.total,
    })),
    serviceNames: serviceNames(e.services),
    serviceTotal: serviceTotal(e.services),
  };
}

function mapAppointment(a: {
  id: string;
  status: string;
  scheduledAt: Date;
  customer: { name: string };
  service: { name: string };
  employee: { id: string; name: string } | null;
}): AppointmentSnapshot {
  return {
    id: a.id,
    status: a.status,
    scheduledAt: a.scheduledAt,
    customer: { name: a.customer.name },
    service: { name: a.service.name },
    employee: a.employee,
  };
}

function activeQueueWhere(ctx: DataScopeContext): Prisma.QueueEntryWhereInput {
  const where: Prisma.QueueEntryWhereInput = {
    salonId: ctx.salonId,
    status: { in: ["waiting", "assigned", "in_progress"] },
  };
  if (ctx.dataScope === "own") {
    if (!ctx.employeeId) {
      return { salonId: ctx.salonId, id: "__none__" };
    }
    where.OR = [
      { employeeId: ctx.employeeId },
      { employeeId: null, status: "waiting" },
    ];
  }
  return where;
}

function completedScopeWhere(
  ctx: DataScopeContext,
  completedAt: { gte: Date; lte: Date }
): Prisma.QueueEntryWhereInput {
  const where: Prisma.QueueEntryWhereInput = {
    salonId: ctx.salonId,
    status: "completed",
    completedAt,
  };
  if (ctx.dataScope === "own") {
    where.employeeId = ctx.employeeId ?? "__unlinked__";
  }
  return where;
}

function invoiceScopeWhere(ctx: DataScopeContext): Prisma.InvoiceWhereInput {
  return salesInvoiceScopeWhere(ctx) as Prisma.InvoiceWhereInput;
}

function buildInsights(stats: QueueDashboardStats): string[] {
  const insights: string[] = [];
  if (stats.waiting > 0 && stats.staffAvailable === 0) {
    insights.push(
      "All stylists are busy. New walk-ins will wait longer — consider calling in backup staff."
    );
  }
  if (stats.avgWaitMinutes > 15) {
    insights.push(
      `Average wait is ${stats.avgWaitMinutes} min. Assign waiting customers to available stylists promptly.`
    );
  }
  if (stats.completedToday > stats.completedYesterday && stats.completedYesterday > 0) {
    insights.push(
      "Completion pace is up vs yesterday. Keep momentum during peak hours."
    );
  }
  if (stats.cancelledToday > 2) {
    insights.push(
      `${stats.cancelledToday} cancellations today. Review no-show and cancellation patterns in Reports.`
    );
  }
  if (stats.noShowToday > 0) {
    insights.push(
      `${stats.noShowToday} no-show appointment(s) today. Follow up with SMS reminders for upcoming bookings.`
    );
  }
  if (insights.length === 0) {
    insights.push(
      "Queue operations look healthy. Monitor wait times during the next rush."
    );
  }
  return insights;
}

function buildAiSuggestion(stats: QueueDashboardStats): string {
  if (stats.waiting >= 3 && stats.staffAvailable <= 1) {
    return "It's a busy period! Consider assigning another stylist to reduce wait times.";
  }
  if (stats.avgWaitMinutes > 20) {
    return "Average wait is high. Prioritize long-waiting customers or add walk-in capacity.";
  }
  return "Queue is flowing smoothly. Keep monitoring peak-hour staffing.";
}

function buildKpis(stats: QueueDashboardStats): QueueKpiPayload[] {
  const completedTrend = computeTrend(
    stats.completedToday,
    stats.completedYesterday
  );
  return [
    {
      key: "waiting",
      label: "Waiting",
      value: String(stats.waiting),
      sublabel: `Est. ${stats.estimatedWait} min wait`,
      sparkline: generateSparkline(stats.waiting),
      sparkColor: "#F97316",
      gradient: "from-amber-400 to-orange-500",
      icon: "waiting",
    },
    {
      key: "inService",
      label: "In Service",
      value: String(stats.inService),
      sublabel: `${stats.inProgress} in progress`,
      sparkline: generateSparkline(stats.inService),
      sparkColor: "#6C3BFF",
      gradient: "from-[#6C3BFF] to-[#8B5CF6]",
      icon: "inService",
    },
    {
      key: "completed",
      label: "Completed Today",
      value: String(stats.completedToday),
      trend: completedTrend,
      sparkline: generateSparkline(stats.completedToday),
      sparkColor: "#10B981",
      gradient: "from-emerald-500 to-teal-500",
      icon: "completed",
    },
    {
      key: "avgWait",
      label: "Avg Wait",
      value: formatWaitTime(stats.avgWaitMinutes),
      sublabel: "Across active queue",
      sparkline: generateSparkline(stats.avgWaitMinutes),
      sparkColor: "#3B82F6",
      gradient: "from-blue-500 to-indigo-500",
      icon: "avgWait",
    },
    {
      key: "avgService",
      label: "Avg Service Time",
      value:
        stats.avgServiceMinutes > 0
          ? formatWaitTime(stats.avgServiceMinutes)
          : "—",
      sublabel: "Completed today",
      sparkline: generateSparkline(stats.avgServiceMinutes || 30),
      sparkColor: "#8B5CF6",
      gradient: "from-violet-500 to-purple-600",
      icon: "avgService",
    },
    {
      key: "walkIns",
      label: "Walk-ins Today",
      value: String(stats.walkInsToday),
      sublabel: `${stats.activeTotal} currently active`,
      sparkline: generateSparkline(stats.walkInsToday),
      sparkColor: "#F43F5E",
      gradient: "from-rose-500 to-pink-500",
      icon: "walkIns",
    },
    {
      key: "appointments",
      label: "Appointments Today",
      value: String(stats.appointmentsToday),
      sublabel: "Scheduled",
      sparkline: generateSparkline(stats.appointmentsToday),
      sparkColor: "#0EA5E9",
      gradient: "from-cyan-500 to-sky-500",
      icon: "appointments",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: String(stats.cancelledToday),
      sublabel: "Appointments today",
      sparkline: generateSparkline(stats.cancelledToday),
      sparkColor: "#EF4444",
      gradient: "from-red-500 to-rose-500",
      icon: "cancelled",
    },
    {
      key: "revenue",
      label: "Revenue Today",
      value: formatCurrency(stats.revenueToday),
      sublabel: "Paid invoices",
      sparkline: generateSparkline(Math.max(stats.revenueToday / 1000, 1)),
      sparkColor: "#6C3BFF",
      gradient: "from-[#6C3BFF] to-[#FF2D6F]",
      icon: "revenue",
    },
    {
      key: "staffAvailable",
      label: "Staff Available",
      value: String(stats.staffAvailable),
      sublabel: "Ready to serve",
      sparkline: generateSparkline(stats.staffAvailable),
      sparkColor: "#14B8A6",
      gradient: "from-teal-500 to-emerald-500",
      icon: "staffAvailable",
    },
    {
      key: "staffBusy",
      label: "Staff Busy",
      value: String(stats.staffBusy),
      sublabel: "Currently serving",
      sparkline: generateSparkline(stats.staffBusy),
      sparkColor: "#D946EF",
      gradient: "from-fuchsia-500 to-purple-600",
      icon: "staffBusy",
    },
    {
      key: "active",
      label: "Active in Queue",
      value: String(stats.activeTotal),
      sublabel: `${stats.assigned} assigned`,
      sparkline: generateSparkline(stats.activeTotal),
      sparkColor: "#6366F1",
      gradient: "from-indigo-500 to-violet-600",
      icon: "active",
    },
  ];
}

function buildSidebar(
  entries: QueueEntry[],
  completedRecent: CompletedEntry[],
  employees: Employee[],
  stats: QueueDashboardStats
): QueueSidebarPayload {
  const chartData = [
    { name: "Waiting", value: stats.waiting, color: CHART_COLORS[0] },
    {
      name: "In Progress",
      value: stats.inProgress + stats.assigned,
      color: CHART_COLORS[1],
    },
    { name: "Completed", value: stats.completedToday, color: CHART_COLORS[2] },
    { name: "Cancelled", value: stats.cancelledToday, color: CHART_COLORS[3] },
  ].filter((d) => d.value > 0);

  const busyIds = new Set(
    entries
      .filter((e) => e.status === "assigned" || e.status === "in_progress")
      .map((e) => e.employee?.id)
      .filter(Boolean) as string[]
  );

  return {
    chartData,
    totalToday:
      stats.waiting +
      stats.inService +
      stats.completedToday +
      stats.cancelledToday,
    upcomingWaiting: entries
      .filter((e) => e.status === "waiting")
      .slice(0, 3)
      .map((e) => ({
        id: e.id,
        customerName: e.customer.name,
        initials: initials(e.customer.name),
        serviceNames: e.serviceNames ?? serviceNames(e.services),
        checkedInAt: e.checkedInAt,
      })),
    recentDone: completedRecent.slice(0, 3).map((e) => ({
      id: e.id,
      customerName: e.customer.name,
      initials: initials(e.customer.name),
      completedAt: e.completedAt,
      total: e.serviceTotal ?? serviceTotal(e.services),
    })),
    staff: employees.slice(0, 6).map((emp) => ({
      id: emp.id,
      name: emp.name,
      initials: initials(emp.name),
      busy: busyIds.has(emp.id),
    })),
    aiSuggestion: buildAiSuggestion(stats),
  };
}

async function loadFloorRows(ctx: DataScopeContext) {
  const now = new Date();
  const today = currentSalonDayBounds(now);
  const yesterday = salonDayBounds(
    getBusinessDateKey(subDays(today.start, 1))
  );
  const invoiceWhere = invoiceScopeWhere(ctx);
  const appointmentBase = appointmentScopeWhere(ctx);

  const [
    activeRows,
    completedTodayRows,
    completedYesterdayCount,
    completedRecentRows,
    appointmentRows,
    employeeRows,
    seatRows,
    serviceRows,
    todayPaid,
    todayPartial,
    avgPaidBill,
    waitingDurationRows,
    activeEmployeeCount,
  ] = await Promise.all([
    prisma.queueEntry.findMany({
      where: activeQueueWhere(ctx),
      include: QUEUE_ENTRY_INCLUDE,
      orderBy: { position: "asc" },
    }),
    prisma.queueEntry.findMany({
      where: completedScopeWhere(ctx, { gte: today.start, lte: today.end }),
      select: {
        id: true,
        completedAt: true,
        checkedInAt: true,
        startedAt: true,
        employeeId: true,
        seatId: true,
        appointmentId: true,
        ...COMPLETED_INCLUDE,
      },
      orderBy: { completedAt: "desc" },
    }),
    prisma.queueEntry.count({
      where: completedScopeWhere(ctx, {
        gte: yesterday.start,
        lte: yesterday.end,
      }),
    }),
    prisma.queueEntry.findMany({
      where: {
        salonId: ctx.salonId,
        status: "completed",
        ...(ctx.dataScope === "own"
          ? { employeeId: ctx.employeeId ?? "__unlinked__" }
          : {}),
      },
      select: {
        id: true,
        completedAt: true,
        employeeId: true,
        seatId: true,
        appointmentId: true,
        ...COMPLETED_INCLUDE,
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    prisma.appointment.findMany({
      where: {
        ...appointmentBase,
        scheduledAt: { gte: today.start, lte: today.end },
      },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        customer: { select: { name: true } },
        service: { select: { name: true } },
        employee: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.employee.findMany({
      where: { salonId: ctx.salonId, status: "active" },
      select: {
        id: true,
        name: true,
        role: true,
        specialties: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.seat.findMany({
      where: { salonId: ctx.salonId, status: "available" },
      select: { id: true, number: true },
      orderBy: { number: "asc" },
    }),
    prisma.service.findMany({
      where: {
        salonId: ctx.salonId,
        status: { not: "ARCHIVED" },
        catalogType: { in: ["SERVICE", "PACKAGE"] },
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.invoice.aggregate({
      where: {
        ...invoiceWhere,
        status: "paid",
        paidAt: { gte: today.start, lte: today.end },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        ...invoiceWhere,
        status: "partial",
        createdAt: { gte: today.start, lte: today.end },
      },
      _sum: { amountPaid: true },
    }),
    prisma.invoice.aggregate({
      where: {
        ...invoiceWhere,
        status: "paid",
        paidAt: { gte: today.start, lte: today.end },
      },
      _avg: { total: true },
      _count: true,
    }),
    prisma.queueEntry.findMany({
      where: { ...activeQueueWhere(ctx), status: "waiting" },
      select: {
        services: { select: { service: { select: { duration: true } } } },
      },
    }),
    prisma.employee.count({
      where: { salonId: ctx.salonId, status: "active" },
    }),
  ]);

  const entries = activeRows.map((row) => mapQueueEntry(row, now));
  const completedToday = completedTodayRows.map(mapCompleted);
  const completedRecent = completedRecentRows.map(mapCompleted);
  const appointmentsToday = appointmentRows.map(mapAppointment);
  const cancelledToday = appointmentsToday.filter((a) => a.status === "cancelled");
  const noShowToday = appointmentsToday.filter((a) => a.status === "no_show");

  const waiting = entries.filter((e) => e.status === "waiting").length;
  const assigned = entries.filter((e) => e.status === "assigned").length;
  const inProgress = entries.filter((e) => e.status === "in_progress").length;
  const inService = assigned + inProgress;

  const busyEmployeeIds = new Set(
    entries
      .filter((e) => e.status === "assigned" || e.status === "in_progress")
      .map((e) => e.employee?.id)
      .filter(Boolean) as string[]
  );

  const waitSamples = [
    ...entries.filter((e) => e.startedAt).map((e) => waitMinutes(e.checkedInAt, e.startedAt, now)),
    ...completedTodayRows
      .filter((e) => e.startedAt && e.checkedInAt)
      .map((e) =>
        differenceInMinutes(new Date(e.startedAt!), new Date(e.checkedInAt))
      )
      .filter((v) => v >= 0),
  ];

  const totalWaitingDuration = waitingDurationRows.reduce(
    (sum, entry) =>
      sum + entry.services.reduce((s, qs) => s + qs.service.duration, 0),
    0
  );
  const estimatedWait = Math.ceil(
    totalWaitingDuration / Math.max(activeEmployeeCount, 1)
  );

  const avgWaitMinutes =
    waitSamples.length > 0
      ? Math.round(waitSamples.reduce((a, b) => a + b, 0) / waitSamples.length)
      : estimatedWait;

  const serviceSamples = completedTodayRows
    .map((e) => {
      if (e.startedAt && e.completedAt) {
        return differenceInMinutes(new Date(e.completedAt), new Date(e.startedAt));
      }
      const duration = e.services.reduce(
        (sum, s) => sum + s.service.duration,
        0
      );
      return duration > 0 ? duration : null;
    })
    .filter((v): v is number => v !== null && v > 0);

  const avgServiceMinutes =
    serviceSamples.length > 0
      ? Math.round(
          serviceSamples.reduce((a, b) => a + b, 0) / serviceSamples.length
        )
      : 0;

  const revenueToday =
    (todayPaid._sum.total ?? 0) + (todayPartial._sum.amountPaid ?? 0);

  const walkInsToday = waiting + inService + completedToday.length;

  const stats: QueueDashboardStats = {
    waiting,
    inService,
    assigned,
    inProgress,
    completedToday: completedToday.length,
    completedYesterday: completedYesterdayCount,
    avgWaitMinutes,
    avgServiceMinutes,
    walkInsToday,
    appointmentsToday: appointmentsToday.filter((a) => a.status !== "cancelled")
      .length,
    cancelledToday: cancelledToday.length,
    noShowToday: noShowToday.length,
    revenueToday,
    staffAvailable: Math.max(0, employeeRows.length - busyEmployeeIds.size),
    staffBusy: busyEmployeeIds.size,
    estimatedWait,
    activeTotal: entries.length,
  };

  const employees: Employee[] = employeeRows.map((e) => ({
    id: e.id,
    name: e.name,
    role: e.role,
  }));

  const avgBillFromInvoices =
    (avgPaidBill._count ?? 0) > 0 ? avgPaidBill._avg.total ?? 0 : 0;
  const avgBillFromServices =
    completedToday.length > 0
      ? completedToday.reduce(
          (sum, e) => sum + (e.serviceTotal ?? serviceTotal(e.services)),
          0
        ) / completedToday.length
      : 0;
  const avgBill = avgBillFromInvoices > 0 ? avgBillFromInvoices : avgBillFromServices;
  const conversionPct =
    walkInsToday > 0
      ? Math.round((completedToday.length / walkInsToday) * 100)
      : null;

  return {
    now,
    entries,
    completedToday,
    completedRecent,
    cancelledToday,
    noShowToday,
    appointmentsToday,
    employees,
    employeeRows,
    seats: seatRows,
    serviceRows,
    estimatedWait,
    revenueToday,
    stats,
    avgBill,
    conversionPct,
    activeEmployeeCount,
  };
}

export async function fetchQueueOverview(
  ctx: DataScopeContext
): Promise<QueueOverview> {
  const data = await loadFloorRows(ctx);
  const tabCounts: Record<QueueTab, number> = {
    waiting: data.stats.waiting,
    assigned: data.stats.assigned,
    in_progress: data.stats.inProgress,
    completed: data.stats.completedToday,
    cancelled: data.stats.cancelledToday,
    no_show: data.stats.noShowToday,
  };

  return {
    generatedAt: data.now.toISOString(),
    entries: data.entries,
    completedToday: data.completedToday,
    completedRecent: data.completedRecent,
    cancelledToday: data.cancelledToday,
    noShowToday: data.noShowToday,
    appointmentsToday: data.appointmentsToday,
    employees: data.employees,
    seats: data.seats,
    services: data.serviceRows.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
    })),
    estimatedWait: data.estimatedWait,
    revenueToday: data.revenueToday,
    stats: data.stats,
    tabCounts,
    kpis: buildKpis(data.stats),
    sidebar: buildSidebar(
      data.entries,
      data.completedRecent,
      data.employees,
      data.stats
    ),
    insights: buildInsights(data.stats),
  };
}

export async function fetchCheckInOverview(
  ctx: DataScopeContext
): Promise<CheckInOverview> {
  const [data, recentCustomers] = await Promise.all([
    loadFloorRows(ctx),
    prisma.customer.findMany({
      where: { salonId: ctx.salonId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  const next = data.entries.find((e) => e.status === "waiting");
  const staffUtilization =
    data.activeEmployeeCount > 0
      ? Math.min(
          100,
          Math.round((data.stats.inService / data.activeEmployeeCount) * 100)
        )
      : 0;

  return {
    generatedAt: data.now.toISOString(),
    services: data.serviceRows.map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: s.price,
      category: s.category?.name ?? "Uncategorized",
    })),
    queueEntries: data.entries.map((e) => ({
      id: e.id,
      position: e.position,
      status: e.status,
      checkedInAt: e.checkedInAt,
      customer: e.customer,
      employee: e.employee,
      services: e.services.map((qs) => ({
        service: {
          name: qs.service.name,
          duration: qs.service.duration,
          price: qs.service.price,
        },
      })),
    })),
    completedEntries: data.completedRecent.map((e) => ({
      id: e.id,
      completedAt: e.completedAt,
      customer: { name: e.customer.name },
      services: e.services.map((qs) => ({
        service: { name: qs.service.name, price: qs.service.price },
      })),
    })),
    estimatedWait: data.estimatedWait,
    employees: data.employeeRows.map((e) => ({
      id: e.id,
      name: e.name,
      role: e.role,
      specialties: e.specialties,
    })),
    recentCustomers,
    billingStats: { revenueToday: data.revenueToday },
    dashboard: {
      waiting: data.stats.waiting,
      beingServed: data.stats.inService,
      completedToday: data.stats.completedToday,
      cancelledToday: data.stats.cancelledToday,
      estimatedWait: data.estimatedWait,
      activeCount: data.entries.length,
      nextCustomer: next
        ? {
            id: next.id,
            name: next.customer.name,
            initials: initials(next.customer.name),
            serviceNames: next.serviceNames ?? serviceNames(next.services),
            checkedInAt: next.checkedInAt,
          }
        : null,
      liveQueue: data.entries.map((e) => ({
        id: e.id,
        position: e.position,
        status: e.status,
        customerName: e.customer.name,
        serviceNames: e.serviceNames ?? serviceNames(e.services),
      })),
      walkInsToday: data.stats.walkInsToday,
      revenueToday: data.revenueToday,
      revenueTodayLabel: formatCurrency(data.revenueToday),
      avgBill: data.avgBill,
      avgBillLabel: data.avgBill > 0 ? formatCurrency(data.avgBill) : "—",
      conversionLabel:
        data.conversionPct !== null ? `${data.conversionPct}%` : "—",
      conversionReal: data.conversionPct !== null,
      staffUtilization,
      staffUtilizationLabel: `${staffUtilization}%`,
      staffUtilizationReal: data.activeEmployeeCount > 0,
    },
  };
}
