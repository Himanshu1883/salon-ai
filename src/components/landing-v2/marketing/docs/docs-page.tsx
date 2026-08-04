"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ERP_MODULES,
  FAQ_ITEMS,
  FOOTER_STATS,
  IMAGES,
  TESTIMONIALS,
} from "../../constants";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;
const CONTAINER =
  "mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-10";
  export const aboutSectionPadding = "py-20 md:py-28 lg:py-32";
export const ABOUT_CONTAINER =
  "mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-10";

const DOC_TOPICS = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "First-time with Gotix? We walk you from signup to your first booked appointment.",
    image: IMAGES.reception,
    cta: "Learn about Getting Started",
  },
  {
    id: "appointments",
    title: "Appointments & Queue",
    description:
      "Smart booking, walk-ins, and live queue — built for how busy floors actually move.",
    image: IMAGES.hairStyling,
    cta: "Learn about Scheduling",
  },
  {
    id: "billing",
    title: "Billing & POS",
    description:
      "Split payments, memberships, and receipts — checkout that keeps the line moving.",
    image: IMAGES.salonChair,
    cta: "Learn about Billing",
  },
  {
    id: "clients",
    title: "Clients & CRM",
    description:
      "Profiles, visit history, and loyalty that turn one visit into lifelong clients.",
    image: IMAGES.facial,
    cta: "Learn about CRM",
  },
  {
    id: "inventory",
    title: "Inventory & Retail",
    description:
      "Stock, recipes, and retail sales tracked across every chair and every branch.",
    image: IMAGES.beautyProducts,
    cta: "Learn about Inventory",
  },
  {
    id: "staff",
    title: "Staff & Payroll",
    description:
      "Schedules, commissions, and attendance — so your team runs without spreadsheet chaos.",
    image: IMAGES.barber,
    cta: "Learn about Staff",
  },
  {
    id: "marketing",
    title: "Marketing & WhatsApp",
    description:
      "Campaigns, reminders, and two-way chat that fill empty chairs automatically.",
    image: IMAGES.bridal,
    cta: "Learn about Marketing",
  },
  {
    id: "ai",
    title: "AI & Reports",
    description:
      "Forecast demand, spot upsells, and export the numbers owners actually need.",
    image: IMAGES.salonWorkspace,
    cta: "Learn about Analytics",
  },
] as const;

const STANDARDS = ERP_MODULES.slice(0, 8).map((mod) => ({
  id: mod.id,
  title: mod.title,
  description: mod.description,
  image: mod.image,
  meta: "Guide",
}));

const PROCESS_STEPS = [
  {
    title: "We start with your salon",
    body: "Gotix documentation is written around real floor workflows — not generic SaaS jargon. Every guide maps to how stylists, reception, and owners actually work.",
    cta: "How It Works",
    href: "#process",
  },
  {
    title: "Using a process built around you",
    body: "Think of our docs as your sherpa from first login to full ERP rollout. We coordinate setup, training, and go-live so you move from idea to a running salon system.",
    cta: "See Quick Start",
    href: "#topics",
  },
] as const;

const STATS = [
  {
    value: "24h",
    label: "Average time to go live with onboarding support",
  },
  {
    value: `${ERP_MODULES.length}+`,
    label: "Module guides covering the full ERP suite",
  },
  {
    value: "5%",
    label: "Most salons need less than a day of training",
  },
  {
    value: `${FOOTER_STATS[0].value!.toLocaleString("en-IN")}+`,
    label: "Salons using Gotix documentation daily",
  },
];

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
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={
        reduced
          ? { duration: 0.25, delay }
          : { duration: 0.5, delay, ease: EASE }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#1B1714] px-7 py-3.5 text-sm font-semibold text-white transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-[#2E1065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2";

const linkArrow =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B1714] underline-offset-4 transition-colors hover:text-[#5B21B6] hover:underline";

export function DocsPageContent() {
  const reduced = !!useReducedMotion();
  const setupFaq = FAQ_ITEMS.find((f) => f.question.includes("set up"));

  return (
    <div className="bg-white text-[#1B1714]">
      {/* Hero — 100vh, centered (unique bg vs other marketing pages) */}
      <section className="hero-editorial relative min-h-[100svh] overflow-hidden border-b border-[#E4DDD1]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/docss.png"
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
                  Documentations · Gotix ERP
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
              <h1 className="landing-display text-[2.25rem] font-medium leading-[1.1] tracking-tight text-[#1B1714] sm:text-5xl md:text-6xl lg:text-[3.75rem]">
              The best way to set up and run {" "}
                <span className="italic text-[#5B21B6]">
                your salon on Gotix.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
                Clear guides for every module — from first login to multi-branch
                ERP. Written for salon owners, not developers.
              </p>
            </Reveal>
            <Reveal delay={0.18} className="mt-10">
              <Link href="/login" className={primaryBtn}>
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Topic cards — "Whatever type of place you have in mind" */}
      <section id="topics" className="relative overflow-hidden border-b border-[#E4DDD1] bg-white py-20 md:py-28">
  {/* Premium Animated Background */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Animated Gradient Orbs */}
    <motion.div
      className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-[#5B21B6]/[0.04] blur-3xl"
      animate={{
        x: [0, 40, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -left-40 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.03] blur-3xl"
      animate={{
        x: [0, -40, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* 3D Perspective Grid */}
    <div className="absolute inset-0 opacity-[0.015]" style={{
      perspective: '1000px',
      transform: 'rotateX(60deg)',
      backgroundImage: `
        linear-gradient(rgba(91,33,182,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,33,182,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      transformOrigin: 'bottom center',
    }} />

    {/* Floating Geometric Shapes */}
    <motion.div
      className="absolute right-[10%] top-[15%] h-14 w-14 rounded-xl border-2 border-[#5B21B6]/10"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 bg-[#5B21B6]/5 rounded-xl" />
    </motion.div>

    <motion.div
      className="absolute left-[8%] bottom-[25%] h-10 w-10 rounded-full border-2 border-[#4F46E5]/10"
      animate={{
        rotate: [360, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />

    <motion.div
      className="absolute right-[20%] bottom-[30%] h-6 w-6 rotate-45 border-2 border-[#5B21B6]/10"
      animate={{
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    />

    {/* Dot Pattern */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: 'radial-gradient(circle, #5B21B6 1.5px, transparent 1.5px)',
      backgroundSize: '30px 30px',
    }} />
  </div>

  <div className={CONTAINER}>
    {/* Header with Premium Design */}
    <Reveal>
      <div className="mb-14 text-center md:mb-16">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#5B21B6]/20" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]">
            Guides & Resources
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#5B21B6]/20" />
        </div>
        
        <motion.h2
          className="mt-4 text-3xl font-bold tracking-tight text-[#1B1714] md:text-4xl lg:text-[3.5rem]"
          whileHover={{ rotateX: 2 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] bg-clip-text text-transparent">
              Whatever
            </span>
            <span className="absolute -bottom-1 left-0 h-2 w-full bg-[#5B21B6]/10" />
          </span>{" "}
          type of guide you need
        </motion.h2>
      </div>
    </Reveal>

    {/* Topics Grid - Premium Cards */}
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
      {DOC_TOPICS.map((topic, index) => (
        <Reveal key={topic.id} delay={index * 0.06}>
          <motion.article
            className="group relative flex h-full flex-col"
            whileHover={{
              y: -8,
              transition: { duration: 0.3 },
            }}
          >
            {/* Card Container */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(27,23,20,0.06)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(91,33,182,0.12)] ring-1 ring-[#1B1714]/5">
              {/* Image Container with 3D Effect */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <motion.div
                  className="h-full w-full"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src={topic.image}
                    alt=""
                    fill
                    className="object-cover saturate-[0.85]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </motion.div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1714]/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Number Badge */}
                <motion.div
                  className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-[#5B21B6] shadow-lg backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </motion.div>

                {/* Category Tag */}
                <motion.div
                  className="absolute right-3 top-3 rounded-full bg-[#5B21B6]/90 px-3 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Guide
                </motion.div>

                {/* Play/View Icon Overlay */}
                {/* <motion.div
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-2xl backdrop-blur-sm">
                    <svg className="h-6 w-6 text-[#5B21B6]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </motion.div> */}
              </div>

              {/* Content */}
              <div className="relative flex flex-1 flex-col p-6">
                {/* Decorative Line */}
                <motion.div
                  className="mb-4 h-0.5 w-12 bg-[#5B21B6]/10 transition-all duration-500 group-hover:w-16 group-hover:bg-[#5B21B6]"
                  initial={{ width: 48 }}
                  whileHover={{ width: 64 }}
                />

                <h3 className="text-lg font-semibold text-[#1B1714] transition-colors duration-300 group-hover:text-[#5B21B6]">
                  {topic.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1B1714]/55">
                  {topic.description}
                </p>

                {/* CTA with Animated Arrow */}
                <motion.a
                  href={`#${topic.id}`}
                  className="group/link mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#5B21B6] transition-all duration-300 hover:text-[#4B1B96]"
                  whileHover={{ x: 4 }}
                >
                  <span className="relative">
                    {topic.cta}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#5B21B6] transition-all duration-300 group-hover/link:w-full" />
                  </span>
                  <motion.span
                    animate={{ x: 0 }}
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </motion.span>
                </motion.a>
              </div>

              {/* Bottom Glow Effect */}
              <div className="absolute -bottom-px left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#5B21B6]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Corner Accents */}
              <div className="absolute -right-px -top-px h-8 w-8 rounded-tr-2xl border-r-2 border-t-2 border-[#5B21B6]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-2xl border-b-2 border-l-2 border-[#5B21B6]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Floating Decorative Element */}
              <motion.div
                className="absolute -right-3 -top-3 h-10 w-10 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02]"
                whileHover={{
                  scale: 1.2,
                  rotate: 45,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.article>
        </Reveal>
      ))}
    </div>

    {/* Bottom CTA Section */}

    {/* Bottom Decorative */}
   
  </div>
</section>

      {/* Process bands — Huts "We do it across / Using a process" */}
      <section id="process" className="relative overflow-hidden border-b border-[#E4DDD1] bg-white py-20 md:py-28">
  {/* Background */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    <div className="absolute -right-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#5B21B6]/[0.03] blur-3xl" />
    <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.02] blur-3xl" />
  </div>

  <div className={CONTAINER}>
    {/* Header */}
    <Reveal>
      <div className="mb-16 text-center">
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]">
          Our Process
        </span>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-[#1B1714] md:text-4xl lg:text-[3.5rem]">
          How we bring your{" "}
          <span className="font-bold text-[#5B21B6]">vision to life</span>
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-[#5B21B6]/20" />
          <span className="text-[8px] text-[#1B1714]/10">✦</span>
          <span className="h-px w-12 bg-[#5B21B6]/20" />
        </div>
      </div>
    </Reveal>

    {/* Timeline */}
    <div className="relative">
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#5B21B6]/20 via-[#5B21B6]/10 to-transparent" />

      {PROCESS_STEPS.map((step, index) => (
        <div
          key={step.title}
          className={cn(
            "relative mb-16 last:mb-0",
            index % 2 === 0 ? "lg:pr-[50%]" : "lg:pl-[50%]"
          )}
        >
          <Reveal>
            <motion.div
              className={cn(
                "relative rounded-2xl bg-white p-8 shadow-lg shadow-[#5B21B6]/5 ring-1 ring-[#1B1714]/5 transition-all duration-500 hover:shadow-2xl hover:shadow-[#5B21B6]/10",
                index % 2 === 0 ? "lg:mr-8" : "lg:ml-8"
              )}
              whileHover={{ y: -4 }}
            >
              {/* Connector Dot */}
              <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
                <div className="h-4 w-4 rounded-full border-4 border-[#5B21B6] bg-white shadow-lg shadow-[#5B21B6]/20" />
              </div>

              {/* Step Number */}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6]/10 text-sm font-bold text-[#5B21B6]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B1714]/30">
                  Step {index + 1}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-[#1B1714]">
                {step.title}
              </h3>
              <div className="mt-2 h-0.5 w-12 bg-[#5B21B6]/20" />
              <p className="mt-4 text-base leading-relaxed text-[#1B1714]/60">
                {step.body}
              </p>

              <motion.a
                href={step.href}
                className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#5B21B6] transition-all duration-300 hover:gap-3"
                whileHover={{ x: 4 }}
              >
                {step.cta}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </motion.a>
            </motion.div>
          </Reveal>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Standards / Module guides — Huts Standards strip */}
      <section className="relative overflow-hidden border-b border-[#E4DDD1] py-20 md:py-28">
  {/* Premium Animated Background */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Animated Gradient Orbs */}
    <motion.div
      className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-[#5B21B6]/[0.04] blur-3xl"
      animate={{
        x: [0, 40, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -left-40 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.03] blur-3xl"
      animate={{
        x: [0, -40, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* 3D Perspective Grid */}
    <div className="absolute inset-0 opacity-[0.015]" style={{
      perspective: '1000px',
      transform: 'rotateX(60deg)',
      backgroundImage: `
        linear-gradient(rgba(91,33,182,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,33,182,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      transformOrigin: 'bottom center',
    }} />

    {/* Floating Geometric Shapes */}
    <motion.div
      className="absolute right-[10%] top-[15%] h-12 w-12 rounded-xl border-2 border-[#5B21B6]/10"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 bg-[#5B21B6]/5 rounded-xl" />
    </motion.div>

    <motion.div
      className="absolute left-[8%] bottom-[25%] h-8 w-8 rounded-full border-2 border-[#4F46E5]/10"
      animate={{
        rotate: [360, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />

    <motion.div
      className="absolute right-[20%] bottom-[30%] h-6 w-6 rotate-45 border-2 border-[#5B21B6]/10"
      animate={{
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    />

    {/* Dot Pattern */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: 'radial-gradient(circle, #5B21B6 1.5px, transparent 1.5px)',
      backgroundSize: '30px 30px',
    }} />
  </div>

  <div className={CONTAINER}>
    {/* Header with Premium Design */}
    <Reveal>
      <div className="max-w-3xl">
        <div className="flex items-center gap-4">
          <span className="h-px w-12 bg-[#5B21B6]/40" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]">
            Module Guides
          </span>
          <span className="h-px flex-1 bg-[#5B21B6]/10" />
        </div>
        
        <div className="mt-6">
          <h2 className="text-3xl font-bold tracking-tight text-[#1B1714] md:text-4xl lg:text-[3.5rem]">
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] bg-clip-text text-transparent">
                It all starts
              </span>
              <span className="absolute -bottom-1 left-0 h-2 w-full bg-[#5B21B6]/10" />
            </span>{" "}
            with our module guides…
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#1B1714]/60 md:text-lg">
            They're more than help articles — they're product playbooks designed for real salons, real staff, and real days on the floor. {ERP_MODULES.length} modules, one shared data model.
          </p>
        </div>
      </div>
    </Reveal>

    {/* Module Cards Grid */}
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {STANDARDS.map((item, index) => (
        <Reveal key={item.id} delay={index * 0.06}>
          <motion.article
            className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(27,23,20,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(91,33,182,0.12)] ring-1 ring-[#1B1714]/5"
            whileHover={{
              borderColor: '#5B21B6',
            }}
          >
            {/* Image Container with 3D Effect */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <motion.div
                className="h-full w-full"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover saturate-[0.85]"
                  sizes="(max-width: 768px) 200px, 25vw"
                />
              </motion.div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1714]/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Number Badge */}
              <motion.div
                className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-[#5B21B6] shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                {String(index + 1).padStart(2, '0')}
              </motion.div>

              {/* Category Tag */}
              <motion.div
                className="absolute right-3 top-3 rounded-full bg-[#5B21B6]/90 px-3 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                {item.meta}
              </motion.div>
            </div>

            {/* Content */}
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#1B1714] transition-colors duration-300 group-hover:text-[#5B21B6]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#1B1714]/50">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Animated Divider */}
              <motion.div
                className="mt-3 h-0.5 w-8 bg-[#5B21B6]/10 transition-all duration-500 group-hover:w-full group-hover:bg-[#5B21B6]"
                initial={{ width: 32 }}
                whileHover={{ width: '100%' }}
              />

              {/* Read More Link */}
              <motion.a
                href={`#${item.id}`}
                className="group/link mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#5B21B6] transition-all duration-300 hover:gap-2"
                whileHover={{ x: 4 }}
              >
                <span>Read Guide</span>
                <ArrowRight className="h-3 w-3" aria-hidden />
              </motion.a>
            </div>

            {/* Corner Accents */}
            <div className="absolute -right-px -top-px h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-[#5B21B6]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -bottom-px -left-px h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-[#5B21B6]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Floating Decorative Element */}
            <motion.div
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02]"
              whileHover={{
                scale: 1.2,
                rotate: 45,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.article>
        </Reveal>
      ))}
    </div>

    {/* Bottom Section with Enhanced Design */}
    <Reveal className="mt-16">
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B21B6]/5 to-[#4F46E5]/5 p-8 ring-1 ring-[#5B21B6]/10"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-medium text-[#1B1714] md:text-2xl">
              …and we work with you to{" "}
              <span className="text-[#5B21B6]">make it yours.</span>
            </p>
            {setupFaq && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1B1714]/60">
                {setupFaq.answer}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-[#5B21B6]/20" />
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[#5B21B6] px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#4B1B96] hover:shadow-lg hover:shadow-[#5B21B6]/25"
            >
              See More Guides
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-4 w-4" aria-hidden />
              </motion.span>
            </Link>
            <span className="h-px w-8 bg-[#5B21B6]/20" />
          </div>
        </div>
      </motion.div>
    </Reveal>

    {/* Bottom Decorative */}
    <Reveal delay={0.35}>
      <motion.div
        className="mt-12 flex items-center justify-center gap-4"
        whileHover={{ rotateX: 2 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.span
          className="h-px w-16 bg-gradient-to-r from-transparent to-[#5B21B6]/10"
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
          <span className="h-2 w-2 rotate-45 border border-[#5B21B6]/15" />
          <span className="h-2 w-2 rotate-45 border border-[#5B21B6]/15" />
          <span className="h-2 w-2 rotate-45 border border-[#5B21B6]/15" />
        </motion.div>
        <motion.span
          className="h-px w-16 bg-gradient-to-l from-transparent to-[#5B21B6]/10"
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </Reveal>
  </div>
</section>

      {/* Testimonials — "But don't take it from us" */}
      <section className="relative overflow-hidden border-b border-[#E4DDD1] bg-white py-20 md:py-28">
  {/* Premium Animated Background */}
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {/* Animated Gradient Orbs */}
    <motion.div
      className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-[#5B21B6]/[0.04] blur-3xl"
      animate={{
        x: [0, 40, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -left-40 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/[0.03] blur-3xl"
      animate={{
        x: [0, -40, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* 3D Perspective Grid */}
    <div className="absolute inset-0 opacity-[0.015]" style={{
      perspective: '1000px',
      transform: 'rotateX(60deg)',
      backgroundImage: `
        linear-gradient(rgba(91,33,182,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,33,182,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      transformOrigin: 'bottom center',
    }} />

    {/* Floating Geometric Shapes */}
    <motion.div
      className="absolute right-[10%] top-[15%] h-12 w-12 rounded-xl border-2 border-[#5B21B6]/10"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 bg-[#5B21B6]/5 rounded-xl" />
    </motion.div>

    <motion.div
      className="absolute left-[8%] bottom-[25%] h-8 w-8 rounded-full border-2 border-[#4F46E5]/10"
      animate={{
        rotate: [360, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />

    <motion.div
      className="absolute right-[20%] bottom-[30%] h-6 w-6 rotate-45 border-2 border-[#5B21B6]/10"
      animate={{
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    />

    {/* Dot Pattern */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: 'radial-gradient(circle, #5B21B6 1.5px, transparent 1.5px)',
      backgroundSize: '30px 30px',
    }} />
  </div>

  <div className={CONTAINER}>
    {/* Header with Premium Design */}
    <Reveal>
      <div className="mb-14 text-center md:mb-16">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#5B21B6]/20" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#5B21B6]">
            Testimonials
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#5B21B6]/20" />
        </div>
        
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1B1714] md:text-4xl lg:text-[3.5rem]">
          But,{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] bg-clip-text text-transparent">
              don't take it from us…
            </span>
            <span className="absolute -bottom-1 left-0 h-2 w-full bg-[#5B21B6]/10" />
          </span>
        </h2>
      </div>
    </Reveal>

    {/* Testimonials Grid */}
    <div className="grid gap-6 md:grid-cols-3 md:gap-8">
      {TESTIMONIALS.slice(0, 3).map((t, index) => (
        <Reveal key={t.id} delay={index * 0.08}>
          <motion.blockquote
            className="group relative flex h-full flex-col rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgba(27,23,20,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(91,33,182,0.12)] ring-1 ring-[#1B1714]/5"
            whileHover={{
              borderColor: '#5B21B6',
            }}
          >
            {/* Gradient Hover Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5B21B6]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Quote Icon */}
            <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6]/10 text-[#5B21B6] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#5B21B6] group-hover:text-white">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>
            </div>

            {/* Quote Text */}
            <p className="relative flex-1 text-base leading-relaxed text-[#1B1714]/75">
              {t.quote}
            </p>

            {/* Animated Divider */}
            <motion.div
              className="relative mt-6 h-0.5 w-12 bg-[#5B21B6]/10 transition-all duration-500 group-hover:w-20 group-hover:bg-[#5B21B6]"
              initial={{ width: 48 }}
              whileHover={{ width: 80 }}
            />

            {/* Footer */}
            <footer className="relative mt-4">
              <p className="text-sm font-semibold text-[#1B1714] transition-colors duration-300 group-hover:text-[#5B21B6]">
                {t.name}
              </p>
              <p className="mt-0.5 text-xs text-[#1B1714]/40">
                {t.salon}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-px w-6 bg-[#5B21B6]/10" />
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#5B21B6]/60">
                  {t.role}
                </span>
              </div>
            </footer>

            {/* Corner Accents */}
            <div className="absolute -right-px -top-px h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-[#5B21B6]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -bottom-px -left-px h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-[#5B21B6]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Floating Decorative Element */}
            <motion.div
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full border border-[#5B21B6]/5 bg-[#5B21B6]/[0.02]"
              whileHover={{
                scale: 1.2,
                rotate: 45,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.blockquote>
        </Reveal>
      ))}
    </div>

    {/* Bottom CTA Section */}
   

    {/* Bottom Decorative */}
   
  </div>
</section>

      {/* Stats — Huts bottom stats */}
      <section className="landing-preview-band border-b border-[#E4DDD1] py-16 md:py-20">
        <div className={CONTAINER}>
          <Reveal className="mb-10 text-center">
            <p className="text-sm text-[#1B1714]/50">Still don&apos;t believe it?</p>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.06}>
                <div className="text-center lg:text-left">
                  <p className="landing-display text-3xl font-semibold tabular-nums text-[#1B1714] md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/55">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quick start checklist */}
      <section
  id="getting-started"
  className="border-b border-[#E4DDD1] bg-white py-20 md:py-28"
>
  <div className={CONTAINER}>
    <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
      {/* Left Column - Image */}
      <Reveal>
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={IMAGES.waitingArea}
                alt="Salon waiting area"
                fill
                className="object-cover saturate-[0.85] transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1714]/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Right Column - Content */}
      <Reveal delay={0.1}>
        <div>
          {/* Label */}
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#5B21B6]/40" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B21B6]">
              Getting Started
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-4 text-3xl font-light tracking-tight text-[#1B1714] md:text-4xl lg:text-[3rem]">
            Quick start{" "}
            <span className="font-bold text-[#5B21B6]">checklist</span>
          </h2>

          <p className="mt-2 text-sm text-[#1B1714]/40">
            5 simple steps to get your salon running
          </p>

          {/* Checklist */}
          <div className="mt-8 space-y-3">
            {[
              "Sign in or start your 14-day free trial.",
              "Complete salon profile — services, staff, taxes, branding.",
              "Import clients and your service catalog.",
              "Configure WhatsApp reminders and POS payments.",
              "Go live — most salons are operational within 24 hours.",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="group flex items-start gap-4 rounded-lg p-3 transition-all duration-300 hover:bg-[#F8F6F4]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                {/* Number */}
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#E8E4DE] text-xs font-medium text-[#1B1714]/40 transition-all duration-300 group-hover:border-[#5B21B6] group-hover:bg-[#5B21B6] group-hover:text-white">
                  {i + 1}
                </span>

                {/* Text */}
                <span className="pt-0.5 text-sm leading-relaxed text-[#1B1714]/70 transition-colors duration-300 group-hover:text-[#1B1714]">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[#5B21B6] px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#4B1B96] hover:shadow-lg hover:shadow-[#5B21B6]/20"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
            <span className="ml-4 text-xs text-[#1B1714]/30">No credit card</span>
          </motion.div>
        </div>
      </Reveal>
    </div>
  </div>
</section>

      {/* Bottom CTA */}
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
