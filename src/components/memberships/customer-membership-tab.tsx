"use client";

import Link from "next/link";
import { format } from "date-fns";
import { RecommendationPanel } from "@/components/memberships/recommendation-panel";
import { DigitalMembershipCard } from "@/components/memberships/digital-membership-card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Crown, Wallet, Sparkles, Plus } from "lucide-react";
import { MEMBERSHIP_PRIMARY } from "@/lib/memberships/constants";
import type { PlanRecommendation } from "@/lib/memberships/recommendations";

type MembershipProfile = {
  membership: {
    id: string;
    membershipNumber: string;
    endDate: Date;
    plan: {
      name: string;
      themeColor: string;
      discountPercent: number;
      benefits: { benefit: { name: string } }[];
    };
    customer: { name: string };
  } | null;
  walletBalance: number;
  analytics: {
    visitCount: number;
    totalSpend: number;
    visitsLast90Days: number;
    favoriteServices: string[];
    hasActiveMembership: boolean;
  };
  recommendation: PlanRecommendation | null;
};

export function CustomerMembershipTab({
  customerId,
  customerName,
  loyaltyPoints,
  profile,
}: {
  customerId: string;
  customerName: string;
  loyaltyPoints: number;
  profile: MembershipProfile;
}) {
  const { membership, walletBalance, analytics, recommendation } = profile;

  if (membership) {
    const benefits = membership.plan.benefits.map((b) => b.benefit.name);
    return (
      <div className="space-y-6">
        <DigitalMembershipCard
          customerName={customerName}
          planName={membership.plan.name}
          membershipNumber={membership.membershipNumber}
          themeColor={membership.plan.themeColor}
          endDate={membership.endDate}
          benefits={benefits}
          discountPercent={membership.plan.discountPercent}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <Wallet className="h-4 w-4 text-teal-600" />
            <p className="mt-2 text-xs text-stone-500">Wallet balance</p>
            <p className="text-xl font-bold">{formatCurrency(walletBalance)}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <p className="mt-2 text-xs text-stone-500">Loyalty points</p>
            <p className="text-xl font-bold">{loyaltyPoints}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <Crown className="h-4 w-4" style={{ color: MEMBERSHIP_PRIMARY }} />
            <p className="mt-2 text-xs text-stone-500">Service discount</p>
            <p className="text-xl font-bold">{membership.plan.discountPercent}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-8 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <Crown className="mx-auto h-10 w-10 text-emerald-500" />
        <p className="mt-3 font-semibold text-stone-900 dark:text-white">
          No active membership
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {analytics.visitsLast90Days > 0
            ? `${analytics.visitsLast90Days} visits in the last 90 days — a plan could save them money.`
            : "Sell a membership to unlock discounts and loyalty rewards."}
        </p>
        <Button
          asChild
          className="mt-4 rounded-xl text-white"
          style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
        >
          <Link href={`/memberships/sell?customerId=${customerId}`}>
            <Plus className="mr-2 h-4 w-4" />
            Sell membership
          </Link>
        </Button>
      </div>

      <RecommendationPanel recommendation={recommendation} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs uppercase text-stone-500">Wallet balance</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(walletBalance)}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs uppercase text-stone-500">Loyalty points</p>
          <p className="mt-1 text-2xl font-bold">{loyaltyPoints}</p>
        </div>
      </div>

      {analytics.favoriteServices.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs font-semibold uppercase text-stone-500">Favorite services</p>
          <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">
            {analytics.favoriteServices.join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
