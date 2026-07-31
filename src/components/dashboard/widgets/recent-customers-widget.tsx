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
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-dashboard-text">Recent Customers</h3>
        <Link
          href="/clients"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="px-6 pb-6">
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
                className="-mx-2 flex items-center justify-between rounded-2xl px-2 py-3 transition-colors hover:bg-dashboard-bg/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-semibold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dashboard-text">{customer.name}</p>
                    <p className="text-xs text-dashboard-muted">
                      {customer.phone || customer.email || "New client"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-dashboard-muted">
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
