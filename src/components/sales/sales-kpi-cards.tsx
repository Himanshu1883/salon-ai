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
      whileHover={{ 
        y: -3, 
        scale: 1.02,
        transition: { duration: 0.2 } 
      }}
      className="group relative overflow-hidden rounded-2xl border border-[#F0F0F0] bg-white p-4 shadow-[0_2px_16px_rgba(28,16,61,0.06)] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(28,16,61,0.12)]"
    >
      {/* Premium gradient accent bar */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-[#6366F1]/5 to-[#8B5CF6]/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
              iconBg,
              iconColor
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              {label}
            </p>
            <p className="text-lg font-bold tracking-tight text-[#1C103D] transition-colors duration-300 group-hover:text-[#6366F1]">
              {value}
            </p>
          </div>
        </div>
        
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all duration-300",
              trend >= 0
                ? "bg-emerald-50/80 text-emerald-600 group-hover:bg-emerald-100"
                : "bg-red-50/80 text-red-500 group-hover:bg-red-100"
            )}
          >
            <TrendingUp
              className={cn(
                "h-3 w-3 transition-transform duration-300", 
                trend < 0 && "rotate-180",
                trend >= 0 && "group-hover:translate-y-[-1px]"
              )}
            />
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>

      {sublabel && (
        <p className="relative mt-1.5 text-xs text-[#6B7280] opacity-80 transition-opacity duration-300 group-hover:opacity-100">
          {sublabel}
        </p>
      )}
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
