export type MembershipPlanSummary = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  validityDays: number;
  discountPercent: number;
  walletBonus: number;
  rewardMultiplier: number;
  priorityBooking: boolean;
  vipAccess: boolean;
  themeColor: string;
  status: string;
};

export type CustomerAnalytics = {
  visitCount: number;
  totalSpend: number;
  avgSpendPerVisit: number;
  visitsLast90Days: number;
  favoriteServices: string[];
  hasActiveMembership: boolean;
};

export type PlanRecommendation = {
  plan: MembershipPlanSummary;
  score: number;
  estimatedAnnualSavings: number;
  reasons: string[];
  matchLabel: "Best fit" | "Great value" | "Premium upgrade" | "Consider";
};

export function recommendMembershipPlan(
  analytics: CustomerAnalytics,
  plans: MembershipPlanSummary[]
): PlanRecommendation | null {
  const activePlans = plans.filter((p) => p.status === "ACTIVE");
  if (activePlans.length === 0 || analytics.hasActiveMembership) return null;

  const annualSpend = analytics.avgSpendPerVisit * Math.max(analytics.visitsLast90Days, 1) * 4;

  const scored = activePlans.map((plan) => {
    let score = 0;
    const reasons: string[] = [];

    const estimatedSavings = (annualSpend * plan.discountPercent) / 100 + plan.walletBonus;

    if (analytics.visitsLast90Days >= 3) {
      score += 30;
      reasons.push(`Visits ${analytics.visitsLast90Days} times in 90 days — membership pays off`);
    } else if (analytics.visitsLast90Days >= 1) {
      score += 15;
      reasons.push("Regular visitor — membership can reduce costs");
    }

    if (analytics.totalSpend >= 15000) {
      score += 25;
      reasons.push(`Lifetime spend ${Math.round(analytics.totalSpend).toLocaleString("en-IN")} — premium tier recommended`);
    } else if (analytics.totalSpend >= 5000) {
      score += 15;
      reasons.push("Solid spending history — mid-tier plan fits well");
    }

    if (plan.discountPercent >= 15 && analytics.avgSpendPerVisit >= 800) {
      score += 20;
      reasons.push(`${plan.discountPercent}% service discount saves on high-value visits`);
    }

    if (plan.walletBonus > 0) {
      score += 10;
      reasons.push(`₹${plan.walletBonus} wallet bonus on signup`);
    }

    if (plan.vipAccess && analytics.totalSpend >= 20000) {
      score += 15;
      reasons.push("VIP perks match high-value client profile");
    }

    if (analytics.favoriteServices.length > 0) {
      reasons.push(`Frequent services: ${analytics.favoriteServices.slice(0, 2).join(", ")}`);
    }

    const priceRatio = plan.price / Math.max(annualSpend, 1);
    if (priceRatio < 0.15) score += 20;
    else if (priceRatio < 0.25) score += 10;

    let matchLabel: PlanRecommendation["matchLabel"] = "Consider";
    if (score >= 70) matchLabel = "Best fit";
    else if (score >= 50) matchLabel = "Great value";
    else if (plan.vipAccess) matchLabel = "Premium upgrade";

    return {
      plan,
      score,
      estimatedAnnualSavings: Math.round(estimatedSavings),
      reasons: reasons.slice(0, 4),
      matchLabel,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0] ?? null;
}

export function comparePlans(
  plans: MembershipPlanSummary[],
  analytics: CustomerAnalytics
): PlanRecommendation[] {
  const annualSpend = analytics.avgSpendPerVisit * Math.max(analytics.visitsLast90Days, 1) * 4;

  return plans
    .filter((p) => p.status === "ACTIVE")
    .map((plan) => {
      const estimatedSavings = (annualSpend * plan.discountPercent) / 100 + plan.walletBonus;
      const reasons: string[] = [];
      if (plan.discountPercent > 0) {
        reasons.push(`${plan.discountPercent}% off all services`);
      }
      if (plan.walletBonus > 0) {
        reasons.push(`₹${plan.walletBonus} wallet credit`);
      }
      if (plan.priorityBooking) reasons.push("Priority booking");
      if (plan.vipAccess) reasons.push("VIP lounge access");

      return {
        plan,
        score: estimatedSavings / Math.max(plan.price, 1),
        estimatedAnnualSavings: Math.round(estimatedSavings),
        reasons,
        matchLabel: "Consider" as const,
      };
    })
    .sort((a, b) => b.estimatedAnnualSavings - a.estimatedAnnualSavings);
}
