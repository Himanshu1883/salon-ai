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
      "We map your salon workflows, services, and staff — then configure Gotix around how you already work.",
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
    label: "Salons running daily operations on Gotix",
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
    <div className="bg-white text-[#1B1714]">
      {/* ── Hero — Docs-style centered 100vh banner ── */}
      <section className="hero-editorial relative min-h-[100svh] overflow-hidden border-b border-[#E8E4DE]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/about.png"
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
                <span className="inline-flex items-center gap-2 rounded-full border border-[#5B21B6]/20 bg-white/70 py-1 pl-1 pr-4 text-xs font-medium text-[#5B21B6] shadow-sm backdrop-blur-sm">
                  <Image
                    src="/log.png"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-contain"
                    aria-hidden
                  />
                  Welcome to Gotix
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="landing-display text-[2.25rem] font-medium leading-[1.1] tracking-tight text-[#1B1714] sm:text-5xl md:text-6xl lg:text-[3.75rem]">
              Salons that run smarter on {" "}
                <span className="italic text-[#5B21B6]">
                 Gotix.
                </span>
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
      <section className="relative overflow-hidden bg-[#FAF8F6]">
  {/* Premium Background Elements */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Large geometric shapes */}
    <div className="absolute -right-20 top-20 h-[500px] w-[500px] rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02]" />
    <div className="absolute -left-40 bottom-0 h-[600px] w-[600px] rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.015]" />
    
    {/* Diagonal lines pattern */}
    <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <pattern id="diagonal-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="#5B21B6" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
    </svg>

    {/* Large floating text */}
    <p className="absolute -right-10 top-1/2 hidden -translate-y-1/2 select-none text-[clamp(8rem,20vw,16rem)] font-bold leading-none tracking-tight text-[#5B21B6]/[0.03] lg:block">
      SALON
    </p>
  </div>

  <div className={cn(ABOUT_CONTAINER, aboutSectionPadding, "relative z-10")}>
    {/* Unique Split Layout */}
    <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      
      {/* Left Column - Text Content with New Layout */}
      <div className="order-2 flex flex-col justify-center lg:order-1">
        <Reveal>
          {/* Unique Label with Dot */}
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-[#5B21B6]" />
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#5B21B6]">
              Why Gotix
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {/* Unique Heading Style */}
          <h2 className="mt-6 text-4xl font-light leading-[1.1] tracking-tight text-[#1B1714] sm:text-5xl md:text-6xl lg:text-[3.8rem]">
            The system that{" "}
            <span className="relative inline-block">
              <span className="relative z-10 font-bold italic text-[#5B21B6]">
                empowers
              </span>
              <span className="absolute -bottom-1 left-0 h-2 w-full bg-[#5B21B6]/10" />
            </span>{" "}
            your salon
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          {/* Unique Description with Icon */}
          <div className="mt-8 flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#5B21B6]/20 bg-[#5B21B6]/5">
              <svg className="h-5 w-5 text-[#5B21B6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-base leading-relaxed text-[#1B1714]/60 md:text-lg">
              Technology that disappears into the rhythm of the floor — so owners see the business, and stylists stay with the client.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          {/* Unique Stats Grid - Different from before */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[#1B1714]/10 pt-8">
            {[
              { number: "92%", label: "Faster booking" },
              { number: "3.5x", label: "Revenue growth" },
              { number: "100%", label: "Client retention" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-2xl font-bold text-[#5B21B6] md:text-3xl">
                  {stat.number}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#1B1714]/45">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          {/* Unique CTA with Icon */}
          <div className="mt-8 flex items-center gap-6">
            <button className="group inline-flex items-center gap-3 rounded-full bg-[#5B21B6] px-8 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#4B1B96] hover:shadow-lg hover:shadow-[#5B21B6]/20">
              Get Started
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <span className="text-xs text-[#1B1714]/30">No credit card required</span>
          </div>
        </Reveal>
      </div>

      {/* Right Column - Unique Card-Style Image */}
      <div className="order-1 lg:order-2">
        <Reveal delay={0.1}>
          <motion.div 
            className="relative"
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Unique Floating Card Layout */}
            <div className="relative rounded-[2rem] bg-white p-4 shadow-2xl shadow-[#5B21B6]/5 ring-1 ring-[#1B1714]/5">
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:aspect-[5/6] lg:aspect-auto lg:min-h-[520px]">
                <Image
                  src={IMAGES.salonWorkspace}
                  alt="Modern salon workspace"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.05]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
                
                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1714]/60 via-[#1B1714]/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#5B21B6]/10 via-transparent to-transparent" />
                
                {/* Ring Effect */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />

                {/* Unique Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#5B21B6] shadow-lg backdrop-blur-sm"
                >
                  ✦ Live Demo
                </motion.div>

                {/* Bottom Content - Unique Layout */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-end justify-between"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                        Experience the difference
                      </p>
                      <p className="mt-2 text-xl font-medium text-white md:text-2xl">
                        Built for the{" "}
                        <span className="italic text-[#C4B5FD]">modern</span> salon
                      </p>
                    </div>
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full border border-[#5B21B6]/10 bg-[#5B21B6]/5 blur-2xl" />
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/5 blur-xl" />
              </div>
            </div>

            {/* Unique Decorations */}
            <div className="absolute -bottom-8 -right-8 hidden h-20 w-20 rounded-full border-2 border-[#5B21B6]/10 bg-white lg:block" />
            <div className="absolute -top-8 -left-8 hidden h-16 w-16 rounded-full border-2 border-[#5B21B6]/10 bg-white lg:block" />
          </motion.div>
        </Reveal>
      </div>
    </div>
  </div>
</section>

      {/* ── Founder's note / Mission quote ── */}
    <section className={cn(aboutSectionPadding, "relative overflow-hidden bg-white border-b border-[#E8E4DE]")}>
  {/* Large Background Text - "OUR MISSION" as watermark */}
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
    <span className="select-none text-[clamp(6rem,20vw,16rem)] font-bold leading-none tracking-[-0.03em] text-[#1B1714]/[0.04]">
      OUR MISSION
    </span>
  </div>

  <div className={ABOUT_CONTAINER}>
    <div className="relative z-10 mx-auto max-w-4xl text-center">
      
      <Reveal>
        {/* [ FOUNDER'S NOTE ] - Centered */}
        <div className="mb-8">
          <span className="text-[11px] font-medium tracking-[0.3em] text-[#5B21B6]">
            [ FOUNDER'S NOTE ]
          </span>
        </div>

        {/* Quote - Large, elegant, centered */}
        <blockquote>
          <p className="text-[1.6rem] font-light leading-[1.5] tracking-tight text-[#1B1714] md:text-[2rem] lg:text-[2.4rem]">
            "Our mission is to craft salon software that doesn't just track numbers, but{" "}
            <span className="font-medium italic text-[#5B21B6]">
              feels built for the floor
            </span>{" "}
            — where technology serves the stylist, not the other way around."
          </p>
        </blockquote>

        {/* Attribution - Centered */}
        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#1B1714]">
            GOTIX TEAM
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#1B1714]/40">
            PRODUCT & DESIGN
          </p>
        </div>
      </Reveal>
    </div>
  </div>
</section>

      {/* ── Our Story ── */}
      <section className={cn(aboutSectionPadding, "border-b border-[#E8E4DE] bg-white relative overflow-hidden")}>
  {/* Large Background Text */}
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
    <span className="select-none text-[clamp(6rem,15vw,12rem)] font-bold leading-none tracking-[-0.03em] text-[#1B1714]/[0.04]">
      OUR STORY
    </span>
  </div>

  {/* Decorative diagonal lines */}
  <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden>
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <pattern id="diagonalLines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="#5B21B6" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#diagonalLines)" />
    </svg>
  </div>

  <div className={ABOUT_CONTAINER}>
    <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20 relative z-10">
      
      {/* Left Column - Image with unique line accents */}
      <Reveal>
        <div className="relative">
          {/* Decorative corner lines around image */}
          <div className="absolute -left-4 -top-4 h-12 w-12 border-l-2 border-t-2 border-[#5B21B6]/20" />
          <div className="absolute -right-4 -bottom-4 h-12 w-12 border-r-2 border-b-2 border-[#5B21B6]/20" />
          
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[400px]">
            <Image
              src={IMAGES.salonWorkspace}
              alt="Salon workspace"
              fill
              className="object-cover saturate-[0.88]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1714]/5 via-transparent to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-[#1B1714]/5" />
            
            {/* Line overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5B21B6]/30 to-transparent" />
          </div>
        </div>
      </Reveal>

      {/* Right Column - Content with line patterns */}
      <Reveal delay={0.1}>
        {/* Decorative line above heading */}
        <div className="mb-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-[#5B21B6]/20 to-transparent" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]/40">Since 2020</span>
          <span className="h-px flex-1 bg-gradient-to-l from-[#5B21B6]/20 to-transparent" />
        </div>

        {/* OUR STORY - Heading with line accent */}
        <div className="relative">
          <h3 className="text-2xl font-light tracking-tight text-[#1B1714] md:text-3xl lg:text-4xl">
            <span className="font-bold text-[#5B21B6]">Our</span> Story
          </h3>
          {/* Underline accent with gradient */}
          <div className="mt-2 h-0.5 w-16 bg-gradient-to-r from-[#5B21B6] to-[#5B21B6]/10" />
        </div>

        {/* Description with line separators */}
        <div className="mt-6 space-y-6">
          <div className="relative pl-6 border-l-2 border-[#5B21B6]/20">
            <p className="text-base leading-relaxed text-[#1B1714]/60 md:text-lg">
              Founded in 2020, our platform grew from a simple belief: great salon software starts with listening. We spent time on real salon floors before we designed a single screen.
            </p>
          </div>
          
          <div className="relative pl-6 border-l-2 border-[#5B21B6]/10">
            <p className="text-base leading-relaxed text-[#1B1714]/60 md:text-lg">
              Every module is personal — rooted in real conversations, honest workflows, and a commitment to tools that age with grace. Enterprise-grade power without enterprise complexity.
            </p>
          </div>
          
          {/* Decorative separator between paragraphs */}
          <div className="flex items-center gap-4 py-2">
            <span className="h-px flex-1 bg-[#1B1714]/5" />
            <span className="text-[8px] text-[#1B1714]/15">✦ ✦ ✦</span>
            <span className="h-px flex-1 bg-[#1B1714]/5" />
          </div>
          
          <div className="relative pl-6 border-l-2 border-[#5B21B6]/20">
            <p className="text-base leading-relaxed text-[#1B1714]/60 md:text-lg">
              Today, 500+ salons run appointments, billing, inventory, and AI insights on one intelligent platform.
            </p>
          </div>
        </div>

        {/* LEARN MORE → with unique line pattern */}
        <div className="mt-10 flex items-center gap-6">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[#5B21B6] transition-all duration-300 hover:gap-3 hover:text-[#4B1B96]"
          >
            LEARN MORE →
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </Link>
          
          {/* Decorative line after CTA */}
          <div className="hidden flex-1 items-center gap-3 md:flex">
            <span className="h-px flex-1 bg-gradient-to-r from-[#5B21B6]/20 to-transparent" />
            <span className="text-[8px] text-[#1B1714]/10">——</span>
          </div>
        </div>
        
        {/* Bottom decorative line */}
        <div className="mt-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-[#5B21B6]/30 to-transparent" />
          <span className="h-1.5 w-1.5 rotate-45 border border-[#5B21B6]/30" />
          <span className="h-px flex-1 bg-gradient-to-l from-[#5B21B6]/30 to-transparent" />
        </div>
      </Reveal>
    </div>
  </div>
</section>

      {/* ── What we do — numbered services ── */}
      <section className={cn(aboutSectionPadding, "landing-preview-band relative overflow-hidden bg-[#FAF8F6]")}>
  {/* Premium Background Elements */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Gradient orbs */}
    <div className="absolute -right-32 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[#5B21B6]/[0.04] blur-3xl" />
    <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.03] blur-3xl" />
    
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `
        linear-gradient(rgba(91,33,182,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,33,182,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px'
    }} />
  </div>

  <div className={ABOUT_CONTAINER}>
    {/* Header */}
    <div className="relative">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="h-px w-12 bg-[#5B21B6]/40" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]">
            What We Do
          </span>
          <span className="h-px flex-1 bg-[#5B21B6]/10" />
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-6 max-w-3xl">
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight text-[#1B1714] md:text-5xl lg:text-[3.5rem]">
            The{" "}
            <span className="relative inline-block">
              <span className="relative z-10 font-bold text-[#5B21B6]">
                Complete
              </span>
              <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#5B21B6]/5" />
            </span>{" "}
            Salon ERP Platform
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-[#1B1714]/60 md:text-xl">
            From first booking to final invoice, we design tools that elevate how you run, grow, and feel about your salon — every day.
          </p>
        </div>
      </Reveal>

      {/* Stats bar */}
      <Reveal delay={0.16}>
        <div className="mt-10 flex flex-wrap items-center gap-8 border-t border-[#1B1714]/5 pt-8">
          {[
            { value: "500+", label: "Salons Trust Us" },
            { value: "50k+", label: "Appointments Booked" },
            { value: "4.9★", label: "Average Rating" },
            { value: "24/7", label: "Support" },
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xl font-bold text-[#5B21B6]">{stat.value}</span>
              <span className="text-xs text-[#1B1714]/40">{stat.label}</span>
              {idx < 3 && <span className="h-4 w-px bg-[#1B1714]/10" />}
            </div>
          ))}
        </div>
      </Reveal>
    </div>

    {/* Services Grid - All 4 cards in single row */}
    <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {SERVICES.slice(0, 4).map((service, index) => (
        <Reveal key={service.num} delay={index * 0.08}>
          <motion.article
            className={cn(
              "group relative flex h-full flex-col rounded-2xl bg-white p-6",
              "border border-[#E8E4DE]",
              "transition-all duration-500",
              "hover:border-[#5B21B6]/30 hover:shadow-2xl hover:shadow-[#5B21B6]/5",
              "hover:-translate-y-2"
            )}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Gradient hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5B21B6]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Number badge */}
            <div className="relative flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B21B6]/10 text-sm font-bold text-[#5B21B6]">
                {service.num}
              </div>
              <div className="flex gap-1">
                {service.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#1B1714]/5 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.1em] text-[#1B1714]/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Icon/Emoji */}
            <div className="relative mt-4 text-2xl">
              {service.num === "01" && "📊"}
              {service.num === "02" && "💳"}
              {service.num === "03" && "📦"}
              {service.num === "04" && "🤖"}
            </div>

            <h3 className="relative mt-3 text-base font-semibold text-[#1B1714]">
              {service.title}
            </h3>
            
            {/* Decorative line */}
            <div className="relative mt-2 h-0.5 w-8 bg-[#5B21B6]/20 transition-all duration-300 group-hover:w-12 group-hover:bg-[#5B21B6]" />
            
            <p className="relative mt-3 flex-1 text-xs leading-relaxed text-[#1B1714]/60">
              {service.description}
            </p>

            {/* CTA */}
            <Link
              href="/#modules"
              className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#5B21B6] transition-all duration-300 hover:gap-2"
            >
              <span className="border-b border-[#5B21B6]/20 pb-0.5 transition-all duration-300 group-hover:border-[#5B21B6]">
                Learn More
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>

            {/* Corner accent */}
            <div className="absolute -right-px -top-px h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-[#5B21B6]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </motion.article>
        </Reveal>
      ))}
    </div>

    {/* Bottom CTA Section */}
    <Reveal delay={0.3}>
      <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#5B21B6]/5 to-[#4F46E5]/5 p-6 text-center ring-1 ring-[#5B21B6]/10">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B1714]">
              Ready to transform your salon operations?
            </p>
            <p className="text-xs text-[#1B1714]/40">
              Join 500+ salons already using Gotix
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-[#5B21B6]/20" />
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#5B21B6] px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#4B1B96] hover:shadow-lg hover:shadow-[#5B21B6]/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="h-px w-8 bg-[#5B21B6]/20" />
          </div>
        </div>
      </div>
    </Reveal>
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
      <section className={cn(aboutSectionPadding, "relative overflow-hidden bg-white")}>
  {/* Premium 3D-inspired Background Elements */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Floating gradient orbs with depth */}
    <div className="absolute -right-20 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#5B21B6]/[0.04] blur-3xl" />
    <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.03] blur-3xl" />
    
    {/* 3D perspective grid */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      perspective: '1000px',
      transform: 'rotateX(60deg)',
      backgroundImage: `
        linear-gradient(rgba(91,33,182,0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,33,182,0.15) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
      transformOrigin: 'bottom center'
    }} />
    
    {/* Floating geometric shapes */}
    <div className="absolute left-[10%] top-[20%] h-20 w-20 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02] blur-sm" />
    <div className="absolute right-[15%] top-[30%] h-16 w-16 rotate-45 border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02]" />
    <div className="absolute left-[5%] bottom-[40%] h-12 w-12 rounded-full border border-[#5B21B6]/5" />
  </div>

  <div className={ABOUT_CONTAINER}>
    {/* Header with 3D perspective effect */}
    <Reveal>
      <div className="relative">
        <div className="flex items-center gap-4">
          <span className="h-px w-10 bg-[#5B21B6]/40" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]">
            Client Stories
          </span>
          <span className="h-px flex-1 bg-[#5B21B6]/10" />
        </div>
        
        <div className="mt-6 max-w-2xl">
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight text-[#1B1714] md:text-5xl lg:text-[3.5rem]">
            <span className="relative inline-block">
              <span className="relative z-10 font-bold text-[#5B21B6]">
                Spaces
              </span>
              <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#5B21B6]/5" />
            </span>{" "}
            That Inspire{" "}
            <span className="italic text-[#5B21B6]/70">Loyalty</span>
          </h2>
          <p className="mt-4 text-lg text-[#1B1714]/60">
            Our work speaks through the voices of salon owners — lasting partnerships built on trust and measurable results.
          </p>
        </div>
      </div>
    </Reveal>

    {/* 3D Floating Cards */}
    <div className="mt-16 grid gap-8 md:grid-cols-3">
      {TESTIMONIALS.slice(0, 3).map((t, index) => (
        <Reveal key={t.id} delay={index * 0.1}>
          <motion.article
            className="group relative"
            initial={{ rotateY: 0 }}
            whileHover={{ 
              rotateY: -5,
              rotateX: 5,
              scale: 1.02,
              transition: { duration: 0.4 }
            }}
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* 3D Card Shadow */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#5B21B6]/10 to-[#4F46E5]/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Main Card */}
            <div className="relative rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(27,23,20,0.06)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(91,33,182,0.12)] ring-1 ring-[#1B1714]/5">
              {/* 3D Depth Layers */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5B21B6]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              {/* Top gradient line - 3D edge effect */}
              <div className="absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#5B21B6]/30 to-transparent" />

              {/* Quote Icon - 3D floating element */}
              <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B21B6]/10 to-[#4F46E5]/5 text-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#5B21B6]/10">
                <svg className="h-5 w-5 text-[#5B21B6]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
              </div>

              {/* Quote Text */}
              <blockquote className="relative z-10">
                <p className="text-base leading-relaxed text-[#1B1714]/75">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>

              {/* Divider with 3D effect */}
              <div className="relative z-10 my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-[#5B21B6]/20 to-transparent" />
                <span className="h-1 w-1 rotate-45 border border-[#5B21B6]/30" />
                <span className="h-px flex-1 bg-gradient-to-l from-[#5B21B6]/20 to-transparent" />
              </div>

              {/* Author Info with 3D hover effect */}
              <div className="relative z-10 flex items-center gap-4">
                {/* Avatar with 3D ring */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#5B21B6]/20 to-[#4F46E5]/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-[#5B21B6]/10 transition-all duration-500 group-hover:ring-[#5B21B6]/30">
                    <Image
                      src={t.image}
                      alt={t.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="48px"
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-[#1B1714] transition-colors duration-300 group-hover:text-[#5B21B6]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#1B1714]/45">
                    {t.role} · {t.salon}
                  </p>
                </div>

                {/* 3D floating badge */}
                <div className="ml-auto opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <span className="text-[8px] font-medium uppercase tracking-[0.15em] text-[#5B21B6]/30">
                    ★ 5.0
                  </span>
                </div>
              </div>

              {/* Bottom 3D edge glow */}
              <div className="absolute -bottom-px left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#5B21B6]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>

            {/* 3D floating elements behind card */}
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02] blur-sm transition-all duration-500 group-hover:scale-110" />
            <div className="pointer-events-none absolute -bottom-4 -left-4 h-12 w-12 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02] transition-all duration-500 group-hover:scale-110" />
          </motion.article>
        </Reveal>
      ))}
    </div>

    {/* Bottom Section with 3D perspective */}
    <Reveal delay={0.25}>
      <div className="relative mt-16 overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B21B6]/5 to-[#4F46E5]/5 p-8 text-center ring-1 ring-[#5B21B6]/10">
        {/* 3D perspective background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          perspective: '1000px',
          transform: 'rotateX(60deg)',
          backgroundImage: `
            linear-gradient(rgba(91,33,182,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,33,182,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transformOrigin: 'bottom center'
        }} />
        
        <div className="relative">
          <p className="text-sm font-medium text-[#1B1714]">
            Trusted by salon owners & brands across India
          </p>
          
          {/* Animated trust indicators */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            {['500+ Salons', '4.9★ Rating', '24/7 Support', '100% Uptime'].map((item, idx) => (
              <motion.span
                key={idx}
                className="text-xs text-[#1B1714]/40"
                whileHover={{ 
                  scale: 1.1,
                  color: '#5B21B6'
                }}
              >
                {item}
                {idx < 3 && <span className="ml-3 text-[#1B1714]/10">|</span>}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  </div>
</section>

      {/* ── How we work ── */}
      <section className={cn(aboutSectionPadding, "landing-preview-band relative overflow-hidden bg-[#FAF8F6]")}>
  {/* Premium Background Elements */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Gradient orbs */}
    <div className="absolute -right-32 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[#5B21B6]/[0.04] blur-3xl" />
    <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.03] blur-3xl" />
    
    {/* 3D Perspective Grid */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      perspective: '1000px',
      transform: 'rotateX(60deg)',
      backgroundImage: `
        linear-gradient(rgba(91,33,182,0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,33,182,0.15) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      transformOrigin: 'bottom center'
    }} />
    
    {/* Floating geometric shapes */}
    <div className="absolute left-[5%] top-[20%] h-16 w-16 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02]" />
    <div className="absolute right-[10%] top-[40%] h-12 w-12 rotate-45 border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02]" />
    <div className="absolute left-[8%] bottom-[30%] h-20 w-20 rounded-full border border-[#5B21B6]/5" />
    
    {/* Animated line */}
    <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5B21B6" stopOpacity="0" />
          <stop offset="50%" stopColor="#5B21B6" stopOpacity="1" />
          <stop offset="100%" stopColor="#5B21B6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="url(#lineGrad)" strokeWidth="0.5" />
      <line x1="10%" y1="70%" x2="90%" y2="70%" stroke="url(#lineGrad)" strokeWidth="0.5" />
    </svg>
  </div>

  <div className={ABOUT_CONTAINER}>
    {/* Header with Unique Design */}
    <Reveal>
      <div className="relative">
        <div className="flex items-center gap-4">
          <span className="h-px w-12 bg-[#5B21B6]/40" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]">
            How We Work
          </span>
          <span className="h-px flex-1 bg-[#5B21B6]/10" />
        </div>
        
        <div className="mt-6 max-w-3xl">
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight text-[#1B1714] md:text-5xl lg:text-[3.5rem]">
            A Clear Path From{" "}
            <span className="relative inline-block">
              <span className="relative z-10 font-bold text-[#5B21B6]">
                Vision
              </span>
              <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#5B21B6]/5" />
            </span>{" "}
            to{" "}
            <span className="italic text-[#5B21B6]/70">Reality</span>
          </h2>
          <p className="mt-4 text-lg text-[#1B1714]/60">
            Every salon follows a structured three-phase process — so you always know what's happening and what comes next.
          </p>
        </div>
      </div>
    </Reveal>

    {/* Process Steps - Modern Timeline Style */}
    <div className="relative mt-16">
      {/* Central connecting line */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#5B21B6]/20 via-[#5B21B6]/10 to-transparent md:block" />
      
      {/* Animated line glow */}
      <div className="absolute left-1/2 top-0 h-16 w-0.5 -translate-x-1/2 bg-[#5B21B6]/30 blur-sm md:block" />

      <div className="grid gap-12 md:grid-cols-3">
        {PROCESS.map((step, index) => (
          <Reveal key={step.num} delay={index * 0.1}>
            <motion.article
              className="group relative"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Number - Large Background */}
              <div className="absolute -right-4 -top-4 text-[8rem] font-bold leading-none text-[#5B21B6]/[0.03] select-none md:text-[10rem]">
                {step.num}
              </div>

              {/* Card with 3D Effect */}
              <div className="relative rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(27,23,20,0.06)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(91,33,182,0.12)] ring-1 ring-[#1B1714]/5">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5B21B6]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Top accent line */}
                <div className="absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#5B21B6]/30 to-transparent" />

                {/* Header with step info */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B21B6]/10 text-lg font-bold text-[#5B21B6] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#5B21B6] group-hover:text-white">
                      {step.num}
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B1714]/30">
                      Step {step.num}
                    </span>
                  </div>
                  <span className="rounded-full border border-[#E8E4DE] px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-[#1B1714]/40">
                    {step.week}
                  </span>
                </div>

                {/* Content */}
                <div className="relative mt-5">
                  <h3 className="text-xl font-semibold text-[#1B1714] transition-colors duration-300 group-hover:text-[#5B21B6]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#1B1714]/60">
                    {step.description}
                  </p>
                </div>

                {/* Points with modern styling */}
                <div className="relative mt-6 space-y-2.5 border-t border-[#1B1714]/5 pt-5">
                  {step.points.map((point, idx) => (
                    <motion.li
                      key={point}
                      className="flex items-start gap-3 text-sm text-[#1B1714]/70"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#5B21B6]/10 text-[8px] text-[#5B21B6]">
                        ✓
                      </span>
                      {point}
                    </motion.li>
                  ))}
                </div>

                {/* Bottom accent glow */}
                <div className="absolute -bottom-px left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#5B21B6]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              {/* Connector dot - visible on desktop */}
              {index < PROCESS.length - 1 && (
                <div className="absolute -right-6 top-1/2 hidden -translate-y-1/2 md:block">
                  <div className="h-3 w-3 rounded-full border-2 border-[#5B21B6]/20 bg-white transition-all duration-500 group-hover:border-[#5B21B6] group-hover:shadow-lg group-hover:shadow-[#5B21B6]/20" />
                </div>
              )}
            </motion.article>
          </Reveal>
        ))}
      </div>
    </div>

    {/* Bottom CTA with 3D Effect */}
    <Reveal delay={0.3}>
      <div className="relative mt-20 overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#4F46E5] p-px">
        <div className="rounded-2xl bg-white p-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-sm font-medium text-[#1B1714]">
                Ready to start your journey?
              </p>
              <p className="text-sm text-[#1B1714]/40">
                Get a free consultation with our experts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-[#5B21B6]/20" />
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-[#5B21B6] px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#4B1B96] hover:shadow-lg hover:shadow-[#5B21B6]/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
              <span className="h-px w-8 bg-[#5B21B6]/20" />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  </div>
</section>

      {/* ── Bottom CTA ── */}
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
