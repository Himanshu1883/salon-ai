"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  Calendar,
  BarChart3,
  IndianRupee,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { SalesStats } from "./types";

type KpiCardProps = {
  label: string;
  value: string;
  sublabel: string;
  trend?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  delay?: number;
};

function KpiCard({
  label,
  value,
  sublabel,
  trend,
  icon,
  iconBg,
  iconColor,
  delay = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] transition-shadow duration-150 hover:shadow-[0_8px_32px_rgba(28,16,61,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            iconBg,
            iconColor
          )}
        >
          {icon}
        </div>
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            )}
          >
            <TrendingUp
              className={cn("h-3 w-3", trend < 0 && "rotate-180")}
            />
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-[#1C103D]">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#6B7280]">{sublabel}</p>
    </motion.div>
  );
}

type SalesKpiCardsProps = {
  stats: SalesStats;
};

export function SalesKpiCards({ stats }: SalesKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        delay={0}
        label="Total Revenue (INR)"
        value={formatCurrency(stats.totalRevenue)}
        sublabel={`${stats.transactionCount} transaction${stats.transactionCount !== 1 ? "s" : ""}`}
        trend={stats.revenueTrend}
        icon={<IndianRupee className="h-5 w-5" />}
        iconBg="bg-gradient-to-br from-[#6C3CF0] to-[#8B5CF6]"
        iconColor="text-white"
      />
      <KpiCard
        delay={0.05}
        label="Average Order Value"
        value={formatCurrency(stats.avgOrderValue)}
        sublabel="Per transaction"
        trend={stats.aovTrend}
        icon={<Wallet className="h-5 w-5" />}
        iconBg="bg-sky-50"
        iconColor="text-sky-600"
      />
      <KpiCard
        delay={0.1}
        label="Today's Revenue"
        value={formatCurrency(stats.todayRevenue)}
        sublabel={`${stats.todayCount} transaction${stats.todayCount !== 1 ? "s" : ""}`}
        icon={<Calendar className="h-5 w-5" />}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <KpiCard
        delay={0.15}
        label="Monthly Revenue"
        value={formatCurrency(stats.monthRevenue)}
        sublabel="Till date"
        icon={<BarChart3 className="h-5 w-5" />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  );
}
