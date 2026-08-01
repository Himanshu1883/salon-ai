"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS, IMAGES } from "../constants";
import type { FaqItem } from "../constants";
import { LandingSection, sectionHeadingClass, sectionEyebrowTextClass } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

/**
 * Portrait FAQ image — replace with /faq-portrait.jpg when available:
 * portrait orientation, warm natural light, salon subject (stylist/client or interior),
 * slightly desaturated, matching site photo treatment.
 */
const FAQ_PORTRAIT_IMAGE = IMAGES.hairStyling;

function FaqRow({
  item,
  index,
  isOpen,
  onToggle,
  reduced,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  reduced: boolean;
}) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="border-b border-[#E4DDD1]">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left lg:py-6",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFE8DC]"
        )}
      >
        <span
          className={cn(
            "landing-display min-w-0 flex-1 text-base font-medium leading-snug transition-colors duration-200 md:text-[17px]",
            isOpen ? "text-[#1B1714]" : "text-[#1B1714]/85 group-hover:text-[#1B1714]"
          )}
        >
          {item.question}
        </span>

        <ChevronDown
          strokeWidth={1.5}
          className={cn(
            "h-5 w-5 shrink-0 text-[#1B1714]/55 transition-[transform,color] duration-[250ms] ease-out",
            "group-hover:text-[#7C3AED]",
            isOpen && "rotate-180 text-[#7C3AED]"
          )}
          aria-hidden
        />
      </button>

      {reduced ? (
        isOpen && (
          <div id={panelId} role="region" aria-labelledby={buttonId}>
            <p className="pb-5 text-sm leading-relaxed text-[#1B1714]/70 md:pb-6 md:text-base">
              {item.answer}
            </p>
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: {
                  height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.28, delay: 0.04 },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.18 },
                },
              }}
              className="overflow-hidden"
            >
              <p className="pb-5 text-sm leading-relaxed text-[#1B1714]/70 md:pb-6 md:text-base">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <LandingSection id="faq" band="band" className="landing-preview-band">
      <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-12 xl:gap-16">
        {/* Portrait photo */}
        <div className="relative min-h-[300px] sm:min-h-[380px] lg:min-h-[560px] lg:h-full">
          <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-[20px]">
            <Image
              src={FAQ_PORTRAIT_IMAGE}
              alt="Stylist working with a client during a salon appointment"
              fill
              className="object-cover object-[center_20%] saturate-[0.88] sepia-[0.07] contrast-[1.02]"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
        </div>

        {/* FAQ list */}
        <div className="flex flex-col lg:justify-center lg:py-2">
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-8 bg-[#7C3AED]/30" aria-hidden />
            <span className={sectionEyebrowTextClass}>FAQ</span>
          </div>

          <h2 className={sectionHeadingClass}>
            Questions? We Have{" "}
            <span className="italic text-violet-500">Answers.</span>
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#1B1714]/60 md:text-base">
            Everything you need to know before getting started with Glow Desk.
          </p>

          <div className="mt-8 border-t border-[#E4DDD1] lg:mt-10">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = open === i;
              return (
                <FaqRow
                  key={item.question}
                  item={item}
                  index={i}
                  isOpen={isOpen}
                  onToggle={() => setOpen(isOpen ? null : i)}
                  reduced={reduced}
                />
              );
            })}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:mt-12">
            <p className="text-sm text-[#1B1714]/65 md:text-base">Still have questions?</p>
            <Link
              href="mailto:support@salonai.com"
              className={cn(
                "inline-flex items-center justify-center rounded-lg border border-[#1B1714]/25",
                "bg-transparent px-5 py-2.5 text-sm font-semibold text-[#1B1714]",
                "transition-all duration-200",
                "hover:-translate-y-px hover:border-[#7C3AED]/40 hover:text-[#7C3AED]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFE8DC]"
              )}
            >
              Contact our team
            </Link>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
