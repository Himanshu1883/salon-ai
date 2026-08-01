"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireOwnerOrManager } from "@/lib/auth";
import { revalidatePath, unstable_cache } from "next/cache";
import {
  getSubscriptionBillingForPlan,
  INVOICE_DUE_DAYS,
  TRIAL_DAYS,
  getMonthPeriod,
  addDays,
  type PaymentMethod,
} from "@/lib/subscription";
import { calculatePlatformInvoiceGst } from "@/lib/platform-billing";

export async function syncOverdueState(salonId: string) {
  const now = new Date();

  await prisma.platformInvoice.updateMany({
    where: {
      salonId,
      status: "sent",
      paidAt: null,
      dueDate: { lt: now },
    },
    data: { status: "overdue" },
  });

  const hasOverdue = await prisma.platformInvoice.findFirst({
    where: {
      salonId,
      status: "overdue",
      paidAt: null,
    },
  });

  if (hasOverdue) {
    await prisma.salonSubscription.updateMany({
      where: { salonId, status: { not: "suspended" } },
      data: { status: "past_due" },
    });
  }
}

async function generateInvoiceNumber(salonId: string, date = new Date()) {
  const year = date.getFullYear();
  const prefix = `SA-${year}-`;
  const latest = await prisma.platformInvoice.findFirst({
    where: {
      salonId,
      invoiceNumber: { startsWith: prefix },
    },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  const nextSequence = latest
    ? Number.parseInt(latest.invoiceNumber.slice(prefix.length), 10) + 1
    : 1;

  return `${prefix}${String(nextSequence).padStart(3, "0")}`;
}

export async function getSalonSubscription(salonId: string) {
  await syncOverdueState(salonId);

  return prisma.salonSubscription.findUnique({
    where: { salonId },
  });
}

export async function getPlatformInvoices(salonId: string) {
  await syncOverdueState(salonId);

  return prisma.platformInvoice.findMany({
    where: { salonId },
    orderBy: { dueDate: "desc" },
  });
}

export async function getOverduePlatformInvoiceReadOnly(salonId: string) {
  return prisma.platformInvoice.findFirst({
    where: {
      salonId,
      status: { in: ["sent", "overdue"] },
      paidAt: null,
      dueDate: { lt: new Date() },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getOverduePlatformInvoice(salonId: string) {
  await syncOverdueState(salonId);
  return getOverduePlatformInvoiceReadOnly(salonId);
}

async function isSalonAccessBlockedReadOnly(salonId: string): Promise<boolean> {
  const subscription = await prisma.salonSubscription.findUnique({
    where: { salonId },
  });
  if (!subscription) return false;

  if (
    subscription.status === "trial" &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt > new Date()
  ) {
    return false;
  }

  if (subscription.status === "suspended") {
    return true;
  }

  const overdueInvoice = await getOverduePlatformInvoiceReadOnly(salonId);
  return !!overdueInvoice;
}

const getCachedSalonAccessBlocked = unstable_cache(
  async (salonId: string) => isSalonAccessBlockedReadOnly(salonId),
  ["salon-access-blocked"],
  { revalidate: 60 }
);

/** Cached read-only check for layout/navigation (no write sync). */
export async function getSalonAccessBlocked(salonId: string): Promise<boolean> {
  return getCachedSalonAccessBlocked(salonId);
}

export async function isSalonAccessBlocked(salonId: string): Promise<boolean> {
  await syncOverdueState(salonId);
  return isSalonAccessBlockedReadOnly(salonId);
}

export async function syncAllSalonOverdueStates() {
  const salons = await prisma.salon.findMany({ select: { id: true } });
  let synced = 0;
  for (const salon of salons) {
    await syncOverdueState(salon.id);
    synced++;
  }
  return { synced };
}

export async function getSalonSubscriptionStatus(salonId: string) {
  const [subscription, invoices, overdueInvoice, blocked, salon] = await Promise.all([
    getSalonSubscription(salonId),
    getPlatformInvoices(salonId),
    getOverduePlatformInvoice(salonId),
    isSalonAccessBlocked(salonId),
    prisma.salon.findUnique({
      where: { id: salonId },
      select: { plan: true },
    }),
  ]);

  const billing = getSubscriptionBillingForPlan(salon?.plan);

  return {
    subscription,
    invoices,
    overdueInvoice,
    blocked,
    planMonthlyFallback: billing.monthlyAmount,
  };
}

export async function generateTrialInvoice(salonId: string) {
  const subscription = await prisma.salonSubscription.findUnique({
    where: { salonId },
  });
  if (!subscription?.trialEndsAt) {
    throw new Error("Trial subscription not found");
  }

  const periodStart = subscription.currentPeriodStart;
  const periodEnd = subscription.trialEndsAt;

  const existing = await prisma.platformInvoice.findFirst({
    where: {
      salonId,
      amount: 0,
      periodStart,
      status: { not: "cancelled" },
    },
  });
  if (existing) return existing;

  const now = new Date();
  const invoiceNumber = await generateInvoiceNumber(salonId, now);

  return prisma.platformInvoice.create({
    data: {
      salonId,
      invoiceNumber,
      amount: 0,
      tax: 0,
      total: 0,
      periodStart,
      periodEnd,
      dueDate: subscription.trialEndsAt,
      status: "paid",
      paidAt: now,
      notes: "Free trial period — no charge",
    },
  });
}

export async function createTrialSubscription(salonId: string) {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { plan: true },
  });
  const billing = getSubscriptionBillingForPlan(salon?.plan);

  const now = new Date();
  const { periodStart, periodEnd } = getMonthPeriod(now);
  const trialEndsAt = addDays(now, TRIAL_DAYS);

  const subscription = await prisma.salonSubscription.create({
    data: {
      salonId,
      status: "trial",
      planName: billing.planName,
      monthlyAmount: billing.monthlyAmount,
      setupFeePaid: false,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
    },
  });

  await generateTrialInvoice(salonId);

  return subscription;
}

export async function generateMonthlyInvoice(salonId: string) {
  const subscription = await prisma.salonSubscription.findUnique({
    where: { salonId },
  });
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const now = new Date();
  const { periodStart, periodEnd } = getMonthPeriod(now);

  const existing = await prisma.platformInvoice.findFirst({
    where: {
      salonId,
      periodStart,
      periodEnd,
      status: { not: "cancelled" },
    },
  });
  if (existing) return existing;

  const amount = subscription.monthlyAmount;
  const { tax, total } = calculatePlatformInvoiceGst(amount);
  const invoiceNumber = await generateInvoiceNumber(salonId, now);

  return prisma.platformInvoice.create({
    data: {
      salonId,
      invoiceNumber,
      amount,
      tax,
      total,
      periodStart,
      periodEnd,
      dueDate: addDays(now, INVOICE_DUE_DAYS),
      status: "sent",
    },
  });
}

export async function payPlatformInvoice(
  invoiceId: string,
  paymentMethod: PaymentMethod,
  options?: { simulate?: boolean }
) {
  const session = await requireOwnerOrManager();
  const now = new Date();

  const invoice = await prisma.platformInvoice.findFirst({
    where: {
      id: invoiceId,
      salonId: session.user.salonId,
      status: { in: ["sent", "overdue"] },
      paidAt: null,
    },
  });

  if (!invoice) {
    return { error: "Invoice not found or already paid" };
  }

  const status = options?.simulate || paymentMethod !== "bank_transfer" ? "paid" : "sent";
  const paidAt = options?.simulate || paymentMethod !== "bank_transfer" ? now : null;
  const notes =
    paymentMethod === "bank_transfer" && !options?.simulate
      ? "Payment pending review — bank transfer reported by salon"
      : invoice.notes;

  await prisma.$transaction(async (tx) => {
    await tx.platformInvoice.update({
      where: { id: invoice.id },
      data: {
        status,
        paidAt,
        paymentMethod,
        notes,
      },
    });

    if (paidAt) {
      const { periodStart, periodEnd } = getMonthPeriod(now);
      await tx.salonSubscription.update({
        where: { salonId: session.user.salonId },
        data: {
          status: "active",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        },
      });
    }
  });

  revalidatePath("/settings/billing");
  revalidatePath("/settings/subscription");
  revalidatePath("/invoice-due");
  revalidatePath("/dashboard");

  if (paymentMethod === "bank_transfer" && !options?.simulate) {
    return {
      success: true,
      pendingReview: true,
      message: "Thank you. We will verify your bank transfer within 1–2 business days.",
    };
  }

  return { success: true };
}

export async function getBillingPageData() {
  const session = await requireOwnerOrManager();
  return getSalonSubscriptionStatus(session.user.salonId);
}

export async function getSubscriptionPageData() {
  const session = await requireOwnerOrManager();
  return getSalonSubscriptionStatus(session.user.salonId);
}

export async function getInvoiceDuePageData() {
  const session = await requireSession();
  const status = await getSalonSubscriptionStatus(session.user.salonId);

  if (!status.blocked) {
    return { ...status, shouldRedirect: true as const };
  }

  return { ...status, shouldRedirect: false as const };
}
