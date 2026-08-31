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
  size?: "compact" | "lg";
};

function CompactKpiCardContent({
  label,
  value,
  icon,
  iconGradient,
  size = "compact",
}: Omit<CompactKpiCardProps, "href" | "delay">) {
  const isLg = size === "lg";

  return (
    <div
      className={cn(
        "flex items-center",
        isLg
          ? "gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 xl:px-5 xl:py-4"
          : "items-start gap-2.5 px-3 py-2.5 xl:gap-3 xl:px-3.5 xl:py-3"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-gradient-to-br shadow-sm",
          isLg
            ? "h-9 w-9 rounded-xl sm:h-10 sm:w-10 xl:h-11 xl:w-11"
            : "h-8 w-8 rounded-lg xl:h-9 xl:w-9",
          iconGradient
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            isLg
              ? "text-[11px] font-semibold leading-tight text-dashboard-text sm:text-sm"
              : "text-[11px] font-medium leading-snug text-dashboard-muted sm:text-xs"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "truncate leading-tight tracking-tight",
            isLg
              ? "mt-0.5 truncate text-xs font-bold text-dashboard-text"
              : "mt-0.5 truncate text-sm font-bold text-dashboard-text sm:text-base"
          )}
        >
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
  size = "compact",
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
        size={size}
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
