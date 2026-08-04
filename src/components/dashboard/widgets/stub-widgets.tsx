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
      <div className="flex flex-row items-center justify-between p-4 pb-3 xl:p-6 xl:pb-4">
        <h3 className="text-base font-semibold text-dashboard-text xl:text-lg">Membership Sales</h3>
        <Link
          href="/sales/memberships"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Manage
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-4 pb-6 pt-2 text-center xl:px-6 xl:pb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md xl:h-12 xl:w-12 xl:rounded-2xl">
          <Crown className="h-4 w-4 xl:h-5 xl:w-5" />
        </div>
        <p className="mt-3 text-xl font-bold text-dashboard-text xl:mt-4 xl:text-2xl">—</p>
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
      <div className="flex flex-row items-center justify-between p-4 pb-3 xl:p-6 xl:pb-4">
        <h3 className="text-base font-semibold text-dashboard-text xl:text-lg">Birthdays</h3>
        <Link
          href="/clients/segments"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Segments
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-4 pb-6 pt-2 text-center xl:px-6 xl:pb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md xl:h-12 xl:w-12 xl:rounded-2xl">
          <Cake className="h-4 w-4 xl:h-5 xl:w-5" />
        </div>
        <p className="mt-3 text-sm text-dashboard-muted xl:mt-4">
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
