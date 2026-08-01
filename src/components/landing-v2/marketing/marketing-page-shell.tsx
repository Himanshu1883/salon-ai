"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  LANDING_CONTAINER,
  LandingCard,
  primaryGradientButtonClass,
  sectionEyebrowTextClass,
  sectionHeadingClass,
} from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

type MarketingPageShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function MarketingPageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: MarketingPageShellProps) {
  return (
    <>
      <section className="border-b border-[#E4DDD1] bg-[#F7F3EC] pt-[calc(var(--landing-nav-h)+2.5rem)] pb-12 md:pt-[calc(var(--landing-nav-h)+3.5rem)] md:pb-16">
        <div className={cn(LANDING_CONTAINER, "max-w-3xl")}>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 shrink-0 bg-[#1B1714]/20" aria-hidden />
            <span className={sectionEyebrowTextClass}>{eyebrow}</span>
          </div>
          <h1 className={cn(sectionHeadingClass, "text-[#7C3AED]")}>{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className={primaryGradientButtonClass("px-6 py-3 text-sm")}
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center rounded-full border border-[#1B1714]/20 bg-white/80 px-6 py-3 text-sm font-semibold text-[#1B1714] backdrop-blur-sm transition-colors hover:border-[#1B1714]/35 hover:bg-white"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#EFE8DC] py-14 md:py-20">
        <div className={cn(LANDING_CONTAINER, "max-w-4xl space-y-10")}>{children}</div>
      </section>
    </>
  );
}

export function MarketingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="landing-display text-xl font-semibold text-[#1B1714] md:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[#1B1714]/75">{children}</div>
    </div>
  );
}

export function MarketingCardGrid({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <LandingCard key={item.title} className="p-5 md:p-6">
          <h3 className="font-semibold text-[#1B1714]">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/65">
            {item.description}
          </p>
        </LandingCard>
      ))}
    </div>
  );
}

export function MarketingStatRow({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <LandingCard key={stat.label} className="p-4 text-center md:p-5">
          <p className="landing-display text-2xl font-bold text-[#7C3AED]">{stat.value}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#1B1714]/50">
            {stat.label}
          </p>
        </LandingCard>
      ))}
    </div>
  );
}

export function MarketingBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed md:text-base">
          <span className="mt-2 h-px w-3 shrink-0 bg-[#7C3AED]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}
