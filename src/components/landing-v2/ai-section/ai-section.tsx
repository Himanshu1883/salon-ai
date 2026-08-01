"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AI_SECTION } from "../constants";
import {
  LandingCard,
  LandingSection,
  SectionEyebrow,
  sectionHeadingClass,
} from "../ui/landing-primitives";
import { cn } from "@/lib/utils";

const AI_SHOTS = [
  {
    src: "/dashboard.png",
    alt: "GlowDesk dashboard with AI-powered salon analytics",
    label: "AI Analytics",
    featured: true,
  },
  {
    src: "/report.png",
    alt: "GlowDesk reports with predictive insights",
    label: "Insights",
    featured: false,
  },
  {
    src: "/inventory.png",
    alt: "GlowDesk inventory intelligence",
    label: "Forecasting",
    featured: false,
  },
] as const;

function BrowserChrome({ label }: { label?: string }) {
  return (
    <div className="flex h-5 items-center justify-between border-b border-[#5B21B6]/10 bg-gradient-to-r from-[#F5F3FF] to-[#EEF2FF] px-2.5 sm:h-[22px]">
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28C840]" />
      </div>
      {label ? (
        <span className="truncate text-[9px] font-medium tracking-wide text-[#5B21B6]/50">
          {label}
        </span>
      ) : null}
      <span className="w-8" aria-hidden />
    </div>
  );
}

function DashboardShot({
  src,
  alt,
  label,
  featured,
}: {
  src: string;
  alt: string;
  label: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#5B21B6]/15 bg-white",
        "shadow-[0_8px_24px_rgba(91,33,182,0.1)] ring-1 ring-[#5B21B6]/[0.06]"
      )}
    >
      <BrowserChrome label={`app.glowdesk.com · ${label}`} />
      <div
        className={cn(
          "relative overflow-hidden bg-[#FAF5FF]",
          featured ? "aspect-[16/10]" : "aspect-[16/9]"
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          className="object-cover object-[center_18%]"
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 50vw"
              : "(max-width: 1024px) 50vw, 25vw"
          }
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[#5B21B6]/[0.04]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_28px_rgba(91,33,182,0.08)]"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function AiSection() {
  const [featured, ...thumbs] = AI_SHOTS;

  return (
    <LandingSection id="ai" band="ivory" className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionEyebrow centered={false}>Artificial Intelligence</SectionEyebrow>
          <h2 className={sectionHeadingClass}>{AI_SECTION.heading}</h2>
          <p className="mt-5 text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
            {AI_SECTION.subtitle}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {AI_SECTION.features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <LandingCard className="h-full border-[#5B21B6]/10 p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#5B21B6]/[0.11] text-[#5B21B6] ring-1 ring-[#5B21B6]/15">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-semibold text-[#1B1714]">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#1B1714]/65">
                      {f.desc}
                    </p>
                  </LandingCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="mb-1 inline-flex items-center gap-2 text-[#5B21B6]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Live product views
            </span>
          </div>

          <DashboardShot {...featured} />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {thumbs.map((shot) => (
              <DashboardShot key={shot.src} {...shot} />
            ))}
          </div>
        </motion.div>
      </div>
    </LandingSection>
  );
}
