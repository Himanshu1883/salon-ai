"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FOOTER_COLUMNS,
  FOOTER_SOCIAL,
  FOOTER_STATS,
} from "../constants";
import { LANDING_CONTAINER } from "../ui/landing-primitives";
import { BrandLogo } from "../ui/brand-logo";
import { cn } from "@/lib/utils";

function SocialIcon({
  icon,
}: {
  icon: (typeof FOOTER_SOCIAL)[number]["icon"];
}) {
  const props = {
    className: "h-3.5 w-3.5",
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

function FooterLinkItem({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon?: (typeof FOOTER_SOCIAL)[number]["icon"];
}) {
  const className =
    "inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors duration-200 hover:text-white";
  const content = (
    <>
      <span>{label}</span>
      {icon ? <SocialIcon icon={icon} /> : null}
    </>
  );

  return (
    <li>
      {href.startsWith("mailto:") || href.startsWith("http") ? (
        <a
          href={href}
          className={className}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
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

function DotGrid() {
  return (
    <div className="grid grid-cols-3 gap-1" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="h-1 w-1 rounded-full bg-[#C4B5FD]/50" />
      ))}
    </div>
  );
}

function formatStatDisplay(stat: (typeof FOOTER_STATS)[number]): string {
  if (stat.value === null) return stat.display;
  if (stat.suffix === "%") {
    const decimals = "decimals" in stat ? stat.decimals : 0;
    return `${stat.value.toFixed(decimals)}${stat.suffix}`;
  }
  if (stat.suffix === "K+") return `${stat.value}${stat.suffix}`;
  return `${stat.value.toLocaleString("en-IN")}${stat.suffix}`;
}

export function Footer() {
  const prefersReducedMotion = useReducedMotion();
  const instant = !!prefersReducedMotion;
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <footer className="relative overflow-hidden bg-[#0C0A09] text-[#F7F3EC]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[380px] w-[60%] rounded-full bg-[#5B21B6]/18 blur-[110px]" />
        <div className="absolute -right-1/4 bottom-0 h-[280px] w-[50%] rounded-full bg-[#4F46E5]/12 blur-[100px]" />
      </div>

      <div className={cn(LANDING_CONTAINER, "relative pt-10 pb-10 md:pt-14 md:pb-12")}>
        {/* Dual CTA cards */}
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <motion.div
            initial={instant ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#161210] px-7 py-8 md:min-h-[320px] md:px-9 md:py-10"
          >
            <div>
              <h2 className="landing-display max-w-[16ch] text-3xl font-medium leading-[1.15] tracking-tight text-white md:text-4xl">
                Salon tips & product updates
              </h2>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/45 md:text-[13px]">
                Get GlowDesk release notes, booking & billing tips, and WhatsApp
                automation ideas. By subscribing you agree to our privacy policy.
              </p>
            </div>

            {subscribed ? (
              <p className="text-sm text-[#C4B5FD]">
                You&apos;re in — watch your inbox for salon updates.
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5"
              >
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yoursalon.com"
                    className="w-full border-0 border-b border-white/25 bg-transparent pb-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#A78BFA]"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#0C0A09] transition-[transform,background-color] hover:-translate-y-px hover:bg-[#EDE9FE]"
                >
                  Subscribe
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={instant ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: instant ? 0 : 0.08, duration: 0.5, ease: EASE }}
            className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[#5B21B6]/35 bg-gradient-to-br from-[#2E1065]/80 to-[#161210] px-7 py-8 md:min-h-[320px] md:px-9 md:py-10"
          >
            <p
              className="pointer-events-none absolute -right-2 bottom-0 select-none font-serif text-[14rem] font-medium leading-none text-white/[0.06] md:text-[16rem]"
              aria-hidden
            >
              S
            </p>

            <div className="relative">
              <DotGrid />
              <h2 className="landing-display mt-6 max-w-[18ch] text-3xl font-medium leading-[1.15] tracking-tight text-white md:text-4xl">
                Run appointments, billing & AI on one platform.
              </h2>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/45 md:text-[13px]">
                14-day free trial · {FOOTER_STATS[0].value}
                {FOOTER_STATS[0].suffix} salons · No credit card
              </p>
            </div>

            <div className="relative mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#0C0A09] transition-[transform,background-color] hover:-translate-y-px hover:bg-[#EDE9FE]"
              >
                Start free trial
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                View pricing
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-b border-white/[0.08] pb-10 md:mt-12 md:grid-cols-4 md:gap-8 md:pb-12">
          {FOOTER_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={instant ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: instant ? 0 : i * 0.05,
                duration: 0.4,
                ease: EASE,
              }}
            >
              <p className="landing-display text-2xl font-medium tracking-tight text-white md:text-3xl">
                {formatStatDisplay(stat)}
              </p>
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/35">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Logo + columns */}
        <div className="mt-12 flex flex-col gap-12 md:mt-14 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="max-w-xs">
            <Link
              href="/"
              aria-label="GlowDesk home"
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-1.5"
            >
              <BrandLogo size="nav" className="!h-8 !w-8 rounded-lg" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              AI-powered salon ERP for appointments, POS, inventory, staff, and
              WhatsApp — built for Indian salons.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:max-w-3xl lg:justify-items-start xl:max-w-4xl">
            {FOOTER_COLUMNS.map((column, colIndex) => (
              <motion.div
                key={column.title}
                initial={instant ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: instant ? 0 : 0.05 + colIndex * 0.05,
                  duration: 0.45,
                  ease: EASE,
                }}
              >
                <h4 className="text-sm font-semibold text-white">
                  {column.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <FooterLinkItem key={link.label} {...link} />
                  ))}
                </ul>
              </motion.div>
            ))}

            <motion.div
              initial={instant ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: instant ? 0 : 0.15,
                duration: 0.45,
                ease: EASE,
              }}
            >
              <h4 className="text-sm font-semibold text-white">Follow us</h4>
              <ul className="mt-4 space-y-2.5">
                <FooterLinkItem
                  label="Contact us"
                  href="mailto:support@glowdesk.com"
                />
                <FooterLinkItem label="Documentation" href="/documentation" />
                {FOOTER_SOCIAL.map((social) => (
                  <FooterLinkItem
                    key={social.label}
                    label={social.label}
                    href={social.href}
                    icon={social.icon}
                  />
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} GlowDesk · Made in India</p>
          <p>Built for salon professionals</p>
        </div>
      </div>
    </footer>
  );
}
