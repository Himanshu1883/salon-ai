"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from "date-fns";
import { upsertCustomer } from "@/lib/customers";
import { scheduleSalonCacheRevalidation, cachedBySalon, salonCacheTag } from "@/lib/salon-cache";
import { cachedRead } from "@/lib/memory-cache";
import { unstable_cache } from "next/cache";
import { assertEmployeeAvailableForSlot } from "@/lib/appointments/availability";
import { parseAppointmentDateTime } from "@/lib/appointments/datetime";
import {
  parseOpeningHours,
  validateAppointmentAgainstSalonHours,
} from "@/lib/appointments/salon-hours";
import {
  getSequentialSlotStart,
  getTotalDuration,
} from "@/lib/appointments/visit-group";
import { deriveAppointmentStatusFromItems } from "@/lib/appointments/service-items";
import {
  appointmentVisitScopeWhere,
  getDataScopeContext,
} from "@/lib/permissions/data-scope";
import { ensureInProgressQueueEntry } from "@/lib/queue/check-in-from-appointment";
import { invalidateQueueCache } from "@/lib/queue/invalidate-cache";

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

const appointmentServiceItemSelect = {
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

const appointmentListSelect = {
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

function revalidateAppointmentPages(salonId: string) {
  revalidatePath("/sales/appointments");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  revalidatePath("/team/analytics");
  scheduleSalonCacheRevalidation(salonId, "staff-analytics", "appointments");
}

function scheduleAppointmentPageRevalidation(salonId: string) {
  after(() => {
    revalidateAppointmentPages(salonId);
  });
}

function scheduleQueueRevalidation(salonId: string) {
  after(() => {
    invalidateQueueCache(salonId);
  });
}

async function fetchAppointmentsInRange(
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

export async function getAppointmentsInRange(start: Date, end: Date) {
  const ctx = await getDataScopeContext();
  const salonId = ctx.salonId;
  const employeeId = ctx.dataScope === "own" ? ctx.employeeId : null;
  if (ctx.dataScope === "own" && !employeeId) return [];

  // Staff must see their own book live — shared salon cache can serve an empty
  // "all staff" snapshot and hide rows the dashboard already shows.
  if (employeeId) {
    return fetchAppointmentsInRange(salonId, start, end, employeeId);
  }

  const rangeKey = `${start.toISOString().slice(0, 10)}:${end.toISOString().slice(0, 10)}`;

  return cachedRead(
    `salon-cache:appointments:range:${salonId}:all:${rangeKey}`,
    60,
    () =>
      unstable_cache(
        () => fetchAppointmentsInRange(salonId, start, end),
        ["appointments", "range", salonId, "all", rangeKey],
        { revalidate: 60, tags: [salonCacheTag(salonId, "appointments")] }
      )()
  );
}

export async function getAppointments(filter: "today" | "upcoming" = "upcoming") {
  const ctx = await getDataScopeContext();
  const now = new Date();

  const dateFilter =
    filter === "today"
      ? { gte: startOfDay(now), lte: endOfDay(now) }
      : { gte: startOfDay(now), lte: endOfDay(addDays(now, 30)) };

  return prisma.appointment.findMany({
    where: {
      ...appointmentVisitScopeWhere(ctx),
      scheduledAt: dateFilter,
      status: { not: "cancelled" },
    },
    select: appointmentListSelect,
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
  const scope = await getDataScopeContext();

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
    select: { id: true, duration: true, price: true },
  });

  if (serviceRecords.length !== parsed.data.serviceLines.length) {
    return { error: "One or more selected services were not found" };
  }

  const durationByServiceId = new Map(
    serviceRecords.map((service) => [service.id, service.duration])
  );
  const priceByServiceId = new Map(
    serviceRecords.map((service) => [service.id, service.price])
  );
  const lineDurations = parsed.data.serviceLines.map(
    (line) => durationByServiceId.get(line.serviceId) ?? 0
  );
  const totalDuration = getTotalDuration(lineDurations);
  const scheduledAt = parseAppointmentDateTime(parsed.data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Enter a valid date and time" };
  }

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

    if (scope.dataScope === "own" && scope.employeeId) {
      line.employeeId = scope.employeeId;
    }

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

  const createdAppointment = await prisma.$transaction(async (tx) => {
    priorDurations = [];
    const firstLine = parsed.data.serviceLines[0];
    if (!firstLine) {
      throw new Error("Add at least one service");
    }

    const appointment = await tx.appointment.create({
      data: {
        salonId: session.user.salonId,
        customerId: customer.id,
        serviceId: firstLine.serviceId,
        employeeId:
          scope.dataScope === "own"
            ? scope.employeeId
            : firstLine.employeeId || null,
        scheduledAt,
        notes: parsed.data.notes?.trim() || null,
      },
    });

    for (const [index, line] of parsed.data.serviceLines.entries()) {
      const duration = durationByServiceId.get(line.serviceId) ?? 0;
      const slotStart = getSequentialSlotStart(scheduledAt, priorDurations);
      await tx.appointmentServiceItem.create({
        data: {
          appointmentId: appointment.id,
          serviceId: line.serviceId,
          employeeId:
            scope.dataScope === "own"
              ? scope.employeeId
              : line.employeeId || null,
          price: priceByServiceId.get(line.serviceId) ?? 0,
          duration,
          status: "scheduled",
          scheduledAt: slotStart,
          sortOrder: index,
        },
      });
      priorDurations = [...priorDurations, duration];
    }

    return appointment;
  });

  if (salon && createdAppointment) {
    const { scheduleAppointmentReminder } = await import("@/actions/sms");
    await scheduleAppointmentReminder(
      createdAppointment.id,
      salon.name ?? "Salon"
    );
  }

  revalidateAppointmentPages(session.user.salonId!);
  return { success: true, id: createdAppointment.id };
}

function canAccessAppointment(
  scope: { dataScope: string; employeeId: string | null },
  appointment: {
    employeeId: string | null;
    serviceItems?: Array<{ employeeId: string | null }>;
  }
) {
  if (scope.dataScope !== "own") return true;
  if (!scope.employeeId) return false;
  if (appointment.employeeId === scope.employeeId) return true;
  return Boolean(
    appointment.serviceItems?.some((item) => item.employeeId === scope.employeeId)
  );
}

export async function updateAppointmentStatus(
  id: string,
  status: string
) {
  const session = await requireSession();
  const scope = await getDataScopeContext();
  const appointment = await prisma.appointment.findFirst({
    where: { id, salonId: session.user.salonId },
    include: {
      service: true,
      serviceItems: { select: { id: true, employeeId: true, serviceId: true } },
    },
  });
  if (!appointment) return { error: "Appointment not found" };
  if (!canAccessAppointment(scope, appointment)) {
    return { error: "Appointment not found" };
  }

  const wasCompleted = appointment.status === "completed";
  const isCompleting = status === "completed" && !wasCompleted;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: { status },
    });

    if (isCompleting) {
      await tx.appointmentServiceItem.updateMany({
        where: {
          appointmentId: id,
          status: { notIn: ["cancelled", "no_show"] },
        },
        data: { status: "completed", completedAt: now },
      });
      await tx.queueEntry.updateMany({
        where: {
          salonId: session.user.salonId,
          appointmentId: id,
          status: { in: ["waiting", "assigned", "in_progress"] },
        },
        data: { status: "completed", completedAt: now },
      });
    }

    if (status === "cancelled") {
      await tx.appointmentServiceItem.updateMany({
        where: {
          appointmentId: id,
          status: { notIn: ["completed"] },
        },
        data: { status: "cancelled" },
      });
    }
  });

  if (isCompleting) {
    const { consumeServiceRecipesForAppointment } = await import(
      "@/lib/inventory/ledger"
    );
    const itemServiceIds =
      appointment.serviceItems.length > 0
        ? appointment.serviceItems.map((item) => item.serviceId)
        : [appointment.serviceId];
    for (const serviceId of [...new Set(itemServiceIds)]) {
      await consumeServiceRecipesForAppointment(
        session.user.salonId,
        appointment.id,
        serviceId,
        appointment.customerId,
        appointment.employeeId,
        session.user.id
      );
    }
    revalidatePath("/inventory");
    revalidatePath("/inventory/consumption");
    revalidatePath("/inventory/ledger");
    revalidatePath("/inventory/products");
  }

  revalidateAppointmentPages(session.user.salonId!);
  return { success: true };
}

export async function updateAppointmentServiceItemStatus(
  itemId: string,
  status: string
) {
  const session = await requireSession();
  const scope = await getDataScopeContext();
  const item = await prisma.appointmentServiceItem.findFirst({
    where: {
      id: itemId,
      appointment: { salonId: session.user.salonId },
    },
    include: {
      appointment: {
        select: {
          id: true,
          customerId: true,
          employeeId: true,
          status: true,
          serviceItems: {
            select: {
              id: true,
              status: true,
              employeeId: true,
              serviceId: true,
            },
          },
        },
      },
    },
  });
  if (!item) return { error: "Service not found" };
  if (!canAccessAppointment(scope, item.appointment)) {
    return { error: "Service not found" };
  }
  if (scope.dataScope === "own" && item.employeeId && item.employeeId !== scope.employeeId) {
    return { error: "Service not found" };
  }

  const now = new Date();
  const data: {
    status: string;
    startedAt?: Date;
    completedAt?: Date;
  } = { status };
  if (status === "in_progress") {
    data.startedAt = item.startedAt ?? now;
  }
  if (status === "completed") {
    data.completedAt = now;
    if (!item.startedAt) data.startedAt = now;
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointmentServiceItem.update({
      where: { id: itemId },
      data,
    });

    const remaining = item.appointment.serviceItems.map((row) =>
      row.id === itemId ? status : row.status
    );
    const nextVisitStatus = deriveAppointmentStatusFromItems(remaining);
    if (nextVisitStatus && nextVisitStatus !== item.appointment.status) {
      await tx.appointment.update({
        where: { id: item.appointment.id },
        data: { status: nextVisitStatus },
      });
    } else if (status === "in_progress" && item.appointment.status === "scheduled") {
      await tx.appointment.update({
        where: { id: item.appointment.id },
        data: { status: "checked_in" },
      });
    }

    if (status === "in_progress") {
      const serviceIds = [
        ...new Set(
          item.appointment.serviceItems
            .filter((row) => row.status !== "cancelled")
            .map((row) => row.serviceId)
        ),
      ];
      await ensureInProgressQueueEntry(tx, {
        salonId: session.user.salonId!,
        appointmentId: item.appointment.id,
        customerId: item.appointment.customerId,
        employeeId: item.employeeId,
        serviceIds,
      });
    }

    if (nextVisitStatus === "completed") {
      await tx.queueEntry.updateMany({
        where: {
          salonId: session.user.salonId!,
          appointmentId: item.appointment.id,
          status: { in: ["waiting", "assigned", "in_progress"] },
        },
        data: { status: "completed", completedAt: now },
      });
    }
  });

  scheduleQueueRevalidation(session.user.salonId!);
  return { success: true };
}

export async function startAppointmentVisit(appointmentId: string) {
  const session = await requireSession();
  const scope = await getDataScopeContext();
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, salonId: session.user.salonId },
    select: {
      id: true,
      customerId: true,
      employeeId: true,
      status: true,
      serviceItems: {
        select: {
          id: true,
          status: true,
          employeeId: true,
          serviceId: true,
          startedAt: true,
        },
      },
    },
  });
  if (!appointment) return { error: "Appointment not found" };
  if (!canAccessAppointment(scope, appointment)) {
    return { error: "Appointment not found" };
  }

  const toStart = appointment.serviceItems.filter((item) => {
    if (item.status !== "scheduled") return false;
    if (scope.dataScope === "own") {
      return Boolean(item.employeeId && item.employeeId === scope.employeeId);
    }
    return true;
  });
  if (toStart.length === 0) {
    return { error: "No services to start" };
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.appointmentServiceItem.updateMany({
      where: { id: { in: toStart.map((item) => item.id) } },
      data: { status: "in_progress", startedAt: now },
    });

    const remaining = appointment.serviceItems.map((row) =>
      toStart.some((item) => item.id === row.id) ? "in_progress" : row.status
    );
    const nextVisitStatus = deriveAppointmentStatusFromItems(remaining);
    if (nextVisitStatus && nextVisitStatus !== appointment.status) {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: nextVisitStatus },
      });
    } else if (appointment.status === "scheduled") {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: "checked_in" },
      });
    }

    const serviceIds = [
      ...new Set(
        appointment.serviceItems
          .filter((row) => row.status !== "cancelled")
          .map((row) => row.serviceId)
      ),
    ];
    await ensureInProgressQueueEntry(tx, {
      salonId: session.user.salonId!,
      appointmentId: appointment.id,
      customerId: appointment.customerId,
      employeeId: toStart[0]?.employeeId ?? appointment.employeeId,
      serviceIds,
    });
  });

  scheduleQueueRevalidation(session.user.salonId!);
  return { success: true };
}

export async function addAppointmentServiceLine(
  appointmentId: string,
  input: { serviceId: string; employeeId?: string }
) {
  const session = await requireSession();
  const scope = await getDataScopeContext();
  if (scope.dataScope === "own") {
    return { error: "You cannot add services to this appointment" };
  }

  const [appointment, service] = await Promise.all([
    prisma.appointment.findFirst({
      where: { id: appointmentId, salonId: session.user.salonId },
      include: {
        serviceItems: {
          orderBy: { sortOrder: "desc" },
          take: 1,
          select: { scheduledAt: true, duration: true, sortOrder: true },
        },
      },
    }),
    prisma.service.findFirst({
      where: { id: input.serviceId, salonId: session.user.salonId },
      select: { id: true, duration: true, price: true },
    }),
  ]);
  if (!appointment) return { error: "Appointment not found" };
  if (appointment.status === "cancelled") {
    return { error: "Cannot add a service to a cancelled appointment" };
  }
  if (!service) return { error: "Service not found" };

  const lastItem = appointment.serviceItems[0];
  const slotStart = lastItem
    ? getSequentialSlotStart(new Date(lastItem.scheduledAt), [lastItem.duration])
    : appointment.scheduledAt;
  const employeeId = input.employeeId || null;

  if (employeeId) {
    const availability = await assertEmployeeAvailableForSlot(
      session.user.salonId,
      employeeId,
      slotStart,
      service.duration
    );
    if (availability.error) return { error: availability.error };
  }

  const created = await prisma.appointmentServiceItem.create({
    data: {
      appointmentId,
      serviceId: service.id,
      employeeId,
      price: service.price,
      duration: service.duration,
      status: "scheduled",
      scheduledAt: slotStart,
      sortOrder: (lastItem?.sortOrder ?? 0) + 1,
    },
    select: appointmentServiceItemSelect,
  });

  scheduleAppointmentPageRevalidation(session.user.salonId!);
  return { success: true, item: created };
}

export async function deleteAppointment(id: string) {
  const session = await requireSession();
  const scope = await getDataScopeContext();
  const appointment = await prisma.appointment.findFirst({
    where: { id, salonId: session.user.salonId },
    include: { serviceItems: { select: { employeeId: true } } },
  });
  if (!appointment) return { error: "Appointment not found" };
  if (!canAccessAppointment(scope, appointment)) {
    return { error: "Appointment not found" };
  }

  await prisma.appointment.delete({ where: { id } });
  revalidateAppointmentPages(session.user.salonId!);
  return { success: true };
}
