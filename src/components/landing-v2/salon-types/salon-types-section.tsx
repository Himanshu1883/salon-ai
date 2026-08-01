"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SALON_TYPES } from "../constants";
import type { SalonType } from "../constants";
import { LandingSection, SectionHeader } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const FEATURED_IDS = new Set(["hair", "spa"]);

/** Featured tiles first so dense grid placement stays predictable */
const ORDERED_TYPES = [
  ...SALON_TYPES.filter((t) => FEATURED_IDS.has(t.id)),
  ...SALON_TYPES.filter((t) => !FEATURED_IDS.has(t.id)),
];

function tileLayoutClass(id: string) {
  if (!FEATURED_IDS.has(id)) {
    return "col-span-1 row-span-1";
  }
  return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1 lg:col-span-2 lg:row-span-2 xl:col-span-3 xl:row-span-2";
}

function tileMinHeightClass(id: string) {
  if (FEATURED_IDS.has(id)) {
    return "min-h-[220px] sm:min-h-[260px] lg:min-h-[320px] xl:min-h-[360px]";
  }
  return "min-h-[200px] sm:min-h-[220px] lg:min-h-[200px]";
}

function SalonTypeTile({
  type,
  index,
  reduced,
}: {
  type: SalonType;
  index: number;
  reduced: boolean;
}) {
  const row = Math.floor(index / 4);
  const staggerDelay = row * 0.07 + (index % 4) * 0.07;

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduced
          ? { duration: 0.25, delay: index * 0.04 }
          : { duration: 0.5, delay: staggerDelay, ease: [0.22, 1, 0.36, 1] }
      }
      tabIndex={0}
      className={cn(
        "group relative outline-none",
        tileLayoutClass(type.id),
        tileMinHeightClass(type.id)
      )}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-2xl",
          "border border-[#1B1714]/[0.08]",
          "shadow-[0_4px_20px_rgba(27,23,20,0.06)]",
          "transition-[transform,box-shadow] duration-[400ms] ease-out",
          "group-hover:-translate-y-1 group-hover:shadow-[0_12px_32px_rgba(27,23,20,0.12)]",
          "group-focus-visible:ring-2 group-focus-visible:ring-[#7C3AED] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#F7F3EC]"
        )}
      >
        <Image
          src={type.image}
          alt={type.alt}
          fill
          className={cn(
            "object-cover saturate-[0.82] sepia-[0.07]",
            "transition-transform duration-[400ms] ease-out",
            "group-hover:scale-105"
          )}
          sizes={
            FEATURED_IDS.has(type.id)
              ? "(max-width: 1024px) 100vw, 40vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          }
        />

        {/* Hover darken */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[#1B1714]/0 transition-colors duration-[250ms] group-hover:bg-[#1B1714]/10 group-focus-visible:bg-[#1B1714]/10"
        />

        {/* Label pill */}
        <div className="absolute bottom-4 left-4 z-10 sm:bottom-5 sm:left-5">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-2",
              "bg-[#F7F3EC]/90 text-[#1B1714] backdrop-blur-sm",
              "shadow-[0_2px_12px_rgba(27,23,20,0.08)]",
              "transition-[background-color,color] duration-[250ms]",
              "group-hover:bg-[#7C3AED] group-hover:text-[#F7F3EC]",
              "group-focus-visible:bg-[#7C3AED] group-focus-visible:text-[#F7F3EC]"
            )}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A25D] transition-colors duration-[250ms] group-hover:bg-[#F7F3EC]/80"
            />
            <span className="landing-display text-sm font-semibold leading-none sm:text-base">
              {type.name}
            </span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export function SalonTypesSection() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <LandingSection id="salon-types" band="ivory" className="bg-white">
      <SectionHeader
        eyebrow="Built For Every Salon"
        title="Your Salon Type. Fully Supported."
        className="!mb-3"
      />

      <p className="mb-10 text-center text-sm font-medium text-[#1B1714]/55 md:mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E4DDD1] bg-white px-3.5 py-1.5 shadow-[0_2px_10px_rgba(27,23,20,0.04)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" aria-hidden />
          10 salon types supported
        </span>
      </p>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5",
          "lg:grid-cols-4 lg:gap-5 lg:[grid-auto-flow:dense]",
          "xl:grid-cols-6 xl:gap-5"
        )}
      >
        {ORDERED_TYPES.map((type, i) => (
          <SalonTypeTile key={type.id} type={type} index={i} reduced={reduced} />
        ))}
      </div>
    </LandingSection>
  );
}
