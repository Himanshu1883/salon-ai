"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

type QueueAiInsightsProps = {
  insights?: string[];
};

export function QueueAiInsights({ insights }: QueueAiInsightsProps) {
  const items =
    insights && insights.length > 0
      ? insights
      : ["Queue operations look healthy. Monitor wait times during the next rush."];
  return (
    <div className="rounded-xl border border-[#E8ECF4] bg-white p-3 shadow-[0_2px_12px_rgba(28,16,61,0.04)] sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDE9FE]">
          <Lightbulb className="h-4 w-4 text-[#6C3BFF]" />
        </div>
        <h2 className="font-semibold text-[#1C103D]">AI Insights</h2>
        <span className="rounded-full bg-[#F7F8FC] px-2 py-0.5 text-[10px] font-medium text-[#9CA3AF]">
          Rule-based
        </span>
      </div>
      <ul className="space-y-3">
      {items.map((text, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-2 rounded-xl bg-[#F7F8FC] p-2.5 text-xs text-[#6B7280] sm:p-3 sm:text-sm"
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C3BFF]" />
            {text}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function QueueTipBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between gap-2 rounded-xl bg-gradient-to-r from-[#EDE9FE] to-[#F7F8FC] px-3 py-2.5 sm:items-center sm:rounded-2xl sm:px-4 sm:py-3"
    >
      <p className="text-xs leading-snug text-[#6B7280] sm:text-sm">
        <strong className="text-[#6C3BFF]">Tip:</strong> Not seeing a walk-in
        here? Make sure they are added via Check-in.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 text-[#9CA3AF] hover:bg-white/60 hover:text-[#6B7280]"
        aria-label="Dismiss tip"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
