"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Clock,
  IndianRupee,
  ListOrdered,
  Scissors,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueKpiIconKey, QueueKpiPayload } from "@/lib/queue/overview-types";

type KpiItem = {
  label: string;
  value: string;
  sublabel?: string;
  trend?: number;
  icon: React.ReactNode;
  gradient: string;
  sparkColor: string;
  sparkline?: { v: number }[];
  stub?: boolean;
};

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  const id = color.replace("#", "");
  return (
    <div className="h-10 w-16 shrink-0 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`q-spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#q-spark-${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendPill({ trend }: { trend?: number }) {
  if (trend === undefined) return null;
  return (
    <span
      className={cn(
        "text-[10px] font-medium sm:text-xs",
        trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-[#9CA3AF]"
      )}
    >
      {trend > 0 ? "+" : ""}
      {trend}% vs yesterday
    </span>
  );
}

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="group flex min-w-0 flex-col rounded-xl border border-[#E8ECF4] bg-white p-2 shadow-[0_2px_12px_rgba(28,16,61,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(108,59,255,0.08)] sm:rounded-2xl sm:p-4"
    >
      <div className="flex items-center gap-2 sm:items-start sm:gap-3">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br shadow-sm sm:h-10 sm:w-10 sm:rounded-xl",
            item.gradient
          )}
        >
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium text-[#6B7280] sm:text-xs">
            {item.label}
            {item.stub && " *"}
          </p>
          <p className="text-sm font-bold tracking-tight text-[#1C103D] sm:mt-0.5 sm:text-xl">
            {item.value}
          </p>
        </div>
        {item.sparkline && (
          <div className="hidden sm:block">
            <Sparkline data={item.sparkline} color={item.sparkColor} />
          </div>
        )}
      </div>
      <div className="mt-2 hidden items-center justify-between gap-2 sm:flex">
        {item.sublabel && (
          <p className="truncate text-[11px] text-[#9CA3AF]">{item.sublabel}</p>
        )}
        <TrendPill trend={item.trend} />
      </div>
    </motion.div>
  );
}

const KPI_ICONS: Record<QueueKpiIconKey, React.ReactNode> = {
  waiting: <Users className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  inService: <Scissors className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  completed: <TrendingUp className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  avgWait: <Clock className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  avgService: <Clock className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  walkIns: <ListOrdered className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  appointments: <Calendar className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  cancelled: <XCircle className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  revenue: <IndianRupee className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  staffAvailable: <UserCheck className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  staffBusy: <Users className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
  active: <ListOrdered className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />,
};

function toKpiItem(kpi: QueueKpiPayload): KpiItem {
  return {
    label: kpi.label,
    value: kpi.value,
    sublabel: kpi.sublabel,
    trend: kpi.trend,
    icon: KPI_ICONS[kpi.icon],
    gradient: kpi.gradient,
    sparkColor: kpi.sparkColor,
    sparkline: kpi.sparkline,
  };
}

export function QueueKpiGrid({ kpis }: { kpis?: QueueKpiPayload[] }) {
  const items = (kpis ?? []).map(toKpiItem);

  return (
    <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {items.map((kpi, i) => (
        <KpiCard key={kpi.label} item={kpi} index={i} />
      ))}
    </div>
  );
}
