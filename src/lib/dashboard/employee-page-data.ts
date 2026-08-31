import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  currentSalonDayBounds,
  DEFAULT_SALON_TIMEZONE,
  formatZonedTime,
  getBusinessDateKey,
  getZonedMinutes,
  businessDateFromKey,
  salonDayBounds,
} from "@/lib/attendance/business-day";
import { employeeInvoiceFilter } from "@/lib/analytics/staff-analytics-sql";
import { getDataScopeContext } from "@/lib/permissions/data-scope";
import { PermissionDeniedError } from "@/lib/permissions/require";

const NEXT_HIDDEN = new Set(["cancelled", "no_show", "completed", "in_progress"]);

function formatMinutesLabel(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

function salonGreeting(now = new Date()) {
  const hour = Math.floor(getZonedMinutes(now) / 60);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function salonRangeFromKeys(fromKey: string, toKey: string) {
  return {
    start: salonDayBounds(fromKey).start,
    end: salonDayBounds(toKey).end,
  };
}

function currentSalonWeekBounds(now = new Date()) {
  const noon = parseISO(`${getBusinessDateKey(now)}T12:00:00`);
  return salonRangeFromKeys(
    format(startOfWeek(noon, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    format(endOfWeek(noon, { weekStartsOn: 1 }), "yyyy-MM-dd")
  );
}

function currentSalonMonthBounds(now = new Date()) {
  const noon = parseISO(`${getBusinessDateKey(now)}T12:00:00`);
  return salonRangeFromKeys(
    format(startOfMonth(noon), "yyyy-MM-dd"),
    format(endOfMonth(noon), "yyyy-MM-dd")
  );
}

async function attributedRevenue(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string
) {
  const employeeFilter = employeeInvoiceFilter(employeeId);
  const rows = await prisma.$queryRaw<{ revenue: number }[]>(Prisma.sql`
    SELECT COALESCE(SUM(li.total), 0)::float AS revenue
    FROM "Invoice" i
    INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
    WHERE i."salonId" = ${salonId}
      AND i.status = 'paid'
      AND i."paidAt" >= ${from}
      AND i."paidAt" <= ${to}
      ${employeeFilter}
  `);
  return rows[0]?.revenue ?? 0;
}

export type EmployeeDashboardUnlinked = {
  unlinked: true;
  employeeName: string;
};

export type EmployeeDashboardPayload = {
  unlinked?: false;
  greeting: string;
  employeeName: string;
  timezone: string;
  rangeLabel: string;
  today: {
    earnings: number;
    appointments: number;
    completedServices: number;
    workedMinutes: number;
    workedLabel: string;
    checkIn: string | null;
    checkOut: string | null;
    status: string;
    lateMinutes: number;
    canCheckIn: boolean;
    canCheckOut: boolean;
  };
  secondary: {
    weekEarnings: number;
    monthEarnings: number;
    weekAppointments: number;
    monthAppointments: number;
  };
  appointmentStatus: {
    completed: number;
    upcoming: number;
    inQueue: number;
    cancelled: number;
    noShow: number;
  };
  topServices: {
    serviceName: string;
    appointments: number;
    estimated: number;
  }[];
  queue: {
    id: string;
    status: string;
    service: string;
    appointmentId: string | null;
  }[];
  schedule: {
    id: string;
    appointmentId: string;
    time: string;
    at: string;
    service: string;
    price: number;
    status: string;
    duration: number;
  }[];
  nextAppointment: {
    id: string;
    appointmentId: string;
    time: string;
    service: string;
    price: number;
    status: string;
    duration: number;
  } | null;
};

export type EmployeeDashboardData =
  | EmployeeDashboardUnlinked
  | EmployeeDashboardPayload;

export async function fetchEmployeeDashboardData(_params?: {
  period?: string;
  from?: string;
  to?: string;
}): Promise<EmployeeDashboardData> {
  const ctx = await getDataScopeContext();
  if (ctx.dataScope !== "own") {
    throw new PermissionDeniedError("dashboard.view");
  }
  if (!ctx.employeeId) {
    return {
      unlinked: true,
      employeeName: ctx.employeeName ?? "there",
    };
  }

  const employeeId = ctx.employeeId;
  const salonId = ctx.salonId;
  const todayBounds = currentSalonDayBounds();
  const todayDate = businessDateFromKey(getBusinessDateKey());
  const weekRange = currentSalonWeekBounds();
  const monthRange = currentSalonMonthBounds();
  const nowMs = Date.now();

  const [
    todayItems,
    attendance,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    weekAppointmentGroups,
    monthAppointmentGroups,
    queueEntries,
    greetingName,
  ] = await Promise.all([
    prisma.appointmentServiceItem.findMany({
      where: {
        employeeId,
        scheduledAt: { gte: todayBounds.start, lte: todayBounds.end },
        appointment: { salonId },
      },
      select: {
        id: true,
        appointmentId: true,
        scheduledAt: true,
        status: true,
        price: true,
        duration: true,
        service: { select: { name: true } },
        appointment: { select: { status: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: { employeeId, date: todayDate },
      },
      select: {
        checkInAt: true,
        checkOutAt: true,
        totalWorkedMinutes: true,
        status: true,
        lateMinutes: true,
      },
    }),
    attributedRevenue(salonId, todayBounds.start, todayBounds.end, employeeId),
    attributedRevenue(salonId, weekRange.start, weekRange.end, employeeId),
    attributedRevenue(salonId, monthRange.start, monthRange.end, employeeId),
    prisma.appointmentServiceItem.groupBy({
      by: ["appointmentId"],
      where: {
        employeeId,
        scheduledAt: { gte: weekRange.start, lte: weekRange.end },
        status: { not: "cancelled" },
        appointment: { salonId },
      },
    }),
    prisma.appointmentServiceItem.groupBy({
      by: ["appointmentId"],
      where: {
        employeeId,
        scheduledAt: { gte: monthRange.start, lte: monthRange.end },
        status: { not: "cancelled" },
        appointment: { salonId },
      },
    }),
    prisma.queueEntry.findMany({
      where: {
        salonId,
        employeeId,
        status: { in: ["waiting", "assigned", "in_progress"] },
      },
      select: {
        id: true,
        status: true,
        appointmentId: true,
        services: { select: { service: { select: { name: true } } } },
      },
      orderBy: { position: "asc" },
    }),
    prisma.employee.findFirst({
      where: { id: employeeId, salonId },
      select: { name: true },
    }),
  ]);

  const weekAppointments = weekAppointmentGroups.length;
  const monthAppointments = monthAppointmentGroups.length;

  const completedToday = todayItems.filter((row) => row.status === "completed");
  const upcomingForNext = todayItems.filter(
    (row) => !NEXT_HIDDEN.has(row.status)
  );
  const nextItem =
    upcomingForNext.find((row) => row.scheduledAt.getTime() >= nowMs) ??
    upcomingForNext[0] ??
    null;

  const workedMinutes =
    attendance?.totalWorkedMinutes ??
    (attendance?.checkInAt
      ? Math.round(
          ((attendance.checkOutAt ?? new Date()).getTime() -
            attendance.checkInAt.getTime()) /
            60000
        )
      : 0);

  const serviceTotals = new Map<
    string,
    { appointments: number; estimated: number }
  >();
  for (const row of todayItems) {
    if (row.status === "cancelled" || row.status === "no_show") continue;
    const current = serviceTotals.get(row.service.name) ?? {
      appointments: 0,
      estimated: 0,
    };
    current.appointments += 1;
    current.estimated += row.price;
    serviceTotals.set(row.service.name, current);
  }

  const distinctVisitIds = new Set(
    todayItems
      .filter((row) => row.status !== "cancelled")
      .map((row) => row.appointmentId)
  );

  return {
    greeting: salonGreeting(),
    employeeName: greetingName?.name ?? ctx.employeeName ?? "there",
    timezone: DEFAULT_SALON_TIMEZONE,
    rangeLabel: format(parseISO(`${getBusinessDateKey()}T12:00:00`), "EEEE, d MMM"),
    today: {
      earnings: todayRevenue,
      appointments: distinctVisitIds.size,
      completedServices: completedToday.length,
      workedMinutes,
      workedLabel: formatMinutesLabel(workedMinutes),
      checkIn: attendance?.checkInAt
        ? formatZonedTime(attendance.checkInAt)
        : null,
      checkOut: attendance?.checkOutAt
        ? formatZonedTime(attendance.checkOutAt)
        : null,
      status: attendance?.status ?? "none",
      lateMinutes: attendance?.lateMinutes ?? 0,
      canCheckIn: !attendance?.checkInAt,
      canCheckOut: Boolean(attendance?.checkInAt && !attendance.checkOutAt),
    },
    secondary: {
      weekEarnings: weekRevenue,
      monthEarnings: monthRevenue,
      weekAppointments,
      monthAppointments,
    },
    appointmentStatus: {
      completed: completedToday.length,
      upcoming: todayItems.filter((row) => row.status === "scheduled").length,
      inQueue: todayItems.filter(
        (row) =>
          row.status === "in_progress" ||
          row.appointment.status === "checked_in"
      ).length,
      cancelled: todayItems.filter((row) => row.status === "cancelled").length,
      noShow: todayItems.filter((row) => row.status === "no_show").length,
    },
    topServices: [...serviceTotals.entries()]
      .map(([serviceName, value]) => ({ serviceName, ...value }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 6),
    queue: [...queueEntries]
      .sort((a, b) => {
        const rank = (status: string) =>
          status === "in_progress" ? 0 : status === "assigned" ? 1 : 2;
        return rank(a.status) - rank(b.status);
      })
      .map((entry) => ({
        id: entry.id,
        status: entry.status,
        service:
          entry.services.map((row) => row.service.name).join(", ") || "Service",
        appointmentId: entry.appointmentId,
      })),
    schedule: todayItems.map((row) => ({
      id: row.id,
      appointmentId: row.appointmentId,
      time: formatZonedTime(row.scheduledAt),
      at: row.scheduledAt.toISOString(),
      service: row.service.name,
      price: row.price,
      status: row.status === "in_progress" ? "in_progress" : row.appointment.status,
      duration: row.duration,
    })),
    nextAppointment: nextItem
      ? {
          id: nextItem.appointmentId,
          appointmentId: nextItem.appointmentId,
          time: formatZonedTime(nextItem.scheduledAt),
          service: nextItem.service.name,
          price: nextItem.price,
          status: nextItem.status,
          duration: nextItem.duration,
        }
      : null,
  };
}
