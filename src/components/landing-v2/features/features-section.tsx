"use client";

import { motion } from "framer-motion";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { FEATURES } from "../constants";

export function FeaturesSection() {
  return (
    <SectionWrapper id="features" className="bg-gray-50/50">
      <SectionHeader
        badge="Features"
        title="Everything You Need to Scale"
        subtitle="From front-desk operations to back-office analytics — every feature is designed for salon enterprises."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 4) * 0.05, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-emerald-50 text-violet-600 transition group-hover:from-violet-600 group-hover:to-emerald-500 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
