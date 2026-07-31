"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { cachedBySalon, revalidateSalonCache } from "@/lib/salon-cache";
import {
  checkInSchema,
  assignQueueSchema,
} from "@/lib/validations";
import { upsertCustomer } from "@/lib/customers";

function invalidateQueueCache(salonId: string) {
  revalidateSalonCache(
    salonId,
    "queue",
    "check-in",
    "dashboard-kpis",
    "dashboard-widgets",
    "dashboard-stats"
  );
}

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
  const waiting = await prisma.queueEntry.findMany({
    where: { salonId, status: "waiting" },
    include: { services: { include: { service: true } } },
  });

  const activeEmployees = await prisma.employee.count({
    where: { salonId, status: "active" },
  });

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
  const session = await requireSession();
  return getCachedQueueEntries(session.user.salonId);
}

export async function checkInFromAppointment(appointmentId: string) {
  const session = await requireSession();

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, salonId: session.user.salonId },
  });
  if (!appointment) return { error: "Appointment not found" };
  if (appointment.status === "cancelled") {
    return { error: "Cannot check in a cancelled appointment" };
  }
  if (appointment.status === "completed") {
    return { error: "Appointment is already completed" };
  }

  const existingEntry = await prisma.queueEntry.findFirst({
    where: {
      salonId: session.user.salonId,
      appointmentId,
      status: { in: ["waiting", "assigned", "in_progress"] },
    },
  });

  if (existingEntry) {
    if (appointment.status !== "checked_in") {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "checked_in" },
      });
    }
    invalidateQueueCache(session.user.salonId);
    return { success: true, position: existingEntry.position, alreadyInQueue: true };
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
        customerId: appointment.customerId,
        appointmentId,
        position,
        status: appointment.employeeId ? "assigned" : "waiting",
        employeeId: appointment.employeeId,
        services: {
          create: [{ serviceId: appointment.serviceId }],
        },
      },
    }),
  ]);

  invalidateQueueCache(session.user.salonId);
  return { success: true, position };
}

export async function checkInCustomer(formData: FormData) {
  const session = await requireSession();
  const serviceIds = formData.getAll("serviceIds") as string[];

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

  const position = await getNextPosition(session.user.salonId);

  const customer = await upsertCustomer(session.user.salonId, {
    customerId: parsed.data.customerId,
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
  });

  await prisma.queueEntry.create({
    data: {
      salonId: session.user.salonId,
      customerId: customer.id,
      position,
      status: "waiting",
      services: {
        create: parsed.data.serviceIds.map((serviceId) => ({ serviceId })),
      },
    },
  });

  invalidateQueueCache(session.user.salonId);
  return { success: true, position };
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

  await prisma.queueEntry.update({
    where: { id: queueEntryId },
    data: { status: "in_progress", startedAt: new Date() },
  });

  invalidateQueueCache(session.user.salonId);
  return { success: true };
}

export async function completeService(queueEntryId: string) {
  const session = await requireSession();
  const entry = await prisma.queueEntry.findFirst({
    where: { id: queueEntryId, salonId: session.user.salonId },
    include: { seat: true },
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
    data: { status: "completed", completedAt: new Date() },
  });

  invalidateQueueCache(session.user.salonId);
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
  return prisma.queueEntry.findMany({
    where: { salonId: session.user.salonId, status: "completed" },
    include: {
      customer: true,
      services: { include: { service: true } },
      invoices: { select: { id: true, status: true, paymentMethod: true, total: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 10,
  });
}

export async function getEstimatedWaitMinutes() {
  const session = await requireSession();
  return getCachedEstimatedWait(session.user.salonId);
}
