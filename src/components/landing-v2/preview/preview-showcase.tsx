"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { useState } from "react";
import { IMAGES, PREVIEW_TABS } from "../constants";
import { HeroDashboardPreview } from "../hero/hero-dashboard-preview";
import { DashboardMockup } from "../ui/dashboard-mockup";
import { cn } from "@/lib/utils";

type TabId =
  | "dashboard"
  | "appointment"
  | "billing"
  | "crm"
  | "inventory"
  | "marketing"
  | "reports"
  | "analytics";

const SIDE_PHOTOS = {
  left: {
    image: IMAGES.hairColor,
    alt: "Stylist performing a colour service",
    rotate: -5,
  },
  right: {
    image: IMAGES.reception,
    alt: "Salon reception welcoming clients",
    caption: "Live at Luxe Hair Studio, Mumbai",
    rotate: 4,
  },
} as const;

const ACCENT_CHIPS = {
  left: [
    { icon: TrendingUp, label: "Revenue today", value: "₹2.4L", accent: "burgundy" as const },
    { icon: Sparkles, label: "AI insights", value: "Active", accent: "sage" as const },
  ],
  right: [
    { icon: Users, label: "Clients served", value: "1,284", accent: "gold" as const },
    { icon: Zap, label: "Sync status", value: "Real-time", accent: "sage" as const },
  ],
};

function PreviewContent({ variant }: { variant: TabId }) {
  if (variant === "dashboard") {
    return <HeroDashboardPreview />;
  }
  return <DashboardMockup variant={variant} />;
}

function SidePhotoCard({
  image,
  alt,
  caption,
  rotate,
  className,
}: {
  image: string;
  alt: string;
  caption?: string;
  rotate: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div
        className="transition-transform duration-300 hover:rotate-0"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <div className="overflow-hidden rounded-2xl border border-[#E4DDD1] bg-white p-1.5 shadow-[0_8px_28px_rgba(27,23,20,0.08)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#EFE8DC]">
            <Image
              src={image}
              alt={alt}
              fill
              className="object-cover saturate-[0.82] sepia-[0.06]"
              sizes="(max-width: 768px) 140px, 200px"
            />
          </div>
          {caption && (
            <p className="mt-2.5 px-1 text-center text-[9px] leading-snug text-[#1B1714]/55 xl:text-[10px]">
              {caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AccentChip({
  icon: Icon,
  label,
  value,
  accent,
  className,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  accent: "burgundy" | "sage" | "gold";
  className?: string;
}) {
  const styles = {
    burgundy: "border-[#7C3AED]/15 bg-white text-[#7C3AED]",
    sage: "border-[#2F6F5E]/15 bg-white text-[#2F6F5E]",
    gold: "border-[#C9A25D]/25 bg-white text-[#9A7B3B]",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5",
        "shadow-[0_4px_16px_rgba(27,23,20,0.06)] backdrop-blur-sm",
        styles[accent],
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          accent === "burgundy" && "bg-[#7C3AED]/10",
          accent === "sage" && "bg-[#2F6F5E]/10",
          accent === "gold" && "bg-[#C9A25D]/15"
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#1B1714]/45">
          {label}
        </p>
        <p className="landing-display text-sm font-semibold tabular-nums leading-tight text-[#1B1714]">
          {value}
        </p>
      </div>
    </div>
  );
}

function LivePreviewBadge({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute -top-3.5 right-4 z-30 flex items-center gap-1.5 rounded-full border border-[#E4DDD1] bg-white px-3 py-1.5 shadow-[0_4px_20px_rgba(27,23,20,0.12)] sm:right-6">
      <span className="relative flex h-2 w-2" aria-hidden>
        {!reduced && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F6F5E]/45" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2F6F5E]" />
      </span>
      <span className="text-[10px] font-semibold text-[#1B1714]">Live Preview</span>
    </div>
  );
}

export function PreviewShowcase() {
  const [active, setActive] = useState<TabId>("dashboard");
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const current = PREVIEW_TABS.find((t) => t.id === active)!;
  const fadeMs = reduced ? 0.12 : 0.22;

  return (
    <div className="relative">
      {/* Premium stage panel */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] border border-[#C4B5FD]/40",
          "bg-gradient-to-br from-white via-[#F5F3FF] to-[#EDE9FE]",
          "px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-14",
          "shadow-[0_20px_60px_-24px_rgba(91,33,182,0.25)]"
        )}
      >
        {/* Texture + glow */}
        <div
          aria-hidden
          className="hero-editorial__grain pointer-events-none absolute inset-0 opacity-[0.35]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(124,58,237,0.12),transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_60%,rgba(47,111,94,0.1),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_35%,rgba(201,162,93,0.12),transparent_50%)]"
        />

        {/* Gold hairlines */}
        <div
          aria-hidden
          className="absolute left-8 right-8 top-6 h-px bg-gradient-to-r from-transparent via-[#C9A25D]/40 to-transparent md:left-12 md:right-12"
        />
        <div
          aria-hidden
          className="absolute bottom-6 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C9A25D]/30 to-transparent md:left-12 md:right-12"
        />

        {/* Module context strip */}
        <p className="relative z-10 mb-6 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#1B1714]/45 md:mb-8">
          Dashboard · Appointments · POS · CRM · Inventory · Analytics
        </p>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,200px)] lg:gap-6 xl:gap-10">
            {/* Left column — photo + chips */}
            <div className="hidden flex-col gap-4 lg:flex xl:gap-5">
              <SidePhotoCard {...SIDE_PHOTOS.left} className="max-w-[188px] justify-self-end xl:max-w-[200px]" />
              {ACCENT_CHIPS.left.map((chip) => (
                <AccentChip key={chip.label} {...chip} className="max-w-[188px] justify-self-end xl:max-w-[200px]" />
              ))}
            </div>

            {/* Center — mockup */}
            <div className="relative min-w-0">
              {/* Center glow behind mockup */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.14),transparent_70%)] blur-2xl lg:-inset-6"
              />

              <LivePreviewBadge reduced={reduced} />

              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-[#E4DDD1] bg-white",
                  "shadow-[0_40px_80px_rgba(27,23,20,0.14),0_12px_32px_rgba(27,23,20,0.08)]",
                  "ring-1 ring-[#1B1714]/[0.05]"
                )}
              >
                <div className="flex items-center gap-3 border-b border-[#E4DDD1] bg-[#F7F3EC]/95 px-4 py-2.5">
                  <div className="flex items-center gap-1.5" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]/35" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#C9A25D]/45" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2F6F5E]/35" />
                  </div>
                  <div className="mx-auto flex max-w-md flex-1 items-center justify-center rounded-md border border-[#E4DDD1] bg-white px-3 py-1">
                    <span className="truncate text-[10px] text-[#1B1714]/55 sm:text-[11px]">
                      app.salonai.com/{active === "dashboard" ? "dashboard" : active}
                    </span>
                  </div>
                  <div className="hidden w-[52px] sm:block" aria-hidden />
                </div>

                <div className="relative min-h-[300px] bg-[#FDFCFA] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[400px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: fadeMs, ease: "easeInOut" }}
                      className="absolute inset-0 overflow-hidden"
                    >
                      <PreviewContent variant={active} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div
                  role="tablist"
                  aria-label="Platform module preview"
                  className={cn(
                    "flex gap-1 overflow-x-auto border-t border-[#E4DDD1] bg-[#F7F3EC]/95 p-2",
                    "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    "lg:flex-wrap lg:justify-center lg:overflow-visible"
                  )}
                >
                  {PREVIEW_TABS.map((tab) => {
                    const isActive = active === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActive(tab.id as TabId)}
                        className={cn(
                          "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 sm:px-3.5 sm:text-sm",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFE8DC]",
                          isActive
                            ? "bg-[#7C3AED] text-[#F7F3EC] shadow-[0_2px_10px_-2px_rgba(124,58,237,0.35)]"
                            : "bg-transparent text-[#1B1714]/70 hover:bg-[#1B1714]/[0.05] hover:text-[#1B1714]"
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column — photo + chips */}
            <div className="hidden flex-col gap-4 lg:flex xl:gap-5">
              <SidePhotoCard
                {...SIDE_PHOTOS.right}
                className="max-w-[188px] justify-self-start xl:max-w-[200px]"
              />
              {ACCENT_CHIPS.right.map((chip) => (
                <AccentChip key={chip.label} {...chip} className="max-w-[188px] justify-self-start xl:max-w-[200px]" />
              ))}
            </div>
          </div>
        </div>

        {/* Trust strip inside stage */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#E4DDD1]/60 pt-6 md:mt-10 md:gap-x-10">
          {[
            { label: "22 integrated modules" },
            { label: "Built for Indian salons" },
            { label: "Cloud · Secure · Real-time" },
          ].map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-[11px] font-medium text-[#1B1714]/55 sm:text-xs"
            >
              <span className="h-1 w-1 rounded-full bg-[#7C3AED]/50" aria-hidden />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile accents */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
        <SidePhotoCard {...SIDE_PHOTOS.left} className="max-w-none" rotate={-2} />
        <SidePhotoCard {...SIDE_PHOTOS.right} className="max-w-none" rotate={2} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
        {[...ACCENT_CHIPS.left, ...ACCENT_CHIPS.right].map((chip) => (
          <AccentChip key={chip.label} {...chip} className="col-span-1" />
        ))}
      </div>

      {/* Module caption */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: fadeMs }}
          className="mt-6 text-center md:mt-8"
        >
          <h3 className="landing-display text-lg font-semibold text-[#1B1714] md:text-xl">
            {current.title}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-[#1B1714]/65">
            {current.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
