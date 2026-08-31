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
    <DashboardCard delay={delay} className="flex h-full flex-col">
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-dashboard-text">Recent Customers</h3>
        <Link
          href="/clients"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="h-[15.5rem] overflow-y-auto overscroll-contain px-3 pb-3">
        {recentCustomers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center">
            <p className="text-xs font-medium text-dashboard-text">No customers yet</p>
            <Link
              href={isEnterprise ? "/check-in" : "/sales/appointments"}
              className="mt-1.5 inline-block text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
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
                className="-mx-1 flex min-w-0 items-center justify-between gap-2 rounded-xl px-1 py-1.5 transition-colors hover:bg-dashboard-bg/80"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-[11px] font-semibold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-dashboard-text">{customer.name}</p>
                    <p className="truncate text-[11px] text-dashboard-muted">
                      {customer.phone || customer.email || "New client"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-dashboard-muted">
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
