"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_PRIMARY, MEMBERSHIP_GOLD } from "@/lib/memberships/constants";
import type { PlanRecommendation } from "@/lib/memberships/recommendations";

export function RecommendationPanel({
  recommendation,
  className,
}: {
  recommendation: PlanRecommendation | null;
  className?: string;
}) {
  if (!recommendation) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900/50",
          className
        )}
      >
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Select a customer to see AI-powered plan recommendations.
        </p>
      </div>
    );
  }

  const { plan, estimatedAnnualSavings, reasons, matchLabel } = recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-amber-50/30 shadow-lg dark:border-emerald-900/40 dark:from-emerald-950/30 dark:via-stone-900 dark:to-amber-950/20",
        className
      )}
    >
      <div className="border-b border-emerald-100/80 px-5 py-4 dark:border-emerald-900/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: MEMBERSHIP_PRIMARY }} />
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            AI Recommendation
          </span>
          <span
            className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white"
            style={{ backgroundColor: MEMBERSHIP_GOLD }}
          >
            {matchLabel}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {plan.description}
            </p>
          </div>
          <div
            className="shrink-0 rounded-xl px-3 py-2 text-center"
            style={{ backgroundColor: `${plan.themeColor}18` }}
          >
            <p className="text-lg font-bold" style={{ color: plan.themeColor }}>
              {formatCurrency(plan.price)}
            </p>
            <p className="text-[10px] text-stone-500">{plan.validityDays} days</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-100/60 px-4 py-3 dark:bg-emerald-950/40">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Est. annual savings: {formatCurrency(estimatedAnnualSavings)}
          </span>
        </div>

        <ul className="mt-4 space-y-2">
          {reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: MEMBERSHIP_PRIMARY }}
              />
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
