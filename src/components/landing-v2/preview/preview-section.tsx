"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PREVIEW_TABS } from "../constants";
import { SectionWrapper } from "../ui/section-wrapper";
import { MonitorMockup } from "../ui/monitor-mockup";
import { cn } from "@/lib/utils";

type TabId = "dashboard" | "appointment" | "billing" | "crm" | "inventory" | "marketing" | "reports" | "analytics";

export function PreviewSection() {
  const [active, setActive] = useState<TabId>("dashboard");
  const current = PREVIEW_TABS.find((t) => t.id === active)!;

  return (
    <SectionWrapper id="preview" className="bg-white">
      <div className="mx-auto max-w-[95vw] px-4 lg:max-w-7xl lg:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-purple-600">
            Platform Preview
          </p>
          <h2 className="font-serif text-3xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            See It In Action
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Explore every corner of your salon command center.
          </p>
        </div>

        {/* Huge monitor mockup */}
        <div className="relative mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <MonitorMockup variant={active} className="scale-100 md:scale-105" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 md:mt-14">
          {PREVIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id as TabId)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                active === tab.id
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-8 text-center"
          >
            <h3 className="text-xl font-bold text-gray-900 md:text-2xl">{current.title}</h3>
            <p className="mx-auto mt-2 max-w-lg text-gray-600">{current.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
