"use client";

import Link from "next/link";
import { Crown, Cake } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type MembershipSalesWidgetProps = {
  delay?: number;
};

export function MembershipSalesWidget({ delay = 0 }: MembershipSalesWidgetProps) {
  return (
    <DashboardCard delay={delay}>
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-dashboard-text">Membership Sales</h3>
        <Link
          href="/sales/memberships"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Manage
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-3 pb-3 pt-1 text-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
          <Crown className="h-4 w-4" />
        </div>
        <p className="mt-2 text-xs text-dashboard-muted">
          Membership metrics coming soon
        </p>
        <Link
          href="/reports/sales/memberships"
          className="mt-1.5 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View membership reports →
        </Link>
      </div>
    </DashboardCard>
  );
}

type BirthdaysWidgetProps = {
  delay?: number;
};

export function BirthdaysWidget({ delay = 0 }: BirthdaysWidgetProps) {
  return (
    <DashboardCard delay={delay}>
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-dashboard-text">Birthdays</h3>
        <Link
          href="/clients/segments"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Segments
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-3 pb-3 pt-1 text-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-sm">
          <Cake className="h-4 w-4" />
        </div>
        <p className="mt-2 text-xs text-dashboard-muted">
          No upcoming birthdays in the next 7 days
        </p>
        <Link
          href="/clients/segments"
          className="mt-1.5 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Create birthday segment →
        </Link>
      </div>
    </DashboardCard>
  );
}
