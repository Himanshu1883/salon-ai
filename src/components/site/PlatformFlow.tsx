"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  MessageCircle,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Keep in sync: Tailwind gap-x-5 = 1.25rem */
const COL_GAP = "gap-x-5";
const GAP_REM = 1.25;

function EngineBar({ title }: { title: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#2f1578] via-primary to-[#6d28d9] px-4 py-3 text-center shadow-[0_12px_30px_-12px_rgba(91,33,182,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      <p className="relative text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:text-xs">
        {title}
      </p>
    </div>
  );
}

function ShellCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_28px_-16px_rgba(15,23,42,0.18)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function InputPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-1 text-center">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white shadow-md shadow-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-[11px] font-medium leading-snug text-slate-500">{label}</p>
    </div>
  );
}

function GridRow({
  cols,
  children,
  className,
}: {
  cols: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid w-full items-stretch", COL_GAP, className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

/** Labels live in their own row — never overlaid on connector SVGs */
function ColumnCaptions({ labels }: { labels: string[] }) {
  return (
    <div
      className={cn("grid w-full pb-3 pt-1", COL_GAP)}
      style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
    >
      {labels.map((text) => (
        <p
          key={text}
          className="px-1 text-center text-[10px] font-medium leading-snug text-slate-500"
        >
          {text}
        </p>
      ))}
    </div>
  );
}

function FlowCaption({ children }: { children: ReactNode }) {
  return (
    <p className="pb-2 pt-1 text-center text-[10px] font-medium leading-snug tracking-wide text-slate-500">
      {children}
    </p>
  );
}

/** Straight vertical dotted lines under N columns — flush to neighbors */
function VerticalLines({ cols, height = "h-10" }: { cols: number; height?: string }) {
  return (
    <div
      className={cn("grid w-full", COL_GAP)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex justify-center">
          <div className={cn("gotix-flow-vline", height)} />
        </div>
      ))}
    </div>
  );
}

function CenterStem({ height = "h-8" }: { height?: string }) {
  return (
    <div className="flex w-full justify-center" aria-hidden>
      <div className={cn("gotix-flow-vline", height)} />
    </div>
  );
}

/**
 * Merge N column centers into one center stem.
 * Uses the same CSS grid + gap as the cards so verticals hit icon centers.
 * Drawn as separate segments (not overlapping SVG paths) to avoid the center kink.
 */
function MergeToCenter({ cols }: { cols: number }) {
  const inset = `calc((100% - ${(cols - 1) * GAP_REM}rem) / ${cols * 2})`;

  return (
    <div className="w-full pt-2" aria-hidden>
      <div
        className={cn("grid w-full", COL_GAP)}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <div className="gotix-flow-vline h-9" />
          </div>
        ))}
      </div>
      <div className="relative h-9">
        <div className="gotix-flow-hline absolute top-0" style={{ left: inset, right: inset }} />
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="gotix-flow-vline h-9" />
        </div>
      </div>
    </div>
  );
}

/** Fan from center stem out to N column centers (gap-aware) */
function FanFromCenter({ cols }: { cols: number }) {
  const inset = `calc((100% - ${(cols - 1) * GAP_REM}rem) / ${cols * 2})`;

  return (
    <div className="w-full" aria-hidden>
      <div className="flex justify-center">
        <div className="gotix-flow-vline h-9" />
      </div>
      <div className="relative h-px">
        <div className="gotix-flow-hline absolute top-0" style={{ left: inset, right: inset }} />
      </div>
      <div
        className={cn("grid w-full", COL_GAP)}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <div className="gotix-flow-vline h-9" />
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeCard() {
  return (
    <ShellCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Booking Intake</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" className="stroke-slate-200" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              className="stroke-primary"
              strokeWidth="3"
              strokeDasharray="88"
              strokeDashoffset="8"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800">
            96%
          </span>
        </div>
        <div>
          <p className="font-display text-xl text-slate-900">Confirmed</p>
          <p className="text-xs text-slate-500">Same-day fill rate</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-600">+12% vs last week</p>
        </div>
      </div>
    </ShellCard>
  );
}

function LogoTile({ mark, name, sub }: { mark: string; name: string; sub: string }) {
  return (
    <ShellCard className="flex min-h-[148px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-purple-500/20 font-display text-lg font-bold text-primary">
        {mark}
      </div>
      <p className="mt-2 font-display text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{sub}</p>
    </ShellCard>
  );
}

function TimelineCard() {
  const rows = [
    { t: "10:12", e: "Walk-in checked in", who: "Reception" },
    { t: "10:18", e: "Stylist assigned · Chair 3", who: "Floor lead" },
    { t: "10:41", e: "Service started · Balayage", who: "Priya S." },
    { t: "11:28", e: "Checkout completed · UPI", who: "POS" },
  ];
  return (
    <ShellCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Live Floor Deployment
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">Status stream · Main branch</p>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.t} className="flex items-start gap-2.5 text-xs">
            <span className="mt-0.5 w-10 shrink-0 font-mono text-[10px] text-primary">{row.t}</span>
            <div className="min-w-0">
              <p className="font-medium text-slate-800">{row.e}</p>
              <p className="text-[10px] text-slate-500">{row.who}</p>
            </div>
          </li>
        ))}
      </ul>
    </ShellCard>
  );
}

function RevenueCard() {
  return (
    <ShellCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Real-time dashboards
      </p>
      <p className="mt-2 font-display text-2xl text-slate-900">
        ₹1,84,720
        <span className="ml-2 text-sm font-semibold text-emerald-600">+8.2%</span>
      </p>
      <p className="text-xs text-slate-500">Today’s revenue</p>
      <div className="mt-4 space-y-2">
        {[
          { label: "Services", pct: 72 },
          { label: "Retail", pct: 18 },
          { label: "Membership", pct: 10 },
        ].map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-[10px] text-slate-500">
              <span>{row.label}</span>
              <span>{row.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}

function AnalyticsCard() {
  const points = "0,28 20,22 40,24 60,14 80,18 100,8 120,12 140,6 160,10 180,4";
  return (
    <ShellCard>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Predictive analytics
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">Demand & anomaly detection</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          AI
        </span>
      </div>
      <div className="relative mt-3 h-20">
        <svg viewBox="0 0 180 36" className="h-full w-full overflow-visible" aria-hidden>
          <polyline fill="none" className="stroke-primary/80" strokeWidth="2" points={points} />
          <polyline
            fill="none"
            className="stroke-amber-500/70"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            points="0,20 30,18 60,19 90,16 120,17 150,15 180,14"
          />
        </svg>
        <div className="absolute -top-1 right-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] shadow-sm">
          <p className="font-semibold text-slate-900">20.8K</p>
          <p className="text-slate-500">visits YTD</p>
        </div>
      </div>
    </ShellCard>
  );
}

function AgentCard() {
  return (
    <ShellCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Front desk console
      </p>
      <div className="relative mx-auto mt-3 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/15" />
        <div className="absolute inset-3 rounded-full border border-primary/20" />
        <div className="absolute inset-6 rounded-full border border-primary/30" />
        <div className="relative flex -space-x-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary ring-2 ring-white">
            AR
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/15 text-xs font-bold text-purple-700 ring-2 ring-white">
            PS
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">2 agents · queue cleared in 4m</p>
    </ShellCard>
  );
}

function BillingLogCard() {
  const rows = [
    { label: "Membership renew · Priya", status: "Collected", tone: "text-emerald-600" },
    { label: "Split bill · Chair 2", status: "Pending", tone: "text-amber-600" },
    { label: "Retail · Kerastase", status: "Collected", tone: "text-emerald-600" },
  ];
  return (
    <ShellCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Billing & recovery
      </p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-slate-800">{row.label}</span>
            <span className={cn("shrink-0 font-semibold", row.tone)}>{row.status}</span>
          </li>
        ))}
      </ul>
    </ShellCard>
  );
}

function MobilePortalCard() {
  return (
    <ShellCard className="flex flex-col items-center justify-center">
      <div className="w-[7.25rem] rounded-[1.1rem] border border-slate-200 bg-slate-50 p-2">
        <div className="rounded-xl bg-white p-2.5 shadow-sm">
          <p className="text-[9px] font-semibold text-slate-500">Client portal</p>
          <p className="mt-1 font-display text-sm text-slate-900">Next visit</p>
          <p className="text-[10px] text-slate-500">Sat · 2:30 PM</p>
          <div className="mt-2 rounded-lg bg-primary/10 px-2 py-1.5 text-[10px] font-medium text-primary">
            Balayage · Priya
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Due today</p>
          <p className="font-display text-base text-slate-900">₹2,400</p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-slate-900">Self-service portal</p>
      <p className="text-center text-[10px] text-slate-500">Book · Pay · Review</p>
    </ShellCard>
  );
}

function DesktopArchitecture() {
  return (
    <div className="w-full rounded-[var(--site-shell-radius,1.75rem)] border border-slate-200/80 bg-white/90 px-5 py-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.16)] sm:px-8 sm:py-8">
      {/* Inputs */}
      <GridRow cols={4}>
        <InputPill icon={Store} label="Walk-in & front desk" />
        <InputPill icon={Calendar} label="Online booking feed" />
        <InputPill icon={MessageCircle} label="WhatsApp / SMS API" />
        <InputPill icon={CreditCard} label="POS & payment rails" />
      </GridRow>

      {/* 4 verticals → one horizontal → center stem (gap-aligned with icons) */}
      <MergeToCenter cols={4} />
      <div className="mx-auto w-full max-w-3xl">
        <EngineBar title="Secure API Gateway · Real-time Event Bus" />
      </div>

      {/* Gateway → 3 lanes: lines first, captions below (never on lines) */}
      <FanFromCenter cols={3} />
      <ColumnCaptions labels={["Bookings, waitlists", "Profiles, loyalty", "Tickets, payments"]} />

      <GridRow cols={3}>
        <GaugeCard />
        <LogoTile mark="CRM" name="Client Graph" sub="Profiles · visits · notes" />
        <LogoTile mark="POS" name="Checkout Lane" sub="UPI · Card · Split bills" />
      </GridRow>

      <VerticalLines cols={3} height="h-8" />
      <GridRow cols={3}>
        <EngineBar title="Smart Scheduling Engine" />
        <EngineBar title="Client Lifecycle Engine" />
        <EngineBar title="Billing & Payments Engine" />
      </GridRow>

      <VerticalLines cols={3} height="h-8" />
      <FlowCaption>Structured records · staff events · stock SKUs</FlowCaption>

      <GridRow cols={3}>
        <LogoTile mark="WA" name="WhatsApp Ops" sub="Reminders · confirmations" />
        <TimelineCard />
        <ShellCard className="flex min-h-[148px] flex-col items-center justify-center text-center">
          <p className="font-display text-3xl text-slate-900">22+</p>
          <p className="mt-1 text-sm font-medium text-slate-900">ERP modules covered</p>
          <p className="mt-1 text-xs leading-snug text-slate-500">
            Inventory, memberships, multi-branch sync
          </p>
        </ShellCard>
      </GridRow>

      <MergeToCenter cols={3} />
      <FlowCaption>Normalized salon transactions</FlowCaption>
      <CenterStem height="h-6" />
      <div className="mx-auto w-full max-w-2xl">
        <EngineBar title="Gotix Core Sync · Normalization Engine" />
      </div>

      <FanFromCenter cols={5} />
      <ColumnCaptions
        labels={["Dashboards", "AI insights", "Console", "Billing", "Client portal"]}
      />

      <GridRow cols={5}>
        <RevenueCard />
        <AnalyticsCard />
        <AgentCard />
        <BillingLogCard />
        <MobilePortalCard />
      </GridRow>
    </div>
  );
}

function MobileArchitecture() {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InputPill icon={Store} label="Walk-in" />
        <InputPill icon={Calendar} label="Online booking" />
        <InputPill icon={MessageCircle} label="WhatsApp" />
        <InputPill icon={CreditCard} label="POS rails" />
      </div>
      <div className="flex justify-center" aria-hidden>
        <div className="gotix-flow-vline h-8" />
      </div>
      <EngineBar title="Secure API Gateway · Event Bus" />
      <div className="flex justify-center" aria-hidden>
        <div className="gotix-flow-vline h-8" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <GaugeCard />
        <LogoTile mark="CRM" name="Client Graph" sub="Profiles · loyalty" />
        <LogoTile mark="POS" name="Checkout Lane" sub="Split · UPI · Card" />
        <TimelineCard />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <EngineBar title="Scheduling" />
        <EngineBar title="Lifecycle" />
        <EngineBar title="Billing" />
      </div>
      <div className="flex justify-center" aria-hidden>
        <div className="gotix-flow-vline h-8" />
      </div>
      <EngineBar title="Gotix Core Sync · Normalization Engine" />
      <div className="flex justify-center" aria-hidden>
        <div className="gotix-flow-vline h-8" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <RevenueCard />
        <AnalyticsCard />
        <AgentCard />
        <BillingLogCard />
        <div className="sm:col-span-2 sm:mx-auto sm:max-w-xs">
          <MobilePortalCard />
        </div>
      </div>
    </div>
  );
}

export function PlatformFlow() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#f5f7fb] py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Salon data architecture</span>
          </div>
          <h2 className="mt-5 font-display text-3xl leading-[1.08] sm:text-4xl lg:text-[3rem]">
            From every input to one{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              synchronized salon engine.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Bookings, payments, staff, inventory and AI signals flow through Gotix Core —
            normalized, matched, and delivered to dashboards, WhatsApp, and the client portal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-12 hidden w-full lg:block"
        >
          <DesktopArchitecture />
        </motion.div>

        <div className="mt-10 lg:hidden">
          <MobileArchitecture />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/platform"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-dark"
          >
            Explore the platform
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-primary/30 hover:bg-primary/5"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  );
}
