"use client";

import Link from "next/link";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type SparklinePoint = { value: number };

type KpiCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  icon: React.ReactNode;
  iconGradient: string;
  trend?: number;
  sparkline?: SparklinePoint[];
  delay?: number;
};

function MiniSparkline({ data }: { data: SparklinePoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-8 items-end gap-0.5">
      {data.map((point, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-dashboard-primary to-dashboard-secondary opacity-80"
          style={{ height: `${Math.max((point.value / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

function KpiCardContent({
  label,
  value,
  sublabel,
  icon,
  iconGradient,
  trend,
  sparkline,
}: Omit<KpiCardProps, "href" | "delay">) {
  return (
    <div className="flex items-start gap-4 p-5">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm",
          iconGradient
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-dashboard-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-dashboard-text">
          {value}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {trend !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  trend > 0
                    ? "text-dashboard-success"
                    : trend < 0
                      ? "text-dashboard-danger"
                      : "text-dashboard-muted"
                )}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {trend > 0 ? "+" : ""}
                {trend}% vs yesterday
              </span>
            )}
            {sublabel && (
              <p className="mt-0.5 text-xs text-dashboard-muted">{sublabel}</p>
            )}
          </div>
          {sparkline && sparkline.length > 0 && (
            <MiniSparkline data={sparkline} />
          )}
        </div>
      </div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sublabel,
  href,
  icon,
  iconGradient,
  trend,
  sparkline,
  delay = 0,
}: KpiCardProps) {
  const card = (
    <DashboardCard delay={delay} className="h-full">
      <KpiCardContent
        label={label}
        value={value}
        sublabel={sublabel}
        icon={icon}
        iconGradient={iconGradient}
        trend={trend}
        sparkline={sparkline}
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
