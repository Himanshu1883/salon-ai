"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { GradientText } from "../ui/gradient-text";
import { AI_FEATURES } from "../constants";

export function AiSection() {
  return (
    <SectionWrapper id="ai" className="overflow-hidden">
      <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 px-8 py-16 md:px-16 md:py-24">
        {/* Glow effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        </div>

        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          {/* Left — AI illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Orbiting rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20 + ring * 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-violet-500/20"
                  style={{
                    width: `${120 + ring * 60}px`,
                    height: `${120 + ring * 60}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}

              {/* Central AI orb */}
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-emerald-500 shadow-2xl shadow-violet-500/40 md:h-52 md:w-52">
                <Bot className="h-16 w-16 text-white md:h-20 md:w-20" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/30 to-emerald-400/30"
                />
              </div>

              {/* Floating particles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute h-2 w-2 rounded-full bg-emerald-400"
                  style={{
                    top: `${20 + i * 12}%`,
                    left: `${10 + (i % 3) * 35}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right — content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
              <Sparkles className="h-4 w-4" />
              AI Intelligence
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Your Salon&apos;s{" "}
              <GradientText className="from-violet-400 via-purple-400 to-emerald-400">
                AI Brain
              </GradientText>
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              Predictive analytics, smart automation, and natural language insights — powered by AI built specifically for salon businesses.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {AI_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-violet-500/30 hover:bg-white/10"
                  >
                    <Icon className="mb-2 h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-xs text-gray-400">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
