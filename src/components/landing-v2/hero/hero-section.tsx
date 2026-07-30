"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { GradientText } from "../ui/gradient-text";
import { MacBookMockup } from "../ui/macbook-mockup";
import { FloatingCards } from "./floating-cards";
import { CUSTOMER_LOGOS, HERO_FEATURES } from "../constants";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.08),transparent_70%)]" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/80 px-4 py-1.5 text-sm font-medium text-violet-700 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              AI Powered Salon ERP Platform
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-[3.5rem]">
              Run Your Entire Salon with{" "}
              <GradientText>AI Powered ERP</GradientText>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-500">
              One enterprise platform for{" "}
              {HERO_FEATURES.slice(0, 6).join(", ")},{" "}
              and more — built for modern salon businesses.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {HERO_FEATURES.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition hover:shadow-violet-500/40"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
              >
                Book Demo
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 border-t border-gray-100 pt-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">4.9/5</span>
                <span className="text-sm text-gray-400">from 500+ reviews</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {CUSTOMER_LOGOS.map((logo) => (
                  <span key={logo} className="text-sm font-semibold text-gray-300">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — MacBook + floating cards */}
          <div className="relative">
            <FloatingCards />
            <MacBookMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
