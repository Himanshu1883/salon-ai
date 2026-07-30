"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ERP_MODULES } from "../constants";
import { SectionWrapper } from "../ui/section-wrapper";
import { DashboardMockup } from "../ui/dashboard-mockup";

export function ModulesSection() {
  return (
    <SectionWrapper id="modules" className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Complete ERP Suite
          </p>
          <h2 className="font-serif text-3xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            22 Modules. One Platform.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Every tool your salon needs — from first appointment to final invoice.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ERP_MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 4) * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100 transition-shadow hover:shadow-xl"
              >
                {/* Large lifestyle image */}
                <div className="relative h-44 overflow-hidden md:h-52 lg:h-56">
                  <Image
                    src={mod.image}
                    alt={mod.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Mini ERP mock overlay */}
                  <div className="absolute bottom-3 right-3 w-[45%] overflow-hidden rounded-lg border border-white/30 shadow-lg">
                    <DashboardMockup variant={mod.id === "appointments" ? "appointment" : mod.id === "billing" || mod.id === "pos" ? "billing" : mod.id === "crm" || mod.id === "customers" ? "crm" : mod.id === "inventory" ? "inventory" : mod.id === "marketing" ? "marketing" : mod.id === "reports" ? "reports" : mod.id === "analytics" ? "analytics" : "dashboard"} compact />
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{mod.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{mod.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
