import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { RevenueDay } from "@/actions/dashboard";
import { cn } from "@/lib/utils";

type DashboardRevenueChartProps = {
  data: RevenueDay[];
  revenueMonth: number;
};

export function DashboardRevenueChart({
  data,
  revenueMonth,
}: DashboardRevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const weekTotal = data.reduce((sum, d) => sum + d.revenue, 0);
  const todayKey = format(new Date(), "yyyy-MM-dd");

  return (
    <Card className="rounded-xl border-zinc-100 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Revenue
          </CardTitle>
          <p className="mt-1 text-sm text-zinc-500">Last 7 days</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-3xl font-bold tracking-tight text-zinc-900">
            {formatCurrency(weekTotal)}
          </p>
        </div>

        {weekTotal === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-10 text-center">
            <p className="text-sm font-medium text-zinc-700">No revenue yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Record your first sale to see trends here
            </p>
            <Link
              href="/billing"
              className="mt-4 text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              Create invoice →
            </Link>
          </div>
        ) : (
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-[280px] items-end justify-between gap-2 px-1">
              {data.map((day) => {
                const heightPct = Math.max((day.revenue / maxRevenue) * 100, 8);
                const isToday = day.date === todayKey;
                return (
                  <div
                    key={day.date}
                    className="group flex flex-1 flex-col items-center gap-2"
                  >
                    {day.revenue > 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          isToday ? "text-violet-700" : "text-zinc-400"
                        )}
                      >
                        {formatCurrency(day.revenue)}
                      </span>
                    )}
                    <div className="relative flex h-28 w-full items-end justify-center">
                      <div
                        className={cn(
                          "w-full max-w-[2.25rem] rounded-t-lg transition-opacity group-hover:opacity-80",
                          isToday
                            ? "bg-gradient-to-t from-violet-700 to-violet-500"
                            : "bg-violet-200"
                        )}
                        style={{ height: `${heightPct}%` }}
                        title={`${day.label}: ${formatCurrency(day.revenue)}`}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-medium",
                        isToday ? "text-violet-700" : "text-zinc-500"
                      )}
                    >
                      {isToday ? "Today" : day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-zinc-100 pt-4">
          <p className="text-sm text-zinc-500">
            This month:{" "}
            <span className="font-semibold text-zinc-800">
              {formatCurrency(revenueMonth)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
