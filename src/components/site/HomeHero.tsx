"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Play,
  Receipt,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const heroImg = "/gotix/hero-salon.jpg";

const PILLS = [
  "Appointments",
  "POS Billing",
  "Inventory",
  "CRM",
  "Marketing",
  "Membership",
  "WhatsApp",
  "Reports",
  "Analytics",
  "Multi-Branch",
];

// Kinetic word-cycle — the single signature move that replaces the dashboard
// mockup. Each word reframes who the platform is "the operating system" for.
const AUDIENCE_WORDS = ["modern salons.", "busy spas.", "growing chains.", "boutique studios."];

const METRICS = [
  { value: "12.8K+", label: "Salons onboarded" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "+156%", label: "Avg. revenue lift" },
];

const TOUR_STEPS = [
  {
    key: "dashboard",
    label: "Dashboard",
    title: "Your command center",
    desc: "Revenue, bookings, staff utilization, and branch performance — live in one unified view.",
    image: "/gotix/dashboard.png",
    url: "app.gotix.in/dashboard",
    highlights: [
      "Live revenue and footfall at a glance",
      "Branch comparison for multi-location owners",
      "Pin the widgets that matter to your role",
    ],
  },
  {
    key: "appointments",
    label: "Appointments",
    title: "Smart scheduling",
    desc: "Drag-and-drop calendar with conflict detection, waitlists, and automated reminders.",
    image: "/gotix/appoinment.png",
    url: "app.gotix.in/appointments",
    highlights: [
      "Drag-and-drop with automatic conflict checks",
      "WhatsApp and SMS reminders on autopilot",
      "Waitlist fills cancellations in real time",
    ],
  },
  {
    key: "billing",
    label: "Billing",
    title: "Fast checkout",
    desc: "Split bills, apply memberships, track payments, and share GST-ready invoices in seconds.",
    image: "/gotix/biling.png",
    url: "app.gotix.in/billing",
    highlights: [
      "Cash, card, UPI, and membership in one flow",
      "Offers and loyalty credit applied automatically",
      "Receipts shared via WhatsApp instantly",
    ],
  },
  {
    key: "crm",
    label: "CRM",
    title: "Client relationships",
    desc: "360° profiles with visit history, preferences, and personalized follow-ups.",
    image: "/gotix/customers.png",
    url: "app.gotix.in/clients",
    highlights: [
      "Full visit history and spend tracking",
      "Auto-segments for win-back campaigns",
      "Allergy notes and consent stored per client",
    ],
  },
] as const;

// Live-pulse feed for the new section — real product moments, not chrome.
const PULSE_EVENTS = [
  { icon: Calendar, text: "New booking confirmed — Priya S., Bridal Package" },
  { icon: Receipt, text: "Payment received — ₹2,400 via UPI" },
  { icon: MessageCircle, text: "WhatsApp reminder sent to 12 clients" },
  { icon: Star, text: "5★ review received — \u201cBest salon in the city\u201d" },
  { icon: UserPlus, text: "Walk-in checked in — queue position 2" },
  { icon: Sparkles, text: "AI flagged Saturday 2–6 PM as peak — staff alerted" },
];

const PULSE_STATS = [
  { value: 50000, suffix: "+", label: "Appointments handled monthly" },
  { value: 12800, suffix: "+", label: "Salons running on Gotix" },
  { value: 4.9, suffix: "★", label: "Average client rating", decimals: 1 },
  { value: 99.9, suffix: "%", label: "Platform uptime", decimals: 1 },
];

const fadeUp = (delay: number, reduced: boolean) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
      };

/* ---------------- background ---------------- */

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <img
        src={heroImg}
        alt=""
        width={1920}
        height={1088}
        className="h-full w-full object-cover object-[center_30%] ken-burns"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/72 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/88 via-background/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute inset-0 saas-flow-mesh opacity-70" />
      <div
        className="absolute inset-0 opacity-25 mix-blend-soft-light"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 90% 75% at 50% 20%, black, transparent 78%)",
        }}
      />
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-primary/12 blur-[100px] saas-flow-orb-a" />
      <div className="absolute -right-16 top-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] saas-flow-orb-b" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

/* ---------------- kinetic headline ---------------- */

function KineticHeadline({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % AUDIENCE_WORDS.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <h1 className="font-display text-[2.35rem] leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.65rem] xl:text-[4rem]">
      The operating system for{" "}
      <span className="relative mt-2 block h-[1.15em] overflow-hidden text-primary lg:inline-block lg:align-bottom">
        <AnimatePresence mode="wait">
          <motion.span
            key={AUDIENCE_WORDS[index]}
            initial={reduced ? false : { y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduced ? undefined : { y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {AUDIENCE_WORDS[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}

/* ---------------- editorial visual (replaces dashboard mockup) ---------------- */

function HeroStatBadge({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  className,
  style,
  reduced,
  delay,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: typeof Star;
  tone: "sage" | "sand" | "violet";
  className?: string;
  style?: CSSProperties;
  reduced: boolean;
  delay: number;
}) {
  const tones = {
    sage: "border-emerald-500/20 bg-[color-mix(in_oklab,var(--color-card)_90%,#dceee3)] shadow-[0_16px_48px_-20px_rgba(16,185,129,0.35)]",
    sand: "border-amber-500/20 bg-[color-mix(in_oklab,var(--color-card)_90%,#f3ebe0)] shadow-[0_16px_48px_-20px_rgba(217,119,6,0.28)]",
    violet:
      "border-primary/20 bg-[color-mix(in_oklab,var(--color-card)_88%,#ece7f8)] shadow-[0_16px_48px_-20px_rgba(124,58,237,0.28)]",
  } as const;

  return (
    <motion.div
      style={style}
      className={cn(
        "absolute z-20 min-w-[9.5rem] rounded-2xl border px-4 py-3 backdrop-blur-xl",
        tones[tone],
        className,
      )}
      initial={reduced ? false : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/70 text-primary shadow-sm">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 font-display text-[1.65rem] font-bold leading-none tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[10px] font-medium text-emerald-700/80">{hint}</p> : null}
    </motion.div>
  );
}

function HeroMoment({
  reduced,
  onWatchTour,
}: {
  reduced: boolean;
  onWatchTour?: () => void;
}) {
  return (
    <motion.div
      {...fadeUp(0.28, reduced)}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div
        className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-primary/15 via-purple-500/10 to-amber-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-1 rounded-[2.35rem] border border-primary/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-border/40 bg-muted/30"
        aria-hidden
      />

      <div className="group relative overflow-hidden rounded-[2rem] border border-white/25 bg-card/20 shadow-[0_28px_90px_-32px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-[2px]">
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
          <img
            src={heroImg}
            alt="A stylist at work in a modern salon"
            className="h-full w-full object-cover object-[center_32%] ken-burns scale-[1.03]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-amber-500/10 mix-blend-soft-light" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_20%_0%,rgba(255,255,255,0.16),transparent_55%)]" />

          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live floor
            </span>
            {onWatchTour ? (
              <button
                type="button"
                onClick={onWatchTour}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <Play className="h-3.5 w-3.5 fill-white/80" />
                Watch tour
              </button>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
            <div className="rounded-[1.35rem] border border-white/12 bg-black/35 p-4 backdrop-blur-xl sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Right now
              </p>
              <p className="mt-2 font-display text-xl leading-[1.15] text-white sm:text-[1.65rem]">
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  47 bookings
                </span>{" "}
                confirmed automatically today.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium text-emerald-100">
                  <TrendingUp className="h-3 w-3" />
                  +18% vs last week
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/75">
                  <Calendar className="h-3 w-3" />
                  8 open slots left
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      <HeroStatBadge
        reduced={reduced}
        delay={0.55}
        tone="sage"
        label="Client NPS"
        icon={Star}
        value={
          <>
            4.9<span className="text-amber-500">★</span>
          </>
        }
        className="-left-3 top-10 drift sm:-left-5 lg:-left-7"
      />

      <HeroStatBadge
        reduced={reduced}
        delay={0.68}
        tone="sand"
        label="Today"
        icon={Receipt}
        value="₹48,320"
        hint="+12% vs yesterday"
        className="-right-3 bottom-24 drift sm:-right-5 lg:-right-6"
        style={{ animationDelay: "0.8s" }}
      />

      <HeroStatBadge
        reduced={reduced}
        delay={0.8}
        tone="violet"
        label="Queue"
        icon={UserPlus}
        value="3 walk-ins"
        hint="Avg. wait · 4 min"
        className="bottom-2 left-4 hidden sm:block lg:left-6"
      />
    </motion.div>
  );
}

function HeroMarquee() {
  const items = [...PILLS, ...PILLS];
  return (
    <div className="relative mt-10 overflow-hidden py-2">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
        aria-hidden
      />
      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {items.map((pill, i) => (
          <span
            key={`${pill}-${i}`}
            className="shrink-0 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
          >
            {pill}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------------- NEW SECTION: live pulse ---------------- */

function useCountUp(target: number, active: boolean, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
}

function PulseStat({
  stat,
  active,
}: {
  stat: (typeof PULSE_STATS)[number];
  active: boolean;
}) {
  const display = useCountUp(stat.value, active, stat.decimals ?? 0);
  return (
    <div className="text-center">
      <p className="font-display text-3xl text-ink-foreground sm:text-4xl">
        {display}
        {stat.suffix}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink-foreground/55">
        {stat.label}
      </p>
    </div>
  );
}

export function LivePulseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const feed = [...PULSE_EVENTS, ...PULSE_EVENTS];

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-ink py-20 text-ink-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/20 blur-[110px]" aria-hidden />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-purple-500/15 blur-[110px]" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl text-center"
        >
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Happening right now
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl">The floor, live.</h2>
          <p className="mt-3 text-ink-foreground/60">
            Every booking, payment, and message — flowing through Gotix in real time.
          </p>
        </motion.div>

        {/* scrolling live-event ticker */}
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-4 backdrop-blur">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent"
            aria-hidden
          />
          <motion.div
            className="flex w-max gap-3 px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          >
            {feed.map((event, i) => (
              <span
                key={`${event.text}-${i}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-ink/40 px-4 py-2 text-xs text-ink-foreground/75"
              >
                <event.icon className="h-3.5 w-3.5 text-primary" />
                {event.text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* animated counters */}
        <div className="mt-14 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 sm:grid-cols-4">
          {PULSE_STATS.map((stat) => (
            <PulseStat key={stat.label} stat={stat} active={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- product tour modal ---------------- */

function ProductTourModal({
  open,
  onOpenChange,
  reduced,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reduced: boolean;
}) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step]!;
  const isLast = step === TOUR_STEPS.length - 1;

  const goTo = useCallback((index: number) => {
    setStep(Math.max(0, Math.min(index, TOUR_STEPS.length - 1)));
  }, []);

  const goNext = useCallback(() => {
    setStep((s) => (s >= TOUR_STEPS.length - 1 ? 0 : s + 1));
  }, []);

  const goPrev = useCallback(() => {
    setStep((s) => (s <= 0 ? TOUR_STEPS.length - 1 : s - 1));
  }, []);

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, goNext, goPrev]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-5xl gap-0 overflow-hidden border-border bg-background p-0 shadow-2xl sm:rounded-2xl [&>button:last-child]:hidden">
        <div className="flex items-start justify-between gap-4 border-b border-border/70 bg-muted/30 px-5 py-4 sm:items-center sm:px-6">
          <div className="min-w-0">
            <DialogTitle className="font-display text-lg sm:text-xl">Product tour</DialogTitle>
            <DialogDescription className="mt-1 text-xs sm:text-sm">
              Step {step + 1} of {TOUR_STEPS.length} · explore Gotix in under a minute
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border/70 bg-background p-2 text-muted-foreground transition hover:text-foreground"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-border/60 px-5 py-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {TOUR_STEPS.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => goTo(index)}
              aria-pressed={step === index}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm",
                step === index
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 max-h-[calc(92vh-11rem)] overflow-x-hidden overflow-y-auto lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0 border-b border-border/60 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary">{current.label}</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="mt-2 font-display text-2xl sm:text-3xl">{current.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {current.desc}
                </p>
                <ul className="mt-6 space-y-3">
                  {current.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-foreground/85">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative min-w-0 overflow-hidden bg-muted/20 p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-8 top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
              >
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-3 truncate rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">
                    {current.url}
                  </span>
                </div>
                <div className="relative aspect-[16/10] bg-muted/30">
                  <img
                    src={current.image}
                    alt={`${current.title} preview`}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <div className="flex shrink-0 items-center justify-center gap-2 sm:justify-start">
            {TOUR_STEPS.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to ${item.label}`}
                className={cn(
                  "h-2 shrink-0 rounded-full transition-all",
                  step === index ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/40",
                )}
              />
            ))}
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Previous</span>
            </button>
            {!isLast ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <>
                <Link
                  href="/platform#product-tour"
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
                >
                  Full platform tour
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  <span>Start free trial</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- hero ---------------- */

export function HomeHero() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const [tourOpen, setTourOpen] = useState(false);

  const openTour = useCallback(() => {
    setTourOpen(true);
  }, []);

  useEffect(() => {
    if (window.location.hash !== "#product-tour") return;
    openTour();
    window.history.replaceState(null, "", window.location.pathname);
  }, [openTour]);

  return (
    <>
      <ProductTourModal open={tourOpen} onOpenChange={setTourOpen} reduced={reduced} />

      <section className="site-hero-shell relative isolate min-h-[100svh] w-full overflow-hidden pt-24 lg:pt-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-16 sm:px-8 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-14 xl:gap-20">
          <div className="relative mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <div
              className="pointer-events-none absolute -inset-6 -top-8 rounded-[3rem] bg-background/45 blur-3xl lg:-inset-10 lg:bg-background/35"
              aria-hidden
            />
            <div className="relative">
              <motion.div
                {...fadeUp(0, reduced)}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">AI-Powered Salon OS</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  v3.0
                </span>
              </motion.div>

              <motion.div {...fadeUp(0.06, reduced)}>
                <KineticHeadline reduced={reduced} />
              </motion.div>

              <motion.p
                {...fadeUp(0.16, reduced)}
                className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0"
              >
                Appointments, POS billing, inventory, CRM and AI analytics in one intelligent
                platform — built for salons, spas and beauty chains that refuse to run on
                spreadsheets.
              </motion.p>

              <motion.div
                {...fadeUp(0.22, reduced)}
                className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                <Link href="/signup" className="group btn-base btn-primary relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Start free trial
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  href="/demo"
                  className="btn-base btn-outline border-2 bg-background/60 backdrop-blur-sm"
                >
                  <Calendar className="h-4 w-4" />
                  Book a demo
                </Link>
                <button
                  type="button"
                  onClick={openTour}
                  aria-expanded={tourOpen}
                  className="btn-base btn-ghost text-muted-foreground hover:text-primary"
                >
                  <Play className="h-4 w-4" />
                  Watch tour
                </button>
              </motion.div>

              <motion.div
                {...fadeUp(0.28, reduced)}
                className="mt-8 flex flex-wrap items-center justify-center gap-6 border-y border-border/50 py-5 lg:justify-start"
              >
                {METRICS.map((metric, i) => (
                  <div key={metric.label} className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="font-display text-xl font-bold sm:text-2xl">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                    {i < METRICS.length - 1 && (
                      <span className="hidden h-10 w-px bg-border/70 sm:block" aria-hidden />
                    )}
                  </div>
                ))}
              </motion.div>

              <motion.div
                {...fadeUp(0.34, reduced)}
                className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/35 to-purple-600/35"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trusted by{" "}
                    <span className="font-semibold text-foreground">1,200+ salons</span> worldwide
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className={cn(tourOpen && "rounded-[2rem] ring-2 ring-primary/30 ring-offset-4 ring-offset-background transition-shadow")}>
            <HeroMoment reduced={reduced} onWatchTour={openTour} />
          </div>
        </div>

        <HeroMarquee />
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ delay: 1 }}
      >
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Scroll to explore
        </span>
        <ChevronDown className="h-4 w-4 animate-bounce text-muted-foreground" />
      </motion.div>
      </section>
    </>
  );
}