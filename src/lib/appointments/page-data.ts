import { prisma } from "@/lib/prisma";
import { parseOpeningHours } from "@/lib/appointments/salon-hours";
import { cachedBySalon } from "@/lib/salon-cache";
import { isScheduleCalendarAppointment } from "@/components/appointments/appointments-utils";
import type { Appointment, Employee } from "@/components/appointments/types";
import type { DataScopeContext } from "@/lib/permissions/data-scope";
import {
  fetchAppointmentsInRange,
  type AppointmentListRow,
} from "@/lib/appointments/queries";
import { getAppointmentsPageWindows } from "@/lib/appointments/page-windows";
import type {
  AppointmentsPagePart,
  AppointmentsPagePayload,
} from "@/lib/appointments/page-types";

export type { AppointmentsPagePart, AppointmentsPagePayload };
export { getAppointmentsPageWindows };

export function toClientAppointment(a: AppointmentListRow): Appointment {
  return {
    id: a.id,
    customerId: a.customerId,
    serviceId: a.serviceId,
    scheduledAt: a.scheduledAt,
    status: a.status,
    notes: a.notes,
    customer: { name: a.customer.name, phone: a.customer.phone },
    service: {
      id: a.service.id,
      name: a.service.name,
      duration: a.service.duration,
      price: a.service.price,
      category: a.service.category,
    },
    employee: a.employee
      ? { id: a.employee.id, name: a.employee.name }
      : null,
    serviceItems: a.serviceItems?.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      employeeId: item.employeeId,
      price: item.price,
      duration: item.duration,
      status: item.status,
      scheduledAt: item.scheduledAt,
      startedAt: item.startedAt,
      completedAt: item.completedAt,
      sortOrder: item.sortOrder,
      service: {
        id: item.service.id,
        name: item.service.name,
        duration: item.service.duration,
        price: item.service.price,
        category: item.service.category,
      },
      employee: item.employee
        ? { id: item.employee.id, name: item.employee.name }
        : null,
    })),
  };
}

function calendarSlice(
  appointments: Appointment[],
  includeCheckedIn: boolean
) {
  return appointments.filter((appointment) =>
    isScheduleCalendarAppointment(appointment, { includeCheckedIn })
  );
}

const getCachedOpeningHours = cachedBySalon(
  "appointments",
  async (salonId: string) => {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { openingHours: true },
    });
    return parseOpeningHours(salon?.openingHours);
  },
  { revalidate: 300, key: "opening-hours" }
);

const getCachedPageServices = cachedBySalon(
  "catalog-options",
  async (salonId: string) =>
    prisma.service.findMany({
      where: {
        salonId,
        status: { not: "ARCHIVED" },
        catalogType: { in: ["SERVICE", "PACKAGE"] },
      },
      select: { id: true, name: true, duration: true },
      orderBy: { name: "asc" },
    }),
  { revalidate: 60, key: "appointment-page-options" }
);

const getCachedPageEmployees = cachedBySalon(
  "team",
  async (salonId: string) =>
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      select: {
        id: true,
        name: true,
        role: true,
        specialties: true,
        services: { select: { serviceId: true } },
      },
      orderBy: { name: "asc" },
    }),
  { revalidate: 60, key: "appointment-page-staff" }
);

function scopedEmployees(
  employees: Awaited<ReturnType<typeof getCachedPageEmployees>>,
  ctx: DataScopeContext
): Employee[] {
  let scheduleEmployees = employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    specialties: employee.specialties,
    serviceIds: employee.services?.map((link) => link.serviceId) ?? [],
  }));
  if (ctx.dataScope === "own" && ctx.employeeId) {
    scheduleEmployees = scheduleEmployees.filter(
      (employee) => employee.id === ctx.employeeId
    );
    if (scheduleEmployees.length === 0) {
      scheduleEmployees = [
        {
          id: ctx.employeeId,
          name: ctx.employeeName ?? "Me",
          role: "Staff",
          specialties: "",
          serviceIds: [],
        },
      ];
    }
  }
  return scheduleEmployees;
}

function emptyPayload(
  extras: Partial<AppointmentsPagePayload> = {}
): AppointmentsPagePayload {
  return {
    weekAppointments: [],
    todayAppointments: [],
    upcomingAppointments: [],
    calendarWeekAppointments: [],
    calendarTodayAppointments: [],
    calendarUpcomingAppointments: [],
    services: [],
    employees: [],
    openingHours: parseOpeningHours(null),
    includeCheckedInOnSchedule: false,
    canAddService: false,
    ...extras,
  };
}

export async function getAppointmentsPageData(
  ctx: DataScopeContext,
  part: AppointmentsPagePart,
  weekStartIso: string
): Promise<AppointmentsPagePayload> {
  const employeeId = ctx.dataScope === "own" ? ctx.employeeId : null;
  if (ctx.dataScope === "own" && !employeeId) {
    return emptyPayload({
      includeCheckedInOnSchedule: true,
      canAddService: false,
    });
  }

  const includeCheckedInOnSchedule = ctx.dataScope === "own";
  const canAddService = ctx.dataScope !== "own";
  const windows = getAppointmentsPageWindows(weekStartIso);

  if (part === "bootstrap") {
    const [openingHours, services, employees, todayRows] = await Promise.all([
      getCachedOpeningHours(ctx.salonId),
      getCachedPageServices(ctx.salonId),
      getCachedPageEmployees(ctx.salonId),
      windows.includeToday
        ? fetchAppointmentsInRange(
            ctx.salonId,
            windows.todayStart,
            windows.todayEnd,
            employeeId
          )
        : Promise.resolve([]),
    ]);
    const todayAppointments = todayRows.map(toClientAppointment);
    return emptyPayload({
      todayAppointments,
      calendarTodayAppointments: calendarSlice(
        todayAppointments,
        includeCheckedInOnSchedule
      ),
      services,
      employees: scopedEmployees(employees, ctx),
      openingHours,
      includeCheckedInOnSchedule,
      canAddService,
    });
  }

  if (part === "week") {
    const weekRows = await fetchAppointmentsInRange(
      ctx.salonId,
      windows.weekStart,
      windows.weekEnd,
      employeeId
    );
    const weekAppointments = weekRows.map(toClientAppointment);
    return emptyPayload({
      weekAppointments,
      calendarWeekAppointments: calendarSlice(
        weekAppointments,
        includeCheckedInOnSchedule
      ),
      includeCheckedInOnSchedule,
      canAddService,
    });
  }

  const upcomingRows = await fetchAppointmentsInRange(
    ctx.salonId,
    windows.upcomingStart,
    windows.upcomingEnd,
    employeeId
  );
  const upcomingAppointments = upcomingRows.map(toClientAppointment);
  return emptyPayload({
    upcomingAppointments,
    calendarUpcomingAppointments: calendarSlice(
      upcomingAppointments,
      includeCheckedInOnSchedule
    ),
    includeCheckedInOnSchedule,
    canAddService,
  });
}
