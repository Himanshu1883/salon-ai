import {
  addMinutes,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { Appointment, Employee } from "./types";
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  SLOT_MINUTES,
} from "./types";

export type ViewMode = "week" | "day" | "list";

export type ViewSwitcherMode = ViewMode | "month" | "timeline";

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
    if (employeeFilter === "unassigned" && apt.employee) return false;
    if (
      employeeFilter !== "all" &&
      employeeFilter !== "unassigned" &&
      apt.employee?.id !== employeeFilter
    ) {
      return false;
    }
    if (serviceName && apt.service.name !== serviceName) return false;
    if (statusFilter !== "all" && apt.status !== statusFilter) return false;
    if (query) {
      const haystack = [
        apt.customer.name,
        apt.customer.phone ?? "",
        apt.service.name,
        apt.employee?.name ?? "",
        apt.notes ?? "",
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
    .reduce((sum, a) => sum + a.service.duration, 0);

  const businessMinutes =
    (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60 *
    Math.max(employees.length, 1);

  const occupiedStaff = new Set(
    todayAppointments
      .filter((a) => a.status !== "cancelled" && a.employee?.id)
      .map((a) => a.employee!.id)
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
    isSameDay(new Date(a.scheduledAt), day)
  );

  const slots: boolean[] = Array.from(
    {
      length:
        ((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60) / SLOT_MINUTES,
    },
    () => true
  );

  for (const apt of dayAppointments) {
    if (apt.status === "cancelled") continue;
    const start = new Date(apt.scheduledAt);
    const startMinutes =
      start.getHours() * 60 + start.getMinutes() - CALENDAR_START_HOUR * 60;
    const slotCount = Math.ceil(apt.service.duration / SLOT_MINUTES);
    const startSlot = Math.floor(startMinutes / SLOT_MINUTES);
    for (let i = startSlot; i < startSlot + slotCount && i < slots.length; i++) {
      if (i >= 0) slots[i] = false;
    }
  }

  return slots.filter(Boolean).length;
}

export function formatAppointmentTime(apt: Appointment) {
  const start = new Date(apt.scheduledAt);
  const end = addMinutes(start, apt.service.duration);
  return `${format(start, "h:mm")} – ${format(end, "h:mm a")}`;
}

export function isAppointmentToday(apt: Appointment) {
  return isSameDay(new Date(apt.scheduledAt), startOfDay(new Date()));
}
