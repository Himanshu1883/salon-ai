"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import {
  addDays,
  getMonthPeriod,
  MONTHLY_AMOUNT_INR,
  PLATFORM_TAX_RATE,
  SUBSCRIPTION_PLAN_NAME,
  TRIAL_DAYS,
  type SubscriptionStatus,
} from "@/lib/subscription";
import { generateMonthlyInvoice } from "@/actions/subscription";

export type SalonStatusFilter =
  | "all"
  | "trial"
  | "active"
  | "past_due"
  | "suspended";

export type SalonPlanFilter = "all" | "BASIC" | "ENTERPRISE";

export type SalonSubscriptionAction =
  | "extend_trial"
  | "activate"
  | "suspend"
  | "generate_invoice";

export async function getAdminStats() {
  await requireSuperAdmin();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalSalons,
    onTrial,
    activeMonthly,
    pastDueOrSuspended,
    signedUpThisMonth,
    basicPlan,
    enterprisePlan,
  ] = await Promise.all([
    prisma.salon.count(),
    prisma.salonSubscription.count({ where: { status: "trial" } }),
    prisma.salonSubscription.count({ where: { status: "active" } }),
    prisma.salonSubscription.count({
      where: { status: { in: ["past_due", "suspended"] } },
    }),
    prisma.salon.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.salon.count({ where: { plan: "BASIC" } }),
    prisma.salon.count({ where: { plan: "ENTERPRISE" } }),
  ]);

  return {
    totalSalons,
    onTrial,
    activeMonthly,
    pastDueOrSuspended,
    signedUpThisMonth,
    basicPlan,
    enterprisePlan,
  };
}

export async function getAllSalons(options?: {
  search?: string;
  status?: SalonStatusFilter;
  plan?: SalonPlanFilter;
  page?: number;
  pageSize?: number;
}) {
  await requireSuperAdmin();

  const search = options?.search?.trim() ?? "";
  const status = options?.status ?? "all";
  const plan = options?.plan ?? "all";
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: {
    plan?: "BASIC" | "ENTERPRISE";
    subscription?: { status: SubscriptionStatus | { in: SubscriptionStatus[] } };
    OR?: Array<{
      name?: { contains: string };
      city?: { contains: string };
      users?: { some: { email: { contains: string } } };
    }>;
  } = {};

  if (status !== "all") {
    where.subscription = { status };
  }

  if (plan !== "all") {
    where.plan = plan;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { users: { some: { email: { contains: search } } } },
    ];
  }

  const [salons, total] = await Promise.all([
    prisma.salon.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: true,
        users: {
          where: { role: "owner" },
          take: 1,
        },
        _count: {
          select: { employees: true, seats: true },
        },
      },
    }),
    prisma.salon.count({ where }),
  ]);

  return {
    salons: salons.map((salon) => {
      const owner = salon.users[0];
      return {
        id: salon.id,
        name: salon.name,
        slug: salon.slug,
        city: salon.city,
        phone: salon.businessPhone ?? salon.phone,
        businessType: salon.businessType,
        status: salon.subscription?.status ?? "trial",
        plan: salon.plan,
        trialEndsAt: salon.subscription?.trialEndsAt ?? null,
        currentPeriodEnd: salon.subscription?.currentPeriodEnd ?? null,
        createdAt: salon.createdAt,
        ownerName: owner?.name ?? "—",
        ownerEmail: owner?.email ?? "—",
        seatsCount: salon.totalSeats,
        staffCount: salon._count.employees,
      };
    }),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getSalonDetail(salonId: string) {
  await requireSuperAdmin();

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    include: {
      subscription: true,
      platformInvoices: { orderBy: { dueDate: "desc" } },
      users: { where: { role: "owner" }, take: 1 },
      _count: {
        select: {
          employees: true,
          customers: true,
          services: true,
          seats: true,
        },
      },
    },
  });

  if (!salon) return null;

  const owner = salon.users[0];

  let openingHours: Record<string, unknown> | null = null;
  if (salon.openingHours) {
    try {
      openingHours = JSON.parse(salon.openingHours);
    } catch {
      openingHours = null;
    }
  }

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    businessType: salon.businessType,
    plan: salon.plan,
    gstin: salon.gstin,
    address: salon.address,
    addressLine1: salon.addressLine1,
    city: salon.city,
    state: salon.state,
    pincode: salon.pincode,
    phone: salon.businessPhone ?? salon.phone,
    email: salon.businessEmail,
    openingHours,
    createdAt: salon.createdAt,
    totalSeats: salon.totalSeats,
    owner: owner
      ? {
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
        }
      : null,
    subscription: salon.subscription,
    platformInvoices: salon.platformInvoices,
    counts: {
      employees: salon._count.employees,
      customers: salon._count.customers,
      services: salon._count.services,
      seats: salon._count.seats,
    },
  };
}

export async function updateSalonSubscription(
  salonId: string,
  action: SalonSubscriptionAction
) {
  await requireSuperAdmin();

  const subscription = await prisma.salonSubscription.findUnique({
    where: { salonId },
  });

  if (!subscription) {
    return { error: "Subscription not found" };
  }

  const now = new Date();

  switch (action) {
    case "extend_trial": {
      const base =
        subscription.trialEndsAt && subscription.trialEndsAt > now
          ? subscription.trialEndsAt
          : now;
      const trialEndsAt = addDays(base, TRIAL_DAYS);
      await prisma.salonSubscription.update({
        where: { salonId },
        data: {
          status: "trial",
          trialEndsAt,
        },
      });
      break;
    }
    case "activate": {
      const { periodStart, periodEnd } = getMonthPeriod(now);
      await prisma.salonSubscription.update({
        where: { salonId },
        data: {
          status: "active",
          planName: SUBSCRIPTION_PLAN_NAME,
          monthlyAmount: MONTHLY_AMOUNT_INR,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        },
      });
      break;
    }
    case "suspend": {
      await prisma.salonSubscription.update({
        where: { salonId },
        data: { status: "suspended" },
      });
      break;
    }
    case "generate_invoice": {
      await generateMonthlyInvoice(salonId);
      break;
    }
    default:
      return { error: "Unknown action" };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/salons");
  revalidatePath(`/admin/salons/${salonId}`);

  return { success: true };
}
