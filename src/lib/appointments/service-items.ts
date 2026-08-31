import { parseVisitGroupId } from "@/lib/appointments/visit-group";

export const SERVICE_ITEM_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type ServiceItemStatus = (typeof SERVICE_ITEM_STATUSES)[number];

export type AppointmentServiceItemView = {
  id: string;
  serviceId: string;
  employeeId: string | null;
  price: number;
  duration: number;
  status: string;
  scheduledAt: Date | string;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  sortOrder?: number;
  service: {
    id?: string;
    name: string;
    duration: number;
    price?: number;
    category?: { id: string; name: string } | null;
  };
  employee: { id: string; name: string } | null;
};

export type VisitLikeAppointment = {
  id: string;
  notes: string | null;
  scheduledAt: Date | string;
  status: string;
  serviceId?: string;
  service: AppointmentServiceItemView["service"];
  employee: { id: string; name: string } | null;
  serviceItems?: AppointmentServiceItemView[];
};

/** Prefer the nested relation, then the stored foreign key. Never invent staff. */
export function serviceItemStaffId(item: {
  employeeId?: string | null;
  employee?: { id: string } | null;
}): string | undefined {
  return item.employee?.id || item.employeeId || undefined;
}

export function getAppointmentServiceItems<T extends VisitLikeAppointment>(
  appointment: T,
  allAppointments: T[] = []
): AppointmentServiceItemView[] {
  if (appointment.serviceItems && appointment.serviceItems.length > 0) {
    return [...appointment.serviceItems].sort((a, b) => {
      const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (order !== 0) return order;
      return (
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    });
  }

  const groupId = parseVisitGroupId(appointment.notes);
  const siblings = groupId
    ? allAppointments
        .filter((item) => parseVisitGroupId(item.notes) === groupId)
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        )
    : [appointment];

  return siblings.map((item, index) => ({
    id: item.id,
    serviceId: item.serviceId ?? item.service.id ?? "",
    employeeId: item.employee?.id ?? null,
    price: item.service.price ?? 0,
    duration: item.service.duration,
    status: item.status,
    scheduledAt: item.scheduledAt,
    sortOrder: index,
    service: item.service,
    employee: item.employee,
  }));
}

export function visitGroupKey(appointment: {
  id: string;
  notes: string | null;
}): string {
  return parseVisitGroupId(appointment.notes) ?? appointment.id;
}

/** Collapse legacy visit-group rows so one customer visit is one list card. */
export function groupAppointmentsByVisit<T extends VisitLikeAppointment>(
  appointments: T[]
): T[] {
  const seen = new Set<string>();
  const grouped: T[] = [];

  for (const appointment of appointments) {
    const key = visitGroupKey(appointment);
    if (seen.has(key)) continue;
    seen.add(key);

    const groupId = parseVisitGroupId(appointment.notes);
    if (!groupId) {
      grouped.push(appointment);
      continue;
    }

    const siblings = appointments
      .filter((item) => parseVisitGroupId(item.notes) === groupId)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    grouped.push(siblings[0] ?? appointment);
  }

  return grouped;
}

export function visitServiceCount<T extends VisitLikeAppointment>(
  appointment: T,
  allAppointments: T[] = []
) {
  return getAppointmentServiceItems(appointment, allAppointments).length;
}

export function visitStaffCount<T extends VisitLikeAppointment>(
  appointment: T,
  allAppointments: T[] = []
) {
  const ids = new Set(
    getAppointmentServiceItems(appointment, allAppointments)
      .map((item) => serviceItemStaffId(item))
      .filter((id): id is string => Boolean(id))
  );
  return ids.size;
}

export function visitTotalPrice<T extends VisitLikeAppointment>(
  appointment: T,
  allAppointments: T[] = []
) {
  return getAppointmentServiceItems(appointment, allAppointments).reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );
}

export function deriveAppointmentStatusFromItems(
  itemStatuses: string[]
): string | null {
  if (itemStatuses.length === 0) return null;
  if (itemStatuses.every((status) => status === "cancelled")) return "cancelled";
  if (itemStatuses.every((status) => status === "no_show")) return "no_show";
  if (itemStatuses.every((status) => status === "completed")) return "completed";
  if (itemStatuses.some((status) => status === "in_progress")) {
    return "checked_in";
  }
  return null;
}

export function getServiceItemStatusLabel(status: string) {
  switch (status) {
    case "scheduled":
      return "Not Started";
    case "in_progress":
      return "In Progress";
    case "checked_in":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "no_show":
      return "No Show";
    default:
      return status.replace(/_/g, " ");
  }
}
