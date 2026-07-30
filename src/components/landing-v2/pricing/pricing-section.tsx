"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { PRICING_PLANS } from "../constants";

export function PricingSection() {
  return (
    <SectionWrapper id="pricing">
      <SectionHeader
        badge="Pricing"
        title="Simple, Transparent Pricing"
        subtitle="Start free for 14 days. No credit card required. Upgrade when you're ready to scale."
      />

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {PRICING_PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={cn(
              "relative flex flex-col rounded-3xl border p-8",
              plan.highlighted
                ? "border-violet-200 bg-gradient-to-b from-violet-50 to-white shadow-xl shadow-violet-500/10"
                : "border-gray-200 bg-white shadow-sm"
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
              {plan.period && (
                <span className="text-sm text-gray-500">{plan.period}</span>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-500">{plan.description}</p>

            <ul className="mt-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.name === "Enterprise" ? "#" : "/signup"}
              className={cn(
                "mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition",
                plan.highlighted
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-violet-200 hover:bg-violet-50"
              )}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
