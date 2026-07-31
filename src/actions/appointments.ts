"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import {
  startOfDay,
  endOfDay,
  addDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { upsertCustomer } from "@/lib/customers";

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
  const session = await requireSession();
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });

  return prisma.appointment.findMany({
    where: {
      salonId: session.user.salonId,
      scheduledAt: { gte: start, lte: end },
    },
    include: {
      customer: true,
      service: { include: { category: true } },
      employee: true,
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createAppointment(formData: FormData) {
  const session = await requireSession();

  const raw = {
    customerId: (formData.get("customerId") as string) || undefined,
    customerName: formData.get("customerName") as string,
    customerPhone: (formData.get("customerPhone") as string) || undefined,
    serviceId: formData.get("serviceId") as string,
    employeeId: (formData.get("employeeId") as string) || undefined,
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

  const appointment = await prisma.appointment.create({
    data: {
      salonId: session.user.salonId,
      customerId: customer.id,
      serviceId: parsed.data.serviceId,
      employeeId: parsed.data.employeeId || null,
      scheduledAt: new Date(parsed.data.scheduledAt),
      notes: parsed.data.notes,
    },
  });

  const salon = await prisma.salon.findUnique({
    where: { id: session.user.salonId },
  });
  if (salon) {
    const { scheduleAppointmentReminder } = await import("@/actions/sms");
    await scheduleAppointmentReminder(appointment.id, salon.name);
  }

  revalidatePath("/sales/appointments");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/customers");
  return { success: true };
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
  return { success: true };
}
