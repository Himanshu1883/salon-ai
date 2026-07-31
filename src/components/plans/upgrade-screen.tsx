"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PLAN_FEATURES,
  PLAN_LABELS,
  PLAN_PRICING,
  type PlanModule,
  type SalonPlan,
} from "@/lib/plans";

type UpgradeScreenProps = {
  featureName?: string;
  module?: PlanModule | null;
  currentPlan?: SalonPlan;
};

export function UpgradeScreen({
  featureName = "This feature",
  module,
  currentPlan = "BASIC",
}: UpgradeScreenProps) {
  const enterpriseFeatures = PLAN_FEATURES.ENTERPRISE.filter(
    (feature) => !PLAN_FEATURES.BASIC.includes(feature)
  );

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E8ECF4] bg-white shadow-[0_20px_60px_rgba(108,59,255,0.12)]"
      >
        <div className="bg-gradient-to-br from-[#6C3BFF] via-[#7C4DFF] to-[#FF2D6F] px-8 py-10 text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold">
            Upgrade to unlock {featureName}
          </h1>
          <p className="mt-2 text-center text-sm text-violet-100/90">
            You&apos;re on the {PLAN_LABELS[currentPlan]} plan. Enterprise unlocks the full
            Salon AI ERP experience.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C3BFF]/10 text-[#6C3BFF]">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[#1C103D]">Enterprise Plan</p>
                <p className="text-sm text-[#6B7280]">
                  {PLAN_PRICING.ENTERPRISE.tagline} ·{" "}
                  <span className="font-medium text-[#6C3BFF]">
                    ₹{PLAN_PRICING.ENTERPRISE.monthly}/mo
                  </span>
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {enterpriseFeatures.slice(0, 6).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[#374151]">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#6C3BFF]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {module && (
            <p className="text-center text-sm text-[#6B7280]">
              {featureName} is part of our Enterprise toolkit for salons that need
              analytics, marketing, and advanced operations.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 flex-1 rounded-2xl bg-[#6C3BFF] text-base font-semibold hover:bg-[#5B2FE0]"
            >
              <Link href="/settings/subscription">Upgrade Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 flex-1 rounded-2xl border-[#E8ECF4]"
            >
              <Link href="/settings/billing">View billing</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
