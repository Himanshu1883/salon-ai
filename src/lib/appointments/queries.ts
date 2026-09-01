import { prisma } from "@/lib/prisma";

export const appointmentServiceItemSelect = {
  id: true,
  serviceId: true,
  employeeId: true,
  price: true,
  duration: true,
  status: true,
  scheduledAt: true,
  startedAt: true,
  completedAt: true,
  sortOrder: true,
  service: {
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      category: { select: { id: true, name: true } },
    },
  },
  employee: { select: { id: true, name: true } },
} as const;

export const appointmentListSelect = {
  id: true,
  customerId: true,
  serviceId: true,
  scheduledAt: true,
  status: true,
  notes: true,
  customer: { select: { id: true, name: true, phone: true } },
  service: {
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      category: { select: { id: true, name: true } },
    },
  },
  employee: { select: { id: true, name: true } },
  serviceItems: {
    orderBy: [{ sortOrder: "asc" as const }, { scheduledAt: "asc" as const }],
    select: appointmentServiceItemSelect,
  },
};

export type AppointmentListRow = Awaited<
  ReturnType<typeof fetchAppointmentsInRange>
>[number];

export async function fetchAppointmentsInRange(
  salonId: string,
  start: Date,
  end: Date,
  employeeId?: string | null
) {
  return prisma.appointment.findMany({
    where: {
      salonId,
      scheduledAt: { gte: start, lte: end },
      status: { not: "cancelled" },
      ...(employeeId
        ? {
            OR: [
              { employeeId },
              { serviceItems: { some: { employeeId } } },
            ],
          }
        : {}),
    },
    select: appointmentListSelect,
    orderBy: { scheduledAt: "asc" },
  });
}
