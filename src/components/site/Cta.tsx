"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TITLE = "Ready to run your dream salon?";

const BENEFITS = [
  "Free 14-day full-access trial",
  "Free onboarding & data migration",
  "Completely non-binding",
  "Personal success manager",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function DemoCalendar() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selected, setSelected] = useState<number | null>(12);

  const { year, month, monthLabel, days, availableFrom } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const total = lastDay.getDate();

    const cells: (number | null)[] = [
      ...Array.from({ length: startOffset }, () => null),
      ...Array.from({ length: total }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return {
      year: y,
      month: m,
      monthLabel: viewDate.toLocaleString("en-IN", { month: "long", year: "numeric" }),
      days: cells,
      availableFrom: 8,
    };
  }, [viewDate]);

  const shiftMonth = (delta: number) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
    setSelected(null);
  };

  return (
    <div className="w-full max-w-[19rem] rounded-2xl border border-border/60 bg-card/90 p-3.5 shadow-lg shadow-primary/5 backdrop-blur-sm sm:max-w-[20rem] sm:p-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-base text-foreground">Select a day</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[7.5rem] text-center text-xs font-medium text-foreground sm:text-sm">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {day}
          </span>
        ))}
        {days.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;
          const isAvailable = day >= availableFrom;
          const isSelected = selected === day;
          return (
            <button
              key={`${month}-${day}`}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && setSelected(day)}
              className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition sm:h-8 sm:w-8 ${
                isSelected
                  ? "bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/25"
                  : isAvailable
                    ? "bg-primary/90 font-medium text-primary-foreground hover:bg-primary"
                    : "cursor-default text-muted-foreground/35"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-2 text-[10px] text-muted-foreground sm:text-xs">
        <Globe className="h-3 w-3 shrink-0 text-primary" />
        <span>IST · 30 min demo</span>
      </div>

      <Link
        href="/demo"
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 sm:text-sm"
      >
        {selected
          ? `Book demo · ${monthLabel.split(" ")[0]} ${selected}`
          : "Book a free demo"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function CtaBanner({
  title = DEFAULT_TITLE,
  copy = "Book a free demo by appointment, reach us on WhatsApp or email — and start a 14-day trial with full access to every module. We'll configure Gotix for your salon before day one.",
}: {
  title?: string;
  copy?: string;
}) {
  const isDefaultTitle = title === DEFAULT_TITLE;
  const titleLead = isDefaultTitle ? "Ready to run your" : title;
  const titleAccent = isDefaultTitle ? "dream salon?" : null;

  return (
    <section className="site-cta-shell relative w-full overflow-hidden bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 py-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] backdrop-blur-sm sm:text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              Get started
            </span>

            <h2 className="mt-3 font-display text-2xl leading-tight text-foreground sm:text-3xl lg:text-4xl">
              {titleAccent ? (
                <>
                  {titleLead}{" "}
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {titleAccent}
                  </span>
                </>
              ) : (
                titleLead
              )}
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {copy.split(/(appointment|WhatsApp|email|14-day trial|free demo)/gi).map((part, i) => {
                const keyTerms = ["appointment", "whatsapp", "email", "14-day trial", "free demo"];
                const isBold = keyTerms.includes(part.toLowerCase());
                return isBold ? (
                  <strong key={i} className="font-semibold text-foreground">
                    {part}
                  </strong>
                ) : (
                  <span key={i}>{part}</span>
                );
              })}
            </p>

            <ul className="mt-4 space-y-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-xs text-muted-foreground sm:text-sm">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/signup" className="btn-base btn-primary !px-4 !py-2 text-sm shadow-md shadow-primary/15">
                Start free trial
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/contact" className="btn-base btn-outline !px-4 !py-2 text-sm bg-background/80">
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="flex flex-col items-center lg:items-end lg:sticky lg:top-24"
          >
            <DemoCalendar />
{/* 
            <div className="mt-2.5 flex max-w-[19rem] flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground sm:text-xs">
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-600" />
                No credit card
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-0.5">4.9</span>
              </span>
            </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border/50 bg-white/50 p-2 backdrop-blur-sm">
      {items.map((item, index) => (
        <motion.div
          key={item.q}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group rounded-xl transition-colors hover:bg-muted/30"
        >
          <details className="px-4 py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <h3 className="font-display text-base font-medium text-foreground transition-colors group-hover:text-primary">
                  {item.q}
                </h3>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 transition-all group-hover:bg-primary/10">
                <span className="text-xl font-light text-primary transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </div>
            </summary>
            <div className="mt-3 pl-9">
              <div className="rounded-lg bg-muted/20 p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            </div>
          </details>
        </motion.div>
      ))}
    </div>
  );
}

export function RatingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-4 rounded-2xl border border-border/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-left">
        <p className="text-sm font-bold text-foreground">4.9/5</p>
        <p className="text-xs text-muted-foreground">from 847 reviews</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-1.5">
        <Shield className="h-4 w-4 text-green-500" />
        <span className="text-xs font-medium text-muted-foreground">Verified</span>
      </div>
    </motion.div>
  );
}

export function TestimonialFeatured() {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/50 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 text-lg font-display text-primary">
          PS
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">5.0</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            &ldquo;Gotix transformed how we manage our salon. Revenue is up 40%!&rdquo;
          </p>
          <p className="mt-2 text-xs font-medium text-foreground">Priya Sharma</p>
          <p className="text-xs text-muted-foreground">Luxe Hair Studio, Mumbai</p>
        </div>
      </div>
    </div>
  );
}
