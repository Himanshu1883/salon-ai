import type { MembershipBenefitType, MembershipPlanType } from "@/generated/prisma/enums";
import type { PrismaClient } from "@/generated/prisma/client";

export const SAMPLE_MEMBERSHIP_PLANS: Array<{
  name: string;
  description: string;
  category: string;
  type: MembershipPlanType;
  validityDays: number;
  price: number;
  discountPercent: number;
  walletBonus: number;
  rewardMultiplier: number;
  priorityBooking: boolean;
  vipAccess: boolean;
  themeColor: string;
  sortOrder: number;
  benefits: Array<{ name: string; type: MembershipBenefitType; value?: number }>;
}> = [
  {
    name: "Silver",
    description: "Perfect for occasional visitors who want consistent savings.",
    category: "Standard",
    type: "MONTHLY",
    validityDays: 30,
    price: 999,
    discountPercent: 5,
    walletBonus: 100,
    rewardMultiplier: 1.2,
    priorityBooking: false,
    vipAccess: false,
    themeColor: "#94A3B8",
    sortOrder: 1,
    benefits: [
      { name: "5% off all services", type: "DISCOUNT_PERCENT", value: 5 },
      { name: "₹100 wallet bonus", type: "WALLET_BONUS", value: 100 },
    ],
  },
  {
    name: "Gold",
    description: "Our most popular plan — great value for regular clients.",
    category: "Premium",
    type: "QUARTERLY",
    validityDays: 90,
    price: 2499,
    discountPercent: 10,
    walletBonus: 300,
    rewardMultiplier: 1.5,
    priorityBooking: true,
    vipAccess: false,
    themeColor: "#D4AF37",
    sortOrder: 2,
    benefits: [
      { name: "10% off all services", type: "DISCOUNT_PERCENT", value: 10 },
      { name: "Priority booking", type: "PRIORITY_BOOKING" },
      { name: "₹300 wallet bonus", type: "WALLET_BONUS", value: 300 },
    ],
  },
  {
    name: "Platinum",
    description: "Premium benefits for dedicated salon enthusiasts.",
    category: "Premium",
    type: "HALF_YEARLY",
    validityDays: 180,
    price: 4499,
    discountPercent: 15,
    walletBonus: 750,
    rewardMultiplier: 2,
    priorityBooking: true,
    vipAccess: false,
    themeColor: "#22C55E",
    sortOrder: 3,
    benefits: [
      { name: "15% off all services", type: "DISCOUNT_PERCENT", value: 15 },
      { name: "Priority booking", type: "PRIORITY_BOOKING" },
      { name: "2x loyalty points", type: "LOYALTY_MULTIPLIER", value: 2 },
      { name: "₹750 wallet bonus", type: "WALLET_BONUS", value: 750 },
    ],
  },
  {
    name: "VIP",
    description: "Ultimate luxury membership with exclusive perks and VIP access.",
    category: "VIP",
    type: "YEARLY",
    validityDays: 365,
    price: 7999,
    discountPercent: 20,
    walletBonus: 1500,
    rewardMultiplier: 3,
    priorityBooking: true,
    vipAccess: true,
    themeColor: "#1E293B",
    sortOrder: 4,
    benefits: [
      { name: "20% off all services", type: "DISCOUNT_PERCENT", value: 20 },
      { name: "VIP lounge access", type: "OTHER" },
      { name: "Priority booking", type: "PRIORITY_BOOKING" },
      { name: "3x loyalty points", type: "LOYALTY_MULTIPLIER", value: 3 },
      { name: "₹1,500 wallet bonus", type: "WALLET_BONUS", value: 1500 },
    ],
  },
];

export async function seedMembershipPlansForSalon(
  prisma: PrismaClient,
  salonId: string
) {
  const existing = await prisma.membershipPlan.count({ where: { salonId } });
  if (existing > 0) return;

  await prisma.membershipSettings.upsert({
    where: { salonId },
    create: { salonId },
    update: {},
  });

  await prisma.loyaltySettings.upsert({
    where: { salonId },
    create: { salonId },
    update: {},
  });

  for (const planData of SAMPLE_MEMBERSHIP_PLANS) {
    const { benefits, ...planFields } = planData;
    const plan = await prisma.membershipPlan.create({
      data: {
        salonId,
        ...planFields,
        status: "ACTIVE",
      },
    });

    for (const benefitData of benefits) {
      const benefit = await prisma.membershipBenefit.create({
        data: {
          salonId,
          name: benefitData.name,
          type: benefitData.type,
          value: benefitData.value,
        },
      });

      await prisma.planBenefit.create({
        data: { planId: plan.id, benefitId: benefit.id },
      });
    }
  }
}
