"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FAQ_ITEMS,
  PRICING_PLANS,
  type PricingPlan,
} from "../../constants";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;
const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-10";

const TIER_LABELS: Record<string, string> = {
  starter: "essential",
  professional: "growth",
  business: "pro",
  enterprise: "enterprise",
};

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
    return { price: plan.price, period: "" };
  }
  if (!annual) {
    return { price: plan.price, period: plan.period };
  }
  const base = parseInrPrice(plan.price);
  if (base === null) return { price: plan.price, period: plan.period };
  return {
    price: formatInr(Math.round(base * 0.85)),
    period: "/month",
  };
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = !!useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduced
          ? { duration: 0.2, delay }
          : { duration: 0.5, delay, ease: EASE }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FeatureRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-snug text-[#1B1714]/75">
      <span
        className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#5B21B6]/10"
        aria-hidden
      >
        <Check className="h-2.5 w-2.5 text-[#5B21B6]" strokeWidth={2.5} />
      </span>
      {children}
    </li>
  );
}

function PlanCard({
  plan,
  annual,
  index,
}: {
  plan: PricingPlan;
  annual: boolean;
  index: number;
}) {
  const display = getDisplayPrice(plan, annual);
  const tier = TIER_LABELS[plan.id] ?? plan.id;
  const isPopular = !!plan.highlighted;

  return (
    <Reveal delay={index * 0.08} className="h-full">
      <article
        className={cn(
          "relative flex h-full flex-col rounded-2xl border bg-white p-6 md:p-7",
          "shadow-[0_4px_24px_rgba(27,23,20,0.05)]",
          "transition-[transform,box-shadow,border-color] duration-300",
          isPopular
            ? "border-[#5B21B6]/40 shadow-[0_12px_40px_rgba(91,33,182,0.12)] ring-1 ring-[#5B21B6]/15"
            : "border-[#E8E4DE] hover:-translate-y-1 hover:border-[#5B21B6]/25 hover:shadow-[0_12px_32px_rgba(91,33,182,0.08)]"
        )}
      >
        {isPopular && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            Most popular
          </span>
        )}

        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#5B21B6]/80">
          {tier}
        </p>
        <h3 className="landing-display mt-2 text-2xl font-medium text-[#1B1714]">
          {plan.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/55">
          {plan.description}
        </p>

        <div className="mt-6 flex items-baseline gap-1">
          <span className="landing-display text-3xl font-semibold tabular-nums text-[#1B1714] md:text-4xl">
            {display.price}
          </span>
          {display.period && (
            <span className="text-sm text-[#1B1714]/45">{display.period}</span>
          )}
        </div>
        {annual && plan.id !== "enterprise" && (
          <p className="mt-1 text-xs text-[#2F6F5E]">Billed annually · save 15%</p>
        )}

        <Link
          href={plan.id === "enterprise" ? "/login" : "/login"}
          className={cn(
            "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-[transform,background-color,box-shadow] duration-200",
            isPopular
              ? "bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white shadow-[0_8px_24px_-6px_rgba(91,33,182,0.4)] hover:-translate-y-px"
              : "border border-[#1B1714]/20 bg-[#FAF9F7] text-[#1B1714] hover:border-[#5B21B6]/35 hover:bg-white"
          )}
        >
          {plan.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>

        <div className="mt-8 border-t border-[#E8E4DE] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1B1714]/40">
            Key features included
          </p>
          <ul className="mt-4 space-y-3">
            {plan.features.map((feature) => (
              <FeatureRow key={feature}>{feature}</FeatureRow>
            ))}
          </ul>
        </div>
      </article>
    </Reveal>
  );
}

export function PricingPageContent() {
  const [annual, setAnnual] = useState(false);
  const standardPlans = PRICING_PLANS.filter((p) => p.id !== "enterprise");
  const enterprise = PRICING_PLANS.find((p) => p.id === "enterprise")!;
  const pricingFaqs = FAQ_ITEMS.filter((f) =>
    /trial|payment|set up|WhatsApp/i.test(f.question)
  );

  return (
    <div className="bg-white text-[#1B1714]">
      {/* Hero — 100vh banner */}
      <section className="hero-editorial relative min-h-[100svh] overflow-hidden border-b border-[#E8E4DE]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/pricing.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-white/55" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_42%,rgba(255,255,255,0.35),transparent_68%)]" />
          <div className="hero-editorial__grain absolute inset-0 opacity-40" />
        </div>

        <div
          className={cn(
            CONTAINER,
            "relative z-10 flex min-h-[100svh] flex-col items-center justify-center text-center",
            "pb-16 pt-[calc(var(--landing-nav-h)+2rem)]"
          )}
        >
          <div className="max-w-4xl">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#1B1714]/45">
                Pricing · Salon AI ERP
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="landing-display mt-6 text-[2.5rem] font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem]">
                Pricing that scales with your salon,{" "}
                <span className="italic text-[#5B21B6]">and your ROI</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
                Flexible plans designed to reduce ops cost, save floor time, and
                deliver value from day one.
              </p>
            </Reveal>

            <Reveal
              delay={0.24}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(91,33,182,0.4)] transition-[transform,box-shadow] hover:-translate-y-px"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#plans"
                className="inline-flex items-center rounded-full border border-[#1B1714]/25 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#1B1714] backdrop-blur-sm transition-colors hover:border-[#5B21B6]/35 hover:bg-white"
              >
                View plans
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section
        id="plans"
        className="scroll-mt-24 border-b border-[#E8E4DE] bg-white pb-16 pt-12 md:pb-24 md:pt-16"
      >
        <div className={CONTAINER}>
          <Reveal className="mb-10 flex justify-center">
            <div
              className="inline-flex rounded-full border border-[#E8E4DE] bg-white p-1 shadow-[0_2px_8px_rgba(27,23,20,0.04)]"
              role="group"
              aria-label="Billing frequency"
            >
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  !annual
                    ? "bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white shadow-sm"
                    : "text-[#1B1714]/60 hover:text-[#1B1714]"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  annual
                    ? "bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white shadow-sm"
                    : "text-[#1B1714]/60 hover:text-[#1B1714]"
                )}
              >
                Annual
                <span className="ml-1.5 text-[10px] opacity-80">−15%</span>
              </button>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {standardPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                annual={annual}
                index={index}
              />
            ))}
          </div>

          {/* Enterprise — ReflexAI full-width dark card */}
          <Reveal delay={0.2} className="mt-6 md:mt-8">
            <article className="relative overflow-hidden rounded-2xl bg-[#2E1065] px-6 py-8 text-white md:flex md:items-center md:justify-between md:gap-10 md:px-10 md:py-10">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(167,139,250,0.2),transparent_55%)]"
                aria-hidden
              />
              <div className="relative max-w-xl">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#C4B5FD]">
                  enterprise
                </p>
                <h3 className="landing-display mt-2 text-2xl font-medium md:text-3xl">
                  {enterprise.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-base">
                  Schedule time with our team to walk through enterprise
                  solutions built for multi-branch chains, custom integrations,
                  and higher-volume operations.
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {enterprise.features.slice(0, 4).map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 text-xs text-white/70"
                    >
                      <Check className="h-3 w-3 text-[#C4B5FD]" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mt-8 shrink-0 md:mt-0">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#2E1065] transition-[transform,background-color] hover:-translate-y-px hover:bg-[#C4B5FD]"
                >
                  Talk to us
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="landing-preview-band border-b border-[#E8E4DE] py-16 md:py-20">
        <div className={CONTAINER}>
          <Reveal className="mb-10 text-center">
            <h2 className="landing-display text-2xl font-medium md:text-3xl">
              Common questions
            </h2>
          </Reveal>
          <div className="mx-auto grid max-w-3xl gap-4">
            {pricingFaqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.05}>
                <details className="group rounded-xl border border-[#E8E4DE] bg-white px-5 py-4 open:shadow-[0_4px_20px_rgba(27,23,20,0.05)]">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[#1B1714] marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {faq.question}
                      <span className="text-[#5B21B6] transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#1B1714]/65">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA — ReflexAI style */}
      <section className="bg-white py-20 md:py-28">
        <div className={cn(CONTAINER, "max-w-2xl text-center")}>
          <Reveal>
            <h2 className="landing-display text-3xl font-medium md:text-4xl">
              Ready to elevate every{" "}
              <span className="italic text-[#5B21B6]">appointment?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-[#1B1714]/60">
              Start a 14-day free trial with full module access. No credit card
              required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(91,33,182,0.4)] transition-[transform,box-shadow] hover:-translate-y-px"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-[#1B1714]/20 bg-white px-8 py-3.5 text-sm font-semibold text-[#1B1714] hover:border-[#5B21B6]/30"
              >
                Learn about us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
