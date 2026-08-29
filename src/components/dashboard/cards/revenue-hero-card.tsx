"use client";

import Link from "next/link";
import { TrendingDown, TrendingUp, Minus, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatCurrency } from "@/lib/currency";

type RevenueHeroCardProps = {
  value: string;
  revenueMonth: number;
  revenueTrend: number;
  weekSalesCount: number;
  href?: string;
  delay?: number;
};

function RevenueHeroContent({
  value,
  revenueMonth,
  revenueTrend,
  weekSalesCount,
}: Omit<RevenueHeroCardProps, "href" | "delay">) {
  return (
    <div className="flex h-full min-h-[220px] flex-col justify-between p-5 xl:min-h-[260px] xl:p-6">
      <div>
        <div className="flex items-center gap-2 text-white/75">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <IndianRupee className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Today&apos;s Revenue</span>
        </div>
        <p className="mt-4 text-4xl font-bold tracking-tight text-white xl:text-[2.75rem]">
          {value}
        </p>
        <span
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            revenueTrend > 0
              ? "bg-emerald-400/20 text-emerald-200"
              : revenueTrend < 0
                ? "bg-red-400/20 text-red-200"
                : "bg-white/10 text-white/70"
          )}
        >
          {revenueTrend > 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : revenueTrend < 0 ? (
            <TrendingDown className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
          {revenueTrend > 0 ? "+" : ""}
          {revenueTrend}% vs yesterday
        </span>
      </div>
      <p className="mt-6 border-t border-white/10 pt-4 text-sm text-white/70">
        {formatCurrency(revenueMonth)} this month
        {weekSalesCount > 0 ? ` • ${weekSalesCount} sales this week` : ""}
      </p>
    </div>
  );
}

export function RevenueHeroCard({
  value,
  revenueMonth,
  revenueTrend,
  weekSalesCount,
  href = "/sales/daily",
  delay = 0,
}: RevenueHeroCardProps) {
  const card = (
    <DashboardCard
      delay={delay}
      hover={false}
      className="h-full overflow-hidden border-0 bg-gradient-to-br from-[#4c1d95] via-[#5b21b6] to-[#6d28d9] shadow-xl ring-0"
    >
      <RevenueHeroContent
        value={value}
        revenueMonth={revenueMonth}
        revenueTrend={revenueTrend}
        weekSalesCount={weekSalesCount}
      />
    </DashboardCard>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}
