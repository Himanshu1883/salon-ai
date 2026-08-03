"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ERP_MODULES,
  FOOTER_STATS,
  IMAGES,
  TESTIMONIALS,
} from "../../constants";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;
const CONTAINER = "mx-auto w-full max-w-[1120px] px-5 sm:px-6 lg:px-8";

/** Real integrations / connected capabilities from Gotix Product */
const WORKFLOWS = [
  {
    id: "messaging",
    title: "Client Messaging",
    description:
      "Turn appointment data into reliable WhatsApp workflows — reminders, confirmations, and follow-ups.",
    image: IMAGES.makeupArtist,
    capabilities: [
      "WhatsApp reminders",
      "Confirmations",
      "Payment receipts",
      "Marketing messages",
    ],
    href: "#whatsapp",
    cta: "Explore Messaging",
  },
  {
    id: "payments",
    title: "Payments & POS",
    description:
      "Turn salon checkout into a fast production workflow — cash, card, UPI, and split tenders.",
    image: IMAGES.salonChair,
    capabilities: [
      "Cash / Card / UPI",
      "Split payments",
      "Membership credits",
      "Gift cards & wallets",
    ],
    href: "#payments",
    cta: "Explore Payments",
  },
  {
    id: "operations",
    title: "Floor Operations",
    description:
      "Turn inventory, marketing, and multi-branch data into one connected salon system.",
    image: IMAGES.salonWorkspace,
    capabilities: [
      "Inventory sync",
      "Marketing automation",
      "Multi-branch reporting",
      "PDF / BI exports",
    ],
    href: "#operations",
    cta: "Explore Operations",
  },
] as const;

const PLATFORM_PILLARS = [
  {
    title: "WhatsApp Automation",
    body: "Reminders, confirmations, and marketing messages — included on Professional and above.",
  },
  {
    title: "Native POS Payments",
    body: "Cash, card, UPI, wallets, split payments, and membership credits with automatic receipts.",
  },
  {
    title: "ERP Data Sync",
    body: "Appointments, billing, inventory, and CRM share one data model — no double entry.",
  },
  {
    title: "API & Enterprise",
    body: "Business and Enterprise plans include API access and custom accounting / BI integrations.",
  },
] as const;

const QUOTES = TESTIMONIALS.slice(0, 4).map((t) => ({
  quote: t.quote,
  name: t.name,
  role: `${t.role}, ${t.salon}`,
}));

const NATIVE = ERP_MODULES.filter((m) =>
  ["whatsapp", "billing", "pos", "marketing", "inventory", "multi-branch", "reports", "settings"].includes(
    m.id
  )
);

const primaryBtn =
  "inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(91,33,182,0.4)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_12px_36px_-6px_rgba(91,33,182,0.5)]";

const outlineBtn =
  "inline-flex items-center gap-2 rounded-full border border-[#1B1714]/25 bg-white/80 px-7 py-3.5 text-sm font-semibold text-[#1B1714] transition-[transform,background-color,border-color] duration-200 hover:-translate-y-px hover:border-[#1B1714]/40 hover:bg-white";

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

export function IntegrationsPageContent() {
  const reduced = !!useReducedMotion();

  return (
    <div className="bg-white text-[#1B1714]">
      {/* Hero — Docs-style centered 100vh banner */}
      <section className="hero-editorial relative min-h-[100svh] overflow-hidden border-b border-[#E8E4DE]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/docs.png"
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
                  Integrations · Gotix ERP
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
                Complex workflows. Busy floors.{" "}
                <span className="italic text-[#5B21B6]">
                  One connected platform.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
                Gotix connects WhatsApp, UPI payments, POS, inventory,
                marketing, and multi-branch ops — so your team runs one system
                from booking to checkout.
              </p>
            </Reveal>

            <Reveal
              delay={0.22}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/login" className={primaryBtn}>
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/documentation" className={outlineBtn}>
                View Documentation
              </Link>
            </Reveal>

            <Reveal delay={0.3} className="mt-12">
              <p className="text-sm text-[#1B1714]/45">
                Shaping the{" "}
                <em className="not-italic italic text-[#5B21B6]">future</em> of
                salon operations
              </p>
              <p className="mt-2 text-xs text-[#1B1714]/35">
                Trusted by {FOOTER_STATS[0].value!.toLocaleString("en-IN")}+
                salons across India
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pick your workflow */}
      <section className="border-b border-[#E8E4DE] bg-white py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal>
            <h2 className="landing-display max-w-2xl text-3xl font-medium tracking-tight text-[#1B1714] md:text-4xl">
              Pick your workflow. See Gotix at work.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {WORKFLOWS.map((wf, index) => (
              <Reveal key={wf.id} delay={index * 0.08}>
                <article
                  id={wf.id === "messaging" ? "whatsapp" : wf.id}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E4DE] bg-white",
                    "shadow-[0_4px_24px_rgba(27,23,20,0.05)]",
                    "transition-[transform,border-color,box-shadow] duration-300",
                    "hover:-translate-y-1 hover:border-[#5B21B6]/30 hover:shadow-[0_16px_40px_rgba(91,33,182,0.12)]"
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={wf.image}
                      alt=""
                      fill
                      className="object-cover saturate-[0.88] transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40" />
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <h3 className="landing-display text-xl font-medium text-[#1B1714] md:text-2xl">
                      {wf.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#1B1714]/60">
                      {wf.description}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {wf.capabilities.map((cap) => (
                        <li
                          key={cap}
                          className="rounded-full border border-[#E8E4DE] bg-[#FAF9F7] px-3 py-1 text-[11px] font-medium text-[#1B1714]/65"
                        >
                          {cap}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={wf.href}
                      className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5B21B6] transition-colors hover:text-[#4C1D95]"
                    >
                      {wf.cta}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="landing-preview-band border-b border-[#E8E4DE] py-16 md:py-20">
        <div className={CONTAINER}>
          <div className="grid gap-5 md:grid-cols-2">
            {QUOTES.map((q, index) => (
              <Reveal key={q.name} delay={index * 0.06}>
                <blockquote className="rounded-2xl border border-[#E8E4DE] bg-white p-6 shadow-[0_4px_20px_rgba(27,23,20,0.04)] md:p-7">
                  <p className="text-base leading-relaxed text-[#1B1714]/80 md:text-lg">
                    &ldquo;{q.quote}&rdquo;
                  </p>
                  <footer className="mt-5 text-sm text-[#1B1714]/45">
                    <span className="font-medium text-[#1B1714]/75">{q.name}</span>
                    <span className="mx-2 text-[#1B1714]/20">·</span>
                    {q.role}
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section
        id="operations"
        className="border-b border-[#E8E4DE] bg-white py-20 md:py-28"
      >
        <div className={CONTAINER}>
          <Reveal className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5B21B6]">
              Connected Salon ERP
            </p>
            <h2 className="landing-display mt-4 text-3xl font-medium tracking-tight text-[#1B1714] md:text-4xl lg:text-5xl">
              Build once.
              <br />
              Deploy across chairs.
              <br />
              <span className="italic text-[#5B21B6]">Improve over time.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#1B1714]/60">
              Go beyond standalone tools with the context, integrations, and
              controls needed to run appointments, billing, and clients from
              start to finish.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {PLATFORM_PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.06}>
                <div className="rounded-2xl border border-[#E8E4DE] bg-white p-6 shadow-[0_4px_20px_rgba(27,23,20,0.04)] transition-[border-color,box-shadow] hover:border-[#5B21B6]/30 hover:shadow-[0_12px_32px_rgba(91,33,182,0.08)] md:p-7">
                  <h3 className="text-lg font-semibold text-[#1B1714]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/60">
                    {pillar.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mt-10">
            <Link href="/login" className={primaryBtn}>
              See it on your salon
              <span className="text-white/70">· 14-day trial</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Payments */}
      <section
        id="payments"
        className="landing-preview-band border-b border-[#E8E4DE] py-20 md:py-28"
      >
        <div className={CONTAINER}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5B21B6]">
                Payments & POS
              </p>
              <h2 className="landing-display mt-4 text-3xl font-medium text-[#1B1714] md:text-4xl">
                Checkout built for how Indian salons actually pay
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#1B1714]/60">
                Cash, card, UPI, wallets, split payments, and membership credits
                — all with automatic receipt generation. Same POS your
                reception already trains on.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Cash, card & UPI",
                  "Split & partial payments",
                  "Membership credits",
                  "Gift cards & wallets",
                  "Auto receipts",
                  "Multi-tender checkout",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-[#1B1714]/70"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[#5B21B6]"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#E8E4DE] shadow-[0_12px_40px_rgba(27,23,20,0.08)]">
                <Image
                  src={IMAGES.salonChair}
                  alt="Salon POS and billing counter"
                  fill
                  className="object-cover saturate-[0.9]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Native modules */}
      <section className="border-b border-[#E8E4DE] bg-white py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal className="max-w-2xl">
            <h2 className="landing-display text-3xl font-medium text-[#1B1714] md:text-4xl">
              Native modules that power every integration
            </h2>
            <p className="mt-4 text-base text-[#1B1714]/60">
              These aren&apos;t third-party plugins — they&apos;re built into
              Gotix and share the same client, staff, and billing data.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {NATIVE.map((mod, index) => {
              const Icon = mod.icon;
              return (
                <Reveal key={mod.id} delay={reduced ? 0 : (index % 4) * 0.04}>
                  <div className="rounded-xl border border-[#E8E4DE] bg-white p-5 shadow-[0_4px_16px_rgba(27,23,20,0.04)] transition-[border-color,box-shadow] hover:border-[#5B21B6]/30 hover:shadow-[0_8px_24px_rgba(91,33,182,0.08)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5B21B6]/10 text-[#5B21B6]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-[#1B1714]">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#1B1714]/55">
                      {mod.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Migration + API */}
      <section className="landing-preview-band border-b border-[#E8E4DE] py-20 md:py-28">
        <div className={CONTAINER}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-[#E8E4DE] bg-white p-7 shadow-[0_4px_20px_rgba(27,23,20,0.04)] md:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#5B21B6]">
                  Data Migration
                </p>
                <h3 className="landing-display mt-3 text-2xl font-medium text-[#1B1714]">
                  Move from tools you already use
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1B1714]/60">
                  Free data migration from Fresha, Booksy, Zoho, and Excel —
                  with zero downtime. Your clients, services, and history come
                  with you.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Fresha", "Booksy", "Zoho", "Excel"].map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-[#E8E4DE] bg-[#FAF9F7] px-3 py-1 text-xs text-[#1B1714]/70"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded-2xl border border-[#E8E4DE] bg-white p-7 shadow-[0_4px_20px_rgba(27,23,20,0.04)] md:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#5B21B6]">
                  API & Enterprise
                </p>
                <h3 className="landing-display mt-3 text-2xl font-medium text-[#1B1714]">
                  Custom integrations when you scale
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1B1714]/60">
                  Business and Enterprise plans include API access and custom
                  integrations for accounting exports, BI tools, and
                  multi-branch data sync — with dedicated support.
                </p>
                <Link
                  href="/documentation"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5B21B6] hover:text-[#4C1D95]"
                >
                  Read documentation
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white py-24 md:py-32">
        <div className={cn(CONTAINER, "max-w-3xl text-center")}>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#1B1714]/40">
              Precision ERP for salon workflows
            </p>
            <h2 className="landing-display mt-4 text-3xl font-medium tracking-tight text-[#1B1714] md:text-4xl lg:text-5xl">
              Build once.
              <br />
              Connect everything.
              <br />
              <span className="italic text-[#5B21B6]">Run the floor.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base text-[#1B1714]/60">
              Start a 14-day free trial — WhatsApp, payments, POS, and inventory
              in one platform. No credit card required.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/login" className={primaryBtn}>
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/#pricing" className={outlineBtn}>
                View Pricing
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
