"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { ERP_MODULES } from "../constants";
import type { ErpModule } from "../constants";
import { LandingCard, LandingSection, SectionHeader } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const INITIAL_COUNT = 8;
const STAGGER_DELAY = 0.05;

type ModuleCardProps = {
  mod: ErpModule;
  index: number;
  animateIn?: boolean;
  staggerIndex?: number;
};

function ModuleCard({ mod, index, animateIn = false, staggerIndex = 0 }: ModuleCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const Icon = mod.icon;
  const accent = index % 2 === 0 ? "burgundy" : "sage";

  const motionProps =
    animateIn && !reduced
      ? {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: staggerIndex * STAGGER_DELAY, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
        }
      : animateIn && reduced
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.2 },
          }
        : {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-40px" },
            transition: { delay: (index % 4) * 0.06, duration: 0.45 },
          };

  return (
    <motion.div key={mod.id} {...motionProps}>
      <LandingCard className="group h-full overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(27,23,20,0.09)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl border-b border-[#E4DDD1]">
          <Image
            src={mod.image}
            alt={mod.alt}
            fill
            className="object-cover saturate-[0.85] sepia-[0.06] transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                accent === "burgundy"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                  : "bg-[#2F6F5E]/10 text-[#2F6F5E]"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <span className="text-[10px] font-medium tabular-nums text-[#1B1714]/40">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="landing-display text-lg font-semibold text-[#1B1714]">{mod.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/65">{mod.description}</p>
        </div>
      </LandingCard>
    </motion.div>
  );
}

export function ModulesSection() {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  const initialModules = ERP_MODULES.slice(0, INITIAL_COUNT);
  const extraModules = ERP_MODULES.slice(INITIAL_COUNT);

  const handleToggle = useCallback(() => {
    if (expanded) {
      setExpanded(false);
      const section = document.getElementById("modules");
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < 0) {
          section.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }
      }
    } else {
      setExpanded(true);
    }
  }, [expanded, reduced]);

  return (
    <LandingSection
      id="modules"
      band="ivory"
      className="!pt-6 lg:!pt-[calc(var(--landing-trust-half)+4.5rem)]"
    >
      <p className="mb-6 hidden text-center text-sm font-medium text-[#1B1714]/60 lg:mb-8 lg:block">
        Trusted by Beauty Professionals
      </p>
      <SectionHeader
        eyebrow="Complete ERP Suite"
        title="22 Modules. One Platform."
        subtitle="Every tool your salon needs — from first appointment to final invoice."
      />

      <div id="modules-grid">
        <div className="relative">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {initialModules.map((mod, i) => (
              <ModuleCard key={mod.id} mod={mod} index={i} />
            ))}
          </div>

          {!expanded && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-b from-transparent to-[#F7F3EC]"
            />
          )}
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="modules-extra"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={
                reduced
                  ? { duration: 0.15 }
                  : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
              }
              className="overflow-hidden"
            >
              <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {extraModules.map((mod, i) => (
                  <ModuleCard
                    key={mod.id}
                    mod={mod}
                    index={INITIAL_COUNT + i}
                    animateIn
                    staggerIndex={i}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-center md:mt-10">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="modules-grid"
          onClick={handleToggle}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5",
            "border border-[#1B1714]/30 bg-transparent text-base font-semibold text-[#1B1714]",
            "transition-[transform,background-color,border-color,box-shadow] duration-200",
            "hover:border-[#7C3AED] hover:bg-[#7C3AED]/[0.08]",
            "hover:shadow-[0_4px_16px_-6px_rgba(27,23,20,0.08)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
          )}
        >
          {expanded ? "Show Less" : "View All 22 Modules"}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      </div>
    </LandingSection>
  );
}
