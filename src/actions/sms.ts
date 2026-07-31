"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  sendSms,
  isTwilioConfigured,
  buildAppointmentReminderMessage,
} from "@/lib/sms";
import { revalidatePath } from "next/cache";
import { subHours } from "date-fns";

export async function getSmsConfig() {
  await requireSession();
  return {
    twilioConfigured: isTwilioConfigured(),
    demoMode: !isTwilioConfigured(),
  };
}

export async function getSmsReminders(filter?: "pending" | "sent" | "failed" | "all") {
  const session = await requireSession();

  const where: Record<string, unknown> = { salonId: session.user.salonId };
  if (filter && filter !== "all") {
    where.status = filter;
  }

  return prisma.smsReminder.findMany({
    where,
    include: {
      appointment: {
        include: { customer: true, service: true },
      },
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });
}

export async function getPendingSmsCountForSalon(salonId: string) {
  return prisma.smsReminder.count({
    where: { salonId, status: "pending" },
  });
}

export async function getPendingSmsCount() {
  const session = await requireSession();
  return getPendingSmsCountForSalon(session.user.salonId);
}

export async function scheduleAppointmentReminder(
  appointmentId: string,
  salonName: string
) {
  const session = await requireSession();

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, salonId: session.user.salonId },
    include: { customer: true, service: true },
  });
  if (!appointment || !appointment.customer.phone) return;

  const scheduledAt = subHours(new Date(appointment.scheduledAt), 24);
  if (scheduledAt <= new Date()) return;

  await prisma.smsReminder.deleteMany({
    where: {
      appointmentId,
      salonId: session.user.salonId,
      status: "pending",
    },
  });

  const message = buildAppointmentReminderMessage(
    appointment.customer.name,
    appointment.service.name,
    new Date(appointment.scheduledAt),
    salonName
  );

  await prisma.smsReminder.create({
    data: {
      salonId: session.user.salonId,
      type: "appointment_reminder",
      recipientPhone: appointment.customer.phone,
      recipientName: appointment.customer.name,
      message,
      scheduledAt,
      appointmentId,
    },
  });
}

export async function sendManualSms(formData: FormData) {
  const session = await requireSession();

  const recipientPhone = formData.get("recipientPhone") as string;
  const recipientName = formData.get("recipientName") as string;
  const message = formData.get("message") as string;
  const appointmentId = (formData.get("appointmentId") as string) || undefined;

  if (!recipientPhone || !recipientName || !message) {
    return { error: "Phone, name, and message are required" };
  }

  const reminder = await prisma.smsReminder.create({
    data: {
      salonId: session.user.salonId,
      type: appointmentId ? "appointment_reminder" : "follow_up",
      recipientPhone,
      recipientName,
      message,
      scheduledAt: new Date(),
      appointmentId: appointmentId || null,
    },
  });

  const result = await processReminder(reminder.id, session.user.salonId);

  revalidatePath("/settings/notifications");
  revalidatePath("/dashboard");
  return result;
}

async function processReminder(reminderId: string, salonId: string) {
  const reminder = await prisma.smsReminder.findFirst({
    where: { id: reminderId, salonId },
  });
  if (!reminder || reminder.status !== "pending") {
    return { error: "Reminder not found or already processed" };
  }

  const result = await sendSms(reminder.recipientPhone, reminder.message);

  if (result.success) {
    await prisma.smsReminder.update({
      where: { id: reminderId },
      data: { status: "sent", sentAt: new Date() },
    });
    return { success: true, demoMode: result.demoMode };
  }

  await prisma.smsReminder.update({
    where: { id: reminderId },
    data: { status: "failed" },
  });
  return { error: result.error ?? "Failed to send SMS" };
}

export async function retrySmsReminder(id: string) {
  const session = await requireSession();

  const reminder = await prisma.smsReminder.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!reminder) return { error: "Reminder not found" };

  await prisma.smsReminder.update({
    where: { id },
    data: { status: "pending" },
  });

  const result = await processReminder(id, session.user.salonId);
  revalidatePath("/settings/notifications");
  revalidatePath("/dashboard");
  return result;
}

export async function cancelSmsReminder(id: string) {
  const session = await requireSession();

  const reminder = await prisma.smsReminder.findFirst({
    where: { id, salonId: session.user.salonId, status: "pending" },
  });
  if (!reminder) return { error: "Pending reminder not found" };

  await prisma.smsReminder.update({
    where: { id },
    data: { status: "cancelled" },
  });

  revalidatePath("/settings/notifications");
  return { success: true };
}

export async function processDueReminders(salonId?: string) {
  const now = new Date();
  const where: Record<string, unknown> = {
    status: "pending",
    scheduledAt: { lte: now },
  };
  if (salonId) where.salonId = salonId;

  const due = await prisma.smsReminder.findMany({ where, take: 20 });

  let sent = 0;
  let failed = 0;

  for (const reminder of due) {
    const result = await processReminder(reminder.id, reminder.salonId);
    if (result.success) sent++;
    else failed++;
  }

  return { processed: due.length, sent, failed };
}
