"use client";

import Link from "next/link";
import { Crown, Cake } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type MembershipSalesWidgetProps = {
  delay?: number;
};

export function MembershipSalesWidget({ delay = 0 }: MembershipSalesWidgetProps) {
  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-dashboard-text">Membership Sales</h3>
        <Link
          href="/sales/memberships"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Manage
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-6 pb-8 pt-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
          <Crown className="h-5 w-5" />
        </div>
        <p className="mt-4 text-2xl font-bold text-dashboard-text">—</p>
        <p className="mt-1 text-sm text-dashboard-muted">
          Membership metrics coming soon
        </p>
        <Link
          href="/reports/sales/memberships"
          className="mt-4 text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
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
    <DashboardCard delay={delay} className="h-full">
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-dashboard-text">Birthdays</h3>
        <Link
          href="/clients/segments"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Segments
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-6 pb-8 pt-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md">
          <Cake className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm text-dashboard-muted">
          No upcoming birthdays in the next 7 days
        </p>
        <Link
          href="/clients/segments"
          className="mt-4 text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Create birthday segment →
        </Link>
      </div>
    </DashboardCard>
  );
}
