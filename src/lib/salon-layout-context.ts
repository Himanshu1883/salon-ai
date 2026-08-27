import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { cachedBySalon } from "@/lib/salon-cache";
import { normalizeSalonPlan, type SalonPlan } from "@/lib/plans";

export type SalonLayoutContext = {
  plan: SalonPlan;
  accessBlocked: boolean;
  logoUrl: string | null;
};

function computeAccessBlocked(
  subscription: {
    status: string;
    trialEndsAt: Date | null;
  } | null,
  hasOverdueInvoice: boolean
): boolean {
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

  return hasOverdueInvoice;
}

async function loadSalonLayoutContext(salonId: string): Promise<SalonLayoutContext> {
  const now = new Date();

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: {
      plan: true,
      logoUrl: true,
      subscription: {
        select: { status: true, trialEndsAt: true },
      },
      platformInvoices: {
        where: {
          status: { in: ["sent", "overdue"] },
          paidAt: null,
          dueDate: { lt: now },
        },
        take: 1,
        select: { id: true },
      },
    },
  });

  return {
    plan: normalizeSalonPlan(salon?.plan),
    logoUrl: salon?.logoUrl ?? null,
    accessBlocked: computeAccessBlocked(
      salon?.subscription ?? null,
      (salon?.platformInvoices.length ?? 0) > 0
    ),
  };
}

async function loadSalonAccessBlocked(salonId: string): Promise<boolean> {
  const now = new Date();
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: {
      subscription: {
        select: { status: true, trialEndsAt: true },
      },
      platformInvoices: {
        where: {
          status: { in: ["sent", "overdue"] },
          paidAt: null,
          dueDate: { lt: now },
        },
        take: 1,
        select: { id: true },
      },
    },
  });

  return computeAccessBlocked(
    salon?.subscription ?? null,
    (salon?.platformInvoices.length ?? 0) > 0
  );
}

const getSalonLayoutContextCached = cachedBySalon(
  "layout-context",
  loadSalonLayoutContext,
  { revalidate: 120 }
);

const getSalonAccessBlockedCached = cachedBySalon(
  "layout-context",
  loadSalonAccessBlocked,
  { revalidate: 120, key: "access-blocked" }
);

const getSalonLogoPathCached = cachedBySalon(
  "layout-context",
  async (salonId: string) => {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { logoUrl: true },
    });
    return salon?.logoUrl ?? null;
  },
  { revalidate: 120, key: "logo" }
);

/** Salon logo path/URL for dashboard chrome (cached ~120s). */
export const getSalonLogoPath = cache(async (salonId: string) =>
  getSalonLogoPathCached(salonId)
);

/** Plan + subscription gate in one DB round-trip (cached ~120s). */
export const getSalonLayoutContext = cache(async (salonId: string) =>
  getSalonLayoutContextCached(salonId)
);

/** Subscription gate only — skips plan read when JWT already carries plan. */
export const getSalonAccessBlocked = cache(async (salonId: string) =>
  getSalonAccessBlockedCached(salonId)
);
