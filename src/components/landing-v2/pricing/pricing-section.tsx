"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { IMAGES, PRICING_PLANS } from "../constants";
import { SectionWrapper } from "../ui/section-wrapper";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="relative overflow-hidden">
      <Image
        src={IMAGES.pricingBg}
        alt="Luxury salon background for pricing section"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-white/92 backdrop-blur-sm" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-purple-600">
            Simple Pricing
          </p>
          <h2 className="font-serif text-3xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Plans That Grow With You
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={cn(
                "relative overflow-hidden rounded-3xl p-8 shadow-xl",
                plan.highlighted
                  ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white ring-4 ring-emerald-300/50"
                  : "bg-white text-gray-900 ring-1 ring-gray-200"
              )}
            >
              {plan.highlighted && (
                <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold md:text-5xl">{plan.price}</span>
                {plan.period && (
                  <span className={plan.highlighted ? "text-emerald-100" : "text-gray-500"}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={cn("mt-3 text-sm", plan.highlighted ? "text-emerald-100" : "text-gray-600")}>
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", plan.highlighted ? "text-emerald-200" : "text-emerald-600")} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === "enterprise" ? "#" : "/register"}
                className={cn(
                  "mt-8 block rounded-xl py-3.5 text-center text-sm font-semibold transition",
                  plan.highlighted
                    ? "bg-white text-emerald-700 hover:bg-emerald-50"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
