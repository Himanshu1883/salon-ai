"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerOrManager, requireSession, requireSuperAdmin } from "@/lib/auth";
import {
  getPlanMonthlyAmount,
  getSubscriptionPlanName,
  PLAN_FEATURES,
  PLAN_LABELS,
  PLAN_PRICING,
  normalizeSalonPlan,
  type SalonPlan,
} from "@/lib/plans";

async function syncSubscriptionPlan(salonId: string, plan: SalonPlan) {
  await prisma.salonSubscription.updateMany({
    where: { salonId },
    data: {
      planName: getSubscriptionPlanName(plan),
      monthlyAmount: getPlanMonthlyAmount(plan),
    },
  });
}

function revalidatePlanPaths() {
  revalidateTag("salon-plan", "max");
  revalidatePath("/", "layout");
}

export async function getSalonPlanDetails() {
  const session = await requireSession();
  const salon = await prisma.salon.findUnique({
    where: { id: session.user.salonId },
    select: { plan: true, name: true },
  });

  const plan = normalizeSalonPlan(salon?.plan);

  return {
    plan,
    planLabel: PLAN_LABELS[plan],
    pricing: PLAN_PRICING[plan],
    features: PLAN_FEATURES[plan],
    salonName: salon?.name ?? session.user.salonName,
  };
}

export async function updateSalonPlan(plan: SalonPlan) {
  const session = await requireOwnerOrManager();

  if (plan !== "BASIC" && plan !== "ENTERPRISE") {
    return { error: "Invalid plan" };
  }

  await prisma.salon.update({
    where: { id: session.user.salonId },
    data: { plan },
  });

  await syncSubscriptionPlan(session.user.salonId, plan);

  revalidatePlanPaths();
  revalidatePath("/settings/subscription");
  revalidatePath("/settings/billing");

  return { success: true, plan };
}

export async function updateSalonPlanAsAdmin(salonId: string, plan: SalonPlan) {
  await requireSuperAdmin();

  if (plan !== "BASIC" && plan !== "ENTERPRISE") {
    return { error: "Invalid plan" };
  }

  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (!salon) return { error: "Salon not found" };

  await prisma.salon.update({
    where: { id: salonId },
    data: { plan },
  });

  await syncSubscriptionPlan(salonId, plan);

  revalidatePlanPaths();
  revalidatePath("/admin/salons");
  revalidatePath(`/admin/salons/${salonId}`);

  return { success: true, plan };
}
