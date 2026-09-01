"use client";

import { IndianRupee, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { BillingStats } from "./types";

type KpiCardProps = {
  label: string;
  compactLabel?: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  iconBg: string;
  active?: boolean;
  onClick?: () => void;
};

function KpiCard({
  label,
  compactLabel,
  value,
  sublabel,
  icon,
  iconBg,
  active = false,
  onClick,
}: KpiCardProps) {
  const clickable = Boolean(onClick);

  return (
    <div
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
        "min-w-0 rounded-xl border bg-white p-1.5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] transition-shadow duration-150 sm:rounded-2xl sm:p-5",
        clickable &&
          "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(28,16,61,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CF0]/40",
        active
          ? "border-[#6C3CF0] ring-2 ring-[#6C3CF0]/20"
          : "border-[#ECECEC]"
      )}
    >
      <div className="flex items-center gap-1.5 sm:block">
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md sm:mb-0 sm:h-11 sm:w-11 sm:rounded-xl",
            iconBg
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 sm:mt-4">
          <p className="truncate text-sm font-bold tracking-tight text-[#1C103D] sm:text-2xl">
            {value}
          </p>
          <p className="truncate text-[8px] font-medium uppercase tracking-wide text-[#9CA3AF] sm:mt-0.5 sm:text-xs">
            <span className="sm:hidden">{compactLabel ?? label}</span>
            <span className="hidden sm:inline">{label}</span>
          </p>
          {sublabel ? (
            <p className="mt-0.5 hidden text-sm text-[#6B7280] sm:block">{sublabel}</p>
          ) : null}
        </div>
      </div>
    </div>
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
    <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-4">
      <KpiCard
        label="Revenue today"
        compactLabel="Today"
        value={stats.revenueTodayLabel ?? formatCurrency(stats.revenueToday)}
        sublabel="Collected today"
        icon={<IndianRupee className="h-3.5 w-3.5 text-emerald-600 sm:h-5 sm:w-5" />}
        iconBg="bg-emerald-50"
      />
      <KpiCard
        label="This month"
        compactLabel="Month"
        value={stats.revenueMonthLabel ?? formatCurrency(stats.revenueMonth)}
        sublabel="Month to date"
        icon={<IndianRupee className="h-3.5 w-3.5 text-violet-600 sm:h-5 sm:w-5" />}
        iconBg="bg-violet-50"
      />
      <KpiCard
        label="Unpaid"
        value={String(stats.unpaidCount)}
        sublabel={
          stats.unpaidSublabel ??
          (stats.unpaidCount > 0 ? "Awaiting payment" : "All clear")
        }
        icon={<FileText className="h-3.5 w-3.5 text-amber-600 sm:h-5 sm:w-5" />}
        iconBg="bg-amber-50"
        active={activeStatusFilter === "unpaid"}
        onClick={onUnpaidClick}
      />
    </div>
  );
}
