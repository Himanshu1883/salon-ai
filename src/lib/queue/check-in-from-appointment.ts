import { after } from "next/server";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { prisma } from "@/lib/prisma";
import { parseVisitGroupId } from "@/lib/appointments/visit-group";
import {
  assertEmployeeResourceAccess,
  getDataScopeContext,
} from "@/lib/permissions/data-scope";
import { invalidateQueueCache } from "@/lib/queue/invalidate-cache";

function scheduleQueueCacheRefresh(
  salonId: string,
  options?: { revalidateAppointmentPages?: boolean }
) {
  after(() => {
    try {
      invalidateQueueCache(salonId, options);
    } catch (error) {
      console.error("[check-in-from-appointment] cache revalidate failed", error);
    }
  });
}

function checkInErrorMessage(error: unknown): string {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return "A linked service or staff record is missing. Update the appointment and try again.";
    }
    if (error.code === "P2002") {
      return "This appointment is already in the queue.";
    }
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return "Unauthorized";
  }
  console.error("[check-in-from-appointment]", error);
  return "Could not check in. Try again.";
}

export type CheckInFromAppointmentResult = {
  error?: string;
  success?: boolean;
  position?: number;
  alreadyInQueue?: boolean;
  alreadyCompleted?: boolean;
  appointmentIds?: string[];
};

async function findVisitGroupAppointments(
  salonId: string,
  appointment: {
    id: string;
    notes: string | null;
    customerId: string;
    serviceId: string;
    employeeId: string | null;
    status: string;
  }
) {
  const groupId = parseVisitGroupId(appointment.notes);
  if (!groupId) return [appointment];

  const siblings = await prisma.appointment.findMany({
    where: {
      salonId,
      customerId: appointment.customerId,
      status: { not: "cancelled" },
      notes: { startsWith: `[visit:${groupId}]` },
    },
    select: {
      id: true,
      notes: true,
      customerId: true,
      serviceId: true,
      employeeId: true,
      status: true,
    },
  });

  const matched = siblings.filter(
    (item) => parseVisitGroupId(item.notes) === groupId
  );
  return matched.length > 0 ? matched : [appointment];
}

async function getNextPosition(salonId: string) {
  const last = await prisma.queueEntry.findFirst({
    where: {
      salonId,
      status: { in: ["waiting", "assigned", "in_progress"] },
    },
    orderBy: { position: "desc" },
  });
  return (last?.position ?? 0) + 1;
}

export async function performCheckInFromAppointment(options: {
  salonId: string;
  appointmentId: string;
  startNow?: boolean;
}): Promise<CheckInFromAppointmentResult> {
  try {
    return await performCheckInFromAppointmentInner(options);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: true,
        alreadyInQueue: true,
        appointmentIds: [options.appointmentId],
      };
    }
    return { error: checkInErrorMessage(error) };
  }
}

async function performCheckInFromAppointmentInner(options: {
  salonId: string;
  appointmentId: string;
  startNow?: boolean;
}): Promise<CheckInFromAppointmentResult> {
  const { salonId, appointmentId, startNow = false } = options;
  const scope = await getDataScopeContext();

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, salonId },
  });
  if (!appointment) return { error: "Appointment not found" };
  if (appointment.employeeId) {
    try {
      assertEmployeeResourceAccess(scope, appointment.employeeId);
    } catch {
      return { error: "Appointment not found" };
    }
  }
  if (appointment.status === "cancelled") {
    return { error: "Cannot check in a cancelled appointment" };
  }
  if (appointment.status === "completed") {
    return { error: "Appointment is already completed" };
  }

  const visitAppointments = await findVisitGroupAppointments(salonId, appointment);
  const visitIds = visitAppointments.map((item) => item.id);
  const skipAppointmentPages = { revalidateAppointmentPages: false as const };
  const employeeId =
    visitAppointments.find((item) => item.employeeId)?.employeeId ??
    appointment.employeeId;

  const existingEntry = await prisma.queueEntry.findFirst({
    where: {
      salonId,
      appointmentId: { in: visitIds },
      status: { in: ["waiting", "assigned", "in_progress"] },
    },
  });

  if (existingEntry) {
    await prisma.$transaction([
      prisma.appointment.updateMany({
        where: {
          salonId,
          id: { in: visitIds },
          status: { notIn: ["cancelled", "completed"] },
        },
        data: { status: "checked_in" },
      }),
      ...(startNow
        ? [
            prisma.queueEntry.update({
              where: { id: existingEntry.id },
              data: {
                status: "in_progress" as const,
                employeeId: existingEntry.employeeId ?? employeeId,
                startedAt: existingEntry.startedAt ?? new Date(),
              },
            }),
          ]
        : []),
    ]);
    scheduleQueueCacheRefresh(salonId, skipAppointmentPages);
    return {
      success: true,
      position: existingEntry.position,
      alreadyInQueue: true,
      appointmentIds: visitIds,
    };
  }

  if (appointment.status === "checked_in") {
    const completedEntry = await prisma.queueEntry.findFirst({
      where: {
        salonId,
        appointmentId: { in: visitIds },
        status: "completed",
      },
      orderBy: { completedAt: "desc" },
    });

    if (completedEntry) {
      await prisma.appointment.updateMany({
        where: { salonId, id: { in: visitIds } },
        data: { status: "completed" },
      });
      scheduleQueueCacheRefresh(salonId, skipAppointmentPages);
      return { success: true, alreadyCompleted: true, appointmentIds: visitIds };
    }
  }

  const position = await getNextPosition(salonId);
  const requestedServiceIds = [
    ...new Set(
      visitAppointments
        .map((item) => item.serviceId)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const [validServices, validEmployee] = await Promise.all([
    prisma.service.findMany({
      where: { salonId, id: { in: requestedServiceIds } },
      select: { id: true },
    }),
    employeeId
      ? prisma.employee.findFirst({
          where: { id: employeeId, salonId },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);
  const serviceIds = validServices.map((item) => item.id);
  if (serviceIds.length === 0) {
    return {
      error:
        "The appointment service is missing from the catalog. Update the booking and try again.",
    };
  }
  const assignedEmployeeId = validEmployee?.id ?? null;
  const queueStatus = startNow
    ? "in_progress"
    : assignedEmployeeId
      ? "assigned"
      : "waiting";

  await prisma.$transaction([
    prisma.appointment.updateMany({
      where: {
        salonId,
        id: { in: visitIds },
        status: { notIn: ["cancelled", "completed"] },
      },
      data: { status: "checked_in" },
    }),
    prisma.queueEntry.create({
      data: {
        salonId,
        customerId: appointment.customerId,
        appointmentId,
        position,
        status: queueStatus,
        employeeId: assignedEmployeeId,
        startedAt: startNow ? new Date() : null,
        services: {
          create: serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
    }),
  ]);

  scheduleQueueCacheRefresh(salonId, skipAppointmentPages);
  return { success: true, position, appointmentIds: visitIds };
}
