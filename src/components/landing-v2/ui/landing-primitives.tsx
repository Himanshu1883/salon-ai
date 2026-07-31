"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const LANDING = {
  ivory: "#F7F3EC",
  band: "#EFE8DC",
  ink: "#1B1714",
  accent: "#7C3AED",
  accentDark: "#6D28D9",
  sage: "#2F6F5E",
  gold: "#C9A25D",
  border: "#E4DDD1",
  cardShadow: "0 4px 20px rgba(27,23,20,0.06)",
} as const;

/** @deprecated Use LANDING.accent */
export const LANDING_BURGUNDY = LANDING.accent;

export const primaryGradientButtonClass = (className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full",
    "bg-gradient-to-r from-violet-600 via-purple-500 to-violet-400",
    "font-semibold text-white",
    "shadow-[0_8px_24px_-4px_rgba(124,58,237,0.4)]",
    "transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
    "hover:scale-[1.02] hover:shadow-[0_12px_32px_-4px_rgba(124,58,237,0.5)] hover:brightness-105",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2",
    className
  );

export const LANDING_CONTAINER =
  "mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-10 xl:px-12 2xl:max-w-[1680px] 2xl:px-14";

type SectionBand = "ivory" | "band";

export function LandingSection({
  id,
  band = "ivory",
  className,
  children,
}: {
  id?: string;
  band?: SectionBand;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24 lg:py-28 xl:py-32",
        band === "ivory" ? "bg-[#F7F3EC]" : "bg-[#EFE8DC]",
        className
      )}
    >
      <div className={LANDING_CONTAINER}>{children}</div>
    </section>
  );
}

export const sectionEyebrowTextClass =
  "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7C3AED]";

export const sectionHeadingClass =
  "landing-display text-3xl font-semibold leading-tight tracking-tight text-[#7C3AED] md:text-4xl lg:text-5xl";

export function SectionEyebrow({
  children,
  centered = true,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-3",
        centered ? "justify-center" : "justify-center lg:justify-start"
      )}
    >
      <span className="h-px w-8 shrink-0 bg-[#7C3AED]/25" aria-hidden />
      <span className={sectionEyebrowTextClass}>{children}</span>
      <span className="hidden h-px w-8 shrink-0 bg-[#7C3AED]/25 sm:block" aria-hidden />
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = true,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 md:mb-16", centered && "text-center", className)}>
      <SectionEyebrow centered={centered}>{eyebrow}</SectionEyebrow>
      <h2 className={sectionHeadingClass}>{title}</h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function LandingCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E4DDD1] bg-white",
        "shadow-[0_4px_20px_rgba(27,23,20,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={primaryGradientButtonClass(cn("px-6 py-3 text-sm", className))}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-[#1B1714]/25 bg-transparent px-6 py-3",
        "text-sm font-semibold text-[#1B1714]",
        "transition-[transform,background-color,box-shadow] duration-200",
        "hover:-translate-y-px hover:border-[#1B1714]/40 hover:bg-white/60 hover:shadow-[0_4px_16px_-6px_rgba(27,23,20,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function ContainedPhoto({
  src,
  alt,
  className,
  aspect = "video",
}: {
  src: string;
  alt: string;
  className?: string;
  aspect?: "video" | "square" | "portrait" | "none";
}) {
  const aspectClass =
    aspect === "none"
      ? ""
      : aspect === "square"
        ? "aspect-square"
        : aspect === "portrait"
          ? "aspect-[3/4]"
          : "aspect-video";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#E4DDD1]",
        aspectClass,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover saturate-[0.85] contrast-[1.02] sepia-[0.08]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

export function BulletItem({ children, variant = "burgundy" }: { children: React.ReactNode; variant?: "burgundy" | "sage" }) {
  return (
    <li className="flex items-start gap-3 text-[#1B1714]/80">
      <span
        className={cn(
          "mt-2.5 h-px w-4 shrink-0",
          variant === "sage" ? "bg-[#2F6F5E]" : "bg-[#7C3AED]"
        )}
        aria-hidden
      />
      {children}
    </li>
  );
}
