"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { COMPARISON } from "../constants";

export function ComparisonSection() {
  return (
    <SectionWrapper id="comparison" className="bg-gray-50/50">
      <SectionHeader
        badge="Why Salon AI"
        title="Traditional Salon vs Salon AI ERP"
        subtitle="See why 1,000+ salon owners switched from fragmented tools to a unified enterprise platform."
      />

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Traditional */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <X className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{COMPARISON.traditional.title}</h3>
          </div>
          <ul className="space-y-4">
            {COMPARISON.traditional.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <span className="text-sm text-gray-500">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Salon AI */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-emerald-50/30 p-8 shadow-xl shadow-violet-500/10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500">
              <Check className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{COMPARISON.salonAi.title}</h3>
          </div>
          <ul className="space-y-4">
            {COMPARISON.salonAi.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
