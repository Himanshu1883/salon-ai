import { after } from "next/server";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseVisitGroupId } from "@/lib/appointments/visit-group";
import {
  getDataScopeContextFromAuth,
  type DataScopeContext,
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

async function getNextPosition(
  salonId: string,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  const last = await db.queueEntry.findFirst({
    where: {
      salonId,
      status: { in: ["waiting", "assigned", "in_progress"] },
    },
    orderBy: { position: "desc" },
  });
  return (last?.position ?? 0) + 1;
}

/** Put the visit on the Walk-ins In Progress board when a service is started. */
export async function ensureInProgressQueueEntry(
  db: Prisma.TransactionClient | typeof prisma,
  input: {
    salonId: string;
    appointmentId: string;
    customerId: string;
    employeeId?: string | null;
    serviceIds: string[];
    visitAppointmentIds?: string[];
  }
) {
  const serviceIds = [...new Set(input.serviceIds.filter(Boolean))];
  if (serviceIds.length === 0) return null;

  const visitIds = input.visitAppointmentIds?.length
    ? input.visitAppointmentIds
    : [input.appointmentId];
  const now = new Date();

  const existing = await db.queueEntry.findFirst({
    where: {
      salonId: input.salonId,
      appointmentId: { in: visitIds },
      status: { in: ["waiting", "assigned", "in_progress"] },
    },
    include: { services: { select: { serviceId: true } } },
  });

  if (existing) {
    await db.queueEntry.update({
      where: { id: existing.id },
      data: {
        status: "in_progress",
        startedAt: existing.startedAt ?? now,
        employeeId: existing.employeeId ?? input.employeeId ?? null,
      },
    });
    const have = new Set(existing.services.map((row) => row.serviceId));
    const missing = serviceIds.filter((id) => !have.has(id));
    if (missing.length > 0) {
      await db.queueService.createMany({
        data: missing.map((serviceId) => ({
          queueEntryId: existing.id,
          serviceId,
        })),
        skipDuplicates: true,
      });
    }
    return existing.id;
  }

  const position = await getNextPosition(input.salonId, db);
  const created = await db.queueEntry.create({
    data: {
      salonId: input.salonId,
      customerId: input.customerId,
      appointmentId: input.appointmentId,
      position,
      status: "in_progress",
      employeeId: input.employeeId ?? null,
      startedAt: now,
      services: {
        create: serviceIds.map((serviceId) => ({ serviceId })),
      },
    },
    select: { id: true },
  });
  return created.id;
}

async function startFirstScheduledServiceItem(
  appointmentId: string,
  employeeId?: string | null
) {
  const item = await prisma.appointmentServiceItem.findFirst({
    where: {
      appointmentId,
      status: { in: ["scheduled"] },
      ...(employeeId
        ? { OR: [{ employeeId }, { employeeId: null }] }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { scheduledAt: "asc" }],
    select: { id: true },
  });
  if (!item) return;
  await prisma.appointmentServiceItem.update({
    where: { id: item.id },
    data: { status: "in_progress", startedAt: new Date() },
  });
}

export async function performCheckInFromAppointment(options: {
  salonId: string;
  appointmentId: string;
  startNow?: boolean;
  scope?: DataScopeContext | null;
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
  scope?: DataScopeContext | null;
}): Promise<CheckInFromAppointmentResult> {
  const { salonId, appointmentId, startNow = false } = options;
  const scope = options.scope ?? (await getDataScopeContextFromAuth());
  if (!scope) return { error: "Unauthorized" };

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, salonId },
    include: {
      serviceItems: {
        select: {
          id: true,
          employeeId: true,
          serviceId: true,
          status: true,
          sortOrder: true,
        },
      },
    },
  });
  if (!appointment) return { error: "Appointment not found" };

  if (scope.dataScope === "own") {
    const allowed =
      Boolean(scope.employeeId) &&
      (appointment.employeeId === scope.employeeId ||
        appointment.serviceItems.some(
          (item) => item.employeeId === scope.employeeId
        ));
    if (!allowed) return { error: "Appointment not found" };
  }
  if (appointment.status === "cancelled") {
    return { error: "Cannot check in a cancelled appointment" };
  }
  if (appointment.status === "completed") {
    return { error: "Appointment is already completed" };
  }

  const visitAppointments = await findVisitGroupAppointments(salonId, appointment);
  const visitIds = visitAppointments.map((item) => item.id);
  const employeeId =
    appointment.serviceItems.find((item) => item.employeeId)?.employeeId ??
    visitAppointments.find((item) => item.employeeId)?.employeeId ??
    appointment.employeeId;
  const shouldStartNow =
    startNow ||
    appointment.serviceItems.some((item) => item.status === "in_progress");

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
      ...(shouldStartNow
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
    if (shouldStartNow) {
      await startFirstScheduledServiceItem(appointment.id, employeeId);
    }
    scheduleQueueCacheRefresh(salonId);
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
      scheduleQueueCacheRefresh(salonId);
      return { success: true, alreadyCompleted: true, appointmentIds: visitIds };
    }
  }

  const position = await getNextPosition(salonId);
  const requestedServiceIds = [
    ...new Set(
      [
        ...appointment.serviceItems.map((item) => item.serviceId),
        ...visitAppointments.map((item) => item.serviceId),
      ].filter((id): id is string => Boolean(id))
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
  const queueStatus = shouldStartNow
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
        startedAt: shouldStartNow ? new Date() : null,
        services: {
          create: serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
    }),
  ]);

  if (shouldStartNow) {
    await startFirstScheduledServiceItem(appointment.id, assignedEmployeeId);
  }

  scheduleQueueCacheRefresh(salonId);
  return { success: true, position, appointmentIds: visitIds };
}
