"use client";

import { motion } from "framer-motion";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { ERP_MODULES } from "../constants";

export function ModulesSection() {
  return (
    <SectionWrapper id="modules" className="bg-gray-50/50">
      <SectionHeader
        badge="ERP Modules"
        title="26+ Integrated Modules"
        subtitle="Every tool your salon needs — unified in one enterprise platform. No more juggling disconnected apps."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ERP_MODULES.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 8) * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.gradient} shadow-lg`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{mod.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{mod.description}</p>

              {/* Mini mock preview */}
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-2 opacity-60 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <div className={`h-1 flex-1 rounded-full bg-gradient-to-r ${mod.gradient}`} />
                  <div className="h-1 w-4 rounded-full bg-gray-200" />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full rounded bg-gray-200" />
                  <div className="h-1.5 w-3/4 rounded bg-gray-200" />
                </div>
              </div>

              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${mod.gradient} opacity-0 blur-2xl transition group-hover:opacity-10`}
              />
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
