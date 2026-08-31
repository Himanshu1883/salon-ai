"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { cachedBySalon } from "@/lib/salon-cache";
import {
  checkInSchema,
  assignQueueSchema,
} from "@/lib/validations";
import { upsertCustomer } from "@/lib/customers";
import {
  assertEmployeeResourceAccess,
  getDataScopeContext,
} from "@/lib/permissions/data-scope";
import { performCheckInFromAppointment } from "@/lib/queue/check-in-from-appointment";
import { invalidateQueueCache } from "@/lib/queue/invalidate-cache";

async function fetchQueueEntries(salonId: string) {
  return prisma.queueEntry.findMany({
    where: {
      salonId,
      status: { in: ["waiting", "assigned", "in_progress"] },
    },
    include: {
      customer: true,
      employee: true,
      seat: true,
      services: { include: { service: true } },
    },
    orderBy: { position: "asc" },
  });
}

const getCachedQueueEntries = cachedBySalon("queue", fetchQueueEntries, {
  revalidate: 60,
  key: "entries",
});

async function fetchEstimatedWaitMinutes(salonId: string) {
  const [waiting, activeEmployees] = await Promise.all([
    prisma.queueEntry.findMany({
      where: { salonId, status: "waiting" },
      select: {
        services: { select: { service: { select: { duration: true } } } },
      },
    }),
    prisma.employee.count({
      where: { salonId, status: "active" },
    }),
  ]);

  const totalDuration = waiting.reduce(
    (sum, entry) =>
      sum + entry.services.reduce((s, qs) => s + qs.service.duration, 0),
    0
  );

  const workers = Math.max(activeEmployees, 1);
  return Math.ceil(totalDuration / workers);
}

const getCachedEstimatedWait = cachedBySalon("queue", fetchEstimatedWaitMinutes, {
  revalidate: 60,
  key: "wait",
});

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

export async function getQueueEntries() {
  const ctx = await getDataScopeContext();
  if (ctx.dataScope === "own") {
    if (!ctx.employeeId) return [];
    return prisma.queueEntry.findMany({
      where: {
        salonId: ctx.salonId,
        status: { in: ["waiting", "assigned", "in_progress"] },
        OR: [{ employeeId: ctx.employeeId }, { employeeId: null, status: "waiting" }],
      },
      include: {
        customer: true,
        employee: true,
        seat: true,
        services: { include: { service: true } },
      },
      orderBy: { position: "asc" },
    });
  }
  return getCachedQueueEntries(ctx.salonId);
}

export async function checkInFromAppointment(
  appointmentId: string,
  options?: { startNow?: boolean }
) {
  const session = await requireSession();
  return performCheckInFromAppointment({
    salonId: session.user.salonId,
    appointmentId,
    startNow: options?.startNow,
  });
}

export async function checkInCustomer(formData: FormData) {
  const session = await requireSession();
  const serviceIds = formData.getAll("serviceIds") as string[];
  const startNow = formData.get("startNow") === "1";
  const appointmentId =
    typeof formData.get("appointmentId") === "string" &&
    (formData.get("appointmentId") as string).trim()
      ? (formData.get("appointmentId") as string).trim()
      : undefined;
  const employeeId =
    typeof formData.get("employeeId") === "string" &&
    (formData.get("employeeId") as string).trim()
      ? (formData.get("employeeId") as string).trim()
      : undefined;

  const raw = {
    customerId: (formData.get("customerId") as string) || undefined,
    customerName: formData.get("customerName") as string,
    customerPhone: (formData.get("customerPhone") as string) || undefined,
    serviceIds,
  };

  const parsed = checkInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const customer = await upsertCustomer(session.user.salonId, {
    customerId: parsed.data.customerId,
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
  });

  if (appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, salonId: session.user.salonId },
      select: { id: true, employeeId: true, status: true },
    });
    if (appointment) {
      const existingEntry = await prisma.queueEntry.findFirst({
        where: {
          salonId: session.user.salonId,
          appointmentId,
          status: { in: ["waiting", "assigned", "in_progress"] },
        },
      });
      const assignedEmployeeId =
        employeeId || appointment.employeeId || existingEntry?.employeeId || null;

      if (existingEntry) {
        await prisma.$transaction([
          prisma.queueEntry.update({
            where: { id: existingEntry.id },
            data: {
              status: startNow
                ? "in_progress"
                : assignedEmployeeId
                  ? "assigned"
                  : existingEntry.status,
              employeeId: assignedEmployeeId,
              startedAt: startNow ? new Date() : existingEntry.startedAt,
            },
          }),
          prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: "checked_in" },
          }),
        ]);
        invalidateQueueCache(session.user.salonId);
        return {
          success: true,
          position: existingEntry.position,
          started: startNow,
          alreadyInQueue: true,
        };
      }

      const position = await getNextPosition(session.user.salonId);
      await prisma.$transaction([
        prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: "checked_in" },
        }),
        prisma.queueEntry.create({
          data: {
            salonId: session.user.salonId,
            customerId: customer.id,
            appointmentId,
            position,
            status: startNow
              ? "in_progress"
              : assignedEmployeeId
                ? "assigned"
                : "waiting",
            employeeId: assignedEmployeeId,
            startedAt: startNow ? new Date() : null,
            services: {
              create: parsed.data.serviceIds.map((serviceId) => ({ serviceId })),
            },
          },
        }),
      ]);
      invalidateQueueCache(session.user.salonId);
      return { success: true, position, started: startNow };
    }
  }

  const position = await getNextPosition(session.user.salonId);

  await prisma.queueEntry.create({
    data: {
      salonId: session.user.salonId,
      customerId: customer.id,
      position,
      status: startNow
        ? "in_progress"
        : employeeId
          ? "assigned"
          : "waiting",
      employeeId: employeeId ?? null,
      startedAt: startNow ? new Date() : null,
      services: {
        create: parsed.data.serviceIds.map((serviceId) => ({ serviceId })),
      },
    },
  });

  invalidateQueueCache(session.user.salonId);
  return { success: true, position, started: startNow };
}

export async function assignQueueEntry(formData: FormData) {
  const session = await requireSession();

  const raw = {
    queueEntryId: formData.get("queueEntryId") as string,
    employeeId: formData.get("employeeId") as string,
    seatId: (formData.get("seatId") as string) || undefined,
  };

  const parsed = assignQueueSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const entry = await prisma.queueEntry.findFirst({
    where: {
      id: parsed.data.queueEntryId,
      salonId: session.user.salonId,
    },
  });
  if (!entry) return { error: "Queue entry not found" };

  if (parsed.data.seatId) {
    await prisma.seat.update({
      where: { id: parsed.data.seatId },
      data: { status: "occupied", employeeId: parsed.data.employeeId },
    });
  }

  await prisma.queueEntry.update({
    where: { id: parsed.data.queueEntryId },
    data: {
      employeeId: parsed.data.employeeId,
      seatId: parsed.data.seatId ?? null,
      status: "assigned",
    },
  });

  invalidateQueueCache(session.user.salonId);
  return { success: true };
}

export async function startService(queueEntryId: string) {
  const session = await requireSession();
  const entry = await prisma.queueEntry.findFirst({
    where: { id: queueEntryId, salonId: session.user.salonId },
  });
  if (!entry) return { error: "Queue entry not found" };

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: "in_progress", startedAt: entry.startedAt ?? now },
    });

    if (!entry.appointmentId) return;

    const item = await tx.appointmentServiceItem.findFirst({
      where: {
        appointmentId: entry.appointmentId,
        status: "scheduled",
        ...(entry.employeeId
          ? { OR: [{ employeeId: entry.employeeId }, { employeeId: null }] }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { scheduledAt: "asc" }],
      select: { id: true },
    });
    if (item) {
      await tx.appointmentServiceItem.update({
        where: { id: item.id },
        data: { status: "in_progress", startedAt: now },
      });
    }
    await tx.appointment.updateMany({
      where: {
        id: entry.appointmentId,
        status: { notIn: ["cancelled", "completed"] },
      },
      data: { status: "checked_in" },
    });
  });

  invalidateQueueCache(session.user.salonId);
  return { success: true };
}

export async function completeService(queueEntryId: string) {
  const session = await requireSession();
  const entry = await prisma.queueEntry.findFirst({
    where: { id: queueEntryId, salonId: session.user.salonId },
    include: {
      seat: true,
      appointment: {
        select: {
          id: true,
          serviceId: true,
          customerId: true,
          employeeId: true,
          status: true,
        },
      },
    },
  });
  if (!entry) return { error: "Queue entry not found" };
  if (entry.status === "completed") return { success: true };

  const completedAt = new Date();
  const linkedAppointment = entry.appointment;
  const shouldCompleteAppointment =
    !!entry.appointmentId &&
    linkedAppointment &&
    linkedAppointment.status !== "completed";

  await prisma.$transaction(async (tx) => {
    if (entry.seatId) {
      await tx.seat.updateMany({
        where: { id: entry.seatId },
        data: { status: "available", employeeId: null },
      });
    }

    await tx.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: "completed", completedAt },
    });

    if (shouldCompleteAppointment && entry.appointmentId) {
      await tx.appointment.update({
        where: { id: entry.appointmentId },
        data: { status: "completed" },
      });
      await tx.appointmentServiceItem.updateMany({
        where: {
          appointmentId: entry.appointmentId,
          status: { notIn: ["cancelled", "no_show"] },
        },
        data: { status: "completed", completedAt },
      });
    }
  });

  try {
    invalidateQueueCache(session.user.salonId!);
  } catch (error) {
    console.error("[completeService] cache revalidate failed", error);
  }

  if (shouldCompleteAppointment && entry.appointmentId && linkedAppointment) {
    const salonId = session.user.salonId!;
    const appointmentId = entry.appointmentId;
    const serviceId = linkedAppointment.serviceId;
    const customerId = linkedAppointment.customerId;
    const employeeId = linkedAppointment.employeeId ?? entry.employeeId;
    const createdById = session.user.id;
    after(async () => {
      try {
        const { consumeServiceRecipesForAppointment } = await import(
          "@/lib/inventory/ledger"
        );
        await consumeServiceRecipesForAppointment(
          salonId,
          appointmentId,
          serviceId,
          customerId,
          employeeId,
          createdById
        );
        revalidatePath("/inventory");
        revalidatePath("/inventory/consumption");
        revalidatePath("/inventory/ledger");
        revalidatePath("/inventory/products");
      } catch (error) {
        console.error("[completeService] inventory consume failed", error);
      }
    });
  }

  return { success: true };
}

export async function cancelQueueEntry(queueEntryId: string) {
  const session = await requireSession();
  const entry = await prisma.queueEntry.findFirst({
    where: { id: queueEntryId, salonId: session.user.salonId },
  });
  if (!entry) return { error: "Queue entry not found" };

  if (entry.seatId) {
    await prisma.seat.update({
      where: { id: entry.seatId },
      data: { status: "available", employeeId: null },
    });
  }

  await prisma.queueEntry.update({
    where: { id: queueEntryId },
    data: { status: "cancelled" },
  });

  invalidateQueueCache(session.user.salonId);
  return { success: true };
}

export async function getRecentCompletedCheckIns() {
  const session = await requireSession();
  return getCachedRecentCompletedCheckIns(session.user.salonId!);
}

const getCachedRecentCompletedCheckIns = cachedBySalon(
  "check-in",
  async (salonId: string) =>
    prisma.queueEntry.findMany({
      where: { salonId, status: "completed" },
      select: {
        id: true,
        completedAt: true,
        employeeId: true,
        seatId: true,
        customer: { select: { name: true, phone: true } },
        services: {
          select: {
            service: { select: { id: true, name: true, price: true } },
          },
        },
        invoices: {
          select: { id: true, status: true, paymentMethod: true, total: true },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
  { revalidate: 30, key: "recent-completed" }
);

export async function getEstimatedWaitMinutes() {
  const session = await requireSession();
  return getCachedEstimatedWait(session.user.salonId);
}
