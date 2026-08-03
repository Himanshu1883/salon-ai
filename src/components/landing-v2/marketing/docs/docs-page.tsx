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
              <h1 className="landing-display text-[2.25rem] font-medium leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.75rem]">
                The best way to set up and run your salon on Gotix
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
      <section id="topics" className="border-b border-[#E4DDD1] bg-white py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal className="mb-12 text-center md:mb-16">
            <h2 className="landing-display text-2xl font-medium md:text-3xl lg:text-4xl">
              Whatever type of guide you need
            </h2>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {DOC_TOPICS.map((topic, index) => (
              <Reveal key={topic.id} delay={reduced ? 0 : (index % 4) * 0.05}>
                <article className="group flex h-full flex-col">
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-[#EFE8DC]">
                    <Image
                      src={topic.image}
                      alt=""
                      fill
                      className="object-cover saturate-[0.88] transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <h3 className="landing-display text-xl font-medium">
                    {topic.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1B1714]/65">
                    {topic.description}
                  </p>
                  <a href={`#${topic.id}`} className={cn(linkArrow, "mt-4")}>
                    {topic.cta}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process bands — Huts "We do it across / Using a process" */}
      <section id="process" className="border-b border-[#E4DDD1]">
        {PROCESS_STEPS.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              "py-16 md:py-20",
              index % 2 === 1 ? "landing-preview-band" : "bg-white"
            )}
          >
            <div className={cn(CONTAINER, "max-w-3xl")}>
              <Reveal>
                <h2 className="landing-display text-2xl font-medium md:text-3xl">
                  {step.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[#1B1714]/70 md:text-lg">
                  {step.body}
                </p>
                <a href={step.href} className={cn(linkArrow, "mt-6")}>
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </Reveal>
            </div>
          </div>
        ))}
      </section>

      {/* Standards / Module guides — Huts Standards strip */}
      <section className="landing-preview-band border-b border-[#E4DDD1] py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal className="max-w-3xl">
            <h2 className="landing-display text-2xl font-medium md:text-3xl lg:text-4xl">
              It all starts with our module guides…
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
              They&apos;re more than help articles — they&apos;re product
              playbooks designed for real salons, real staff, and real
              days on the floor. {ERP_MODULES.length} modules, one shared
              data model.
            </p>
          </Reveal>

          <div className="mt-12 flex gap-4 overflow-x-auto pb-4 md:mt-16 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0">
            {STANDARDS.map((item, index) => (
              <Reveal
                key={item.id}
                delay={reduced ? 0 : index * 0.04}
                className="min-w-[200px] flex-shrink-0 md:min-w-0"
              >
                <article className="group overflow-hidden rounded-xl border border-[#E4DDD1] bg-white shadow-[0_4px_20px_rgba(27,23,20,0.04)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(27,23,20,0.08)]">
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-[#E4DDD1]">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover saturate-[0.85] transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 200px, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#1B1714]/40">
                      {item.meta}
                    </p>
                    <h3 className="mt-1 font-semibold text-[#1B1714]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#1B1714]/55">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <p className="landing-display text-xl font-medium text-[#1B1714]/80 md:text-2xl">
              …and we work with you to make it yours.
            </p>
            {setupFaq && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#1B1714]/65">
                {setupFaq.answer}
              </p>
            )}
            <Link href="/login" className={cn(linkArrow, "mt-6")}>
              See More Guides
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Testimonials — "But don't take it from us" */}
      <section className="border-b border-[#E4DDD1] bg-white py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal className="mb-12 text-center md:mb-16">
            <h2 className="landing-display text-2xl font-medium md:text-3xl lg:text-4xl">
              But, don&apos;t take it from us…
            </h2>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {TESTIMONIALS.slice(0, 3).map((t, index) => (
              <Reveal key={t.id} delay={index * 0.08}>
                <blockquote className="flex h-full flex-col">
                  <p className="flex-1 text-base leading-relaxed text-[#1B1714]/80">
                    {t.quote}
                  </p>
                  <footer className="mt-6 border-t border-[#1B1714]/10 pt-4">
                    <p className="text-sm font-semibold text-[#1B1714]">
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#1B1714]/50">
                      {t.salon}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#5B21B6]/80">
                      {t.role}
                    </p>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
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
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={IMAGES.waitingArea}
                  alt="Salon waiting area"
                  fill
                  className="object-cover saturate-[0.9]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="landing-display text-2xl font-medium md:text-3xl">
                Quick start checklist
              </h2>
              <ol className="mt-8 space-y-4">
                {[
                  "Sign in or start your 14-day free trial.",
                  "Complete salon profile — services, staff, taxes, branding.",
                  "Import clients and your service catalog.",
                  "Configure WhatsApp reminders and POS payments.",
                  "Go live — most salons are operational within 24 hours.",
                ].map((item, i) => (
                  <li key={item} className="flex gap-4 text-base text-[#1B1714]/75">
                    <span className="landing-display text-lg font-medium text-[#5B21B6]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-preview-band py-20 md:py-28">
        <div className={cn(CONTAINER, "max-w-3xl text-center")}>
          <Reveal>
            <h2 className="landing-display text-3xl font-medium md:text-4xl lg:text-5xl">
              Let&apos;s get your salon running the way you&apos;ve been dreaming about
            </h2>
            <div className="mt-10">
              <Link href="/login" className={primaryBtn}>
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
