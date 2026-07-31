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
      icon: <Users className="h-5 w-5" />,
      trend: "100%",
      trendUp: true,
      iconBg: "bg-[#EDE9FE]",
      accent: "text-[#6C3BFF]",
      sparkline: stats.growthData.map((d) => d.count + 1),
    },
    {
      label: "Active",
      value: stats.activeClients,
      icon: <UserCheck className="h-5 w-5" />,
      trend: `${activePct}%`,
      trendUp: activePct > 50,
      iconBg: "bg-emerald-50",
      accent: "text-emerald-600",
      sparkline: [2, 3, 4, 3, 5, 4, stats.activeClients],
    },
    {
      label: "VIP Members",
      value: stats.vipMembers,
      icon: <Crown className="h-5 w-5" />,
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
      icon: <Sparkles className="h-5 w-5" />,
      trend: stats.newThisMonth > 0 ? "+New" : "—",
      trendUp: stats.newThisMonth > 0,
      iconBg: "bg-[#EDE9FE]",
      accent: "text-[#6C3BFF]",
      sparkline: stats.growthData.map((d) => d.count),
    },
    {
      label: "Returning",
      value: stats.returningClients,
      icon: <RefreshCw className="h-5 w-5" />,
      trend: stats.returningClients > 0 ? "Repeat" : "—",
      trendUp: stats.returningClients > 0,
      iconBg: "bg-sky-50",
      accent: "text-sky-600",
      sparkline: [1, 2, 2, 3, 3, 4, stats.returningClients],
    },
    {
      label: "Birthday Today",
      value: stats.birthdayToday,
      icon: <Cake className="h-5 w-5" />,
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
      icon: <Wallet className="h-5 w-5" />,
      trend: "Coming soon",
      trendUp: false,
      iconBg: "bg-red-50",
      accent: "text-red-500",
      sparkline: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Lifetime Revenue",
      value: formatCurrency(stats.lifetimeRevenue),
      icon: <DollarSign className="h-5 w-5" />,
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
        <p className="text-xs text-[#9CA3AF]">
          Summary metrics reflect loaded clients on this page.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-[20px] border border-[#E8ECF4] bg-white p-4 shadow-[0_4px_24px_rgba(28,16,61,0.05)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  card.iconBg,
                  card.accent
                )}
              >
                {card.icon}
              </div>
              <TrendingUp
                className={cn(
                  "h-3.5 w-3.5",
                  card.trendUp ? "text-emerald-500" : "text-[#9CA3AF]"
                )}
              />
            </div>
            <p className="mt-3 text-xl font-bold tracking-tight text-[#1C103D] sm:text-2xl">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#6B7280]">
              {card.label}
            </p>
            <p
              className={cn(
                "mt-1 text-[10px] font-medium",
                card.trendUp ? "text-emerald-600" : "text-[#9CA3AF]"
              )}
            >
              {card.trend}
            </p>
            {card.sparkline && (
              <div className="mt-2">
                <MiniSparkline data={card.sparkline} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
