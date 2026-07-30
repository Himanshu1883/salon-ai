"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { HERO, IMAGES } from "../constants";
import { MacbookMockup } from "../ui/macbook-mockup";
import { FloatingCards } from "./floating-cards";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Full-screen background */}
      <Image
        src={IMAGES.hero}
        alt="Luxury salon interior with professional styling stations"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center gap-8 px-4 pb-16 pt-28 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:pt-24">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 flex-1 text-center lg:text-left"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            AI-Powered Salon ERP
          </div>

          <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {HERO.heading.split("AI Powered ERP")[0]}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              AI Powered ERP
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-white/80 lg:text-xl">
            {HERO.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {HERO.features.map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm md:text-sm"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500"
            >
              {HERO.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              {HERO.ctaSecondary}
            </Link>
          </div>
        </motion.div>

        {/* Right — MacBook + floating cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full flex-1 lg:max-w-xl"
        >
          <FloatingCards />
          <MacbookMockup variant="dashboard" />
        </motion.div>
      </div>
    </section>
  );
}
