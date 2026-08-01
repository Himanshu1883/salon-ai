"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HERO } from "../constants";
import { HeroProductShowcase } from "./hero-product-showcase";
import { primaryGradientButtonClass } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const STAGGER = 0.08;

const fadeUp = (delay: number, reduced: boolean) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
      };

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <section className="hero-editorial relative h-full overflow-x-hidden">
      {/* Salon background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/salon.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#F7F3EC]/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EC]/52 via-[#F7F3EC]/10 to-[#F7F3EC]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F3EC]/55 via-transparent to-[#F7F3EC]/20" />
        <div className="hero-editorial__grain absolute inset-0 opacity-95" />
      </div>

      <div className="relative mx-auto flex h-full min-h-0 max-w-7xl flex-col items-center justify-center gap-4 px-5 pb-[7.25rem] pt-[calc(var(--landing-nav-h)+1rem)] sm:gap-5 sm:px-6 sm:pb-[7.5rem] sm:pt-[calc(var(--landing-nav-h)+1.25rem)] lg:flex-row lg:gap-6 lg:px-8 lg:pb-[calc(var(--landing-trust-half)+0.5rem)] lg:pt-[calc(var(--landing-nav-h)+0.75rem)] xl:gap-8">
        {/* Copy & CTAs */}
        <div className="z-10 w-full flex-shrink-0 text-center lg:max-w-xl lg:flex-1 lg:text-left">
          <motion.div
            data-motion=""
            {...fadeUp(0, reduced)}
            className="mb-2 flex items-center justify-center gap-2.5 lg:mb-4 lg:justify-start lg:gap-3"
          >
            <span className="h-px w-6 shrink-0 bg-[#1B1714]/25 sm:w-8" aria-hidden />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7C3AED] sm:text-[11px] sm:tracking-[0.22em]">
              {HERO.eyebrow}
            </span>
            <span className="hidden h-px w-6 shrink-0 bg-[#1B1714]/25 sm:block sm:w-8" aria-hidden />
          </motion.div>

          <motion.h1
            data-motion=""
            {...fadeUp(STAGGER, reduced)}
            className="hero-editorial__headline text-[1.625rem] font-semibold leading-[1.12] tracking-tight text-[#1B1714] sm:text-[1.875rem] sm:leading-[1.1] md:text-4xl lg:text-[2.75rem] lg:leading-[1.08] xl:text-[3.25rem]"
          >
            {HERO.headline}{" "}
            <em className="not-italic text-[#7C3AED]">
              <span className="italic">{HERO.headlineEmphasis}</span>
            </em>
          </motion.h1>

          <motion.p
            data-motion=""
            {...fadeUp(STAGGER * 2, reduced)}
            className="mx-auto mt-3 max-w-[20rem] text-sm leading-relaxed text-[#1B1714]/75 sm:mt-4 sm:max-w-md sm:text-[15px] md:text-base lg:mx-0 lg:max-w-xl"
          >
            {HERO.subtitle}
          </motion.p>

          <motion.div
            data-motion=""
            {...fadeUp(STAGGER * 3, reduced)}
            className="mt-4 hidden flex-wrap justify-center gap-2 min-[720px]:flex lg:justify-start"
          >
            {HERO.features.map((feature) => (
              <span
                key={feature}
                className={cn(
                  "rounded-full border border-[#1B1714]/20 bg-transparent px-3 py-1.5",
                  "text-xs text-[#1B1714]/80 md:text-[13px]",
                  "transition-colors duration-200",
                  "hover:border-[#2F6F5E] hover:bg-[#2F6F5E] hover:text-[#F7F3EC]"
                )}
              >
                {feature}
              </span>
            ))}
          </motion.div>

          <motion.div
            data-motion=""
            {...fadeUp(STAGGER * 4, reduced)}
            className="mx-auto mt-4 flex w-full max-w-sm flex-col gap-2.5 sm:mt-5 sm:max-w-md sm:gap-3 lg:mx-0 lg:mt-6 lg:max-w-none lg:flex-row lg:justify-start"
          >
            <Link
              href="/register"
              className={primaryGradientButtonClass(
                cn(
                  "w-full px-5 py-3 text-sm sm:text-[15px] md:text-base lg:w-auto lg:px-8 lg:py-3.5",
                  "focus-visible:ring-offset-[#F7F3EC]"
                )
              )}
            >
              {HERO.ctaPrimary}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            </Link>
            <Link
              href="#pricing"
              className={cn(
                "inline-flex w-full items-center justify-center rounded-xl px-5 py-3",
                "border border-[#1B1714]/30 bg-white/60 text-sm font-semibold text-[#1B1714] backdrop-blur-sm sm:text-[15px] md:text-base",
                "transition-[transform,box-shadow,background-color,border-color] duration-200",
                "hover:-translate-y-0.5 hover:border-[#1B1714]/50 hover:bg-white/80",
                "hover:shadow-[0_4px_16px_-6px_rgba(27,23,20,0.12)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]",
                "lg:w-auto lg:bg-transparent lg:px-8 lg:py-3.5 lg:backdrop-blur-none"
              )}
            >
              {HERO.ctaSecondary}
            </Link>
          </motion.div>
        </div>

        {/* Dashboard mockup — desktop only */}
        <motion.div
          data-motion=""
          initial={reduced ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.65, delay: STAGGER * 5, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative z-10 hidden w-full min-h-0 flex-1 overflow-visible lg:block lg:max-h-full lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[520px]"
        >
          <HeroProductShowcase animate={!reduced} className="lg:origin-top lg:scale-[0.9] xl:scale-[0.95] 2xl:scale-100" />
        </motion.div>
      </div>
    </section>
  );
}
