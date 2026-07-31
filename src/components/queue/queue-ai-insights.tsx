"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import type { QueueDashboardStats } from "./types";

type QueueAiInsightsProps = {
  stats: QueueDashboardStats;
};

export function QueueAiInsights({ stats }: QueueAiInsightsProps) {
  const insights: string[] = [];

  if (stats.waiting > 0 && stats.staffAvailable === 0) {
    insights.push(
      "All stylists are busy. New walk-ins will wait longer — consider calling in backup staff."
    );
  }
  if (stats.avgWaitMinutes > 15) {
    insights.push(
      `Average wait is ${stats.avgWaitMinutes} min. Assign waiting customers to available stylists promptly.`
    );
  }
  if (stats.completedToday > stats.completedYesterday && stats.completedYesterday > 0) {
    insights.push(
      "Completion pace is up vs yesterday. Keep momentum during peak hours."
    );
  }
  if (stats.cancelledToday > 2) {
    insights.push(
      `${stats.cancelledToday} cancellations today. Review no-show and cancellation patterns in Reports.`
    );
  }
  if (stats.noShowToday > 0) {
    insights.push(
      `${stats.noShowToday} no-show appointment(s) today. Follow up with SMS reminders for upcoming bookings.`
    );
  }
  if (insights.length === 0) {
    insights.push(
      "Queue operations look healthy. Monitor wait times during the next rush."
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8ECF4] bg-white p-5 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDE9FE]">
          <Lightbulb className="h-4 w-4 text-[#6C3BFF]" />
        </div>
        <h2 className="font-semibold text-[#1C103D]">AI Insights</h2>
        <span className="rounded-full bg-[#F7F8FC] px-2 py-0.5 text-[10px] font-medium text-[#9CA3AF]">
          Rule-based
        </span>
      </div>
      <ul className="space-y-3">
        {insights.map((text, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-2 rounded-xl bg-[#F7F8FC] p-3 text-sm text-[#6B7280]"
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
      className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#EDE9FE] to-[#F7F8FC] px-4 py-3"
    >
      <p className="text-sm text-[#6B7280]">
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
