"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AI_SECTION, IMAGES } from "../constants";
import { SectionWrapper } from "../ui/section-wrapper";
import { DashboardMockup } from "../ui/dashboard-mockup";
import { GradientText } from "../ui/gradient-text";

export function AiSection() {
  return (
    <SectionWrapper id="ai" dark className="overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — AI illustration area */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
              <Sparkles className="h-4 w-4" />
              Artificial Intelligence
            </div>
            <h2 className="font-serif text-3xl font-bold text-white md:text-5xl lg:text-6xl">
              <GradientText variant="purple">{AI_SECTION.heading}</GradientText>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-300 md:text-xl">
              {AI_SECTION.subtitle}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {AI_SECTION.features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                  >
                    <Icon className="mb-3 h-6 w-6 text-purple-400" />
                    <h3 className="font-semibold text-white">{f.title}</h3>
                    <p className="mt-1 text-sm text-gray-400">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right — AI dashboard + salon image */}
          <div className="relative">
            <div className="relative mb-6 h-48 overflow-hidden rounded-2xl md:h-64">
              <Image
                src={IMAGES.hairStyling}
                alt="AI-powered salon styling session"
                fill
                className="object-cover opacity-60"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 to-transparent" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-8 rounded-full bg-purple-500/20 blur-2xl" />
                  <Sparkles className="relative h-16 w-16 text-purple-400 md:h-24 md:w-24" />
                </div>
              </motion.div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-900/30">
              <div className="bg-purple-900/50 px-4 py-2 text-xs text-purple-300">
                AI Analytics Dashboard
              </div>
              <DashboardMockup variant="analytics" />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
