import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";
import {
  BLOCKING_APPOINTMENT_STATUSES,
  hasEmployeeConflict,
  type AppointmentSlot,
} from "./conflicts";

function toSlotsFromItems(
  items: Array<{
    employeeId: string | null;
    scheduledAt: Date;
    duration: number;
  }>
): AppointmentSlot[] {
  return items
    .filter((item) => item.employeeId)
    .map((item) => ({
      employeeId: item.employeeId,
      scheduledAt: item.scheduledAt,
      service: { duration: item.duration },
    }));
}

function toSlotsFromHeaderAppointments(
  appointments: Array<{
    employeeId: string | null;
    scheduledAt: Date;
    service: { duration: number };
  }>
): AppointmentSlot[] {
  return appointments
    .filter((appointment) => appointment.employeeId)
    .map((appointment) => ({
      employeeId: appointment.employeeId,
      scheduledAt: appointment.scheduledAt,
      service: appointment.service,
    }));
}

async function fetchEmployeeDaySlots(
  salonId: string,
  employeeId: string,
  dayStart: Date,
  dayEnd: Date
) {
  const [items, headerAppointments] = await Promise.all([
    prisma.appointmentServiceItem.findMany({
      where: {
        employeeId,
        status: { in: ["scheduled", "in_progress"] },
        scheduledAt: { gte: dayStart, lte: dayEnd },
        appointment: {
          salonId,
          status: { in: [...BLOCKING_APPOINTMENT_STATUSES] },
        },
      },
      select: { employeeId: true, scheduledAt: true, duration: true },
    }),
    prisma.appointment.findMany({
      where: {
        salonId,
        employeeId,
        status: { in: [...BLOCKING_APPOINTMENT_STATUSES] },
        scheduledAt: { gte: dayStart, lte: dayEnd },
        serviceItems: { none: {} },
      },
      select: {
        employeeId: true,
        scheduledAt: true,
        service: { select: { duration: true } },
      },
    }),
  ]);

  return [
    ...toSlotsFromItems(items),
    ...toSlotsFromHeaderAppointments(headerAppointments),
  ];
}

export async function assertEmployeeAvailableForSlot(
  salonId: string,
  employeeId: string,
  scheduledAt: Date,
  duration: number
): Promise<{ error?: string }> {
  const dayStart = startOfDay(scheduledAt);
  const dayEnd = endOfDay(scheduledAt);

  const [employee, existing] = await Promise.all([
    prisma.employee.findFirst({
      where: { id: employeeId, salonId, status: "active" },
      select: { id: true, name: true },
    }),
    fetchEmployeeDaySlots(salonId, employeeId, dayStart, dayEnd),
  ]);

  if (!employee) {
    return { error: "Invalid or inactive employee" };
  }

  if (!hasEmployeeConflict(employeeId, scheduledAt, duration, existing)) {
    return {};
  }

  const [allEmployees, otherItems, otherHeaders] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.appointmentServiceItem.findMany({
      where: {
        employeeId: { not: employeeId },
        status: { in: ["scheduled", "in_progress"] },
        scheduledAt: { gte: dayStart, lte: dayEnd },
        appointment: {
          salonId,
          status: { in: [...BLOCKING_APPOINTMENT_STATUSES] },
        },
      },
      select: { employeeId: true, scheduledAt: true, duration: true },
    }),
    prisma.appointment.findMany({
      where: {
        salonId,
        employeeId: { not: employeeId },
        status: { in: [...BLOCKING_APPOINTMENT_STATUSES] },
        scheduledAt: { gte: dayStart, lte: dayEnd },
        serviceItems: { none: {} },
      },
      select: {
        employeeId: true,
        scheduledAt: true,
        service: { select: { duration: true } },
      },
    }),
  ]);

  const allSlots = [
    ...existing,
    ...toSlotsFromItems(otherItems),
    ...toSlotsFromHeaderAppointments(otherHeaders),
  ];

  const available = allEmployees.filter(
    (staff) =>
      staff.id !== employeeId &&
      !hasEmployeeConflict(staff.id, scheduledAt, duration, allSlots)
  );

  if (available.length > 0) {
    return {
      error: `${employee.name} is not available at this time. Try ${available.map((e) => e.name).join(", ")} instead.`,
    };
  }

  return {
    error: `${employee.name} is not available at this time. Please choose another time.`,
  };
}
