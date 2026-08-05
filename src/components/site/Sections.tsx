"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Sparkles, Users, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`relative w-full overflow-hidden pb-20 pt-32 sm:pt-40 ${
        dark ? "gradient-ink text-ink-foreground" : ""
      }`}
    >
      {image && (
        <div className="absolute inset-0 -z-10">
          <img
            src={image}
            alt={imageAlt ?? ""}
            className="h-full w-full object-cover ken-burns"
            loading="lazy"
          />
          <div
            className={`absolute inset-0 ${
              dark
                ? "bg-linear-to-r from-ink/92 via-ink/80 to-ink/40"
                : "bg-linear-to-r from-background via-background/88 to-background/35"
            }`}
          />
        </div>
      )}
      <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
        <Reveal>
          <p className={`eyebrow ${dark ? "!text-gold" : ""}`}>{eyebrow}</p>
          <h1
            className={`mt-4 max-w-4xl text-4xl leading-[1.08] sm:text-5xl lg:text-6xl ${
              dark ? "text-ink-foreground" : ""
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${
                dark ? "text-ink-foreground/72" : "text-muted-foreground"
              }`}
            >
              {subtitle}
            </p>
          )}
        </Reveal>
        {children && <Reveal delay={0.1}>{children}</Reveal>}
      </div>
    </section>
  );
}

export function ParallaxBanner({
  image,
  alt,
  headline,
  copy,
  align = "left",
  badge,
  children,
}: {
  image: string;
  alt: string;
  headline: string;
  copy?: string;
  align?: "left" | "right";
  badge?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative w-full overflow-hidden py-24 sm:py-32">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 -z-10 h-[120%] -top-[10%]"
        style={reduce ? {} : { y }}
      >
        <img
          src={image}
          alt={alt}
          width={1920}
          height={900}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {/* Gradient overlay - Enhanced */}
        <div
          className={`absolute inset-0 ${
            align === "left"
              ? "bg-gradient-to-r from-background/85 via-background/45 to-transparent"
              : "bg-gradient-to-l from-background/85 via-background/45 to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute inset-0 -z-5">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
        <div className={`max-w-xl ${align === "right" ? "ml-auto text-right" : ""}`}>
          <Reveal>
            {/* Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 backdrop-blur-sm mb-4">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                  {badge}
                </span>
              </div>
            )}

            {/* Headline with gradient */}
            <h2 className="text-3xl font-display leading-tight sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {headline}
              </span>
            </h2>

            {/* Description */}
            {copy && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {copy}
              </p>
            )}

            {/* Feature list or CTA */}
            {children && <div className="mt-6">{children}</div>}

            {/* Trust indicators - optional */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Enterprise Grade</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">99.9% Uptime</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">1,200+ Salons</span>
              </div>
            </div>

            {/* CTA Link */}
            <div className="mt-6">
              <Link
                href="/solutions"
                className="group inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3"
              >
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ImageSlot({
  name,
  alt,
  src,
  className = "",
  ratio = "aspect-[4/3]",
}: {
  name: string;
  alt: string;
  src?: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      {...(!src ? { role: "img", "aria-label": alt } : {})}
      title={name}
      className={`relative overflow-hidden rounded-2xl ${ratio} ${className} ${!src ? "slot-placeholder" : ""}`}
    >
      {src && <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />}
      <div className="absolute inset-0 flex items-end p-4">
        <span className="rounded-full bg-card/70 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground backdrop-blur">
          {name}
        </span>
      </div>
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </Reveal>
  );
}
