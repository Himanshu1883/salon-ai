import {
  addMinutes,
  startOfDay,
} from "date-fns";
import type { Appointment, Employee } from "./types";
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  SLOT_MINUTES,
} from "./types";
import {
  appointmentClockMinutes,
  formatAppointmentDateTime,
  isAppointmentOnCalendarDay,
} from "@/lib/appointments/datetime";
import { getAppointmentServiceItems } from "@/lib/appointments/service-items";

export type ViewMode = "week" | "day" | "list";

export type ViewSwitcherMode = ViewMode | "month" | "timeline";

/** Still on the appointment book — not finished or cancelled. */
export function isScheduleCalendarAppointment(
  appointment: Pick<Appointment, "status">,
  options?: { includeCheckedIn?: boolean }
) {
  if (appointment.status === "scheduled") return true;
  if (options?.includeCheckedIn && appointment.status === "checked_in") {
    return true;
  }
  return false;
}

export function filterScheduleCalendarAppointments(
  appointments: Appointment[],
  options?: { includeCheckedIn?: boolean }
) {
  return appointments.filter((appointment) =>
    isScheduleCalendarAppointment(appointment, options)
  );
}

export function filterAppointments(
  appointments: Appointment[],
  {
    employeeFilter,
    serviceFilter,
    statusFilter,
    searchQuery,
    services,
  }: {
    employeeFilter: string;
    serviceFilter: string;
    statusFilter: string;
    searchQuery: string;
    services: { id: string; name: string }[];
  }
) {
  const serviceName =
    serviceFilter === "all"
      ? null
      : services.find((s) => s.id === serviceFilter)?.name;

  const query = searchQuery.trim().toLowerCase();

  return appointments.filter((apt) => {
    const items = getAppointmentServiceItems(apt);
    if (employeeFilter === "unassigned") {
      const hasStaff = items.some((item) => item.employee?.id) || Boolean(apt.employee);
      if (hasStaff) return false;
    } else if (employeeFilter !== "all") {
      const matchesItem = items.some((item) => item.employee?.id === employeeFilter);
      if (!matchesItem && apt.employee?.id !== employeeFilter) return false;
    }
    if (serviceName) {
      const matchesItem = items.some((item) => item.service.name === serviceName);
      if (!matchesItem && apt.service.name !== serviceName) return false;
    }
    if (statusFilter !== "all" && apt.status !== statusFilter) return false;
    if (query) {
      const haystack = [
        apt.customer.name,
        apt.customer.phone ?? "",
        apt.service.name,
        apt.employee?.name ?? "",
        apt.notes ?? "",
        ...items.map((item) => item.service.name),
        ...items.map((item) => item.employee?.name ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-500";
    case "checked_in":
      return "bg-amber-500";
    case "cancelled":
      return "bg-red-400";
    case "no_show":
      return "bg-orange-400";
    default:
      return "bg-[#6C3BFF]";
  }
}

export function getStatusAccentClass(status: string) {
  switch (status) {
    case "completed":
      return "before:bg-emerald-500";
    case "checked_in":
      return "before:bg-amber-500";
    case "cancelled":
      return "before:bg-red-400";
    case "no_show":
      return "before:bg-orange-400";
    default:
      return "before:bg-[#6C3BFF]";
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case "checked_in":
      return "In Queue";
    case "in_progress":
      return "In Progress";
    case "no_show":
      return "No Show";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  }
}

export function getPaymentLabel(status: string) {
  if (status === "completed") return "Paid";
  if (status === "checked_in") return "In Queue";
  if (status === "cancelled") return "N/A";
  return "Pending";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function computeTodayAnalytics(
  todayAppointments: Appointment[],
  employees: Employee[]
) {
  const completed = todayAppointments.filter((a) => a.status === "completed");
  const pending = todayAppointments.filter(
    (a) => a.status === "scheduled" || a.status === "checked_in"
  );
  const cancelled = todayAppointments.filter((a) => a.status === "cancelled");

  const totalMinutes = todayAppointments
    .filter((a) => a.status !== "cancelled")
    .reduce((sum, a) => {
      const items = getAppointmentServiceItems(a);
      if (items.length > 0) {
        return (
          sum +
          items
            .filter((item) => item.status !== "cancelled")
            .reduce((itemSum, item) => itemSum + item.duration, 0)
        );
      }
      return sum + a.service.duration;
    }, 0);

  const businessMinutes =
    (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60 *
    Math.max(employees.length, 1);

  const occupiedStaff = new Set(
    todayAppointments
      .filter((a) => a.status !== "cancelled")
      .flatMap((a) => {
        const items = getAppointmentServiceItems(a)
          .map((item) => item.employee?.id)
          .filter((id): id is string => Boolean(id));
        if (items.length > 0) return items;
        return a.employee?.id ? [a.employee.id] : [];
      })
  );

  const idleStaff = employees.filter((e) => !occupiedStaff.has(e.id));

  return {
    total: todayAppointments.length,
    completed: completed.length,
    pending: pending.length,
    cancelled: cancelled.length,
    occupancy: businessMinutes
      ? Math.min(100, Math.round((totalMinutes / businessMinutes) * 100))
      : 0,
    staffUtilization: employees.length
      ? Math.round((occupiedStaff.size / employees.length) * 100)
      : 0,
    idleStaff,
    revenueEstimate: completed.length * 85,
    averageBill: completed.length
      ? Math.round((completed.length * 85) / completed.length)
      : 0,
  };
}

export function countAvailableSlotsToday(
  todayAppointments: Appointment[],
  day: Date
) {
  const dayAppointments = todayAppointments.filter((a) =>
    isAppointmentOnCalendarDay(a.scheduledAt, day)
  );

  const slots: boolean[] = Array.from(
    {
      length:
        ((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60) / SLOT_MINUTES,
    },
    () => true
  );

  for (const apt of dayAppointments) {
    if (!isScheduleCalendarAppointment(apt, { includeCheckedIn: true })) continue;
    const items = getAppointmentServiceItems(apt);
    const blocks =
      items.length > 0
        ? items
            .filter((item) => item.status !== "cancelled")
            .map((item) => ({
              scheduledAt: item.scheduledAt,
              duration: item.duration,
            }))
        : [{ scheduledAt: apt.scheduledAt, duration: apt.service.duration }];
    for (const block of blocks) {
      const startMinutes =
        appointmentClockMinutes(block.scheduledAt) - CALENDAR_START_HOUR * 60;
      const slotCount = Math.ceil(block.duration / SLOT_MINUTES);
      const startSlot = Math.floor(startMinutes / SLOT_MINUTES);
      for (let i = startSlot; i < startSlot + slotCount && i < slots.length; i++) {
        if (i >= 0) slots[i] = false;
      }
    }
  }

  return slots.filter(Boolean).length;
}

export function formatAppointmentTime(apt: Appointment) {
  const start = new Date(apt.scheduledAt);
  const end = addMinutes(start, apt.service.duration);
  return `${formatAppointmentDateTime(start, "h:mm")} – ${formatAppointmentDateTime(end, "h:mm a")}`;
}

export function expandAppointmentsForCalendar(
  appointments: Appointment[]
): Appointment[] {
  const blocks: Appointment[] = [];
  for (const appointment of appointments) {
    const items = (appointment.serviceItems ?? []).filter(
      (item) => item.status !== "cancelled"
    );
    if (items.length === 0) {
      blocks.push({ ...appointment, calendarKey: appointment.id });
      continue;
    }
    for (const item of items) {
      blocks.push({
        ...appointment,
        calendarKey: `${appointment.id}:${item.id}`,
        scheduledAt: item.scheduledAt,
        service: item.service,
        employee: item.employee,
        status:
          item.status === "in_progress"
            ? "checked_in"
            : item.status === "completed" || item.status === "cancelled"
              ? item.status
              : appointment.status,
      });
    }
  }
  return blocks;
}

export function isAppointmentToday(apt: Appointment) {
  return isAppointmentOnCalendarDay(apt.scheduledAt, startOfDay(new Date()));
}
