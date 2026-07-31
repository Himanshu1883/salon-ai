"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type AiInsightsWidgetProps = {
  revenueToday: number;
  todayAppointments: number;
  waitingCount: number;
  delay?: number;
};

export function AiInsightsWidget({
  revenueToday,
  todayAppointments,
  waitingCount,
  delay = 0,
}: AiInsightsWidgetProps) {
  let insight = "Your salon is ready for the day. Use AI scheduling to optimize time slots.";

  if (waitingCount > 3) {
    insight = `${waitingCount} clients are waiting — consider opening another chair or adjusting walk-in flow.`;
  } else if (todayAppointments > 5 && revenueToday === 0) {
    insight = `You have ${todayAppointments} appointments today but no sales recorded yet. Capture revenue as services complete.`;
  } else if (todayAppointments === 0) {
    insight = "No appointments booked today. AI scheduling can help fill gaps in your calendar.";
  } else if (revenueToday > 0) {
    insight = "Strong start today. AI scheduling can suggest optimal slots for walk-ins between appointments.";
  }

  return (
    <DashboardCard delay={delay} className="h-full">
      <Link
        href="/schedule/ai"
        className="flex h-full flex-col justify-between p-6 transition-colors hover:bg-violet-50/30"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200/60">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-dashboard-text">AI Insights</h3>
            <p className="mt-2 text-sm leading-relaxed text-dashboard-muted">{insight}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-dashboard-primary">
          Open AI scheduler
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </DashboardCard>
  );
}
