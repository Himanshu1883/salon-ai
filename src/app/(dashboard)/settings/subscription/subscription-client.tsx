"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { updateSalonPlan } from "@/actions/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PLAN_FEATURES,
  PLAN_LABELS,
  PLAN_PRICING,
  type SalonPlan,
} from "@/lib/plans";

export function SubscriptionClient({
  plan,
  planLabel,
}: {
  plan: SalonPlan;
  planLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchPlan(nextPlan: SalonPlan) {
    if (nextPlan === plan) return;
    startTransition(async () => {
      await updateSalonPlan(nextPlan);
      router.refresh();
    });
  }

  const plans: SalonPlan[] = ["BASIC", "ENTERPRISE"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C103D]">Plan & subscription</h1>
        <p className="mt-1 text-[#6B7280]">
          Manage your Salon AI ERP tier. Switch plans anytime for demo purposes.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-[#EDE9FE] bg-gradient-to-br from-[#6C3BFF]/5 via-white to-[#FF2D6F]/5 p-6 shadow-[0_12px_40px_rgba(108,59,255,0.08)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C3BFF] text-white shadow-lg shadow-[#6C3BFF]/30">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Current plan</p>
              <p className="text-2xl font-bold text-[#1C103D]">{planLabel}</p>
            </div>
          </div>
          <Badge className="rounded-full bg-[#6C3BFF]/10 px-4 py-1.5 text-[#6C3BFF] hover:bg-[#6C3BFF]/10">
            {plan === "ENTERPRISE" ? "Full ERP access" : "Essentials only"}
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {plans.map((tier, index) => {
          const isCurrent = tier === plan;
          const pricing = PLAN_PRICING[tier];
          const features = PLAN_FEATURES[tier];
          const isEnterprise = tier === "ENTERPRISE";

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                isEnterprise
                  ? "border-[#6C3BFF]/30 bg-white shadow-[0_16px_48px_rgba(108,59,255,0.12)]"
                  : "border-[#E8ECF4] bg-white"
              }`}
            >
              {isEnterprise && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#6C3BFF] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
              )}

              <div className="mb-4 flex items-center gap-2">
                {isEnterprise ? (
                  <Sparkles className="h-5 w-5 text-[#6C3BFF]" />
                ) : (
                  <Zap className="h-5 w-5 text-[#6B7280]" />
                )}
                <h2 className="text-xl font-bold text-[#1C103D]">{PLAN_LABELS[tier]}</h2>
              </div>

              <p className="text-sm text-[#6B7280]">{pricing.tagline}</p>

              <p className="mt-4">
                <span className="text-4xl font-bold text-[#1C103D]">₹{pricing.monthly}</span>
                <span className="text-[#6B7280]">/month</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#374151]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6C3BFF]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                disabled={isCurrent || isPending}
                onClick={() => switchPlan(tier)}
                className={`mt-6 h-11 rounded-2xl ${
                  isEnterprise
                    ? "bg-[#6C3BFF] hover:bg-[#5B2FE0]"
                    : "bg-[#1C103D] hover:bg-[#2D1B4E]"
                }`}
                variant={isCurrent ? "outline" : "default"}
              >
                {isCurrent
                  ? "Current plan"
                  : tier === "ENTERPRISE"
                    ? "Upgrade to Enterprise"
                    : "Switch to Basic"}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-sm text-[#9CA3AF]">
        Platform billing and invoices are managed on the{" "}
        <a href="/settings/billing" className="font-medium text-[#6C3BFF] hover:underline">
          billing page
        </a>
        .
      </p>
    </div>
  );
}
