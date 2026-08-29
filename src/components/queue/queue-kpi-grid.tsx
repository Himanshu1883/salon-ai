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
        "text-xs font-medium",
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
      className="group flex flex-col rounded-2xl border border-[#E8ECF4] bg-white p-3.5 shadow-[0_2px_12px_rgba(28,16,61,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(108,59,255,0.08)] sm:p-4"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
            item.gradient
          )}
        >
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#6B7280] sm:text-xs">
            {item.label}
            {item.stub && " *"}
          </p>
          <p className="mt-0.5 text-lg font-bold tracking-tight text-[#1C103D] sm:text-xl">
            {item.value}
          </p>
        </div>
        {item.sparkline && <Sparkline data={item.sparkline} color={item.sparkColor} />}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {item.sublabel && (
          <p className="truncate text-[11px] text-[#9CA3AF]">{item.sublabel}</p>
        )}
        <TrendPill trend={item.trend} />
      </div>
    </motion.div>
  );
}

const KPI_ICONS: Record<QueueKpiIconKey, React.ReactNode> = {
  waiting: <Users className="h-5 w-5 text-white" />,
  inService: <Scissors className="h-5 w-5 text-white" />,
  completed: <TrendingUp className="h-5 w-5 text-white" />,
  avgWait: <Clock className="h-5 w-5 text-white" />,
  avgService: <Clock className="h-5 w-5 text-white" />,
  walkIns: <ListOrdered className="h-5 w-5 text-white" />,
  appointments: <Calendar className="h-5 w-5 text-white" />,
  cancelled: <XCircle className="h-5 w-5 text-white" />,
  revenue: <IndianRupee className="h-5 w-5 text-white" />,
  staffAvailable: <UserCheck className="h-5 w-5 text-white" />,
  staffBusy: <Users className="h-5 w-5 text-white" />,
  active: <ListOrdered className="h-5 w-5 text-white" />,
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {items.map((kpi, i) => (
        <KpiCard key={kpi.label} item={kpi} index={i} />
      ))}
    </div>
  );
}
