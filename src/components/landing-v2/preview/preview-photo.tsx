"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  LayoutDashboard,
  Calendar,
  CreditCard,
  Package,
  Scissors,
  Sparkle,
  BadgePercent,
  BarChart3,
  Building2,
  Award
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ProcessStep = {
  index: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  tag: string;
  icon: React.ReactNode;
  stats?: Array<{ value: string; label: string }>;
  features?: string[];
  cta?: string;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "Discover Your Salon",
    description:
      "We map every chair, service, and staff schedule you run today, so nothing gets lost when you move to Gotix.",
    image: "/process-discover.png",
    alt: "Gotix onboarding call mapping a salon's workflow",
    tag: "Onboarding",
    icon: <Building2 className="h-5 w-5" />,
    features: [
      "Chair & station mapping",
      "Service catalog audit",
      "Staff schedule review",
      "Inventory assessment"
    ],
    stats: [
      { value: "1,000+", label: "Salons Mapped" },
      { value: "500+", label: "Cities" }
    ]
  },
  {
    index: "02",
    title: "Set Up & Migrate",
    description:
      "Your clients, services, staff, and inventory are imported and configured — dashboard, POS, and CRM ready on day one.",
    image: "/process-setup.png",
    alt: "Gotix dashboard being configured for a salon",
    tag: "Migration",
    icon: <LayoutDashboard className="h-5 w-5" />,
    features: [
      "Client data migration",
      "Service configuration",
      "Inventory setup",
      "POS integration"
    ],
    stats: [
      { value: "22", label: "Modules" },
      { value: "99.9%", label: "Uptime" }
    ],
    cta: "Book Demo"
  },
  {
    index: "03",
    title: "Train Your Team",
    description:
      "Front desk, stylists, and managers get hands-on walkthroughs, so every booking and bill runs smoothly from day one.",
    image: "/process-train.png",
    alt: "Salon staff being trained on the Gotix platform",
    tag: "Training",
    icon: <Users className="h-5 w-5" />,
    features: [
      "Staff onboarding sessions",
      "Role-based workflows",
      "Live support chat",
      "Video tutorials"
    ],
    stats: [
      { value: "4.9★", label: "Rating" },
      { value: "24/7", label: "Support" }
    ]
  },
  {
    index: "04",
    title: "Launch & Scale",
    description:
      "Go live with real-time analytics running from day one. We stay on to optimize as your salon grows across locations.",
    image: "/process-launch.png",
    alt: "Salon team celebrating their Gotix launch",
    tag: "Growth",
    icon: <Sparkle className="h-5 w-5" />,
    features: [
      "Real-time analytics",
      "Multi-branch support",
      "AI insights",
      "Revenue optimization"
    ],
    stats: [
      { value: "₹50Cr+", label: "Billing" },
      { value: "40%", label: "Revenue Growth" }
    ],
    cta: "Book Demo"
  },
];

function BookADemoButton({ className, variant = "primary" }: { className?: string; variant?: "primary" | "secondary" }) {
  return (
    <a
      href="#book-a-demo"
      className={cn(
        "group inline-flex items-center gap-3 rounded-full py-3 px-6",
        "text-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
        variant === "primary" 
          ? "bg-[#7C3AED] text-white shadow-[0_10px_24px_-8px_rgba(124,58,237,0.45)] hover:shadow-[0_16px_32px_-12px_rgba(124,58,237,0.55)]"
          : "border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/5",
        className
      )}
    >
      {variant === "primary" ? "Book a Demo" : "Get Started"}
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
    </a>
  );
}

// Hexagon Background Pattern Component
function HexagonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        opacity="0.05"
      >
        <defs>
          <pattern
            id="hexagons"
            width="60"
            height="52"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(0.8)"
          >
            <path
              d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.5"
            />
            <path
              d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.5"
              transform="translate(30, 0)"
            />
            <path
              d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.5"
              transform="translate(-30, 0)"
            />
            <path
              d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.5"
              transform="translate(0, 26)"
            />
            <path
              d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.5"
              transform="translate(30, 26)"
            />
            <path
              d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.5"
              transform="translate(-30, 26)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

// Salon Preview Card Component
function SalonPreviewCard({ step }: { step: ProcessStep }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#5B21B6]/15 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(91,33,182,0.25)]">
      {/* Inner hexagon pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="hexagons-inner"
              width="40"
              height="34.64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20,0 L40,11.55 L40,34.64 L20,46.19 L0,34.64 L0,11.55 Z"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1"
              />
              <path
                d="M20,0 L40,11.55 L40,34.64 L20,46.19 L0,34.64 L0,11.55 Z"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1"
                transform="translate(20, 0)"
              />
              <path
                d="M20,0 L40,11.55 L40,34.64 L20,46.19 L0,34.64 L0,11.55 Z"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1"
                transform="translate(-20, 0)"
              />
              <path
                d="M20,0 L40,11.55 L40,34.64 L20,46.19 L0,34.64 L0,11.55 Z"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1"
                transform="translate(0, 17.32)"
              />
              <path
                d="M20,0 L40,11.55 L40,34.64 L20,46.19 L0,34.64 L0,11.55 Z"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1"
                transform="translate(20, 17.32)"
              />
              <path
                d="M20,0 L40,11.55 L40,34.64 L20,46.19 L0,34.64 L0,11.55 Z"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1"
                transform="translate(-20, 17.32)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons-inner)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header with stats */}
        <div className="mb-4 flex items-center justify-between border-b border-[#5B21B6]/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
              {step.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B1714]">{step.title}</p>
              <p className="text-xs text-[#1B1714]/40">{step.tag}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#7C3AED]">{step.index}</span>
        </div>

        {/* Features */}
        {step.features && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {step.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg bg-[#F7F3EC]/50 px-2 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                <span className="text-xs text-[#1B1714]/70">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {step.stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {step.stats.map((stat, i) => (
              <div key={i} className="rounded-lg bg-[#FAF5FF] p-2.5 text-center">
                <p className="text-lg font-bold text-[#7C3AED]">{stat.value}</p>
                <p className="text-[10px] font-medium text-[#1B1714]/40 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {step.cta && (
          <BookADemoButton variant="secondary" className="w-full justify-center" />
        )}
      </div>
    </div>
  );
}

function StepIndicator({ active, total, current }: { active: number; total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i === current ? "w-8 bg-[#7C3AED]" : "w-4 bg-[#7C3AED]/20"
          )}
        />
      ))}
    </div>
  );
}

export function ProcessSection() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const [active, setActive] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const currentStep = PROCESS_STEPS[active];

  return (
    <section className="relative bg-[#F7F3EC] px-4 py-16 sm:px-6 md:py-24 lg:px-10 overflow-hidden">
      {/* Grain texture */}
      <div
        aria-hidden
        className="hero-editorial__grain pointer-events-none absolute inset-0 opacity-[0.25]"
      />
      
      {/* Hexagon Background */}
      <HexagonBackground />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 text-center md:mb-20">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-1 w-8 rounded-full bg-[#7C3AED]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7C3AED]">
              Gotix Process
            </span>
            <span className="h-1 w-8 rounded-full bg-[#7C3AED]" />
          </div>
          <h2 className="landing-display text-3xl font-semibold text-[#1B1714] md:text-4xl lg:text-5xl">
            No Guesswork. Just a Proven System.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#1B1714]/60 md:text-base">
            Four steps. Zero wasted time. Every move is intentional.
          </p>
        </div>

        {/* Desktop: Horizontal layout with preview */}
        <div className="hidden lg:block">
          {/* Step Navigation */}
          <div className="mb-10 flex items-center justify-between gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <button
                key={step.index}
                onClick={() => setActive(i)}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                className={cn(
                  "group flex flex-1 items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all duration-300",
                  active === i 
                    ? "border-[#7C3AED] bg-white shadow-[0_8px_24px_-8px_rgba(124,58,237,0.2)]" 
                    : "border-transparent bg-white/50 hover:bg-white hover:shadow-[0_4px_16px_-8px_rgba(27,23,20,0.08)]"
                )}
              >
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  active === i 
                    ? "bg-[#7C3AED] text-white" 
                    : "bg-[#7C3AED]/10 text-[#7C3AED] group-hover:bg-[#7C3AED]/20"
                )}>
                  {step.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-semibold tracking-[0.15em] transition-colors duration-300",
                      active === i ? "text-[#7C3AED]" : "text-[#1B1714]/40"
                    )}>
                      {step.index}
                    </span>
                    <span className="text-[10px] text-[#1B1714]/30">•</span>
                    <span className="text-[10px] font-medium text-[#1B1714]/40">{step.tag}</span>
                  </div>
                  <h3 className={cn(
                    "text-sm font-semibold transition-colors duration-300 truncate",
                    active === i ? "text-[#1B1714]" : "text-[#1B1714]/60 group-hover:text-[#1B1714]/80"
                  )}>
                    {step.title}
                  </h3>
                </div>
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                  active === i ? "bg-[#7C3AED]" : "bg-[#7C3AED]/20"
                )} />
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-[1fr,1.1fr] gap-12 items-start">
            {/* Left: Description */}
            <div className="sticky top-8 flex flex-col">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-semibold tracking-[0.15em] text-[#7C3AED]">
                  {`// ${currentStep.index}`}
                </span>
                <span className="rounded-full bg-[#7C3AED]/10 px-3 py-1 text-xs font-medium text-[#7C3AED]">
                  {currentStep.tag}
                </span>
              </div>
              <h3 className="landing-display text-2xl font-semibold text-[#1B1714] md:text-3xl">
                {currentStep.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#1B1714]/65 md:text-base">
                {currentStep.description}
              </p>
              {currentStep.index === "01" && (
                <BookADemoButton className="mt-8 w-fit" />
              )}
              <div className="mt-8">
                <StepIndicator active={active} total={PROCESS_STEPS.length} current={active} />
              </div>
            </div>

            {/* Right: Preview Card */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep.index}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -20 }}
                transition={{ duration: reduced ? 0.12 : 0.4, ease: "easeOut" }}
              >
                <SalonPreviewCard step={currentStep} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile / tablet: stacked list */}
        <div className="flex flex-col gap-12 lg:hidden">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.index}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-[0.15em] text-[#7C3AED]">
                      {step.index}
                    </span>
                    <span className="text-xs text-[#1B1714]/30">•</span>
                    <span className="text-xs font-medium text-[#1B1714]/40">{step.tag}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1B1714]">
                    {step.title}
                  </h3>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#1B1714]/65">
                {step.description}
              </p>
              <SalonPreviewCard step={step} />
              {step.index === "01" && <BookADemoButton className="mt-4 w-full justify-center" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}