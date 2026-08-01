"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { ERP_MODULES } from "../constants";
import type { ErpModule } from "../constants";
import { LandingCard, LandingSection, SectionHeader } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const INITIAL_COUNT = 8;
const STAGGER_DELAY = 0.07;

type PanelTint = "purple" | "lavender" | "warm";
type DecorStyle = "ring" | "blob" | "dots";

const PANEL_TINTS: Record<
  PanelTint,
  { base: string; hover: string }
> = {
  purple: {
    base: "bg-[radial-gradient(ellipse_70%_80%_at_50%_40%,rgba(91,33,182,0.12),transparent_70%),linear-gradient(160deg,rgba(109,40,217,0.08),rgba(79,70,229,0.06)_55%,rgba(250,249,247,0.4))]",
    hover:
      "group-hover:bg-[radial-gradient(ellipse_70%_80%_at_50%_40%,rgba(91,33,182,0.2),transparent_68%),linear-gradient(160deg,rgba(109,40,217,0.14),rgba(79,70,229,0.1)_55%,rgba(245,243,255,0.6))]",
  },
  lavender: {
    base: "bg-[radial-gradient(ellipse_70%_80%_at_50%_40%,rgba(124,58,237,0.1),transparent_70%),linear-gradient(160deg,rgba(167,139,250,0.12),rgba(199,210,254,0.08)_55%,rgba(250,249,247,0.4))]",
    hover:
      "group-hover:bg-[radial-gradient(ellipse_70%_80%_at_50%_40%,rgba(124,58,237,0.18),transparent_68%),linear-gradient(160deg,rgba(167,139,250,0.18),rgba(165,180,252,0.12)_55%,rgba(245,243,255,0.6))]",
  },
  warm: {
    base: "bg-[radial-gradient(ellipse_70%_80%_at_50%_40%,rgba(91,33,182,0.07),transparent_70%),linear-gradient(160deg,rgba(27,23,20,0.04),rgba(109,40,217,0.06)_50%,rgba(250,249,247,0.5))]",
    hover:
      "group-hover:bg-[radial-gradient(ellipse_70%_80%_at_50%_40%,rgba(91,33,182,0.14),transparent_68%),linear-gradient(160deg,rgba(27,23,20,0.06),rgba(109,40,217,0.1)_50%,rgba(250,249,247,0.55))]",
  },
};

function panelTintFor(index: number): PanelTint {
  const cycle: PanelTint[] = ["purple", "lavender", "warm"];
  return cycle[index % 3];
}

function decorFor(index: number): DecorStyle {
  const cycle: DecorStyle[] = ["ring", "blob", "dots"];
  return cycle[index % 3];
}

/** Alternate tasteful rotate direction per card */
function hoverRotateClass(index: number) {
  return index % 2 === 0
    ? "group-hover:rotate-[-4deg]"
    : "group-hover:rotate-[4deg]";
}

type ModuleCardProps = {
  mod: ErpModule;
  index: number;
  animateIn?: boolean;
  staggerIndex?: number;
  className?: string;
};

function IconDecor({ style }: { style: DecorStyle }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {/* Soft lavender disc + dashed ring (base for every card) */}
      <div className="relative flex h-[92px] w-[92px] items-center justify-center sm:h-[100px] sm:w-[100px]">
        <div className="absolute inset-0 rounded-full bg-[#5B21B6]/[0.07]" />
        <div className="absolute inset-0 rounded-full border border-dashed border-[#5B21B6]/30" />

        {style === "blob" && (
          <div className="absolute inset-3 rounded-full bg-[#5B21B6]/[0.1] blur-xl" />
        )}

        {style === "dots" && (
          <div className="absolute inset-0">
            {[
              "left-2 top-3",
              "right-3 top-2",
              "bottom-3 left-3",
              "bottom-2 right-4",
              "left-[46%] top-1",
              "bottom-1 left-[48%]",
            ].map((pos) => (
              <span
                key={pos}
                className={cn(
                  "absolute h-1 w-1 rounded-full bg-[#5B21B6]/35",
                  pos
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleCard({
  mod,
  index,
  animateIn = false,
  staggerIndex = 0,
  className,
}: ModuleCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const ModuleIcon = mod.icon;
  const tint = panelTintFor(index);
  const decor = decorFor(index);
  const tintStyles = PANEL_TINTS[tint];

  const motionProps =
    animateIn && !reduced
      ? {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            delay: staggerIndex * STAGGER_DELAY,
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1] as const,
          },
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
            transition: {
              delay: reduced ? 0 : (index % 4) * 0.07,
              duration: reduced ? 0.2 : 0.45,
            },
          };

  return (
    <motion.div key={mod.id} {...motionProps} className={className}>
      <LandingCard
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl",
          "border border-[#5B21B6]/30 bg-white shadow-none",
          "transition-[transform,border-color] duration-300 ease-out",
          "hover:-translate-y-1 hover:border-[#5B21B6]/60"
        )}
      >
        {/* Icon display panel */}
        <div
          className={cn(
            "relative flex h-[112px] items-center justify-center overflow-hidden sm:h-[128px]",
            "rounded-t-2xl transition-[background] duration-300 ease-out",
            tintStyles.base,
            tintStyles.hover
          )}
        >
          <IconDecor style={decor} />

          {/* Soft radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(91,33,182,0.12),transparent_55%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* Transparent black Lucide icon — no filled badge */}
          <div
            className={cn(
              "relative z-10 flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16",
              "text-[#1B1714]",
              "transition-transform duration-300 ease-out",
              !reduced && "group-hover:scale-110",
              !reduced && hoverRotateClass(index)
            )}
          >
            <ModuleIcon
              className="h-10 w-10 sm:h-11 sm:w-11"
              strokeWidth={1.35}
              absoluteStrokeWidth
              aria-hidden
            />
          </div>
        </div>

        <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4">
          <span className="mb-2 text-[11px] font-medium tabular-nums tracking-wide text-[#1B1714]/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="landing-display text-lg font-semibold text-[#1B1714] transition-colors duration-300 group-hover:text-[#5B21B6]">
            {mod.title}
          </h3>
          <p className="mt-2 pr-6 text-sm leading-relaxed text-[#1B1714]/65">
            {mod.description}
          </p>

          <ArrowUpRight
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-4 right-4 h-4 w-4 text-[#5B21B6]",
              "translate-y-1 opacity-0 transition-[opacity,transform] duration-300 ease-out",
              "group-hover:translate-y-0 group-hover:opacity-100"
            )}
          />
        </div>
      </LandingCard>
    </motion.div>
  );
}

/** Centers incomplete last-row cards (1 or 2 leftovers). */
function orphanCenterClass(index: number, total: number) {
  const remSm = total % 2;
  const remLg = total % 3;
  const remXl = total % 4;
  const classes: string[] = [];

  if (remSm === 1 && index === total - 1) {
    classes.push(
      "sm:max-lg:col-span-2 sm:max-lg:max-w-[calc(50%-0.5rem)] sm:max-lg:justify-self-center"
    );
  }

  if (remLg > 0 && remLg < 3 && index >= total - remLg) {
    const pos = index - (total - remLg);
    if (remLg === 1) {
      classes.push(
        "lg:max-xl:col-span-3 lg:max-xl:max-w-[calc((100%-2*1rem)/3)] lg:max-xl:justify-self-center"
      );
    } else if (remLg === 2) {
      classes.push(pos === 0 ? "lg:max-xl:col-start-1" : "lg:max-xl:col-start-2");
    }
  }

  if (remXl > 0 && remXl < 4 && index >= total - remXl) {
    const pos = index - (total - remXl);
    if (remXl === 1) {
      classes.push(
        "xl:col-span-4 xl:max-w-[calc((100%-3*1rem)/4)] xl:justify-self-center"
      );
    } else if (remXl === 2) {
      classes.push(pos === 0 ? "xl:col-start-2" : "xl:col-start-3");
    } else if (remXl === 3) {
      classes.push(
        pos === 0
          ? "xl:col-start-1"
          : pos === 1
            ? "xl:col-start-2"
            : "xl:col-start-3"
      );
    }
  }

  return classes.length ? cn(...classes) : undefined;
}

export function ModulesSection() {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  const initialModules = ERP_MODULES.slice(0, INITIAL_COUNT);
  const extraModules = ERP_MODULES.slice(INITIAL_COUNT);
  const visibleCount = expanded
    ? ERP_MODULES.length
    : initialModules.length;

  const handleToggle = useCallback(() => {
    if (expanded) {
      setExpanded(false);
      const section = document.getElementById("modules");
      if (section) {
        const { top } = section.getBoundingClientRect();
        if (top < 0) {
          section.scrollIntoView({
            behavior: reduced ? "auto" : "smooth",
            block: "start",
          });
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
      className="bg-white !pt-6 lg:!pt-[calc(var(--landing-trust-half)+4.5rem)]"
    >
      <p className="mb-6 hidden text-center text-sm font-medium text-[#1B1714]/60 lg:mb-8 lg:block">
        Trusted by Beauty Professionals
      </p>
      <SectionHeader
        eyebrow="Complete ERP Suite"
        title={`${ERP_MODULES.length} Modules. One Platform.`}
        subtitle="Every tool your salon needs — from first appointment to final invoice."
      />

      <div id="modules-grid">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialModules.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              index={i}
              className={orphanCenterClass(i, visibleCount)}
            />
          ))}
        </div>

        {extraModules.length > 0 && (
          <>
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
                        className={orphanCenterClass(
                          INITIAL_COUNT + i,
                          ERP_MODULES.length
                        )}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  "hover:border-[#5B21B6] hover:bg-[#5B21B6]/[0.08]",
                  "hover:shadow-[0_4px_16px_-6px_rgba(27,23,20,0.08)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F7]"
                )}
              >
                {expanded
                  ? "Show Less"
                  : `View All ${ERP_MODULES.length} Modules`}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>
            </div>
          </>
        )}
      </div>
    </LandingSection>
  );
}
