"use client";

import { motion } from "framer-motion";
import { IndianRupee, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { BillingStats } from "./types";

type KpiCardProps = {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  iconBg: string;
  delay?: number;
  active?: boolean;
  onClick?: () => void;
};

function KpiCard({
  label,
  value,
  sublabel,
  icon,
  iconBg,
  delay = 0,
  active = false,
  onClick,
}: KpiCardProps) {
  const clickable = Boolean(onClick);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={clickable ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] transition-shadow duration-150",
        clickable &&
          "cursor-pointer hover:shadow-[0_8px_32px_rgba(28,16,61,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CF0]/40",
        active
          ? "border-[#6C3CF0] ring-2 ring-[#6C3CF0]/20"
          : "border-[#ECECEC]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            iconBg
          )}
        >
          {icon}
        </div>
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

type BillingKpiCardsProps = {
  stats: BillingStats;
  activeStatusFilter?: string;
  onUnpaidClick?: () => void;
};

export function BillingKpiCards({
  stats,
  activeStatusFilter = "all",
  onUnpaidClick,
}: BillingKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <KpiCard
        delay={0}
        label="Revenue today"
        value={stats.revenueTodayLabel ?? formatCurrency(stats.revenueToday)}
        sublabel="Collected today"
        icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
        iconBg="bg-emerald-50"
      />
      <KpiCard
        delay={0.05}
        label="This month"
        value={stats.revenueMonthLabel ?? formatCurrency(stats.revenueMonth)}
        sublabel="Month to date"
        icon={<IndianRupee className="h-5 w-5 text-violet-600" />}
        iconBg="bg-violet-50"
      />
      <KpiCard
        delay={0.1}
        label="Unpaid"
        value={String(stats.unpaidCount)}
        sublabel={
          stats.unpaidSublabel ??
          (stats.unpaidCount > 0 ? "Awaiting payment" : "All clear")
        }
        icon={<FileText className="h-5 w-5 text-amber-600" />}
        iconBg="bg-amber-50"
        active={activeStatusFilter === "unpaid"}
        onClick={onUnpaidClick}
      />
    </div>
  );
}
