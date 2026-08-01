"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FEATURE_BLOCKS } from "../constants";
import type { FeatureBlock } from "../constants";
import { LandingSection, sectionHeadingClass } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const bulletAccentClass = "bg-[#1B1714]/35";

function FeatureNumberMarker({ index }: { index: number }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-px w-6 shrink-0 bg-[#1B1714]/20" aria-hidden />
      <span className="landing-display text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[#1B1714]/50">
        {num}
      </span>
      <span className="hidden h-px w-6 shrink-0 bg-[#1B1714]/20 sm:block" aria-hidden />
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function FeatureImage({
  block,
  parallax,
  imageVariants,
}: {
  block: FeatureBlock;
  parallax: boolean;
  imageVariants: Variants;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [24, -24]);

  return (
    <div ref={ref} className="max-lg:mx-auto max-lg:w-full">
      <motion.div style={parallax ? { y: parallaxY } : undefined}>
        <motion.div
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={cn(
            "group relative overflow-hidden rounded-2xl",
            "border-2 border-[#5B21B6]/45",
            "shadow-[0_20px_40px_rgba(91,33,182,0.12)]",
            "ring-1 ring-inset ring-[#C4B5FD]/40"
          )}
        >
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-[5/4] lg:aspect-[4/3] lg:h-[420px] lg:aspect-auto">
            <Image
              src={block.image}
              alt={block.alt}
              fill
              className={cn(
                "object-cover saturate-[0.85] sepia-[0.06]",
                "transition-transform duration-[400ms] ease-out",
                "lg:group-hover:scale-[1.02]"
              )}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureBlockRow({
  block,
  index,
  enhanced,
}: {
  block: FeatureBlock;
  index: number;
  enhanced: boolean;
}) {
  const reversed = index % 2 === 1;
  const slideFrom = reversed ? 28 : -28;

  const imageVariants: Variants = enhanced
    ? {
        hidden: {
          opacity: 0,
          scale: 0.96,
          x: slideFrom,
          clipPath: reversed ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
        },
        visible: {
          opacity: 1,
          scale: 1,
          x: 0,
          clipPath: "inset(0 0 0 0)",
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      };

  const headingVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        delay: enhanced ? 0.1 : 0.06,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const subheadVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        delay: enhanced ? 0.18 : 0.1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const bulletContainerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: enhanced ? 0.06 : 0,
        delayChildren: enhanced ? 0.26 : 0.08,
      },
    },
  };

  const bulletItemVariants: Variants = {
    hidden: { opacity: 0, y: enhanced ? 12 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <article className="relative">
      {/* Connector dot — desktop center line */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 z-10 hidden h-2 w-2 -translate-x-1/2 rounded-full border border-[#1B1714]/10 bg-[#EFE8DC] lg:block"
      />

      <div
        className={cn(
          "relative grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16",
          reversed && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
        )}
      >
        <FeatureImage
          block={block}
          parallax={enhanced}
          imageVariants={imageVariants}
        />

        <div className="relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: {
                transition: { staggerChildren: 0, when: "beforeChildren" },
              },
            }}
          >
            <FeatureNumberMarker index={index} />

            <motion.h3
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="landing-display text-2xl font-semibold text-[#1B1714] md:text-3xl lg:text-4xl"
            >
              {block.title}
            </motion.h3>

            <motion.p
              variants={subheadVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-4 text-base leading-relaxed text-[#1B1714]/65 md:text-lg"
            >
              {block.description}
            </motion.p>

            <motion.ul
              variants={bulletContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-6 space-y-3"
            >
              {block.bullets.map((b) => (
                <motion.li
                  key={b}
                  variants={bulletItemVariants}
                  className="flex list-none items-start gap-3 text-[#1B1714]/80"
                >
                  <span
                    className={cn("mt-[0.55rem] h-px w-3 shrink-0", bulletAccentClass)}
                    aria-hidden
                  />
                  <span>{b}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </article>
  );
}

export function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const enhanced = isDesktop && !prefersReducedMotion;

  return (
    <LandingSection
      id="features"
      band="band"
      className="landing-features-band !relative !overflow-hidden"
    >
      <div className="relative z-10 mb-12 text-center md:mb-16">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 shrink-0 bg-[#5B21B6]/25" aria-hidden />
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5B21B6]">
            Salon-First Features
          </span>
          <span className="hidden h-px w-8 shrink-0 bg-[#5B21B6]/25 sm:block" aria-hidden />
        </div>
        <h2 className={sectionHeadingClass}>Designed Around Your Salon Floor</h2>
      </div>

      <div className="relative z-10">
        {/* Vertical journey connector — desktop only */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-[#5B21B6]/15 lg:block"
        />

        <div className="relative space-y-16 md:space-y-20 lg:space-y-24">
          {FEATURE_BLOCKS.map((block, i) => (
            <FeatureBlockRow key={block.id} block={block} index={i} enhanced={enhanced} />
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
