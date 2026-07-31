"use client";

import { HERO_FLOATING_CARDS } from "../constants";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

const accentMap = {
  burgundy: "bg-[#7A2E2E]",
  sage: "bg-[#2F6F5E]",
  gold: "bg-[#C9A25D]",
};

const positions = [
  { top: "6%", left: "-2%", delay: 0.52, className: "md:-left-6 lg:-left-10" },
  { top: "18%", right: "-2%", delay: 0.6, className: "md:-right-4 lg:-right-8" },
  { bottom: "12%", left: "4%", delay: 0.68, className: "md:left-0 lg:-left-4" },
];

type FloatingCardsProps = {
  animate?: boolean;
};

export function FloatingCards({ animate = true }: FloatingCardsProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
      {HERO_FLOATING_CARDS.map((card, i) => {
        const pos = positions[i];
        return (
          <motion.div
            key={card.id}
            data-motion=""
            initial={animate && !reduced ? { opacity: 0, y: 20, scale: 0.94 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              animate && !reduced
                ? { delay: pos.delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0 }
            }
            className={cn("pointer-events-auto absolute", pos.className)}
            style={{ top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right }}
          >
            <StatCard card={card} />
          </motion.div>
        );
      })}
    </div>
  );
}

type HeroStatCardsRowProps = {
  animate?: boolean;
};

export function HeroStatCardsRow({ animate = true }: HeroStatCardsRowProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <div className="relative z-10 mt-3 hidden grid-cols-3 gap-2 md:hidden">
      {HERO_FLOATING_CARDS.map((card, i) => (
        <motion.div
          key={card.id}
          data-motion=""
          initial={animate && !reduced ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={
            animate && !reduced
              ? { delay: 0.52 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0 }
          }
        >
          <StatCard card={card} compact />
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({
  card,
  compact,
}: {
  card: (typeof HERO_FLOATING_CARDS)[number];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#1B1714]/[0.08] bg-white/95 backdrop-blur-sm",
        "shadow-[0_8px_32px_-8px_rgba(27,23,20,0.14),0_0_0_1px_rgba(255,255,255,0.9)_inset]",
        "transition-[transform,box-shadow] duration-200",
        "hover:-translate-y-1 hover:shadow-[0_16px_40px_-10px_rgba(27,23,20,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2",
        compact ? "px-2.5 py-2.5" : "min-w-[120px] px-4 py-3.5"
      )}
      tabIndex={0}
      role="figure"
      aria-label={`${card.label}: ${card.value}, ${card.trend}`}
    >
      <div
        className={cn("mb-2.5 h-[3px] rounded-full", accentMap[card.accent], compact ? "w-7" : "w-10")}
        aria-hidden
      />
      <div
        className={cn(
          "font-medium uppercase tracking-[0.12em] text-[#1B1714]/50",
          compact ? "text-[8px]" : "text-[10px]"
        )}
      >
        {card.label}
      </div>
      <div
        className={cn(
          "hero-editorial__headline mt-1 font-semibold tabular-nums text-[#1B1714]",
          compact ? "text-sm" : "text-xl"
        )}
      >
        {card.value}
      </div>
      {!compact && (
        <div className="mt-1 text-[10px] font-medium text-[#2F6F5E]">{card.trend}</div>
      )}
    </div>
  );
}
