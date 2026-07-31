"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { ReportsDashboardMetrics } from "@/components/reports/reports-bi-dashboard";

type Props = {
  metrics: ReportsDashboardMetrics;
};

export function ReportsAiInsights({ metrics }: Props) {
  const insights: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
    href?: string;
    color: string;
  }[] = [];

  if (metrics.revenueTrend > 0) {
    insights.push({
      icon: TrendingUp,
      title: "Revenue is trending up",
      body: `Today's revenue is ${metrics.revenueTrend}% higher than yesterday. Keep momentum with targeted promotions.`,
      href: "/reports/finance/revenue-summary",
      color: "text-emerald-600 bg-emerald-50",
    });
  } else if (metrics.revenueTrend < 0) {
    insights.push({
      icon: AlertCircle,
      title: "Revenue dip detected",
      body: `Revenue is down ${Math.abs(metrics.revenueTrend)}% vs yesterday. Review appointment fill rate and walk-in traffic.`,
      href: "/reports/sales/by-period",
      color: "text-amber-600 bg-amber-50",
    });
  }

  if (metrics.noShowCount > 2) {
    insights.push({
      icon: AlertCircle,
      title: "No-show pattern",
      body: `${metrics.noShowCount} no-shows this month. Consider SMS reminders or deposit policies.`,
      href: "/reports/appointments/no-shows",
      color: "text-rose-600 bg-rose-50",
    });
  }

  if (metrics.lowStockCount > 0) {
    insights.push({
      icon: Lightbulb,
      title: "Restock recommended",
      body: `${metrics.lowStockCount} products are below reorder level. Review purchase history to avoid stockouts.`,
      href: "/reports/inventory/low-stock",
      color: "text-orange-600 bg-orange-50",
    });
  }

  if (metrics.newCustomersMonth > 0) {
    insights.push({
      icon: Sparkles,
      title: "New client growth",
      body: `${metrics.newCustomersMonth} new clients joined this month. Average bill is ${metrics.avgBill > 0 ? formatCurrency(metrics.avgBill) : "—"}.`,
      href: "/reports/clients/new-clients",
      color: "text-[#6C3BFF] bg-[#EDE9FE]",
    });
  }

  if (metrics.staffUtilization < 60 && metrics.employeesOnDuty > 0) {
    insights.push({
      icon: Lightbulb,
      title: "Staff capacity available",
      body: `Staff utilization is at ${metrics.staffUtilization}%. Consider promotions to fill open slots.`,
      href: "/reports/team/shift-hours",
      color: "text-indigo-600 bg-indigo-50",
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: Sparkles,
      title: "All systems healthy",
      body: "Your salon metrics look stable. Explore detailed reports for deeper analysis.",
      href: "/reports/sales/summary",
      color: "text-[#6C3BFF] bg-[#EDE9FE]",
    });
  }

  return (
    <section className="rounded-2xl border border-[#E8ECF4] bg-white p-5 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C3BFF] to-[#8B5CF6]">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#1C103D]">AI Insights</h2>
          <p className="text-xs text-[#9CA3AF]">Derived from your salon data — no external AI calls</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.slice(0, 3).map((insight, i) => {
          const Icon = insight.icon;
          const [textColor, bgColor] = insight.color.split(" ");
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-[#E8ECF4] bg-[#F7F8FC] p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${textColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[#1C103D]">{insight.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{insight.body}</p>
                  {insight.href && (
                    <Link
                      href={insight.href}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#6C3BFF] hover:underline"
                    >
                      View report
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
