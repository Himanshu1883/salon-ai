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
import {
  LANDING_CONTAINER,
  primaryGradientButtonClass,
} from "../ui/landing-primitives";
import { BrandMark } from "../ui/brand-logo";
import { cn } from "@/lib/utils";

function SocialIcon({
  icon,
}: {
  icon: (typeof FOOTER_SOCIAL)[number]["icon"];
}) {
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
  const className =
    "text-sm text-white/50 transition-colors duration-300 hover:text-white";
  const content = <span>{label}</span>;

  return (
    <li>
      {href.startsWith("mailto:") || href.startsWith("http") ? (
        <a href={href} className={className}>
          {content}
        </a>
      ) : (
        <Link href={href} className={className}>
          {content}
        </Link>
      )}
    </li>
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
    stat.value === null
      ? stat.display
      : instant
        ? formatStat(stat, stat.value)
        : "0"
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
      setDisplay(formatStat(stat, stat.value! * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, instant, stat]);

  return (
    <motion.div
      ref={ref}
      initial={instant ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: instant ? 0 : index * 0.07,
        duration: 0.5,
        ease: EASE,
      }}
      className="relative px-1 py-1 sm:px-2"
    >
      <p className="landing-display text-3xl font-medium tracking-tight text-white md:text-4xl">
        {display}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
        {stat.label}
      </p>
    </motion.div>
  );
}

function StatusIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-50" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      <span className="text-xs tracking-wide text-white/45">
        System online
      </span>
    </div>
  );
}

export function Footer() {
  const prefersReducedMotion = useReducedMotion();
  const instant = !!prefersReducedMotion;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0C0A09] text-[#F7F3EC]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-[#5B21B6]/20 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[320px] w-[55%] rounded-full bg-[#4F46E5]/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0)_0%,rgba(12,10,9,0.55)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className={cn(LANDING_CONTAINER, "relative")}>
        {/* CTA band */}
        <motion.div
          initial={instant ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="border-b border-white/[0.08] py-16 md:py-20 lg:py-24"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#C4B5FD]/80">
                Salon AI ERP
              </p>
              <h2 className="landing-display mt-4 text-3xl font-medium leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                Ready to run a salon that{" "}
                <span className="italic text-[#C4B5FD]">feels effortless?</span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/50">
                Appointments, billing, inventory, and AI — one platform built for
                how modern salons actually work.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className={primaryGradientButtonClass(
                  "rounded-full px-7 py-3.5 text-sm focus-visible:ring-offset-[#0C0A09]"
                )}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="mailto:support@salonai.com"
                className={cn(
                  "inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/90",
                  "transition-[transform,background-color,border-color] duration-300",
                  "hover:-translate-y-px hover:border-white/30 hover:bg-white/[0.04]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5FD]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0A09]"
                )}
              >
                Book Demo
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Brand + nav */}
        <div className="grid gap-12 border-b border-white/[0.08] py-14 md:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <motion.div
            initial={instant ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <BrandMark size="footer" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">
              Luxury AI-powered salon ERP trusted by modern salons across India.
            </p>

            {FOOTER_SOCIAL.length > 0 && (
              <div className="mt-6 flex items-center gap-2.5">
                {FOOTER_SOCIAL.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/45",
                      "transition-[transform,color,background-color,border-color] duration-300",
                      "hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    <SocialIcon icon={icon} />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-2 gap-10 sm:gap-12">
            {FOOTER_COLUMNS.map((column, colIndex) => (
              <motion.div
                key={column.title}
                initial={instant ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: instant ? 0 : 0.08 + colIndex * 0.06,
                  duration: 0.5,
                  ease: EASE,
                }}
              >
                <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
                  {column.title}
                </h4>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <FooterLinkItem key={link.label} {...link} />
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats — editorial, no cards */}
        <div className="grid grid-cols-2 gap-y-10 border-b border-white/[0.08] py-12 md:py-14 lg:grid-cols-4 lg:gap-0">
          {FOOTER_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "lg:px-6",
                i > 0 && "lg:border-l lg:border-white/[0.08]",
                i === 0 && "lg:pl-0"
              )}
            >
              <AnimatedStat stat={stat} index={i} instant={instant} />
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start gap-4 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} Salon AI · Made in India
          </p>
          <StatusIndicator />
          <p className="sm:text-right">
            Built for salon professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
