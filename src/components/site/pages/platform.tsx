"use client";

import { CtaBanner } from "@/components/site/Cta";
import { Reveal } from "@/components/site/Reveal";
import { SectionBackdrop } from "@/components/site/SectionBackdrop";
import { ImageSlot } from "@/components/site/Sections";
import { PLATFORM_TABS } from "@/lib/site-data";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  Clock,
  Layers,
  Lock,
  Plug,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const appointmentImg = "/gotix/appoinment.png";
const billingImg = "/gotix/biling.png";
const customersImg = "/gotix/customers.png";
const dashboardImg = "/gotix/dashboard.png";
const inventoryImg = "/gotix/inventory.png";
const servicesImg = "/gotix/services.png";

function unsplash(id: string, w = 2400) {
  return `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;
}

const WORKFLOW_BG = unsplash("photo-1560066984-138dadb4c035", 1920);

const BENTO_MODULES = PLATFORM_TABS.slice(0, 6);

const PLATFORM_IMAGES: Record<string, string> = {
  Dashboard: dashboardImg,
  Appointment: appointmentImg,
  Billing: billingImg,
  CRM: customersImg,
  Inventory: inventoryImg,
  Marketing: servicesImg,
  Reports: servicesImg,
  Analytics: dashboardImg,
};

const TAB_HIGHLIGHTS: Record<string, string[]> = {
  Dashboard: [
    "Live revenue, footfall, and staff utilization in one view",
    "Branch comparison for multi-location owners",
    "Configurable widgets — pin what matters to your role",
  ],
  Appointment: [
    "Drag-and-drop calendar with automatic conflict detection",
    "SMS + WhatsApp reminders sent without lifting a finger",
    "Waitlist auto-fills cancellations in real time",
  ],
  Billing: [
    "Split payments across cash, card, UPI, and memberships",
    "Auto-applies active offers and loyalty credit at checkout",
    "GST-ready invoices generated and shared in one tap",
  ],
  CRM: [
    "360° client profile: visit history, preferences, spend",
    "Auto-segments clients for win-back and upsell campaigns",
    "Consent forms and allergy notes stored per client",
  ],
  Inventory: [
    "Multi-branch stock sync with low-stock alerts",
    "Usage tracked automatically per service performed",
    "Purchase orders generated from reorder thresholds",
  ],
  Marketing: [
    "Campaign builder for SMS, email, and WhatsApp",
    "Birthday and win-back sequences run on autopilot",
    "ROI tracked per campaign against actual bookings",
  ],
  Reports: [
    "Export-ready P&L, staff, and service performance reports",
    "Schedule reports to land in your inbox weekly",
    "Drill down from any chart to the underlying transactions",
  ],
  Analytics: [
    "AI forecasts demand by day, hour, and service type",
    "Churn risk alerts before clients go quiet",
    "Peak-hour staffing recommendations you can act on",
  ],
};

const DIFFERENTIATORS = [
  { label: "Setup time", value: "< 24 hrs" },
  { label: "Modules included", value: "22+" },
  { label: "Uptime SLA", value: "99.9%" },
  { label: "Data migration", value: "Free" },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Book & queue",
    desc: "Appointments, walk-ins and waitlists stay in sync — no double bookings, no lost clients at the door.",
    icon: Calendar,
  },
  {
    step: "02",
    title: "Serve & bill",
    desc: "POS checkout, memberships and split payments at chair-side speed. Receipts land on WhatsApp instantly.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Retain & grow",
    desc: "CRM segments, campaigns and AI insights turn one-time visits into loyal, high-LTV clients.",
    icon: Sparkles,
  },
];

const ROLES = [
  {
    title: "Owner",
    desc: "Revenue, branch comparison and forecast dashboards without chasing spreadsheets.",
    icon: BarChart3,
  },
  {
    title: "Floor manager",
    desc: "Live queue, staff rotation and inventory alerts from a single operations view.",
    icon: Layers,
  },
  {
    title: "Reception",
    desc: "Fast check-in, conflict-free booking and billing in fewer taps than your current stack.",
    icon: Clock,
  },
  {
    title: "Stylist",
    desc: "Client history, formulas and upsell prompts right when the chair turns.",
    icon: Users,
  },
];

const INTEGRATIONS = [
  "Razorpay",
  "WhatsApp Business",
  "Google Calendar",
  "Tally",
  "Zapier",
  "Mailchimp",
  "Shiprocket",
  "Custom API",
];

const UNDER_THE_HOOD = [
  {
    icon: Radio,
    title: "Real-time sync",
    desc: "Every branch and device updates instantly — no refresh between front desk and back office.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade security",
    desc: "Encrypted in transit and at rest, with role-based access so staff only see what they need.",
  },
  {
    icon: Plug,
    title: "Open API",
    desc: "Connect Gotix to accounting, payments or tools you've already built in-house.",
  },
  {
    icon: Lock,
    title: "99.9% uptime SLA",
    desc: "Daily backups and a public status page — not just a promise on a pricing page.",
  },
];

function PlatformHero({
  active,
  onSelect,
  tab,
}: {
  active: string;
  onSelect: (key: string) => void;
  tab: (typeof PLATFORM_TABS)[number];
}) {
  const sideModules = BENTO_MODULES.filter((t) => t.key !== active).slice(0, 4);

  return (
    <section className="relative isolate w-full overflow-hidden border-b border-border/60 bg-background pt-24 lg:pt-28">
      {/* Abstract platform backdrop — no salon photo */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 9%, transparent) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]" />
        <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-purple-500/8 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute inset-x-0 top-[42%] h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-10 sm:px-8 lg:pb-14">
        {/* Centered editorial header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              8
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Connected modules
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-8 font-display text-[2.4rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.25rem]"
          >
            Explore every surface.
            <br />
            <em className="italic text-primary">One platform.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Dashboard, scheduling, billing, CRM, inventory, marketing, reports and AI analytics —
            pick a module below and preview the real Gotix interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="#product-tour" className="btn-base btn-primary">
              Start the tour <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/register" className="btn-base btn-outline">
              Start Free Trial
            </Link>
          </motion.div>
        </div>

        {/* Bento product explorer — unique to platform page */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
          className="mx-auto mt-14 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-5"
        >
          {/* Vertical module rail */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {PLATFORM_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onSelect(t.key)}
                className={`flex min-w-[148px] shrink-0 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all lg:min-w-0 lg:w-full ${
                  active === t.key
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border/70 bg-card/80 hover:border-primary/30 hover:bg-card"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                    active === t.key
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {t.key.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{t.key}</span>
                  <span
                    className={`block truncate text-[10px] ${
                      active === t.key ? "text-primary-foreground/75" : "text-muted-foreground"
                    }`}
                  >
                    {t.title}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Main preview + satellite tiles */}
          <div className="grid gap-4 md:grid-cols-5 md:grid-rows-[1fr_auto]">
            <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl md:col-span-3 md:row-span-2">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <span className="truncate rounded-lg bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground">
                  app.gotix.in/{tab.key.toLowerCase()}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  Live preview
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ImageSlot
                    name={`platform-hero-${tab.key.toLowerCase()}.jpg`}
                    alt={`${tab.title} screen preview`}
                    src={PLATFORM_IMAGES[tab.key]}
                    ratio="aspect-[16/10]"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="border-t border-border/60 px-5 py-4">
                <p className="eyebrow">{tab.key}</p>
                <p className="mt-1 font-display text-lg">{tab.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tab.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              {sideModules.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onSelect(t.key)}
                  className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left transition hover:border-primary/35 hover:shadow-md"
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-muted/30">
                    <img
                      src={PLATFORM_IMAGES[t.key]}
                      alt={t.title}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-semibold">{t.key}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{t.title}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:col-span-5">
              {DIFFERENTIATORS.map((d) => (
                <div
                  key={d.label}
                  className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-center backdrop-blur-sm"
                >
                  <p className="font-display text-xl sm:text-2xl">{d.value}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {d.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PlatformPage() {
  const [active, setActive] = useState(PLATFORM_TABS[0]!.key);
  const tab = PLATFORM_TABS.find((t) => t.key === active)!;

  return (
    <>
      <PlatformHero active={active} onSelect={setActive} tab={tab} />

      {/* ============ WORKFLOW ============ */}
      <section className="relative w-full overflow-hidden border-y border-border/50 py-24">
        <SectionBackdrop variant="mesh" image={WORKFLOW_BG} />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it flows</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              One platform from first booking to repeat visit.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Gotix connects the front desk, the chair and the back office — so nothing falls
              between systems.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {WORKFLOW.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <div className="surface-card lift h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-sm text-primary/60">{item.step}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INTERACTIVE PRODUCT TOUR ============ */}
      <section id="product-tour" className="relative w-full bg-background py-24">
        <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Interactive tour</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Explore every surface in detail.</h2>
            <p className="mt-4 text-muted-foreground">
              Switch tabs to preview real Gotix screens and the capabilities behind each module.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-wrap justify-center gap-2 rounded-2xl border border-border bg-card/60 p-2 backdrop-blur">
            {PLATFORM_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                aria-pressed={active === t.key}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active === t.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.key}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-14 grid items-center gap-12 lg:grid-cols-2"
            >
              <div>
                <p className="eyebrow">{tab.key}</p>
                <h2 className="mt-3 text-3xl sm:text-4xl">{tab.title}</h2>
                <p className="mt-4 text-muted-foreground">{tab.desc}</p>

                <ul className="mt-7 space-y-3">
                  {(TAB_HIGHLIGHTS[tab.key] ?? []).map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-foreground/80">{h}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/demo"
                  className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  See {tab.key.toLowerCase()} in a live demo
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="relative">
                <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                  <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                    <span className="ml-3 truncate rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">
                      app.gotix.in/{tab.key.toLowerCase()}
                    </span>
                  </div>
                  <ImageSlot
                    name={`platform-${tab.key.toLowerCase()}.jpg`}
                    alt={`${tab.title} screen preview`}
                    src={PLATFORM_IMAGES[tab.key]}
                    ratio="aspect-[16/10]"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ============ BUILT FOR EVERY ROLE ============ */}
      <section className="relative w-full overflow-hidden py-24">
        <SectionBackdrop variant="features" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="max-w-xl">
            <p className="eyebrow">For your whole team</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Built for every role on the floor.</h2>
            <p className="mt-4 text-muted-foreground">
              Owners get clarity. Managers get control. Reception and stylists get speed — without
              learning eight different tools.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((role, i) => (
              <Reveal key={role.title} delay={i * 0.06}>
                <div className="surface-card lift h-full p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <role.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg">{role.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INTEGRATIONS ============ */}
      <section className="w-full border-y border-border/50 bg-muted/30 py-16">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Integrations</p>
              <h2 className="mt-2 text-2xl sm:text-3xl">Plugs into tools you already use.</h2>
            </div>
            <Link href="/demo" className="btn-base btn-outline">
              View all integrations <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {INTEGRATIONS.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground/80"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ UNDER THE HOOD ============ */}
      <section className="relative w-full overflow-hidden py-24">
        <SectionBackdrop variant="salon-types" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="max-w-xl">
            <p className="eyebrow">Under the hood</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Enterprise-grade, without the enterprise complexity.
            </h2>
            <p className="mt-4 text-muted-foreground">
              The infrastructure behind Gotix is built for salons that cannot afford downtime —
              whether you run one studio or twenty branches.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {UNDER_THE_HOOD.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="surface-card lift h-full p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ONBOARDING STRIP ============ */}
      <section className="w-full py-20">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-purple-500/5 to-background p-8 sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="eyebrow">Go live fast</p>
                <h2 className="mt-3 text-3xl sm:text-4xl">Live in under 24 hours — we migrate for free.</h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Our onboarding team imports your clients, services and staff schedules. Most
                  salons run their first real day on Gotix within one business day.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Dedicated onboarding specialist",
                    "Free data migration from any system",
                    "Team training included on every plan",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="btn-base btn-primary shrink-0">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner title="Want a guided walkthrough?" />
    </>
  );
}

export default PlatformPage;
