"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  searchCustomersForMembership,
  sellMembership,
} from "@/actions/memberships";
import { MembershipPageHeader } from "@/components/memberships/memberships-shell";
import { RecommendationPanel } from "@/components/memberships/recommendation-panel";
import { DigitalMembershipCard } from "@/components/memberships/digital-membership-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { cn, getInitials } from "@/lib/utils";
import { MEMBERSHIP_PRIMARY, MEMBERSHIP_GOLD } from "@/lib/memberships/constants";
import type { PlanRecommendation } from "@/lib/memberships/recommendations";
import {
  Search,
  User,
  Crown,
  Check,
  Loader2,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  loyaltyPoints: number;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  validityDays: number;
  discountPercent: number;
  walletBonus: number;
  themeColor: string;
  vipAccess: boolean;
  benefits: { benefit: { name: string } }[];
};

type Analytics = {
  visitCount: number;
  totalSpend: number;
  avgSpendPerVisit: number;
  visitsLast90Days: number;
  favoriteServices: string[];
  hasActiveMembership: boolean;
};

export function SellMembershipClient({
  plans,
  customer,
  analytics,
  recommendation,
  comparisons,
}: {
  plans: Plan[];
  customer: Customer | null;
  analytics: Analytics | null;
  recommendation: PlanRecommendation | null;
  comparisons: PlanRecommendation[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(
    recommendation?.plan.id ?? plans[0]?.id ?? ""
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPending, startTransition] = useTransition();
  const [successMembership, setSuccessMembership] = useState<{
    customerName: string;
    planName: string;
    membershipNumber: string;
    themeColor: string;
    endDate: Date;
    benefits: string[];
    discountPercent: number;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await searchCustomersForMembership(value);
    setResults(res);
    setSearching(false);
  }

  function selectCustomer(id: string) {
    router.push(`/memberships/sell?customerId=${id}`);
    setResults([]);
    setQuery("");
  }

  function handleSell() {
    if (!customer || !selectedPlanId) return;
    setError("");
    startTransition(async () => {
      const result = await sellMembership({
        customerId: customer.id,
        planId: selectedPlanId,
        paymentMethod,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      const m = result.membership!;
      setSuccessMembership({
        customerName: m.customer.name,
        planName: m.plan.name,
        membershipNumber: m.membershipNumber,
        themeColor: m.plan.themeColor,
        endDate: m.endDate,
        benefits: m.plan.benefits?.map((b) => b.benefit.name) ?? [],
        discountPercent: m.plan.discountPercent,
      });
      router.refresh();
    });
  }

  const preselectedCustomerId = searchParams.get("customerId");

  if (successMembership) {
    return (
      <div className="space-y-6">
        <MembershipPageHeader
          title="Membership Sold!"
          description="Digital membership card generated successfully."
        />
        <DigitalMembershipCard {...successMembership} />
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setSuccessMembership(null);
              router.push("/memberships/sell");
            }}
          >
            Sell Another
          </Button>
          <Button
            className="rounded-xl text-white"
            style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
            onClick={() => router.push("/memberships/active")}
          >
            View Active Memberships
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Sell Membership"
        description="Find a customer, review AI recommendations, and complete checkout."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <Label className="text-sm font-semibold">Find customer</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search name, phone, email..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>
            {searching && (
              <p className="mt-2 text-xs text-stone-500">Searching...</p>
            )}
            {results.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-stone-100">
                {results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCustomer(c.id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-stone-500">{c.phone ?? c.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {customer ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-stone-900"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
                >
                  {getInitials(customer.name)}
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{customer.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-stone-500">
                    {customer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {customer.phone}
                      </span>
                    )}
                    {customer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {customer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {analytics && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/80 p-2.5 dark:bg-stone-800/80">
                    <p className="text-[10px] uppercase text-stone-500">Visits (90d)</p>
                    <p className="font-bold">{analytics.visitsLast90Days}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 dark:bg-stone-800/80">
                    <p className="text-[10px] uppercase text-stone-500">Lifetime</p>
                    <p className="font-bold">{formatCurrency(analytics.totalSpend)}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 dark:bg-stone-800/80">
                    <p className="text-[10px] uppercase text-stone-500">Avg/visit</p>
                    <p className="font-bold">{formatCurrency(analytics.avgSpendPerVisit)}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 dark:bg-stone-800/80">
                    <p className="text-[10px] uppercase text-stone-500">Points</p>
                    <p className="font-bold">{customer.loyaltyPoints}</p>
                  </div>
                </div>
              )}
              {analytics?.hasActiveMembership && (
                <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-800">
                  This customer already has an active membership.
                </p>
              )}
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center dark:border-stone-700">
              <User className="mx-auto h-8 w-8 text-stone-300" />
              <p className="mt-2 text-sm text-stone-500">
                {preselectedCustomerId
                  ? "Loading customer..."
                  : "Search and select a customer"}
              </p>
            </div>
          )}

          {customer && <RecommendationPanel recommendation={recommendation} />}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Compare Plans
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(comparisons.length
                ? comparisons
                : plans.map((p) => ({
                    plan: {
                      id: p.id,
                      name: p.name,
                      description: p.description,
                      price: p.price,
                      validityDays: p.validityDays,
                      discountPercent: p.discountPercent,
                      walletBonus: p.walletBonus,
                      rewardMultiplier: 1,
                      priorityBooking: false,
                      vipAccess: p.vipAccess,
                      themeColor: p.themeColor,
                      status: "ACTIVE",
                    },
                    estimatedAnnualSavings: 0,
                    reasons: [],
                    matchLabel: "Consider" as const,
                    score: 0,
                  }))
              ).map(({ plan, estimatedAnnualSavings }) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    "relative rounded-2xl border p-4 text-left transition-all",
                    selectedPlanId === plan.id
                      ? "border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/30 dark:bg-emerald-950/20"
                      : "border-stone-200 bg-white hover:border-emerald-200 dark:border-stone-800 dark:bg-stone-900"
                  )}
                >
                  {selectedPlanId === plan.id && (
                    <div
                      className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Crown
                      className="h-4 w-4"
                      style={{ color: plan.vipAccess ? MEMBERSHIP_GOLD : plan.themeColor }}
                    />
                    <span className="font-bold">{plan.name}</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{formatCurrency(plan.price)}</p>
                  <p className="text-xs text-stone-500">{plan.validityDays} days validity</p>
                  {estimatedAnnualSavings > 0 && (
                    <p className="mt-2 text-xs font-medium text-emerald-700">
                      Save ~{formatCurrency(estimatedAnnualSavings)}/yr
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="font-semibold">Checkout</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <Button
              className="mt-4 w-full rounded-xl py-6 text-base font-semibold text-white"
              style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
              disabled={!customer || !selectedPlanId || isPending || analytics?.hasActiveMembership}
              onClick={handleSell}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Complete Sale — {formatCurrency(plans.find((p) => p.id === selectedPlanId)?.price ?? 0)}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
