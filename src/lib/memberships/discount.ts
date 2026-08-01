import { prisma } from "@/lib/prisma";

export type MembershipDiscount = {
  discountPercent: number;
  planName: string;
  membershipId: string;
};

export async function getActiveMembershipDiscount(
  salonId: string,
  customerId: string | null | undefined
): Promise<MembershipDiscount | null> {
  if (!customerId) return null;

  const membership = await prisma.customerMembership.findFirst({
    where: {
      salonId,
      customerId,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
    include: { plan: true },
    orderBy: { plan: { discountPercent: "desc" } },
  });

  if (!membership || membership.plan.discountPercent <= 0) return null;

  return {
    discountPercent: membership.plan.discountPercent,
    planName: membership.plan.name,
    membershipId: membership.id,
  };
}

export function applyMembershipDiscount(
  subtotal: number,
  discountPercent: number
): { discountedSubtotal: number; discountAmount: number } {
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const discountedSubtotal = Math.round((subtotal - discountAmount) * 100) / 100;
  return { discountedSubtotal, discountAmount };
}
