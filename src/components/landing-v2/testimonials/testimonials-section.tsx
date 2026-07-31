"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GOOGLE_REVIEWS, TESTIMONIALS } from "../constants";
import type { Testimonial } from "../constants";
import { LandingSection, SectionHeader } from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = ["bg-[#7A2E2E]", "bg-[#2F6F5E]", "bg-[#1B1714]", "bg-[#C9A25D]"] as const;

const FOOTER_STATS = [
  { value: "4.9", label: "Average Rating", accent: false },
  { value: "1k+", label: "Salon Owners", accent: false },
  { value: "99.9", suffix: "%", label: "Uptime", accent: true },
  { value: "500+", label: "Cities Covered", accent: false },
] as const;

function useCountUpDecimal(target: number, durationMs: number, active: boolean, instant: boolean) {
  const [value, setValue] = useState(instant ? target : 0);

  useEffect(() => {
    if (instant) {
      setValue(target);
      return;
    }
    if (!active) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target * 10) / 10);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, durationMs, instant, target]);

  return value;
}

function GoogleBadge() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#1B1714]/45">
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Google
    </div>
  );
}

function MarqueeCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const initial = testimonial.name.charAt(0).toUpperCase();
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <article
      className={cn(
        "relative flex w-[min(340px,85vw)] shrink-0 flex-col",
        "rounded-2xl border border-[#E4DDD1]/80 bg-white p-6",
        "shadow-[0_8px_32px_rgba(27,23,20,0.07)]",
        "transition-[transform,box-shadow] duration-300",
        "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(27,23,20,0.1)]"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          role="img"
          aria-label={`Rated ${testimonial.rating} out of 5 stars`}
          className="flex gap-0.5"
        >
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-[#C9A25D] text-[#C9A25D]" aria-hidden />
          ))}
        </div>
        <span
          className="landing-display text-3xl leading-none text-[#C9A25D]/20"
          aria-hidden
        >
          &rdquo;
        </span>
      </div>

      <blockquote className="landing-display flex-1 text-[15px] italic leading-relaxed text-[#1B1714]/75 md:text-base">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <div className="mt-6 flex items-end justify-between gap-3 border-t border-[#E4DDD1]/60 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
              avatarColor
            )}
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#1B1714]">{testimonial.name}</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#1B1714]/45">
              Verified customer
            </div>
          </div>
        </div>
        <GoogleBadge />
      </div>
    </article>
  );
}

function TestimonialMarquee({ instant }: { instant: boolean }) {
  const items = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  if (instant) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TESTIMONIALS.map((t, i) => (
          <MarqueeCard key={t.id} testimonial={t} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="testimonial-marquee-mask relative overflow-hidden">
      <div className="testimonial-cards-marquee flex w-max gap-5 py-2">
        {items.map((t, i) => (
          <MarqueeCard key={`${t.id}-${i}`} testimonial={t} index={i % TESTIMONIALS.length} />
        ))}
      </div>
    </div>
  );
}

function StatsFooter({ instant }: { instant: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const rating = useCountUpDecimal(GOOGLE_REVIEWS.rating, 1200, inView, instant);

  return (
    <motion.div
      ref={ref}
      initial={instant ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 md:mt-12"
    >
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
        {FOOTER_STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center text-center",
              i > 0 && "md:border-l md:border-[#E4DDD1]"
            )}
          >
            <div className="landing-display text-3xl font-semibold tabular-nums text-[#1B1714] md:text-4xl">
              {stat.label === "Average Rating" ? (
                rating.toFixed(1)
              ) : stat.accent ? (
                <>
                  {stat.value}
                  <span className="italic text-[#7A2E2E]">{stat.suffix}</span>
                </>
              ) : (
                stat.value
              )}
            </div>
            <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#1B1714]/45">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RatingSummary({ instant }: { instant: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="-mt-8 mb-10 flex items-center justify-center gap-2 md:-mt-10 md:mb-12">
      <div
        className="flex gap-0.5"
        role="img"
        aria-label={`Rated ${GOOGLE_REVIEWS.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            initial={instant ? false : { opacity: 0, scale: 0.6 }}
            animate={inView || instant ? { opacity: 1, scale: 1 } : {}}
            transition={{
              delay: instant ? 0 : 0.2 + i * 0.07,
              type: "spring",
              stiffness: 280,
              damping: 18,
            }}
          >
            <Star className="h-4 w-4 fill-[#C9A25D] text-[#C9A25D]" aria-hidden />
          </motion.span>
        ))}
      </div>
      <span className="text-sm font-medium text-[#1B1714]/70">
        {GOOGLE_REVIEWS.rating} · Top reviews
      </span>
    </div>
  );
}

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion();
  const instant = !!prefersReducedMotion;

  return (
    <LandingSection id="testimonials" band="band">
      <SectionHeader
        eyebrow="Trusted by Salon Owners"
        title="Real Stories. Real Results."
        subtitle="Real stories from salon owners who trust Salon AI to run their floor every day."
      />

      <RatingSummary instant={instant} />

      <div className="-mx-5 overflow-hidden sm:-mx-6 lg:-mx-10 xl:-mx-12 2xl:-mx-14">
        <TestimonialMarquee instant={instant} />
      </div>

      <StatsFooter instant={instant} />
    </LandingSection>
  );
}
