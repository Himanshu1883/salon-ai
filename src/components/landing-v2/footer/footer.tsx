"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  FOOTER_COLUMNS,
  FOOTER_SOCIAL,
  FOOTER_STATS,
} from "../constants";
import { LANDING_CONTAINER, primaryGradientButtonClass } from "../ui/landing-primitives";
import { BrandMark } from "../ui/brand-logo";
import { cn } from "@/lib/utils";

function SocialIcon({ icon }: { icon: (typeof FOOTER_SOCIAL)[number]["icon"] }) {
  const props = {
    className: "h-4 w-4",
    fill: "currentColor",
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
  }
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

function FooterLinkItem({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a
        href={href}
        className="group inline-flex items-center gap-1.5 text-base text-[#F7F3EC]/55 no-underline transition-[color,transform] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:translate-x-0.5 hover:text-white"
      >
        <span>{label}</span>
        <ArrowRight
          className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
          strokeWidth={1.75}
          aria-hidden
        />
      </a>
    </li>
  );
}

function AnimatedStat({
  stat,
  index,
  instant,
}: {
  stat: (typeof FOOTER_STATS)[number];
  index: number;
  instant: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(
    stat.value === null ? stat.display : instant ? formatStat(stat, stat.value) : "0"
  );

  useEffect(() => {
    if (instant || stat.value === null || !inView) {
      if (stat.value !== null && inView) {
        setDisplay(formatStat(stat, stat.value));
      }
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = stat.value! * eased;
      setDisplay(formatStat(stat, current));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, instant, stat]);

  return (
    <motion.div
      ref={ref}
      initial={instant ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: instant ? 0 : index * 0.08, duration: 0.5, ease: EASE }}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm",
        "shadow-[0_8px_32px_rgba(0,0,0,0.24)]",
        "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        "hover:-translate-y-[3px] hover:border-white/[0.1] hover:bg-white/[0.04]",
        "hover:shadow-[0_16px_48px_rgba(0,0,0,0.32)]"
      )}
    >
      <p className="landing-display text-2xl font-bold tracking-tight text-white md:text-[1.75rem]">
        {display}
      </p>
      <p className="mt-1 text-sm text-[#F7F3EC]/50">{stat.label}</p>
    </motion.div>
  );
}

function formatStat(
  stat: (typeof FOOTER_STATS)[number],
  value: number
): string {
  if (stat.value === null) return stat.display;

  const decimals = "decimals" in stat ? stat.decimals : 0;

  if (stat.suffix === "K+") {
    return `${Math.round(value)}${stat.suffix}`;
  }

  if (stat.suffix === "%") {
    return `${value.toFixed(decimals)}${stat.suffix}`;
  }

  return `${Math.round(value).toLocaleString("en-IN")}${stat.suffix}`;
}

function StatusIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F6F5E] opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2F6F5E] shadow-[0_0_8px_rgba(47,111,94,0.6)]" />
      </span>
      <span className="text-sm text-[#F7F3EC]/60">
        System <span className="text-[#F7F3EC]/85">Online</span>
      </span>
    </div>
  );
}

export function Footer() {
  const prefersReducedMotion = useReducedMotion();
  const instant = !!prefersReducedMotion;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0B0908] text-[#F7F3EC]">
      {/* Layered background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(124,58,237,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(198,162,93,0.06),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-[1px]"
        aria-hidden
      />

      <div className={cn(LANDING_CONTAINER, "relative py-14 md:py-16 lg:py-20")}>
        {/* TOP SECTION */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-20">
          {/* Brand column */}
          <motion.div
            initial={instant ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <BrandMark size="footer" />

            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#F7F3EC]/55">
              Luxury AI-powered salon ERP trusted by modern salons across India.
            </p>

            <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:max-w-none lg:w-auto">
              <Link
                href="/register"
                className={primaryGradientButtonClass(
                  "flex-1 px-6 py-3 text-sm focus-visible:ring-offset-[#0B0908]"
                )}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="mailto:support@salonai.com"
                className={cn(
                  "inline-flex flex-1 items-center justify-center rounded-lg border border-white/10 bg-transparent px-6 py-3 text-sm font-semibold text-[#F7F3EC]/90",
                  "transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
                  "hover:-translate-y-px hover:border-white/20 hover:bg-white/[0.05]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A25D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0908]"
                )}
              >
                Book Demo
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {FOOTER_SOCIAL.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#F7F3EC]/50",
                      "transition-[transform,color,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
                      "hover:-translate-y-0.5 hover:rotate-3 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    <SocialIcon icon={icon} />
                  </a>
                ))}
            </div>
          </motion.div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4 lg:gap-8">
            {FOOTER_COLUMNS.map((column, colIndex) => (
              <motion.div
                key={column.title}
                initial={instant ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: instant ? 0 : colIndex * 0.06, duration: 0.5, ease: EASE }}
                className="text-center md:text-left"
              >
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#D6A354]">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <FooterLinkItem key={link.label} {...link} />
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MIDDLE SECTION — divider + stats */}
        <div className="my-12 md:my-14 lg:my-16">
          <div
            className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)]"
            aria-hidden
          />

          <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5 lg:mt-12 lg:grid-cols-4 lg:gap-6">
            {FOOTER_STATS.map((stat, i) => (
              <AnimatedStat key={stat.label} stat={stat} index={i} instant={instant} />
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div
          className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]"
          aria-hidden
        />

        <div className="mt-8 flex flex-col items-center gap-6 text-center md:mt-10 lg:flex-row lg:justify-between lg:gap-4 lg:text-left">
          <div className="space-y-0.5">
            <p className="text-sm text-[#F7F3EC]/50">&copy; {year} Salon AI</p>
            <p className="text-sm text-[#F7F3EC]/40">Made in India.</p>
          </div>

          <StatusIndicator />

          <p className="text-sm text-[#F7F3EC]/50">
            Made with <span className="text-violet-400">♥</span> for salon professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
