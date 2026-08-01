"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { addDays, startOfMonth, endOfMonth, subDays } from "date-fns";
import type {
  MembershipPlanType,
  MembershipPlanStatus,
  MembershipBenefitType,
  CustomerMembershipStatus,
} from "@/generated/prisma/enums";
import {
  recommendMembershipPlan,
  comparePlans,
  type CustomerAnalytics,
} from "@/lib/memberships/recommendations";

function revalidateMemberships() {
  revalidatePath("/memberships");
  revalidatePath("/memberships/plans");
  revalidatePath("/memberships/active");
  revalidatePath("/memberships/sell");
  revalidatePath("/memberships/settings");
  revalidatePath("/clients");
}

async function getMembershipSettings(salonId: string) {
  let settings = await prisma.membershipSettings.findUnique({
    where: { salonId },
  });
  if (!settings) {
    settings = await prisma.membershipSettings.create({
      data: { salonId },
    });
  }
  return settings;
}

async function generateMembershipNumber(salonId: string) {
  const settings = await getMembershipSettings(salonId);
  const count = await prisma.customerMembership.count({ where: { salonId } });
  return `${settings.membershipPrefix}-${String(count + 1).padStart(5, "0")}`;
}

export async function getMembershipDashboardStats() {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const in30Days = addDays(now, 30);

  const [
    activeCount,
    expiringSoon,
    monthRevenue,
    totalMembers,
    planBreakdown,
    recentTransactions,
    monthlyTrend,
  ] = await Promise.all([
    prisma.customerMembership.count({
      where: { salonId, status: "ACTIVE", endDate: { gte: now } },
    }),
    prisma.customerMembership.count({
      where: {
        salonId,
        status: "ACTIVE",
        endDate: { gte: now, lte: in30Days },
      },
    }),
    prisma.membershipTransaction.aggregate({
      where: {
        salonId,
        type: { in: ["PURCHASE", "RENEWAL", "UPGRADE"] },
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.customerMembership.count({ where: { salonId } }),
    prisma.customerMembership.groupBy({
      by: ["planId"],
      where: { salonId, status: "ACTIVE", endDate: { gte: now } },
      _count: { id: true },
    }),
    prisma.membershipTransaction.findMany({
      where: { salonId },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.membershipTransaction.groupBy({
      by: ["createdAt"],
      where: {
        salonId,
        type: { in: ["PURCHASE", "RENEWAL"] },
        createdAt: { gte: subDays(now, 180) },
      },
      _sum: { amount: true },
    }),
  ]);

  const plans = await prisma.membershipPlan.findMany({
    where: { salonId },
    select: { id: true, name: true, themeColor: true },
  });
  const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

  const planChart = planBreakdown.map((row) => ({
    name: planMap[row.planId]?.name ?? "Unknown",
    value: row._count.id,
    color: planMap[row.planId]?.themeColor ?? "#22C55E",
  }));

  const monthBuckets: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-IN", { month: "short" });
    monthBuckets[key] = 0;
  }

  const txs = await prisma.membershipTransaction.findMany({
    where: {
      salonId,
      type: { in: ["PURCHASE", "RENEWAL"] },
      createdAt: { gte: subDays(now, 180) },
    },
    select: { amount: true, createdAt: true },
  });

  for (const tx of txs) {
    const key = tx.createdAt.toLocaleDateString("en-IN", { month: "short" });
    if (key in monthBuckets) monthBuckets[key] += tx.amount;
  }

  const revenueChart = Object.entries(monthBuckets).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue),
  }));

  const walletTotal = await prisma.walletAccount.aggregate({
    where: { salonId },
    _sum: { balance: true },
  });

  return {
    activeCount,
    expiringSoon,
    monthRevenue: monthRevenue._sum.amount ?? 0,
    totalMembers,
    walletBalance: walletTotal._sum.balance ?? 0,
    planChart,
    revenueChart,
    recentTransactions: recentTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      customerName: tx.customer.name,
      createdAt: tx.createdAt,
      description: tx.description,
    })),
  };
}

export async function getMembershipPlans(includeInactive = false) {
  const session = await requireSession();
  return prisma.membershipPlan.findMany({
    where: {
      salonId: session.user.salonId,
      ...(includeInactive ? {} : { status: { not: "ARCHIVED" } }),
    },
    include: {
      benefits: {
        include: { benefit: true },
      },
      _count: { select: { customerMemberships: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
  });
}

export async function getMembershipBenefits() {
  const session = await requireSession();
  return prisma.membershipBenefit.findMany({
    where: { salonId: session.user.salonId },
    orderBy: { name: "asc" },
  });
}

export async function createMembershipPlan(data: {
  name: string;
  description?: string;
  category?: string;
  type: MembershipPlanType;
  validityDays: number;
  price: number;
  tax?: number;
  discountPercent?: number;
  walletBonus?: number;
  rewardMultiplier?: number;
  priorityBooking?: boolean;
  vipAccess?: boolean;
  themeColor?: string;
  status?: MembershipPlanStatus;
  benefitIds?: string[];
}) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const plan = await prisma.membershipPlan.create({
    data: {
      salonId,
      name: data.name,
      description: data.description,
      category: data.category ?? "Standard",
      type: data.type,
      validityDays: data.validityDays,
      price: data.price,
      tax: data.tax ?? 0,
      discountPercent: data.discountPercent ?? 0,
      walletBonus: data.walletBonus ?? 0,
      rewardMultiplier: data.rewardMultiplier ?? 1,
      priorityBooking: data.priorityBooking ?? false,
      vipAccess: data.vipAccess ?? false,
      themeColor: data.themeColor ?? "#22C55E",
      status: data.status ?? "ACTIVE",
    },
  });

  if (data.benefitIds?.length) {
    await prisma.planBenefit.createMany({
      data: data.benefitIds.map((benefitId) => ({
        planId: plan.id,
        benefitId,
      })),
    });
  }

  revalidateMemberships();
  return { success: true, id: plan.id };
}

export async function updateMembershipPlan(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    category: string;
    type: MembershipPlanType;
    validityDays: number;
    price: number;
    tax: number;
    discountPercent: number;
    walletBonus: number;
    rewardMultiplier: number;
    priorityBooking: boolean;
    vipAccess: boolean;
    themeColor: string;
    status: MembershipPlanStatus;
    benefitIds: string[];
  }>
) {
  const session = await requireSession();

  const existing = await prisma.membershipPlan.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!existing) return { error: "Plan not found" };

  const { benefitIds, ...planData } = data;

  await prisma.membershipPlan.update({
    where: { id },
    data: planData,
  });

  if (benefitIds !== undefined) {
    await prisma.planBenefit.deleteMany({ where: { planId: id } });
    if (benefitIds.length) {
      await prisma.planBenefit.createMany({
        data: benefitIds.map((benefitId) => ({ planId: id, benefitId })),
      });
    }
  }

  revalidateMemberships();
  return { success: true };
}

export async function deleteMembershipPlan(id: string) {
  const session = await requireSession();

  const activeCount = await prisma.customerMembership.count({
    where: {
      planId: id,
      salonId: session.user.salonId,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
  });

  if (activeCount > 0) {
    return { error: "Cannot delete plan with active memberships" };
  }

  await prisma.membershipPlan.update({
    where: { id, salonId: session.user.salonId },
    data: { status: "ARCHIVED" },
  });

  revalidateMemberships();
  return { success: true };
}

export async function createMembershipBenefit(data: {
  name: string;
  description?: string;
  type: MembershipBenefitType;
  value?: number;
}) {
  const session = await requireSession();

  const benefit = await prisma.membershipBenefit.create({
    data: {
      salonId: session.user.salonId,
      ...data,
    },
  });

  revalidateMemberships();
  return { success: true, id: benefit.id };
}

export async function getActiveMemberships(filters?: {
  status?: CustomerMembershipStatus | "all";
  planId?: string;
  search?: string;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const now = new Date();

  const where: Record<string, unknown> = { salonId };

  if (filters?.status === "all") {
    // no status filter
  } else if (filters?.status) {
    where.status = filters.status;
    if (filters.status === "ACTIVE") {
      where.endDate = { gte: now };
    }
  } else {
    where.status = "ACTIVE";
    where.endDate = { gte: now };
  }

  if (filters?.planId && filters.planId !== "all") {
    where.planId = filters.planId;
  }

  if (filters?.search) {
    where.OR = [
      { membershipNumber: { contains: filters.search, mode: "insensitive" } },
      { customer: { name: { contains: filters.search, mode: "insensitive" } } },
      { customer: { phone: { contains: filters.search } } },
    ];
  }

  return prisma.customerMembership.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      plan: true,
    },
    orderBy: { endDate: "asc" },
  });
}

export async function sellMembership(data: {
  customerId: string;
  planId: string;
  paymentMethod?: string;
  autoRenew?: boolean;
  notes?: string;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const [plan, customer, settings] = await Promise.all([
    prisma.membershipPlan.findFirst({
      where: { id: data.planId, salonId, status: "ACTIVE" },
    }),
    prisma.customer.findFirst({
      where: { id: data.customerId, salonId },
    }),
    getMembershipSettings(salonId),
  ]);

  if (!plan) return { error: "Plan not found" };
  if (!customer) return { error: "Customer not found" };

  const existingActive = await prisma.customerMembership.findFirst({
    where: {
      salonId,
      customerId: data.customerId,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
  });

  if (existingActive) {
    return { error: "Customer already has an active membership" };
  }

  const tax = Math.round(plan.price * (settings.defaultTaxRate / 100) * 100) / 100;
  const membershipNumber = await generateMembershipNumber(salonId);
  const endDate = addDays(new Date(), plan.validityDays);

  const membership = await prisma.$transaction(async (tx) => {
    const cm = await tx.customerMembership.create({
      data: {
        salonId,
        customerId: data.customerId,
        planId: plan.id,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
        pricePaid: plan.price,
        taxPaid: tax,
        autoRenew: data.autoRenew ?? false,
        membershipNumber,
        qrCode: membershipNumber,
        notes: data.notes,
      },
      include: {
        plan: { include: { benefits: { include: { benefit: true } } } },
        customer: true,
      },
    });

    await tx.membershipTransaction.create({
      data: {
        salonId,
        customerMembershipId: cm.id,
        customerId: data.customerId,
        type: "PURCHASE",
        amount: plan.price,
        tax,
        description: `${plan.name} membership purchase`,
        paymentMethod: data.paymentMethod ?? "cash",
      },
    });

    if (plan.walletBonus > 0) {
      const wallet = await tx.walletAccount.upsert({
        where: { salonId_customerId: { salonId, customerId: data.customerId } },
        create: { salonId, customerId: data.customerId, balance: plan.walletBonus },
        update: { balance: { increment: plan.walletBonus } },
      });

      await tx.walletTransaction.create({
        data: {
          salonId,
          walletAccountId: wallet.id,
          customerId: data.customerId,
          amount: plan.walletBonus,
          balanceAfter: wallet.balance,
          type: "bonus",
          description: `${plan.name} signup wallet bonus`,
          referenceId: cm.id,
        },
      });
    }

    if (plan.rewardMultiplier > 1) {
      const bonusPoints = Math.round(plan.price * plan.rewardMultiplier);
      const newBalance = customer.loyaltyPoints + bonusPoints;
      await tx.customer.update({
        where: { id: data.customerId },
        data: { loyaltyPoints: newBalance },
      });
      await tx.loyaltyPointsLedger.create({
        data: {
          salonId,
          customerId: data.customerId,
          points: bonusPoints,
          balanceAfter: newBalance,
          reason: `${plan.name} membership signup bonus`,
          referenceType: "membership",
          referenceId: cm.id,
        },
      });
    }

    return cm;
  });

  revalidateMemberships();
  return { success: true, membership };
}

export async function getCustomerMembershipProfile(customerId: string) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const [membership, wallet, plans] = await Promise.all([
    prisma.customerMembership.findFirst({
      where: {
        salonId,
        customerId,
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
      include: { plan: { include: { benefits: { include: { benefit: true } } } }, customer: true },
      orderBy: { endDate: "desc" },
    }),
    prisma.walletAccount.findUnique({
      where: { salonId_customerId: { salonId, customerId } },
    }),
    getMembershipPlans(),
  ]);

  const analytics = await getCustomerAnalytics(customerId);
  const recommendation = recommendMembershipPlan(analytics, plans);

  return {
    membership,
    walletBalance: wallet?.balance ?? 0,
    analytics,
    recommendation,
  };
}

export async function getCustomerAnalytics(
  customerId: string
): Promise<CustomerAnalytics> {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const now = new Date();
  const ninetyDaysAgo = subDays(now, 90);

  const [invoices, queueEntries, appointments, activeMembership] = await Promise.all([
    prisma.invoice.findMany({
      where: { salonId, customerId, status: "paid" },
      select: { total: true, createdAt: true, lineItems: { select: { description: true } } },
    }),
    prisma.queueEntry.count({
      where: {
        salonId,
        customerId,
        status: "completed",
        checkedInAt: { gte: ninetyDaysAgo },
      },
    }),
    prisma.appointment.findMany({
      where: { salonId, customerId, status: "completed" },
      include: { service: { select: { name: true } } },
    }),
    prisma.customerMembership.findFirst({
      where: {
        salonId,
        customerId,
        status: "ACTIVE",
        endDate: { gte: now },
      },
    }),
  ]);

  const totalSpend = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const visitCount = queueEntries + appointments.length;
  const visitsLast90Days = queueEntries;

  const serviceCounts: Record<string, number> = {};
  for (const apt of appointments) {
    serviceCounts[apt.service.name] = (serviceCounts[apt.service.name] ?? 0) + 1;
  }
  for (const inv of invoices) {
    for (const item of inv.lineItems) {
      serviceCounts[item.description] = (serviceCounts[item.description] ?? 0) + 1;
    }
  }

  const favoriteServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return {
    visitCount,
    totalSpend,
    avgSpendPerVisit: visitCount > 0 ? totalSpend / visitCount : 0,
    visitsLast90Days,
    favoriteServices,
    hasActiveMembership: !!activeMembership,
  };
}

export async function getSellMembershipData(customerId?: string) {
  const session = await requireSession();
  const plans = await getMembershipPlans();

  let customer = null;
  let analytics: CustomerAnalytics | null = null;
  let recommendation = null;
  let comparisons: ReturnType<typeof comparePlans> = [];

  if (customerId) {
    customer = await prisma.customer.findFirst({
      where: { id: customerId, salonId: session.user.salonId },
    });
    if (customer) {
      analytics = await getCustomerAnalytics(customerId);
      recommendation = recommendMembershipPlan(analytics, plans);
      comparisons = comparePlans(plans, analytics);
    }
  }

  return { plans, customer, analytics, recommendation, comparisons };
}

export async function topUpWallet(
  customerId: string,
  amount: number,
  description?: string
) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  if (amount <= 0) return { error: "Amount must be positive" };

  const wallet = await prisma.$transaction(async (tx) => {
    const account = await tx.walletAccount.upsert({
      where: { salonId_customerId: { salonId, customerId } },
      create: { salonId, customerId, balance: amount },
      update: { balance: { increment: amount } },
    });

    await tx.walletTransaction.create({
      data: {
        salonId,
        walletAccountId: account.id,
        customerId,
        amount,
        balanceAfter: account.balance,
        type: "topup",
        description: description ?? "Manual wallet top-up",
      },
    });

    await tx.membershipTransaction.create({
      data: {
        salonId,
        customerId,
        type: "WALLET_TOPUP",
        amount,
        description: description ?? "Wallet top-up",
      },
    });

    return account;
  });

  revalidateMemberships();
  return { success: true, balance: wallet.balance };
}

export async function getMembershipSettingsAction() {
  const session = await requireSession();
  return getMembershipSettings(session.user.salonId);
}

export async function updateMembershipSettings(data: {
  autoRenewEnabled?: boolean;
  renewalReminderDays?: number;
  allowFamilyMembers?: boolean;
  maxFamilyMembers?: number;
  defaultTaxRate?: number;
  membershipPrefix?: string;
  termsAndConditions?: string;
}) {
  const session = await requireSession();

  await prisma.membershipSettings.upsert({
    where: { salonId: session.user.salonId },
    create: { salonId: session.user.salonId, ...data },
    update: data,
  });

  revalidateMemberships();
  return { success: true };
}

export async function searchCustomersForMembership(query: string) {
  const session = await requireSession();
  if (!query.trim()) return [];

  return prisma.customer.findMany({
    where: {
      salonId: session.user.salonId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      loyaltyPoints: true,
    },
    take: 10,
    orderBy: { name: "asc" },
  });
}
