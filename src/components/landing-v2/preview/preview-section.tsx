"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { BrowserMockup } from "../ui/macbook-mockup";
import { DashboardMockup } from "../ui/dashboard-mockup";
import { PREVIEW_TABS, type PreviewTab } from "../constants";
import { cn } from "@/lib/utils";

export function PreviewSection() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("Dashboard");

  return (
    <SectionWrapper id="preview">
      <SectionHeader
        badge="Live Preview"
        title="See Salon AI in Action"
        subtitle="Explore every module with our interactive ERP preview. Switch tabs to see different views."
      />

      <BrowserMockup className="mx-auto max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-[360px] p-1 sm:min-h-[420px]"
          >
            <DashboardMockup variant={activeTab} className="h-full min-h-[350px] sm:min-h-[410px]" />
          </motion.div>
        </AnimatePresence>
      </BrowserMockup>

      <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2">
        {PREVIEW_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                : "border border-gray-200 bg-white text-gray-600 hover:border-violet-200 hover:bg-violet-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </SectionWrapper>
  );
}
