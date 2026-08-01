"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PRICING_PLANS, type PricingPlan } from "../constants";
import { LandingCard, LandingSection, SectionEyebrow, sectionHeadingClass, primaryGradientButtonClass } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

function parseInrPrice(price: string): number | null {
  const digits = price.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number.parseInt(digits, 10);
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getDisplayPrice(plan: PricingPlan, annual: boolean) {
  if (plan.id === "enterprise") {
    return { price: plan.price, period: plan.period };
  }

  if (!annual) {
    return { price: plan.price, period: plan.period };
  }

  const base = parseInrPrice(plan.price);
  if (base === null) {
    return { price: plan.price, period: plan.period };
  }

  return {
    price: formatInr(Math.round(base * 0.85)),
    period: plan.period,
  };
}

function FeatureCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-snug text-[#1B1714]/80">
      <span
        className="mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[#2F6F5E]/[0.12]"
        aria-hidden
      >
        <Check className="h-2.5 w-2.5 text-[#2F6F5E]" strokeWidth={2.5} />
      </span>
      {children}
    </li>
  );
}

function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean;
  onChange: (annual: boolean) => void;
}) {
  return (
    <div className="mb-8 flex justify-center md:mb-10">
      <div
        className="inline-flex rounded-full border border-[#1B1714]/10 bg-white p-1 shadow-[0_2px_8px_rgba(27,23,20,0.04)]"
        role="group"
        aria-label="Billing frequency"
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2",
            !annual
              ? "bg-gradient-to-r from-violet-600 via-purple-500 to-violet-400 text-white shadow-[0_4px_16px_-4px_rgba(124,58,237,0.4)]"
              : "text-[#1B1714]/70 hover:text-[#1B1714]"
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2",
            annual
              ? "bg-gradient-to-r from-violet-600 via-purple-500 to-violet-400 text-white shadow-[0_4px_16px_-4px_rgba(124,58,237,0.4)]"
              : "text-[#1B1714]/70 hover:text-[#1B1714]"
          )}
        >
          Annual
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              annual
                ? "bg-[#C9A25D]/25 text-[#F7F3EC]"
                : "bg-[#C9A25D]/15 text-[#C9A25D]"
            )}
          >
            Save 15%
          </span>
        </button>
      </div>
    </div>
  );
}

export function PricingSection() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const [annual, setAnnual] = useState(false);

  return (
    <LandingSection id="pricing" band="ivory" className="bg-white">
      <div className="mb-8 text-center md:mb-10">
        <SectionEyebrow centered>Simple Pricing</SectionEyebrow>
        <h2 className={sectionHeadingClass}>
          Plans That <span className="italic text-violet-500">Grow With You</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
          14-day free trial. No credit card required.
        </p>
      </div>

      <BillingToggle annual={annual} onChange={setAnnual} />

      <div className="mx-auto grid max-w-md gap-5 overflow-visible sm:max-w-none md:grid-cols-2 md:gap-6 lg:max-w-[1280px] xl:grid-cols-4 xl:gap-5">
        {PRICING_PLANS.map((plan, i) => {
          const { price, period } = getDisplayPrice(plan, annual);

          return (
            <motion.div
              key={plan.id}
              className={cn(
                "relative h-full overflow-visible",
                plan.highlighted && !reduced && "md:z-10 md:scale-[1.025]"
              )}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduced ? 0 : i * 0.1, duration: 0.45 }}
            >
              <LandingCard
                className={cn(
                  "group relative flex h-full flex-col overflow-visible",
                  "p-7 sm:p-6",
                  plan.highlighted && "mt-3.5 pt-8 sm:pt-7",
                  "shadow-[0_8px_24px_rgba(27,23,20,0.06)]",
                  "transition-[transform,box-shadow] duration-[250ms] ease",
                  !reduced &&
                    "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(27,23,20,0.1)]",
                  plan.highlighted
                    ? "border-[1.5px] border-[#7C3AED] shadow-[0_12px_32px_rgba(27,23,20,0.09)]"
                    : "border-[#E4DDD1]"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[#C9A25D]/60 bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.14em] text-[#C9A25D] shadow-[0_0_0_4px_#F7F3EC]">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="landing-display text-lg font-semibold text-[#1B1714] md:text-xl">
                  {plan.name}
                </h3>

                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="landing-stat text-[2rem] font-semibold leading-none text-[#1B1714] md:text-[2.125rem]">
                    {price}
                  </span>
                  {period && (
                    <span className="text-sm text-[#1B1714]/60">{period}</span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-snug text-[#1B1714]/65">
                  {plan.description}
                </p>

                <div className="mt-4 border-t border-[#1B1714]/10 pt-4">
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <FeatureCheck key={f}>{f}</FeatureCheck>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.id === "enterprise" ? "#" : "/login"}
                  className={cn(
                    plan.highlighted
                      ? primaryGradientButtonClass("mt-6 block w-full py-3 text-center text-sm")
                      : cn(
                          "mt-6 block rounded-full py-3 text-center text-sm font-semibold",
                          "border border-[#1B1714]/25 text-[#1B1714]",
                          "transition-[transform,background-color,box-shadow,border-color] duration-200",
                          "hover:-translate-y-px hover:border-[#1B1714]/35 hover:bg-[#1B1714]/[0.06]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                        )
                  )}
                >
                  {plan.cta}
                </Link>
              </LandingCard>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-[#1B1714]/60 md:mt-10">
        All plans include free onboarding &amp; 24/7 support
      </p>
    </LandingSection>
  );
}
