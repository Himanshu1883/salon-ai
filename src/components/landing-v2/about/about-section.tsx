"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BRAND, FOOTER_STATS } from "../constants";
import {
  LandingSection,
  SectionEyebrow,
  primaryGradientButtonClass,
} from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    num: "01",
    title: "Built for the floor",
    desc: "Workflows shaped around real salon days — not generic retail software.",
  },
  {
    num: "02",
    title: "Intelligence included",
    desc: "AI that forecasts demand, surfaces upsells, and clarifies what drives revenue.",
  },
  {
    num: "03",
    title: "One calm system",
    desc: "Appointments, billing, inventory, and clients — connected in a single desk.",
  },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function AboutSection() {
  const reduced = !!useReducedMotion();

  return (
    <LandingSection
      id="about"
      band="ivory"
      className="relative overflow-hidden bg-[#FAF9F7] !pt-6 lg:!pt-[calc(var(--landing-trust-half)+4.5rem)]"
    >
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[#5B21B6]/[0.06] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#4F46E5]/[0.05] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5B21B6]/20 to-transparent" />
      </div>

      <p className="relative z-10 mb-6 hidden text-center text-sm font-medium text-[#1B1714]/60 lg:mb-8 lg:block">
        Trusted by Beauty Professionals
      </p>

      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
        {/* Copy column */}
        <div>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
          >
            <SectionEyebrow centered={false}>About Gotix</SectionEyebrow>
            <h2 className="landing-display mt-1 text-3xl font-semibold leading-[1.12] tracking-tight text-[#1B1714] md:text-4xl lg:text-[2.75rem]">
              The modern desk for{" "}
              <span className="bg-[linear-gradient(135deg,#6D28D9,#4F46E5)] bg-clip-text text-transparent">
                ambitious salons
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
              {BRAND.name} is {BRAND.tagline.toLowerCase()}. We help owners run
              operations with clarity — so every client visit feels effortless,
              and every decision is grounded in real data.
            </p>
          </motion.div>

          <motion.ul
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: reduced ? 0.2 : 0.5,
              delay: reduced ? 0 : 0.08,
              ease: EASE,
            }}
            className="mt-8 space-y-0 border-t border-[#1B1714]/[0.08]"
          >
            {PILLARS.map((item) => (
              <li
                key={item.num}
                className={cn(
                  "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-[#1B1714]/[0.08] py-5",
                  !reduced && "transition-colors duration-300 hover:bg-[#5B21B6]/[0.03]"
                )}
              >
                <span className="landing-display pt-0.5 text-sm font-light tabular-nums text-[#5B21B6]/55">
                  {item.num}
                </span>
                <div>
                  <p className="landing-display text-lg font-semibold text-[#1B1714]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1B1714]/60">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0.2 : 0.45,
              delay: reduced ? 0 : 0.14,
              ease: EASE,
            }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/about"
              className={cn(
                primaryGradientButtonClass(),
                "!rounded-xl bg-[linear-gradient(135deg,#6D28D9,#4F46E5)] px-6 py-3 text-sm shadow-[0_8px_24px_-6px_rgba(91,33,182,0.4)]"
              )}
            >
              Our story
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/#preview"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-[#5B21B6]/25 bg-white px-6 py-3 text-sm font-semibold text-[#5B21B6]",
                "transition-[background-color,border-color,transform] duration-200",
                "hover:border-[#5B21B6]/45 hover:bg-[#5B21B6]/[0.05]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F7]"
              )}
            >
              See the platform
            </Link>
          </motion.div>
        </div>

        {/* Visual column */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: reduced ? 0.2 : 0.55,
            delay: reduced ? 0 : 0.1,
            ease: EASE,
          }}
          className="relative w-full"
        >
          <div className="relative h-[70vh] max-h-[70vh] min-h-[70vh] overflow-hidden rounded-2xl border border-[#5B21B6]/25 bg-white">
            <Image
              src="/about.png"
              alt="Gotix — modern salon operations"
              fill
              unoptimized
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#1B1714]/55 via-[#1B1714]/15 to-transparent"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(109,40,217,0.18),transparent_50%,rgba(79,70,229,0.12))]"
              aria-hidden
            />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
                Since day one
              </p>
              <p className="landing-display mt-1.5 max-w-md text-xl font-semibold leading-snug text-white sm:text-2xl">
                Designed with salon owners, not for generic retail.
              </p>
            </div>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0.2 : 0.4,
              delay: reduced ? 0 : 0.22,
              ease: EASE,
            }}
            className={cn(
              "absolute left-5 top-5 z-10 sm:left-6 sm:top-6",
              "rounded-xl border border-[#5B21B6]/25 bg-white/95 px-4 py-3 backdrop-blur-sm",
              "w-[min(100%-2.5rem,200px)]"
            )}
          >
            <p className="landing-display text-xl font-semibold tabular-nums text-[#5B21B6]">
              {FOOTER_STATS[0].value!.toLocaleString("en-IN")}
              {FOOTER_STATS[0].suffix}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-[#1B1714]/55">
              Salons on Gotix
            </p>
          </motion.div>
        </motion.div>
      </div>
    </LandingSection>
  );
}
