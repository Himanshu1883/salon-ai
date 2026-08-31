"use client";

import Link from "next/link";
import { format } from "date-fns";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { usePlan } from "@/components/plans/plan-provider";

type RecentCustomer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: Date;
};

type RecentCustomersWidgetProps = {
  recentCustomers: RecentCustomer[];
  delay?: number;
};

export function RecentCustomersWidget({
  recentCustomers,
  delay = 0,
}: RecentCustomersWidgetProps) {
  const { isEnterprise } = usePlan();

  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 p-4 pb-3 xl:p-6 xl:pb-4">
        <h3 className="min-w-0 truncate text-base font-semibold text-dashboard-text xl:text-lg">Recent Customers</h3>
        <Link
          href="/clients"
          className="shrink-0 text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="px-4 pb-4 xl:px-6 xl:pb-6">
        {recentCustomers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-dashboard-border py-8 text-center">
            <p className="text-sm font-medium text-dashboard-text">No customers yet</p>
            <Link
              href={isEnterprise ? "/check-in" : "/sales/appointments"}
              className="mt-2 inline-block text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              {isEnterprise ? "Check in first client →" : "Book first appointment →"}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dashboard-border">
            {recentCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/clients/${customer.id}`}
                className="-mx-2 flex min-w-0 items-center justify-between gap-2 rounded-2xl px-2 py-3 transition-colors hover:bg-dashboard-bg/80"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-semibold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dashboard-text">{customer.name}</p>
                    <p className="truncate text-xs text-dashboard-muted">
                      {customer.phone || customer.email || "New client"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-dashboard-muted">
                  {format(new Date(customer.createdAt), "MMM d")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
