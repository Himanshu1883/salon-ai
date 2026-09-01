"use client";

import { motion } from "framer-motion";
import {
  Cake,
  Crown,
  DollarSign,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./mini-sparkline";
import type { ClientSummaryStats } from "./types";

type SummaryCard = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  iconBg: string;
  accent: string;
  sparkline?: number[];
};

type ClientsSummaryCardsProps = {
  stats: ClientSummaryStats;
  isPartialData?: boolean;
};

export function ClientsSummaryCards({
  stats,
  isPartialData,
}: ClientsSummaryCardsProps) {
  const activePct =
    stats.totalClients > 0
      ? Math.round((stats.activeClients / stats.totalClients) * 100)
      : 0;

  const cards: SummaryCard[] = [
    {
      label: "Total Clients",
      value: stats.totalClients,
      icon: <Users className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend: "100%",
      trendUp: true,
      iconBg: "bg-[#EDE9FE]",
      accent: "text-[#6C3BFF]",
      sparkline: stats.growthData.map((d) => d.count + 1),
    },
    {
      label: "Active",
      value: stats.activeClients,
      icon: <UserCheck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend: `${activePct}%`,
      trendUp: activePct > 50,
      iconBg: "bg-emerald-50",
      accent: "text-emerald-600",
      sparkline: [2, 3, 4, 3, 5, 4, stats.activeClients],
    },
    {
      label: "VIP Members",
      value: stats.vipMembers,
      icon: <Crown className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend:
        stats.totalClients > 0
          ? `${Math.round((stats.vipMembers / stats.totalClients) * 100)}%`
          : "—",
      trendUp: true,
      iconBg: "bg-amber-50",
      accent: "text-amber-600",
      sparkline: [1, 1, 2, 2, 2, stats.vipMembers, stats.vipMembers],
    },
    {
      label: "New This Month",
      value: stats.newThisMonth,
      icon: <Sparkles className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend: stats.newThisMonth > 0 ? "+New" : "—",
      trendUp: stats.newThisMonth > 0,
      iconBg: "bg-[#EDE9FE]",
      accent: "text-[#6C3BFF]",
      sparkline: stats.growthData.map((d) => d.count),
    },
    {
      label: "Returning",
      value: stats.returningClients,
      icon: <RefreshCw className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend: stats.returningClients > 0 ? "Repeat" : "—",
      trendUp: stats.returningClients > 0,
      iconBg: "bg-sky-50",
      accent: "text-sky-600",
      sparkline: [1, 2, 2, 3, 3, 4, stats.returningClients],
    },
    {
      label: "Birthday Today",
      value: stats.birthdayToday,
      icon: <Cake className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend: stats.birthdayToday > 0 ? "Celebrate" : "None",
      trendUp: stats.birthdayToday > 0,
      iconBg: "bg-pink-50",
      accent: "text-[#FF2D6F]",
      sparkline: [0, 0, 0, 0, 0, 0, stats.birthdayToday],
    },
    {
      label: "Outstanding Balance",
      value:
        stats.outstandingBalance !== null
          ? formatCurrency(stats.outstandingBalance)
          : "—",
      icon: <Wallet className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend: "Coming soon",
      trendUp: false,
      iconBg: "bg-red-50",
      accent: "text-red-500",
      sparkline: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Lifetime Revenue",
      value: formatCurrency(stats.lifetimeRevenue),
      icon: <DollarSign className="h-3.5 w-3.5 sm:h-5 sm:w-5" />,
      trend: stats.lifetimeRevenue > 0 ? "Total" : "—",
      trendUp: true,
      iconBg: "bg-emerald-50",
      accent: "text-emerald-600",
      sparkline: stats.growthData.map((d, i) =>
        stats.growthData.slice(0, i + 1).reduce((s, x) => s + x.count, 0)
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {isPartialData && (
        <p className="text-[10px] text-[#9CA3AF] sm:text-xs">
          Summary metrics reflect loaded clients on this page.
        </p>
      )}
      <div className="grid min-w-0 grid-cols-4 gap-1 sm:grid-cols-4 sm:gap-3 2xl:grid-cols-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="min-w-0 rounded-lg border border-[#E8ECF4] bg-white p-1.5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] sm:rounded-[20px] sm:p-4"
          >
            <div className="flex items-center justify-between gap-1 sm:items-start sm:gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md sm:h-10 sm:w-10 sm:rounded-xl",
                  card.iconBg,
                  card.accent
                )}
              >
                {card.icon}
              </div>
              <TrendingUp
                className={cn(
                  "hidden h-3.5 w-3.5 sm:block",
                  card.trendUp ? "text-emerald-500" : "text-[#9CA3AF]"
                )}
              />
            </div>
            <p className="mt-1 truncate text-xs font-bold tracking-tight text-[#1C103D] sm:mt-3 sm:text-2xl">
              {card.value}
            </p>
            <p className="mt-0.5 truncate text-[9px] font-medium leading-tight text-[#6B7280] sm:text-xs">
              {card.label}
            </p>
            <p
              className={cn(
                "mt-0.5 hidden text-[10px] font-medium sm:block",
                card.trendUp ? "text-emerald-600" : "text-[#9CA3AF]"
              )}
            >
              {card.trend}
            </p>
            {card.sparkline && (
              <div className="mt-2 hidden sm:block">
                <MiniSparkline data={card.sparkline} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
