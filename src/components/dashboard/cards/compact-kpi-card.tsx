"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type CompactKpiCardProps = {
  label: string;
  value: string;
  href?: string;
  icon: React.ReactNode;
  iconGradient: string;
  delay?: number;
};

function CompactKpiCardContent({
  label,
  value,
  icon,
  iconGradient,
}: Omit<CompactKpiCardProps, "href" | "delay">) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 xl:gap-3 xl:px-3.5 xl:py-3">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm xl:h-9 xl:w-9",
          iconGradient
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium leading-snug text-dashboard-muted sm:text-xs">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-bold leading-tight tracking-tight text-dashboard-text sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );
}

export function CompactKpiCard({
  label,
  value,
  href,
  icon,
  iconGradient,
  delay = 0,
}: CompactKpiCardProps) {
  const card = (
    <DashboardCard
      delay={delay}
      hover={!!href}
      className="h-full border-0 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)]"
    >
      <CompactKpiCardContent
        label={label}
        value={value}
        icon={icon}
        iconGradient={iconGradient}
      />
    </DashboardCard>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full  min-w-0">
        {card}
      </Link>
    );
  }

  return card;
}
