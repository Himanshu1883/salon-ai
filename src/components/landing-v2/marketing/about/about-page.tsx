"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  BRAND,
  ERP_MODULES,
  FOOTER_STATS,
  IMAGES,
  SALON_TYPES,
  TESTIMONIALS,
} from "../../constants";
import {
  ABOUT_CONTAINER,
  aboutBracketLabel,
  aboutGradientButtonClass,
  aboutOutlineButtonClass,
  aboutSectionPadding,
} from "./about-styles";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const SERVICES = [
  {
    num: "01",
    title: "Salon Operations",
    description:
      "Appointments, walk-ins, queue, and POS — designed for how busy floors actually run.",
    tags: ["Booking", "Queue", "Billing"],
  },
  {
    num: "02",
    title: "Client Relationships",
    description:
      "CRM, memberships, and WhatsApp automation that turn one visit into lifelong loyalty.",
    tags: ["CRM", "Loyalty", "WhatsApp"],
  },
  {
    num: "03",
    title: "Inventory & Retail",
    description:
      "Stock, recipes, and retail sales tracked across every chair and every branch.",
    tags: ["Stock", "Retail", "Alerts"],
  },
  {
    num: "04",
    title: "AI & Insights",
    description:
      "Forecast demand, surface upsells, and see which services actually grow revenue.",
    tags: ["Analytics", "Forecasting", "Reports"],
  },
] as const;

const PROCESS = [
  {
    week: "Day 1",
    num: "01",
    title: "Discover & Setup",
    description:
      "We map your salon workflows, services, and staff — then configure Salon AI around how you already work.",
    points: ["Salon audit", "Module setup", "Team onboarding"],
  },
  {
    week: "Week 1",
    num: "02",
    title: "Launch & Train",
    description:
      "Go live with appointments, POS, and inventory. Your team learns in days, not months.",
    points: ["Live booking", "POS training", "Data import"],
  },
  {
    week: "Ongoing",
    num: "03",
    title: "Grow & Optimize",
    description:
      "AI insights, marketing automation, and multi-branch tools that scale with your brand.",
    points: ["AI analytics", "Automation", "Multi-branch"],
  },
] as const;

const STATS = [
  {
    value: FOOTER_STATS[0].value!,
    suffix: "+",
    label: "Salons running daily operations on Salon AI",
  },
  {
    value: 50,
    suffix: "K+",
    label: "Appointments managed through the platform",
    format: "k" as const,
  },
  {
    value: ERP_MODULES.length,
    suffix: "+",
    label: "Integrated modules in one salon ERP",
  },
  {
    value: SALON_TYPES.length,
    suffix: "",
    label: "Salon types we purpose-built for",
  },
];

function BracketLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className={aboutBracketLabel()}>
      <span className="text-[#1B1714]/35" aria-hidden>
        [
      </span>
      <span>{children}</span>
      <span className="text-[#1B1714]/35" aria-hidden>
        ]
      </span>
    </span>
  );
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
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={
        reduced
          ? { duration: 0.25, delay }
          : { duration: 0.55, delay, ease: EASE }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

function formatStat(
  stat: (typeof STATS)[number],
  value: number
): string {
  if ("format" in stat && stat.format === "k") {
    return `${Math.round(value)}${stat.suffix}`;
  }
  return `${Math.round(value).toLocaleString("en-IN")}${stat.suffix}`;
}

function AnimatedStat({
  stat,
  index,
  reduced,
}: {
  stat: (typeof STATS)[number];
  index: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const final = formatStat(stat, stat.value);
  const [display, setDisplay] = useState(reduced ? final : "0");

  useEffect(() => {
    if (reduced || !inView) {
      if (inView) setDisplay(final);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatStat(stat, stat.value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, stat, final]);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: EASE }}
      className="border-t border-white/15 pt-6"
    >
      <p className="landing-display text-4xl font-semibold tabular-nums text-white md:text-5xl">
        {display}
      </p>
      <p className="mt-3 max-w-[14rem] text-sm leading-relaxed text-white/60">
        {stat.label}
      </p>
    </motion.div>
  );
}

export function AboutPageContent() {
  const reduced = !!useReducedMotion();
  const featured = TESTIMONIALS[0];

  return (
    <div className="bg-[#FAF9F7] text-[#1B1714]">
      {/* ── Hero — Docs-style centered 100vh banner ── */}
      <section className="hero-editorial relative min-h-[100svh] overflow-hidden border-b border-[#E8E4DE]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/bg2.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#F7F3EC]/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F7F3EC]/75 via-[#F7F3EC]/55 to-[#F7F3EC]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(247,243,236,0.55),transparent_70%)]" />
          <div className="hero-editorial__grain absolute inset-0 opacity-90" />
        </div>

        <div
          className={cn(
            ABOUT_CONTAINER,
            "relative z-10 flex min-h-[100svh] flex-col items-center justify-center text-center",
            "pb-16 pt-[calc(var(--landing-nav-h)+2rem)]"
          )}
        >
          <div className="max-w-4xl">
            <Reveal>
              <div className="mb-6 flex flex-col items-center gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#1B1714]/45">
                  Trusted by {FOOTER_STATS[0].value!.toLocaleString("en-IN")}+
                  salons
                </p>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#5B21B6]/20 bg-white/70 px-4 py-1.5 text-xs font-medium text-[#5B21B6] shadow-sm backdrop-blur-sm">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]"
                    aria-hidden
                  />
                  Welcome to Salon AI
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="landing-display text-[2.25rem] font-medium leading-[1.1] tracking-tight text-[#1B1714] sm:text-5xl md:text-6xl lg:text-[3.75rem]">
                Salons that run smarter on Salon AI
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
                {BRAND.tagline}. Appointments, billing, inventory, and AI — one
                platform built for how modern salons actually work.
              </p>
            </Reveal>
            <Reveal
              delay={0.18}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href="/login"
                className={aboutGradientButtonClass("px-7 py-3.5 text-sm")}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/#pricing" className={aboutOutlineButtonClass()}>
                Explore Platform
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="relative overflow-hidden border-b border-[#E8E4DE]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[#F7F3EC]" />
          <div className="absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full bg-[#5B21B6]/[0.06] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[55%] w-[55%] rounded-full bg-[#4F46E5]/[0.05] blur-3xl" />
          <div className="hero-editorial__grain absolute inset-0 opacity-60" />
          <p className="landing-display absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none text-[clamp(6rem,18vw,14rem)] font-medium leading-none tracking-tight text-[#1B1714]/[0.035] lg:block">
            System
          </p>
        </div>

        <div className={cn(ABOUT_CONTAINER, aboutSectionPadding, "relative z-10")}>
          <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 xl:gap-20">
            <div>
              <Reveal>
                <div className="flex items-center gap-4">
                  <span
                    className="h-px w-10 bg-[#5B21B6]/50"
                    aria-hidden
                  />
                  <BracketLabel>Our Philosophy</BracketLabel>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <h2 className="landing-display mt-8 max-w-xl text-[2rem] font-medium leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:max-w-none lg:text-[3.25rem]">
                  Where every appointment matters & every{" "}
                  <span className="italic text-[#5B21B6]">
                    salon has a system
                  </span>
                </h2>
              </Reveal>

              <Reveal delay={0.18}>
                <p className="mt-7 max-w-md text-base leading-relaxed text-[#1B1714]/60 md:text-lg">
                  Software should disappear into the rhythm of the floor —
                  so owners see the business, and stylists stay with the client.
                </p>
              </Reveal>

              <Reveal delay={0.26}>
                <ul className="mt-10 flex flex-col gap-5 border-t border-[#1B1714]/10 pt-8 sm:flex-row sm:gap-10">
                  {[
                    { label: "Clarity", detail: "One source of truth" },
                    { label: "Rhythm", detail: "Built for peak hours" },
                    { label: "Care", detail: "Clients come back" },
                  ].map((item) => (
                    <li key={item.label} className="min-w-0">
                      <p className="text-sm font-semibold tracking-wide text-[#1B1714]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm text-[#1B1714]/45">
                        {item.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={0.14} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:aspect-[5/6] lg:aspect-auto lg:min-h-[480px]">
                <Image
                  src={IMAGES.salonWorkspace}
                  alt="Calm salon workspace with styling stations"
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1714]/55 via-[#1B1714]/10 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-[#1B1714]/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                    Built for the floor
                  </p>
                  <p className="landing-display mt-2 text-xl font-medium leading-snug text-white md:text-2xl">
                    Operations that feel{" "}
                    <span className="italic text-[#C4B5FD]">intentional</span>
                  </p>
                </div>
              </div>
              <div
                className="pointer-events-none absolute -bottom-4 -left-4 hidden h-24 w-24 rounded-full border border-[#5B21B6]/20 bg-[#5B21B6]/[0.06] blur-sm lg:block"
                aria-hidden
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Founder's note / Mission quote ── */}
      <section className={cn(aboutSectionPadding, "bg-[#EFE8DC]")}>
        <div className={ABOUT_CONTAINER}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <Reveal>
              <BracketLabel>Founder&apos;s Note</BracketLabel>
              <p className="landing-display mt-8 text-2xl font-medium leading-snug text-[#1B1714] md:text-3xl lg:text-[2rem]">
                &ldquo;Our mission is to craft salon software that doesn&apos;t
                just track numbers, but{" "}
                <span className="italic text-[#5B21B6]">
                  feels built for the floor
                </span>{" "}
                — where technology serves the stylist, not the other way
                around.&rdquo;
              </p>
              <div className="mt-8 border-t border-[#1B1714]/10 pt-5">
                <p className="text-sm font-semibold tracking-wide text-[#1B1714]">
                  SALON AI TEAM
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#1B1714]/45">
                  Product & Design
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:h-full lg:min-h-[420px]">
                <Image
                  src={IMAGES.reception}
                  alt="Salon reception and team"
                  fill
                  className="object-cover saturate-[0.9]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className={cn(aboutSectionPadding, "border-b border-[#E8E4DE]")}>
        <div className={ABOUT_CONTAINER}>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="relative aspect-[5/6] overflow-hidden rounded-2xl">
                <Image
                  src={IMAGES.salonWorkspace}
                  alt="Salon workspace"
                  fill
                  className="object-cover saturate-[0.88]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:pt-8">
              <h3 className="landing-display text-2xl font-medium md:text-3xl">
                Our Story
              </h3>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-[#1B1714]/70">
                <p>
                  Salon AI grew from a simple belief: great salon software
                  starts with listening. We spent time on real salon floors
                  before we designed a single screen.
                </p>
                <p>
                  Every module is personal — rooted in how stylists book,
                  how owners reconcile the day, and how Indian salons actually
                  grow. Enterprise-grade tools without enterprise complexity.
                </p>
                <p>
                  Today, {FOOTER_STATS[0].value!.toLocaleString("en-IN")}+
                  salons run appointments, billing, inventory, and AI insights
                  on one intelligent platform.
                </p>
              </div>
              <Link
                href="/login"
                className={cn(
                  aboutOutlineButtonClass(),
                  "mt-8 gap-2 border-[#5B21B6]/30 text-[#5B21B6] hover:border-[#5B21B6]/50"
                )}
              >
                Learn More
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── What we do — numbered services ── */}
      <section className={cn(aboutSectionPadding, "bg-[#FAF9F7]")}>
        <div className={ABOUT_CONTAINER}>
          <Reveal className="max-w-2xl">
            <BracketLabel>What We Do</BracketLabel>
            <h2 className="landing-display mt-5 text-3xl font-medium leading-tight md:text-4xl">
              Full-Spectrum Salon ERP Excellence
            </h2>
            <p className="mt-4 text-base text-[#1B1714]/65">
              From first booking to final invoice, we design tools that elevate
              how you run, grow, and feel about your salon — every day.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((service, index) => (
              <Reveal key={service.num} delay={index * 0.08}>
                <article
                  className={cn(
                    "group flex h-full flex-col rounded-2xl border border-[#E8E4DE] bg-white p-6 md:p-8",
                    "shadow-[0_4px_24px_rgba(27,23,20,0.04)]",
                    "transition-[transform,box-shadow,border-color] duration-300",
                    "hover:-translate-y-1 hover:border-[#5B21B6]/25 hover:shadow-[0_12px_40px_rgba(91,33,182,0.1)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-xs tracking-widest text-[#5B21B6]/70">
                      [ {service.num} / MODULE ]
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#E8E4DE] px-2.5 py-0.5 text-[11px] text-[#1B1714]/50"
                      >
                        [{tag}]
                      </span>
                    ))}
                  </div>
                  <h3 className="landing-display mt-6 text-xl font-medium md:text-2xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#1B1714]/65 md:text-base">
                    {service.description}
                  </p>
                  <Link
                    href="/#modules"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5B21B6] transition-colors hover:text-[#4C1D95]"
                  >
                    Learn More
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured client quote ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={IMAGES.salonChair}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#1B1714]/75" />
        </div>
        <div className={cn(ABOUT_CONTAINER, "relative max-w-3xl text-center")}>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              {featured.name} · {featured.role}
            </p>
            <p className="mt-2 text-sm text-white/40">{featured.salon}</p>
            <blockquote className="landing-display mt-8 text-2xl font-medium leading-snug text-white md:text-3xl lg:text-4xl">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section className="bg-[#2E1065] py-20 md:py-28">
        <div className={ABOUT_CONTAINER}>
          <Reveal>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              <span className="text-white/35">[</span> Platform Impact{" "}
              <span className="text-white/35">]</span>
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
              [ 2020 — 2026 ]
            </p>
            <h2 className="landing-display mt-5 max-w-3xl text-3xl font-medium leading-snug text-white md:text-4xl">
              Years of transforming salon floors into{" "}
              <span className="italic text-[#C4B5FD]">
                systems worth running
              </span>
              .
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {STATS.map((stat, index) => (
              <AnimatedStat
                key={stat.label}
                stat={stat}
                index={index}
                reduced={reduced}
              />
            ))}
          </div>

          <Reveal delay={0.2} className="mt-14">
            <Link
              href="/login"
              className={aboutGradientButtonClass("px-8 py-3.5 text-sm")}
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Client stories ── */}
      <section className={cn(aboutSectionPadding, "border-b border-[#E8E4DE]")}>
        <div className={ABOUT_CONTAINER}>
          <Reveal className="max-w-2xl">
            <BracketLabel>Client Stories</BracketLabel>
            <h2 className="landing-display mt-5 text-3xl font-medium md:text-4xl">
              Spaces That Inspire Lasting Loyalty
            </h2>
            <p className="mt-4 text-base text-[#1B1714]/65">
              Our work speaks through the voices of salon owners — lasting
              partnerships built on trust and measurable results.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t, index) => (
              <Reveal key={t.id} delay={index * 0.08}>
                <article className="flex h-full flex-col border-t border-[#1B1714]/12 pt-6">
                  <p className="flex-1 text-base leading-relaxed text-[#1B1714]/75">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full">
                      <Image
                        src={t.image}
                        alt={t.alt}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1B1714]">
                        {t.name}
                      </p>
                      <p className="text-xs text-[#1B1714]/45">
                        {t.role} · {t.salon}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <p className="mt-12 text-center text-sm text-[#1B1714]/45">
              Trusted by salon owners & brands across India
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── How we work ── */}
      <section className={cn(aboutSectionPadding, "bg-[#EFE8DC]")}>
        <div className={ABOUT_CONTAINER}>
          <Reveal className="max-w-2xl">
            <BracketLabel>How We Work</BracketLabel>
            <h2 className="landing-display mt-5 text-3xl font-medium md:text-4xl">
              A Clear Path From Vision to Reality
            </h2>
            <p className="mt-4 text-base text-[#1B1714]/65">
              Every salon follows a structured three-phase process — so you
              always know what&apos;s happening and what comes next.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PROCESS.map((step, index) => (
              <Reveal key={step.num} delay={index * 0.1}>
                <article className="flex h-full flex-col rounded-2xl border border-[#E8E4DE] bg-white p-6 md:p-7">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-[#E8E4DE] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#1B1714]/50">
                      [ {step.week} ]
                    </span>
                    <span className="font-mono text-sm text-[#5B21B6]">
                      /{step.num}
                    </span>
                  </div>
                  <h3 className="landing-display mt-6 text-xl font-medium">
                    {step.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#1B1714]/65">
                    {step.description}
                  </p>
                  <ul className="mt-6 space-y-2 border-t border-[#E8E4DE] pt-5">
                    {step.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-sm text-[#1B1714]/70"
                      >
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-[#5B21B6]"
                          strokeWidth={2}
                          aria-hidden
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={cn(aboutSectionPadding, "border-t border-[#E8E4DE]")}>
        <div className={cn(ABOUT_CONTAINER, "max-w-3xl text-center")}>
          <Reveal>
            <BracketLabel>Let&apos;s Talk</BracketLabel>
            <p className="mt-4 text-sm text-[#1B1714]/45">
              {FOOTER_STATS[0].value!.toLocaleString("en-IN")}+ salons onboard
            </p>
            <h2 className="landing-display mt-5 text-3xl font-medium md:text-4xl lg:text-5xl">
              Ready to Transform{" "}
              <span className="italic text-[#5B21B6]">your Salon?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-[#1B1714]/65">
              Start a complimentary trial and discover how Salon AI can bring
              your entire floor onto one intelligent platform.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className={aboutGradientButtonClass("px-8 py-3.5 text-sm")}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/#pricing" className={aboutOutlineButtonClass()}>
                View Pricing
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
