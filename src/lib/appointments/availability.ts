import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";
import {
  BLOCKING_APPOINTMENT_STATUSES,
  hasEmployeeConflict,
} from "./conflicts";

export async function assertEmployeeAvailableForSlot(
  salonId: string,
  employeeId: string,
  scheduledAt: Date,
  duration: number
): Promise<{ error?: string }> {
  const [existing, employee, allEmployees] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        salonId,
        employeeId: { not: null },
        status: { in: [...BLOCKING_APPOINTMENT_STATUSES] },
        scheduledAt: {
          gte: startOfDay(scheduledAt),
          lte: endOfDay(scheduledAt),
        },
      },
      select: {
        employeeId: true,
        scheduledAt: true,
        service: { select: { duration: true } },
      },
    }),
    prisma.employee.findFirst({
      where: { id: employeeId, salonId, status: "active" },
      select: { id: true, name: true },
    }),
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!employee) {
    return { error: "Invalid or inactive employee" };
  }

  if (!hasEmployeeConflict(employeeId, scheduledAt, duration, existing)) {
    return {};
  }

  const available = allEmployees.filter(
    (e) => !hasEmployeeConflict(e.id, scheduledAt, duration, existing)
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
