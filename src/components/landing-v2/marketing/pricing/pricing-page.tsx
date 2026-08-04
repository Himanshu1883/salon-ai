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
export const aboutSectionPadding = "py-20 md:py-28 lg:py-32";
export const ABOUT_CONTAINER =
  "mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-10";



  export const FOOTER_STATS = [
    { value: 1000, suffix: "+", label: "Salons" },
    { value: 50, suffix: "K+", label: "Appointments" },
    { value: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
    { value: null, display: "24/7", label: "Support" },
  ] as const;

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
              <div className="mb-6 flex flex-col items-center gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#1B1714]/45">
                Pricing · Gotix ERP
                </p>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#5B21B6]/20 bg-white/70 py-1 pl-1 pr-4 text-xs font-medium text-[#5B21B6] shadow-sm backdrop-blur-sm">
                  <Image
                    src="/log.png"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-contain"
                    aria-hidden
                  />
                  One connected platform
                </span>
              </div>
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
      <section className="relative overflow-hidden border-b border-[#E8E4DE] py-16 md:py-20" style={{
  background: 'linear-gradient(135deg, #1A0B2E 0%, #2D1B69 30%, #4B1D8A 60%, #2D1B69 100%)'
}}>
  {/* Premium Animated Background */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Animated Gradient Orbs */}
    <motion.div
      className="absolute -right-40 top-1/4 h-[600px] w-[600px] rounded-full bg-[#8B5CF6]/20 blur-[120px]"
      animate={{
        x: [0, 40, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -left-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-[#5B21B6]/20 blur-[100px]"
      animate={{
        x: [0, -40, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/15 blur-[80px]"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity }}
    />

    {/* 3D Perspective Grid */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      perspective: '1000px',
      transform: 'rotateX(60deg)',
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      transformOrigin: 'bottom center',
    }} />

    {/* Floating Particles */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.4, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>

    {/* Floating Geometric Shapes */}
    <motion.div
      className="absolute right-[10%] top-[15%] h-16 w-16 rounded-xl border border-white/10"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 bg-white/5 rounded-xl" />
    </motion.div>

    <motion.div
      className="absolute left-[8%] bottom-[25%] h-12 w-12 rounded-full border border-white/10"
      animate={{
        rotate: [360, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 bg-white/5 rounded-full" />
    </motion.div>

    <motion.div
      className="absolute right-[20%] bottom-[30%] h-8 w-8 rotate-45 border border-white/10"
      animate={{
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    />
  </div>

  <div className={CONTAINER}>
    <Reveal className="mb-12 text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#C4B5FD]">
          FAQ
        </span>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
      </div>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[3.5rem]">
        Common{" "}
        <span className="bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6] bg-clip-text text-transparent">
          questions
        </span>
      </h2>
      <p className="mt-3 text-sm text-white/40">
        Everything you need to know about getting started with Gotix
      </p>
    </Reveal>

    <div className="mx-auto max-w-3xl space-y-4">
      {pricingFaqs.map((faq, index) => (
        <Reveal key={faq.question} delay={index * 0.06}>
          <motion.details
            className="group rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 open:border-[#8B5CF6]/50 open:bg-white/10 open:shadow-2xl open:shadow-[#5B21B6]/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <summary className="cursor-pointer list-none px-6 py-5 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-white/90 transition-colors duration-300 group-open:text-[#C4B5FD]">
                  {faq.question}
                </span>
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-[#C4B5FD] transition-all duration-300 group-open:rotate-45 group-open:border-[#8B5CF6]/50 group-open:bg-[#8B5CF6]/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </span>
            </summary>
            <div className="px-6 pb-5">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
              <p className="text-sm leading-relaxed text-white/60">
                {faq.answer}
              </p>
            </div>
          </motion.details>
        </Reveal>
      ))}
    </div>

    {/* Bottom CTA */}
    <Reveal delay={0.3}>
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-6 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
          <span className="text-sm text-white/40">
            Still have questions?
          </span>
          <span className="h-4 w-px bg-white/10" />
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[#C4B5FD] transition-all duration-300 hover:gap-3"
          >
            Contact our team
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </Reveal>

    {/* Bottom Decorative */}
    <Reveal delay={0.35}>
      <motion.div
        className="mt-12 flex items-center justify-center gap-4"
        whileHover={{ rotateX: 2 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.span
          className="h-px w-16 bg-gradient-to-r from-transparent to-white/10"
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="flex gap-1"
          animate={{
            rotateY: [0, 180, 360],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <span className="h-2 w-2 rotate-45 border border-white/10" />
          <span className="h-2 w-2 rotate-45 border border-white/10" />
          <span className="h-2 w-2 rotate-45 border border-white/10" />
        </motion.div>
        <motion.span
          className="h-px w-16 bg-gradient-to-l from-transparent to-white/10"
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </Reveal>
  </div>
</section>
      {/* Bottom CTA — ReflexAI style */}
      <section className={cn(aboutSectionPadding, "relative overflow-hidden bg-white")}>
  {/* Premium Background Design Elements */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Gradient blobs */}
    <div className="absolute -right-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#5B21B6]/[0.04] blur-3xl" />
    <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.03] blur-3xl" />
    <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#5B21B6]/[0.02] blur-3xl" />
    
    {/* Geometric shapes */}
    <div className="absolute left-[8%] top-[10%] h-16 w-16 rounded-full border border-[#5B21B6]/5" />
    <div className="absolute right-[12%] top-[20%] h-12 w-12 rotate-45 border border-[#5B21B6]/5" />
    <div className="absolute left-[5%] bottom-[25%] h-20 w-20 rounded-full border border-[#5B21B6]/5" />
    <div className="absolute right-[8%] bottom-[15%] h-14 w-14 rotate-12 border border-[#5B21B6]/5" />
    
    {/* Floating diamonds */}
    <div className="absolute left-[20%] top-[40%] h-3 w-3 rotate-45 border border-[#5B21B6]/10" />
    <div className="absolute right-[25%] bottom-[35%] h-4 w-4 rotate-45 border border-[#5B21B6]/10" />
    <div className="absolute left-[45%] top-[15%] h-3 w-3 rotate-45 border border-[#5B21B6]/10" />
    <div className="absolute right-[40%] bottom-[20%] h-3 w-3 rotate-45 border border-[#5B21B6]/10" />
    
    {/* Dot pattern */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: 'radial-gradient(circle, #5B21B6 1.5px, transparent 1.5px)',
      backgroundSize: '30px 30px'
    }} />
    
    {/* Diagonal line pattern */}
    <svg className="absolute inset-0 h-full w-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
      <pattern id="diagonalLines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="#5B21B6" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#diagonalLines)" />
    </svg>
    
    {/* Animated glowing lines */}
    <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ctaLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5B21B6" stopOpacity="0" />
          <stop offset="50%" stopColor="#5B21B6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5B21B6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="15%" y1="15%" x2="85%" y2="15%" stroke="url(#ctaLineGrad)" strokeWidth="0.5" />
      <line x1="15%" y1="85%" x2="85%" y2="85%" stroke="url(#ctaLineGrad)" strokeWidth="0.5" />
      <line x1="20%" y1="30%" x2="80%" y2="30%" stroke="url(#ctaLineGrad)" strokeWidth="0.3" />
      <line x1="20%" y1="70%" x2="80%" y2="70%" stroke="url(#ctaLineGrad)" strokeWidth="0.3" />
    </svg>
    
    {/* Corner decorative elements */}
    <div className="absolute left-8 top-8 h-12 w-12 border-l-2 border-t-2 border-[#5B21B6]/5" />
    <div className="absolute right-8 top-8 h-12 w-12 border-r-2 border-t-2 border-[#5B21B6]/5" />
    <div className="absolute bottom-8 left-8 h-12 w-12 border-b-2 border-l-2 border-[#5B21B6]/5" />
    <div className="absolute bottom-8 right-8 h-12 w-12 border-b-2 border-r-2 border-[#5B21B6]/5" />
    
    {/* Concentric circles */}
    <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5B21B6]/5" />
    <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5B21B6]/5" />
    <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5B21B6]/5" />
  </div>

  <div className={cn(ABOUT_CONTAINER, "relative max-w-3xl text-center")}>
    <Reveal>
      {/* Decorative top line */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#5B21B6]/20" />
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]/50">Let's Talk</span>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#5B21B6]/20" />
      </div>

      {/* Badge with stats */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#5B21B6]/10 bg-[#5B21B6]/5 px-4 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5B21B6] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5B21B6]" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#1B1714]/50">
          {FOOTER_STATS[0].value!.toLocaleString("en-IN")}+ Salons Onboard
        </span>
      </div>

      {/* Main heading */}
      <h2 className="landing-display mt-6 text-3xl font-medium md:text-4xl lg:text-5xl">
        Ready to Transform{" "}
        <span className="relative inline-block">
          <span className="relative z-10 italic text-[#5B21B6]">your Salon?</span>
          <span className="absolute -bottom-1 left-0 h-2 w-full bg-[#5B21B6]/5" />
        </span>
      </h2>

      {/* Description */}
      <p className="mx-auto mt-4 max-w-lg text-base text-[#1B1714]/65">
        Start a complimentary trial and discover how Gotix can bring
        your entire floor onto one intelligent platform.
      </p>

      {/* Divider with decorative elements */}
      <div className="my-8 flex items-center justify-center gap-4">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#5B21B6]/10" />
        <span className="text-[8px] text-[#5B21B6]/15">✦ ✦ ✦</span>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#5B21B6]/10" />
      </div>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-[#5B21B6]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#5B21B6]/30 hover:scale-105"
        >
          Start Free Trial
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
        <Link
          href="/#pricing"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[#E8E4DE] px-8 py-3.5 text-sm font-medium text-[#1B1714] transition-all duration-300 hover:border-[#5B21B6]/30 hover:bg-[#5B21B6]/5 hover:text-[#5B21B6]"
        >
          View Pricing
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Trust indicators */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {[
          { icon: "✨", text: "Free 14-Day Trial" },
          { icon: "💳", text: "No Credit Card" },
          { icon: "🔄", text: "Cancel Anytime" },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-sm">{item.icon}</span>
            <span className="text-xs text-[#1B1714]/40">{item.text}</span>
            {idx < 2 && <span className="h-3 w-px bg-[#1B1714]/10" />}
          </div>
        ))}
      </div>

      {/* Bottom decorative line */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#5B21B6]/10" />
        <span className="text-[8px] text-[#1B1714]/10">◆</span>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#5B21B6]/10" />
      </div>
    </Reveal>
  </div>
</section>
    </div>
  );
}
