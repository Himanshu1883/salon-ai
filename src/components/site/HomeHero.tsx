"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function unsplash(id: string, w = 1920) {
  return `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;
}

const SLIDE_MS = 6000;

const HERO_SLIDES = [
  {
    key: "os",
    eyebrow: "Salon operating system",
    shortLabel: "Salon",
    title: "The OS that runs your entire salon.",
    accent: "entire salon.",
    copy: "Appointments, billing, inventory, CRM and AI — one platform built for modern beauty businesses.",
    cta: "Start free trial",
    ctaHref: "/signup" as const,
    secondary: "Book a demo",
    secondaryHref: "/demo" as const,
    image: unsplash("photo-1560066984-138dadb4c035", 2400),
    thumb: unsplash("photo-1560066984-138dadb4c035", 480),
    imageAlt: "Modern salon interior representing a full salon operating system",
    object: "object-center",
    stat: "12.8K+ salons",
  },
  {
    key: "appointments",
    eyebrow: "Smart scheduling",
    shortLabel: "Smart",
    title: "Fill every chair without the chaos.",
    accent: "without the chaos.",
    copy: "Drag-and-drop calendar, waitlists, and WhatsApp reminders that keep your floor moving all day.",
    cta: "See appointments",
    ctaHref: "/platform" as const,
    secondary: "Book a demo",
    secondaryHref: "/demo" as const,
    image: "/gotix/hero/schedule.png",
    thumb: "/gotix/hero/schedule.png",
    imageAlt: "Tablet calendar schedule for salon appointments",
    object: "object-center",
    stat: "Zero double-books",
  },
  {
    key: "billing",
    eyebrow: "POS & billing",
    shortLabel: "POS",
    title: "Checkout that feels instant.",
    accent: "instant.",
    copy: "Split bills, apply memberships, accept UPI or card, and share GST-ready invoices in seconds.",
    cta: "Start free trial",
    ctaHref: "/signup" as const,
    secondary: "Watch tour",
    secondaryHref: "#product-tour" as const,
    image: "/gotix/hero/pos-billing.png",
    thumb: "/gotix/hero/pos-billing.png",
    imageAlt: "Tablet POS checkout and billing at a counter",
    object: "object-center",
    stat: "Under 30s checkout",
  },
  {
    key: "crm",
    eyebrow: "Client CRM",
    shortLabel: "Client",
    title: "Every client story in one place.",
    accent: "one place.",
    copy: "Visit history, preferences, loyalty and follow-ups — so every conversation starts with context.",
    cta: "Explore CRM",
    ctaHref: "/features" as const,
    secondary: "Book a demo",
    secondaryHref: "/demo" as const,
    image: "/gotix/hero/client-crm.png",
    thumb: "/gotix/hero/client-crm.png",
    imageAlt: "Client analytics dashboard for CRM insights",
    object: "object-center",
    stat: "+28% retention",
  },
  {
    key: "inventory",
    eyebrow: "Inventory intelligence",
    shortLabel: "Inventory",
    title: "Stock that never blindsides you.",
    accent: "blindsides you.",
    copy: "Low-stock alerts, purchase orders, and consumption tracking tied to every service you sell.",
    cta: "Start free trial",
    ctaHref: "/signup" as const,
    secondary: "See platform",
    secondaryHref: "/platform" as const,
    image: "/gotix/hero/inventory.png",
    thumb: "/gotix/hero/inventory.png",
    imageAlt: "Inventory and production system on a laptop",
    object: "object-center",
    stat: "Real-time stock",
  },
  {
    key: "ai",
    eyebrow: "AI analytics",
    shortLabel: "AI",
    title: "See growth before it happens.",
    accent: "before it happens.",
    copy: "Demand forecasts, pricing gaps, and staff utilization insights so you plan the week with confidence.",
    cta: "Discover AI",
    ctaHref: "/ai" as const,
    secondary: "Book a demo",
    secondaryHref: "/demo" as const,
    image: unsplash("photo-1551288049-bebda4e38f71", 2400),
    thumb: unsplash("photo-1551288049-bebda4e38f71", 480),
    imageAlt: "Analytics dashboard charts for AI-driven salon insights",
    object: "object-center",
    stat: "AI-driven insights",
  },
] as const;

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

function SlideTitle({ title, accent }: { title: string; accent: string }) {
  const parts = title.split(accent);
  if (parts.length < 2) return <>{title}</>;
  return (
    <>
      {parts[0]}
      <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        {accent}
      </span>
      {parts[1]}
    </>
  );
}

export function HomeHero() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const slide = HERO_SLIDES[index]!;
  const total = HERO_SLIDES.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
      setProgressKey((k) => k + 1);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const openTour = useCallback(() => setTourOpen(true), []);

  useEffect(() => {
    if (window.location.hash !== "#product-tour") return;
    openTour();
    window.history.replaceState(null, "", window.location.pathname);
  }, [openTour]);

  useEffect(() => {
    if (reduced || paused || tourOpen) return;
    const timer = window.setTimeout(() => goNext(), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [goNext, paused, reduced, tourOpen, progressKey]);

  return (
    <>
      <ProductTourModal open={tourOpen} onOpenChange={setTourOpen} reduced={reduced} />

      <section
        className="site-hero-shell relative isolate min-h-[100svh] w-full overflow-hidden bg-background"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          const end = e.changedTouches[0]?.clientX;
          touchStartX.current = null;
          if (start == null || end == null) return;
          const delta = end - start;
          if (Math.abs(delta) < 48) return;
          if (delta < 0) goNext();
          else goPrev();
        }}
        aria-roledescription="carousel"
        aria-label="Gotix product highlights"
      >
        {/* Full-bleed Unsplash banners */}
        <div className="absolute inset-0">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={slide.key}
              className="absolute inset-0"
              initial={reduced ? false : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.img
                src={slide.image}
                alt=""
                aria-hidden
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  slide.object,
                  !reduced && "home-hero-kenburns",
                )}
                initial={reduced ? false : { scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
              />
              {/* Light theme veil — image stays dominant across the frame */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/55 to-white/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_85%_45%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-20 top-16 h-80 w-80 rounded-full bg-primary/15 blur-[120px] home-hero-orb-a" />
          <div className="absolute -right-10 bottom-20 h-96 w-96 rounded-full bg-fuchsia-400/15 blur-[130px] home-hero-orb-b" />
        </div>

        {/* Giant slide index watermark */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
          <AnimatePresence mode="wait">
            <motion.p
              key={slide.key}
              initial={reduced ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 0.08, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6 }}
              className="absolute -right-4 bottom-[18%] font-display text-[min(42vw,22rem)] leading-none tracking-tighter text-foreground sm:-right-8 lg:right-[4%]"
            >
              {String(index + 1).padStart(2, "0")}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Overlay content — fills the banner, no empty side column */}
        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1500px] flex-col justify-end px-5 pb-36 pt-28 sm:px-8 lg:justify-center lg:pb-32 lg:pt-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={reduced ? false : { opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -22 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-4xl"
            >
              <p className="font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Gotix
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/70 px-4 py-1.5 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {slide.eyebrow}
                </span>
              </div>

              <h1 className="mt-6 max-w-[18ch] font-display text-[2.6rem] leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]">
                <SlideTitle title={slide.title} accent={slide.accent} />
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-xl">
                {slide.copy}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.ctaHref}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-12px_rgba(124,58,237,0.55)] transition hover:bg-primary-dark sm:text-base"
                >
                  {slide.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {slide.secondaryHref === "#product-tour" ? (
                  <button
                    type="button"
                    onClick={openTour}
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md transition hover:border-primary/35 hover:bg-white sm:text-base"
                  >
                    <Play className="h-4 w-4 fill-foreground/70" />
                    {slide.secondary}
                  </button>
                ) : (
                  <Link
                    href={slide.secondaryHref}
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md transition hover:border-primary/35 hover:bg-white sm:text-base"
                  >
                    <Calendar className="h-4 w-4" />
                    {slide.secondary}
                  </Link>
                )}
              </div>

              <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Highlight", value: slide.stat },
                  { label: "Trial", value: "14 days free" },
                  { label: "Setup", value: "No credit card" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/70 bg-white/65 px-4 py-3 shadow-sm backdrop-blur-md"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 font-display text-lg text-foreground sm:text-xl">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Full-width control dock */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/50 bg-white/55 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex gap-2.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {HERO_SLIDES.map((item, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Show ${item.eyebrow}`}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative h-14 w-[4.85rem] shrink-0 rounded-2xl p-[2px] transition duration-300 sm:h-16 sm:w-24",
                        active
                          ? "bg-gradient-to-br from-primary via-primary to-purple-500 shadow-[0_10px_28px_-10px_rgba(124,58,237,0.55)]"
                          : "bg-border/50 hover:bg-border",
                      )}
                    >
                      <span className="relative block h-full w-full overflow-hidden rounded-[14px] bg-muted">
                        <img
                          src={item.thumb}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className={cn(
                            "h-full w-full object-cover transition duration-300",
                            active ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                          )}
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-1.5 pb-1.5 pt-4 text-center text-[9px] font-semibold uppercase tracking-wide text-white">
                          {item.shortLabel}
                        </span>
                        {active ? (
                          <span className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/35" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="h-[3px] w-full overflow-hidden rounded-full bg-border/60">
                <motion.div
                  key={progressKey}
                  className="h-full origin-left rounded-full bg-gradient-to-r from-primary via-primary-glow to-purple-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: paused || reduced || tourOpen ? undefined : 1 }}
                  transition={
                    reduced || paused || tourOpen
                      ? { duration: 0 }
                      : { duration: SLIDE_MS / 1000, ease: "linear" }
                  }
                  style={paused || reduced || tourOpen ? { scaleX: 0.12 } : undefined}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                <span className="font-display text-base text-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="mx-1.5 text-border">/</span>
                {String(total).padStart(2, "0")} · {slide.eyebrow}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous slide"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary/35 hover:bg-primary/5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next slide"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary/35 hover:bg-primary/5"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

