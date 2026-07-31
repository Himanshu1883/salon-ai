"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Building2, Network, ShieldCheck, Star, Wallet, type LucideIcon } from "lucide-react";
import { LANDING_CONTAINER } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const TRUST_STATS: {
  icon: LucideIcon;
  value: string;
  label: string;
  shortLabel: string;
  accent: "burgundy" | "sage" | "gold";
}[] = [
  {
    icon: Building2,
    value: "1,000+",
    label: "Salon Owners",
    shortLabel: "Salons",
    accent: "burgundy",
  },
  { icon: Star, value: "4.9★", label: "Average Rating", shortLabel: "Rating", accent: "gold" },
  { icon: ShieldCheck, value: "99.9%", label: "Uptime", shortLabel: "Uptime", accent: "sage" },
  {
    icon: Wallet,
    value: "₹50Cr+",
    label: "Billing Processed",
    shortLabel: "Billing",
    accent: "burgundy",
  },
  {
    icon: Network,
    value: "500+",
    label: "Cities Covered",
    shortLabel: "Cities",
    accent: "sage",
  },
];

const accentStyles = {
  burgundy: "bg-[#7C3AED]/10 text-[#7C3AED]",
  sage: "bg-[#2F6F5E]/10 text-[#2F6F5E]",
  gold: "bg-[#C9A25D]/15 text-[#9A7B3B]",
};

function TrustStatItemDesktop({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  accent: "burgundy" | "sage" | "gold";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 lg:flex-1 lg:justify-center lg:gap-3.5">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11",
          accentStyles[accent]
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="landing-display text-sm font-semibold tabular-nums leading-tight text-[#1B1714] sm:text-base lg:text-lg">
          {value}
        </div>
        <div className="mt-0.5 text-[10px] leading-snug text-[#1B1714]/55 sm:text-[11px] lg:text-xs">
          {label}
        </div>
      </div>
    </div>
  );
}

function TrustStatItemMobile({
  icon: Icon,
  value,
  shortLabel,
  accent,
}: {
  icon: LucideIcon;
  value: string;
  shortLabel: string;
  accent: "burgundy" | "sage" | "gold";
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          accentStyles[accent]
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="landing-display text-[11px] font-semibold tabular-nums leading-none text-[#1B1714] sm:text-xs">
        {value}
      </div>
      <div className="text-[8px] leading-tight text-[#1B1714]/55 sm:text-[9px]">{shortLabel}</div>
    </div>
  );
}

export function HeroTrustBridge() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <>
      {/* Mobile & tablet — pinned to bottom inside 100svh hero */}
      <section
        aria-label="Salon AI trust metrics"
        className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#F7F3EC] from-70% via-[#F7F3EC]/95 to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:hidden"
      >
        <motion.div
          data-motion=""
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={cn(
              "rounded-2xl border border-[#E4DDD1] bg-white",
              "shadow-[0_8px_32px_-8px_rgba(27,23,20,0.12)]",
              "px-3 py-3 sm:px-4 sm:py-3.5"
            )}
          >
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
              {TRUST_STATS.map((stat) => (
                <TrustStatItemMobile
                  key={stat.label}
                  icon={stat.icon}
                  value={stat.value}
                  shortLabel={stat.shortLabel}
                  accent={stat.accent}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-[#1B1714]/60 sm:text-sm">
            Trusted by Beauty Professionals
          </p>
        </motion.div>
      </section>

      {/* Desktop — straddles hero / modules boundary */}
      <div
        aria-label="Salon AI trust metrics"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden translate-y-1/2 lg:block"
      >
        <div className={LANDING_CONTAINER}>
          <motion.div
            data-motion=""
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto"
          >
            <div
              className={cn(
                "rounded-full border border-[#E4DDD1] bg-white",
                "shadow-[0_12px_48px_-12px_rgba(27,23,20,0.15)]",
                "px-10 py-4"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 lg:gap-x-4">
                {TRUST_STATS.map((stat) => (
                  <TrustStatItemDesktop key={stat.label} {...stat} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
