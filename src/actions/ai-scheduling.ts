"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { aiSchedulingSchema } from "@/lib/validations";
import { findBestSlots, enrichWithAiExplanation } from "@/lib/ai-scheduling";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function getAiSchedulingSuggestions(formData: FormData) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const raw = {
    customerName: formData.get("customerName") as string,
    serviceIds: formData.getAll("serviceIds") as string[],
    dateFrom: formData.get("dateFrom") as string,
    dateTo: formData.get("dateTo") as string,
    preferredEmployeeId: (formData.get("preferredEmployeeId") as string) || undefined,
  };

  const parsed = aiSchedulingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const serviceId = parsed.data.serviceIds[0];
  const dateFrom = startOfDay(new Date(parsed.data.dateFrom));
  const dateTo = endOfDay(new Date(parsed.data.dateTo || parsed.data.dateFrom));

  const [service, employees, appointments, salon, seats] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, salonId } }),
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      include: { services: true },
    }),
    prisma.appointment.findMany({
      where: {
        salonId,
        scheduledAt: { gte: dateFrom, lte: dateTo },
        status: { not: "cancelled" },
      },
      include: { service: true },
    }),
    prisma.salon.findUnique({ where: { id: salonId } }),
    prisma.seat.findMany({ where: { salonId } }),
  ]);

  if (!service) return { error: "Service not found" };

  const occupiedSeats = seats.filter((s) => s.status === "occupied").length;

  const slots = findBestSlots(
    employees,
    service,
    appointments,
    salon?.totalSeats ?? 4,
    occupiedSeats,
    dateFrom,
    dateTo,
    parsed.data.preferredEmployeeId
  );

  const enriched = await enrichWithAiExplanation(
    slots,
    parsed.data.customerName,
    service.name
  );

  return {
    success: true,
    suggestions: enriched.map((s) => ({
      ...s,
      scheduledAt: s.scheduledAt.toISOString(),
    })),
    service: { id: service.id, name: service.name, duration: service.duration },
    openAiEnabled: !!process.env.OPENAI_API_KEY,
  };
}

export async function bookSuggestedSlot(formData: FormData) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const customerName = formData.get("customerName") as string;
  const customerPhone = (formData.get("customerPhone") as string) || undefined;
  const serviceId = formData.get("serviceId") as string;
  const employeeId = (formData.get("employeeId") as string) || undefined;
  const scheduledAt = formData.get("scheduledAt") as string;

  if (!customerName || !serviceId || !scheduledAt) {
    return { error: "Missing required fields" };
  }

  const customer = await prisma.customer.create({
    data: { salonId, name: customerName, phone: customerPhone },
  });

  const appointment = await prisma.appointment.create({
    data: {
      salonId,
      customerId: customer.id,
      serviceId,
      employeeId: employeeId || null,
      scheduledAt: new Date(scheduledAt),
      notes: "Booked via AI scheduling",
    },
  });

  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (salon && customerPhone) {
    const { scheduleAppointmentReminder } = await import("@/actions/sms");
    await scheduleAppointmentReminder(appointment.id, salon.name);
  }

  revalidatePath("/sales/appointments");
  revalidatePath("/appointments");
  revalidatePath("/schedule/ai");
  revalidatePath("/dashboard");
  return { success: true, appointmentId: appointment.id };
}

export async function getAiSchedulingContext() {
  const session = await requireSession();

  const [services, employees] = await Promise.all([
    prisma.service.findMany({
      where: { salonId: session.user.salonId },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: { salonId: session.user.salonId, status: "active" },
      orderBy: { name: "asc" },
    }),
  ]);

  const defaultFrom = startOfDay(new Date()).toISOString().slice(0, 10);
  const defaultTo = endOfDay(addDays(new Date(), 7)).toISOString().slice(0, 10);

  return {
    services,
    employees,
    defaultFrom,
    defaultTo,
    openAiEnabled: !!process.env.OPENAI_API_KEY,
  };
}
