"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, max } from "date-fns";
import { upsertCustomer } from "@/lib/customers";
import { scheduleSalonCacheRevalidation, cachedBySalon, salonCacheTag } from "@/lib/salon-cache";
import { cachedRead } from "@/lib/memory-cache";
import { unstable_cache } from "next/cache";
import { assertEmployeeAvailableForSlot } from "@/lib/appointments/availability";
import {
  parseOpeningHours,
  validateAppointmentAgainstSalonHours,
} from "@/lib/appointments/salon-hours";
import {
  createVisitGroupMarker,
  getSequentialSlotStart,
  getTotalDuration,
} from "@/lib/appointments/visit-group";

export async function getSalonOpeningHours() {
  const session = await requireSession();
  return getCachedSalonOpeningHours(session.user.salonId!);
}

const getCachedSalonOpeningHours = cachedBySalon(
  "appointments",
  async (salonId: string) => {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { openingHours: true },
    });
    return parseOpeningHours(salon?.openingHours);
  },
  { revalidate: 300, key: "opening-hours" }
);

async function fetchAppointmentsInRange(
  salonId: string,
  start: Date,
  end: Date
) {
  return prisma.appointment.findMany({
    where: {
      salonId,
      scheduledAt: { gte: start, lte: end },
      status: { not: "cancelled" },
    },
    select: {
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
          category: { select: { id: true, name: true } },
        },
      },
      employee: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getAppointmentsInRange(start: Date, end: Date) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const rangeKey = `${start.toISOString().slice(0, 10)}:${end.toISOString().slice(0, 10)}`;

  return cachedRead(
    `salon-cache:appointments:range:${salonId}:${rangeKey}`,
    60,
    () =>
      unstable_cache(
        () => fetchAppointmentsInRange(salonId, start, end),
        ["appointments", "range", salonId, rangeKey],
        { revalidate: 60, tags: [salonCacheTag(salonId, "appointments")] }
      )()
  );
}

export async function getAppointments(filter: "today" | "upcoming" = "upcoming") {
  const session = await requireSession();
  const now = new Date();

  const dateFilter =
    filter === "today"
      ? { gte: startOfDay(now), lte: endOfDay(now) }
      : { gte: startOfDay(now), lte: endOfDay(addDays(now, 30)) };

  return prisma.appointment.findMany({
    where: {
      salonId: session.user.salonId,
      scheduledAt: dateFilter,
      status: { not: "cancelled" },
    },
    include: {
      customer: true,
      service: true,
      employee: true,
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getAppointmentsForWeek(weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });
  return getAppointmentsInRange(start, end);
}

export async function createAppointment(formData: FormData) {
  const session = await requireSession();

  let serviceLines: { serviceId: string; employeeId?: string }[] = [];
  const serviceLinesRaw = formData.get("serviceLines") as string | null;
  if (serviceLinesRaw) {
    try {
      const parsedLines = JSON.parse(serviceLinesRaw);
      if (Array.isArray(parsedLines)) {
        serviceLines = parsedLines;
      }
    } catch {
      return { error: "Invalid service selection" };
    }
  }

  const raw = {
    customerId: (formData.get("customerId") as string) || undefined,
    customerName: formData.get("customerName") as string,
    customerPhone: formData.get("customerPhone") as string,
    serviceLines,
    scheduledAt: formData.get("scheduledAt") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const customer = await upsertCustomer(session.user.salonId, {
    customerId: parsed.data.customerId,
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
  });

  const serviceRecords = await prisma.service.findMany({
    where: {
      salonId: session.user.salonId,
      id: { in: parsed.data.serviceLines.map((line) => line.serviceId) },
    },
    select: { id: true, duration: true },
  });

  if (serviceRecords.length !== parsed.data.serviceLines.length) {
    return { error: "One or more selected services were not found" };
  }

  const durationByServiceId = new Map(
    serviceRecords.map((service) => [service.id, service.duration])
  );
  const lineDurations = parsed.data.serviceLines.map(
    (line) => durationByServiceId.get(line.serviceId) ?? 0
  );
  const totalDuration = getTotalDuration(lineDurations);
  const scheduledAt = new Date(parsed.data.scheduledAt);

  const salon = await prisma.salon.findUnique({
    where: { id: session.user.salonId },
    select: { openingHours: true, name: true },
  });
  const openingHours = parseOpeningHours(salon?.openingHours);
  const hoursCheck = validateAppointmentAgainstSalonHours(
    openingHours,
    scheduledAt,
    totalDuration
  );
  if (!hoursCheck.ok) {
    return { error: hoursCheck.error };
  }

  let priorDurations: number[] = [];
  for (const line of parsed.data.serviceLines) {
    const duration = durationByServiceId.get(line.serviceId) ?? 0;
    const slotStart = getSequentialSlotStart(scheduledAt, priorDurations);

    if (line.employeeId) {
      const availability = await assertEmployeeAvailableForSlot(
        session.user.salonId,
        line.employeeId,
        slotStart,
        duration
      );
      if (availability.error) {
        return { error: availability.error };
      }
    }

    priorDurations = [...priorDurations, duration];
  }

  const visitGroupId = randomUUID();
  const visitNotes = createVisitGroupMarker(visitGroupId, parsed.data.notes);

  const createdAppointments = await prisma.$transaction(async (tx) => {
    priorDurations = [];
    const appointments = [];

    for (const [index, line] of parsed.data.serviceLines.entries()) {
      const duration = durationByServiceId.get(line.serviceId) ?? 0;
      const slotStart = getSequentialSlotStart(scheduledAt, priorDurations);

      const appointment = await tx.appointment.create({
        data: {
          salonId: session.user.salonId,
          customerId: customer.id,
          serviceId: line.serviceId,
          employeeId: line.employeeId || null,
          scheduledAt: slotStart,
          notes: index === 0 ? visitNotes : createVisitGroupMarker(visitGroupId),
        },
      });

      appointments.push(appointment);
      priorDurations = [...priorDurations, duration];
    }

    return appointments;
  });

  if (salon && createdAppointments[0]) {
    const { scheduleAppointmentReminder } = await import("@/actions/sms");
    await scheduleAppointmentReminder(
      createdAppointments[0].id,
      salon.name ?? "Salon"
    );
  }

  revalidatePath("/sales/appointments");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  revalidatePath("/team/analytics");
  scheduleSalonCacheRevalidation(session.user.salonId!, "staff-analytics", "appointments");
  return { success: true, id: createdAppointments[0]?.id };
}

export async function updateAppointmentStatus(
  id: string,
  status: string
) {
  const session = await requireSession();
  const appointment = await prisma.appointment.findFirst({
    where: { id, salonId: session.user.salonId },
    include: { service: true },
  });
  if (!appointment) return { error: "Appointment not found" };

  const wasCompleted = appointment.status === "completed";
  const isCompleting = status === "completed" && !wasCompleted;

  await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  if (isCompleting) {
    const { consumeServiceRecipesForAppointment } = await import(
      "@/lib/inventory/ledger"
    );
    await consumeServiceRecipesForAppointment(
      session.user.salonId,
      appointment.id,
      appointment.serviceId,
      appointment.customerId,
      appointment.employeeId,
      session.user.id
    );
    revalidatePath("/inventory");
    revalidatePath("/inventory/consumption");
    revalidatePath("/inventory/ledger");
    revalidatePath("/inventory/products");
  }

  revalidatePath("/sales/appointments");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/team/analytics");
  scheduleSalonCacheRevalidation(session.user.salonId!, "staff-analytics", "appointments");
  return { success: true };
}

export async function deleteAppointment(id: string) {
  const session = await requireSession();
  const appointment = await prisma.appointment.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!appointment) return { error: "Appointment not found" };

  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/sales/appointments");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/team/analytics");
  scheduleSalonCacheRevalidation(session.user.salonId!, "staff-analytics", "appointments");
  return { success: true };
}
