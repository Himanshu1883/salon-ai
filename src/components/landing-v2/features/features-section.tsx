"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

interface FeatureItem {
  id: string;
  number: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  alt: string;
  ctaLabel: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: "employees",
    number: "01",
    title: "Employee Management",
    description:
      "One record for every staff member — roles, shifts, attendance, and performance in a single view.",
    tags: ["Shifts", "Access control", "Performance"],
    image: "/dashboard.png",
    alt: "Employee management dashboard",
    ctaLabel: "Explore",
  },
  {
    id: "clients",
    number: "02",
    title: "Client CRM",
    description:
      "Every client's full history — visits, preferences, and spend — available the moment they walk in.",
    tags: ["History", "Preferences", "Retention"],
    image: "/customers.png",
    alt: "Client CRM dashboard",
    ctaLabel: "Explore",
  },
  {
    id: "pos",
    number: "03",
    title: "Smart POS & Billing",
    description: "Checkout built for salon speed — split payments, tips, and memberships in one tap.",
    tags: ["Payments", "Memberships", "Receipts"],
    image: "/biling.png",
    alt: "Point of sale checkout screen",
    ctaLabel: "Explore",
  },
  {
    id: "inventory",
    number: "04",
    title: "Inventory Control",
    description: "Real-time stock across every branch, with alerts before you run out mid-service.",
    tags: ["Stock sync", "Reorder alerts", "Usage"],
    image: "/inventory.png",
    alt: "Inventory dashboard",
    ctaLabel: "Explore",
  },
  {
    id: "analytics",
    number: "05",
    title: "Analytics & Reports",
    description: "Revenue, retention, and staff performance — visualized so decisions take minutes.",
    tags: ["Revenue", "Retention", "Reports"],
    image: "/report.png",
    alt: "Analytics dashboard",
    ctaLabel: "Explore",
  },
];

/* ------------------------------------------------------------------ */
/* Decorative rotating graphic                                         */
/* ------------------------------------------------------------------ */

function RotatingBloom() {
  const reduced = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -left-16 top-24 h-64 w-64 opacity-[0.04] md:h-80 md:w-80"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={reduced ? undefined : { duration: 60, repeat: Infinity, ease: "linear" }}
      aria-hidden
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <ellipse
          key={i}
          cx="100"
          cy="100"
          rx="14"
          ry="70"
          fill="#7C3AED"
          transform={`rotate(${(360 / 9) * i} 100 100)`}
        />
      ))}
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/* Grid overlay                                                        */
/* ------------------------------------------------------------------ */

function GridOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-l border-[#7C3AED]/5 first:border-l-0 last:border-r last:border-r-[#7C3AED]/5"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Accordion row                                                       */
/* ------------------------------------------------------------------ */

function FeatureRow({
  item,
  active,
  onToggle,
}: {
  item: FeatureItem;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#7C3AED]/10">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-start justify-between gap-6 px-6 py-7 text-left transition-colors hover:bg-[#7C3AED]/5 md:px-10"
      >
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-[0.15em] text-[#7C3AED]/60">
            {item.number} / Feature
          </span>
          <span
            className={cn(
              "landing-display mt-1.5 block text-2xl font-semibold transition-colors md:text-[2rem]",
              active ? "text-[#1B1714]" : "text-[#1B1714]/80 group-hover:text-[#1B1714]/80"
            )}
          >
            {item.title}
          </span>
        </div>

        <span
          className={cn(
            "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all",
            active
              ? "rotate-45 border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED]"
              : "border-[#7C3AED]/20 text-[#7C3AED]/40 group-hover:border-[#7C3AED]/40 group-hover:text-[#7C3AED]"
          )}
        >
          {active ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 md:px-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-md text-sm leading-relaxed text-[#1B1714]/60">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[#7C3AED]/15 bg-[#7C3AED]/10 px-3 py-1 text-[11px] font-medium text-[#7C3AED]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fixed height image container with padding */}
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#7C3AED]/10 bg-white shadow-[0_20px_50px_-20px_rgba(124,58,237,0.15)]">
                <div className="relative h-[300px] w-full md:h-[340px]">
                  <div className="absolute inset-4 flex items-center justify-center">
                    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#F8F9FC]">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </div>
                  </div>

                  {/* Softer gradient overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/70 to-transparent" />

                  {/* Bottom overlay with title and CTA */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 md:p-6">
                    <div className="flex-1">
                      <span className="block text-lg font-semibold text-[#1B1714] md:text-xl">
                        {item.title}
                      </span>
                      <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#1B1714]/70">
                        {item.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)] transition-transform hover:scale-[1.03]"
                    >
                      {item.ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */

export function FeaturesSection() {
  const [activeId, setActiveId] = useState<string>(FEATURES[1].id);

  return (
    <section className="relative overflow-hidden bg-[#F8F9FC] py-24 md:py-32">
      <GridOverlay />
      <RotatingBloom />

      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-[#7C3AED]/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[#7C3AED]" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">
                Features
              </span>
            </div>
            <h2 className="landing-display max-w-xl text-4xl font-semibold leading-[1.1] text-[#1B1714] md:text-5xl font-serif">
              Everything Your Salon Runs On,{" "}
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] bg-clip-text text-transparent">
                Built In
              </span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#1B1714]/60 md:text-base">
              Staff, clients, billing, stock, and reporting — one system built to run every part of the floor.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#7C3AED]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <p className="mt-1 text-xs text-[#1B1714]/45">
                4.9 rating 
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-transform hover:scale-[1.02]"
            >
              Learn more
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Accordion list */}
        <div className="border-t border-[#7C3AED]/10">
          {FEATURES.map((item) => (
            <FeatureRow
              key={item.id}
              item={item}
              active={activeId === item.id}
              onToggle={() => setActiveId((cur) => (cur === item.id ? "" : item.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}