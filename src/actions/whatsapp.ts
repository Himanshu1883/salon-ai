"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireOwnerOrManager } from "@/lib/auth";
import { revalidateSalonCache } from "@/lib/salon-cache";
import {
  DEFAULT_BILLING_MESSAGE_TEMPLATE,
  buildBillingWhatsAppMessage,
  buildTemplateVariables,
} from "@/lib/whatsapp";
import type { WhatsAppInvoiceContext } from "@/lib/whatsapp";
import { getPublicInvoiceUrl } from "@/lib/salon-paths";
import { cachedBySalon } from "@/lib/salon-cache";

async function getOrCreateWhatsAppSettings(salonId: string) {
  let settings = await prisma.whatsAppSettings.findUnique({
    where: { salonId },
  });
  if (!settings) {
    settings = await prisma.whatsAppSettings.create({
      data: {
        salonId,
        billingMessageTemplate: DEFAULT_BILLING_MESSAGE_TEMPLATE,
      },
    });
  }
  return settings;
}

const getCachedWhatsAppBillingSettings = cachedBySalon(
  "billing",
  async (salonId: string) => {
    const settings = await prisma.whatsAppSettings.findUnique({
      where: { salonId },
      select: {
        billingMessageTemplate: true,
        autoOpenAfterPayment: true,
      },
    });
    return {
      billingMessageTemplate:
        settings?.billingMessageTemplate ?? DEFAULT_BILLING_MESSAGE_TEMPLATE,
      autoOpenAfterPayment: settings?.autoOpenAfterPayment ?? false,
    };
  },
  { revalidate: 120, key: "whatsapp-settings" }
);

export async function getWhatsAppSettingsAction() {
  const session = await requireSession();
  return getCachedWhatsAppBillingSettings(session.user.salonId!);
}

const updateSchema = z.object({
  billingMessageTemplate: z
    .string()
    .min(20, "Template must be at least 20 characters")
    .max(4000, "Template is too long"),
  autoOpenAfterPayment: z.boolean(),
});

export async function updateWhatsAppSettings(data: {
  billingMessageTemplate: string;
  autoOpenAfterPayment: boolean;
}) {
  const session = await requireOwnerOrManager();
  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  await prisma.whatsAppSettings.upsert({
    where: { salonId: session.user.salonId },
    create: {
      salonId: session.user.salonId,
      billingMessageTemplate: parsed.data.billingMessageTemplate,
      autoOpenAfterPayment: parsed.data.autoOpenAfterPayment,
    },
    update: {
      billingMessageTemplate: parsed.data.billingMessageTemplate,
      autoOpenAfterPayment: parsed.data.autoOpenAfterPayment,
    },
  });

  revalidateSalonCache(session.user.salonId!, "billing");
  revalidatePath("/settings/whatsapp");
  revalidatePath("/billing");
  return { success: true as const };
}

export async function getBillingWhatsAppPreview(
  template: string,
  sampleContext?: Partial<WhatsAppInvoiceContext>
) {
  await requireSession();

  const ctx: WhatsAppInvoiceContext = {
    invoiceId: "sample-id",
    invoiceNumber: "INV-2026-000123",
    customerName: sampleContext?.customerName ?? "Priya Sharma",
    customerPhone: sampleContext?.customerPhone ?? "9876543210",
    amount: sampleContext?.amount ?? 2499,
    paymentMethod: sampleContext?.paymentMethod ?? "upi",
    paidAt: sampleContext?.paidAt ?? new Date(),
    staffName: sampleContext?.staffName ?? "Ananya",
    salonName: sampleContext?.salonName ?? "Glow Studio",
    services: sampleContext?.services ?? "Hair Spa, Blow Dry",
  };

  const invoiceUrl = getPublicInvoiceUrl("sample-id");
  return buildBillingWhatsAppMessage(template, ctx, invoiceUrl);
}

export async function getSalonBillingWhatsAppTemplate(salonId: string) {
  const settings = await getOrCreateWhatsAppSettings(salonId);
  return {
    billingMessageTemplate: settings.billingMessageTemplate,
    autoOpenAfterPayment: settings.autoOpenAfterPayment,
  };
}

export { buildTemplateVariables, buildBillingWhatsAppMessage };
