import Link from "next/link";
import {
  Calendar,
  IndianRupee,
  Package,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ListOrdered,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type DashboardStatsProps = {
  revenueToday: number;
  revenueMonth: number;
  revenueTrend: number;
  todayAppointments: number;
  activeQueue: number;
  waitingCount: number;
  employeesOnDuty: number;
  lowStockCount: number;
  unpaidInvoices: number;
};

type StatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  linkLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: number;
};

function StatCard({
  label,
  value,
  sublabel,
  href,
  linkLabel,
  icon,
  iconBg,
  trend,
}: StatCardProps) {
  const content = (
    <Card className="rounded-xl border-zinc-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              iconBg
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
              {value}
            </p>
            {(sublabel || trend !== undefined || linkLabel) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {trend !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium",
                      trend > 0
                        ? "text-emerald-600"
                        : trend < 0
                          ? "text-red-600"
                          : "text-zinc-500"
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
                  <span className="text-xs text-zinc-500">{sublabel}</span>
                )}
                {linkLabel && href && (
                  <span className="text-xs font-medium text-violet-600">
                    {linkLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function DashboardStats({
  revenueToday,
  revenueMonth,
  revenueTrend,
  todayAppointments,
  activeQueue,
  waitingCount,
  employeesOnDuty,
  lowStockCount,
  unpaidInvoices,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        label="Today's Revenue"
        value={formatCurrency(revenueToday)}
        sublabel={`${formatCurrency(revenueMonth)} this month`}
        href="/sales/daily"
        trend={revenueTrend}
        icon={<IndianRupee className="h-5 w-5 text-violet-600" />}
        iconBg="bg-violet-100"
      />
      <StatCard
        label="Appointments Today"
        value={String(todayAppointments)}
        sublabel={`${todayAppointments} scheduled`}
        href="/sales/appointments"
        linkLabel="View all"
        icon={<Calendar className="h-5 w-5 text-rose-600" />}
        iconBg="bg-rose-100"
      />
      <StatCard
        label="In Queue"
        value={String(activeQueue)}
        sublabel={`${waitingCount} waiting`}
        href="/queue"
        icon={<ListOrdered className="h-5 w-5 text-orange-600" />}
        iconBg="bg-orange-100"
      />
      <StatCard
        label="Staff On Duty"
        value={String(employeesOnDuty)}
        sublabel="Active team members"
        href="/team/members"
        icon={<Users className="h-5 w-5 text-sky-600" />}
        iconBg="bg-sky-100"
      />
      <StatCard
        label="Low Stock Alerts"
        value={String(lowStockCount)}
        sublabel={
          lowStockCount > 0 ? "Items need restocking" : "All stocked"
        }
        href="/inventory/stock"
        icon={<Package className="h-5 w-5 text-red-600" />}
        iconBg="bg-red-100"
      />
      <StatCard
        label="Pending Invoices"
        value={String(unpaidInvoices)}
        sublabel="Awaiting payment"
        href="/billing"
        icon={<FileText className="h-5 w-5 text-emerald-600" />}
        iconBg="bg-emerald-100"
      />
    </div>
  );
}
