"use client";

import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type {
  getStaffAnalyticsDetails,
  getStaffAnalyticsOverview,
  StaffAnalyticsSearchParams,
} from "@/actions/staff-analytics";

type DetailsData = Awaited<ReturnType<typeof getStaffAnalyticsDetails>>;
type OverviewExtras = Pick<
  Awaited<ReturnType<typeof getStaffAnalyticsOverview>>,
  "utilization" | "attendance" | "productSales" | "customers"
>;

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#E8ECF4] px-4 text-center text-sm text-[#9CA3AF]">
      {message}
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-semibold text-[#1C103D]">{value}</span>
    </div>
  );
}

export function StaffAnalyticsDetailsUi({
  details,
  overviewExtras,
  searchParams,
}: {
  details: DetailsData;
  overviewExtras: OverviewExtras;
  searchParams: StaffAnalyticsSearchParams;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function selectEmployee(employeeId: string) {
    const params = new URLSearchParams();
    params.set("employeeId", employeeId);
    if (searchParams.period) params.set("period", searchParams.period);
    if (searchParams.from) params.set("from", searchParams.from);
    if (searchParams.to) params.set("to", searchParams.to);
    startTransition(() => {
      router.push(`/team/analytics?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[20px] border-[#E8ECF4] xl:col-span-2">
          <CardHeader>
            <CardTitle>Top customers</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {details.customers.rows.length === 0 ? (
              <EmptyBlock message="No customer activity in this period." />
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#EEF1F6] text-left text-[#6B7280]">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4 text-right">Visits</th>
                    <th className="py-2 pr-4 text-right">Revenue</th>
                    <th className="py-2 text-right">Last visit</th>
                  </tr>
                </thead>
                <tbody>
                  {details.customers.rows.map((row) => (
                    <tr key={row.customerId} className="border-b border-[#F3F4F8]">
                      <td className="py-3 pr-4 font-medium">{row.customerName}</td>
                      <td className="py-3 pr-4 text-right">{row.visits}</td>
                      <td className="py-3 pr-4 text-right">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="py-3 text-right">
                        {format(parseISO(row.lastVisit), "MMM d")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Customer performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatLine label="Total customers" value={details.customers.total} />
            <StatLine label="New customers" value={details.customers.new} />
            <StatLine label="Returning" value={details.customers.returning} />
            <StatLine label="Repeat rate" value={`${details.customers.repeatRate}%`} />
          </CardContent>
        </Card>
      </div>

      {details.teamRanking.length > 0 && (
        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Team performance ranking</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#EEF1F6] text-left text-[#6B7280]">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4 text-right">Revenue</th>
                  <th className="py-2 pr-4 text-right">Appointments</th>
                  <th className="py-2 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {details.teamRanking.map((row, index) => (
                  <tr key={row.id} className="border-b border-[#F3F4F8]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#9CA3AF]">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          className="font-medium text-[#1C103D] hover:text-[#6C3BFF]"
                          onClick={() => selectEmployee(row.id)}
                        >
                          {row.name}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="py-3 pr-4 text-right">{row.appointments}</td>
                    <td className="py-3 text-right">
                      {row.utilization != null ? `${row.utilization}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatLine
              label="Booked"
              value={`${Math.round(overviewExtras.utilization.bookedMinutes / 60)}h`}
            />
            <StatLine
              label="Available"
              value={
                overviewExtras.utilization.availableMinutes > 0
                  ? `${Math.round(overviewExtras.utilization.availableMinutes / 60)}h`
                  : "Add shifts to measure"
              }
            />
            <StatLine
              label="Utilization"
              value={
                overviewExtras.utilization.utilizationPercent != null
                  ? `${overviewExtras.utilization.utilizationPercent}%`
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!overviewExtras.attendance.hasData ? (
              <EmptyBlock message="No attendance records in this period." />
            ) : (
              <>
                <StatLine
                  label="Present"
                  value={`${overviewExtras.attendance.daysPresent} days`}
                />
                <StatLine
                  label="Absent"
                  value={`${overviewExtras.attendance.daysAbsent} days`}
                />
                <StatLine
                  label="Late"
                  value={`${overviewExtras.attendance.lateArrivals} times`}
                />
                <StatLine
                  label="Hours worked"
                  value={`${overviewExtras.attendance.hoursWorked}h`}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Retail sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!overviewExtras.productSales.hasData ? (
              <EmptyBlock message="No attributed product sales in this period." />
            ) : (
              <>
                <StatLine
                  label="Product revenue"
                  value={formatCurrency(overviewExtras.productSales.revenue)}
                />
                <StatLine
                  label="Products sold"
                  value={String(overviewExtras.productSales.productsSold)}
                />
                <StatLine
                  label="Average sale"
                  value={formatCurrency(overviewExtras.productSales.averageSale)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Performance insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {details.insights.length === 0 ? (
              <EmptyBlock message="Insights will appear once there is enough activity." />
            ) : (
              details.insights.map((insight) => (
                <p
                  key={insight}
                  className="rounded-xl bg-[#FAFAFF] px-4 py-3 text-sm text-[#4B5563]"
                >
                  {insight}
                </p>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Attention areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {details.alerts.length === 0 ? (
              <EmptyBlock message="No alerts for the selected period." />
            ) : (
              details.alerts.map((alert) => (
                <p
                  key={alert.message}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    alert.type === "warning"
                      ? "bg-amber-50 text-amber-800"
                      : alert.type === "success"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-[#FAFAFF] text-[#4B5563]"
                  }`}
                >
                  {alert.message}
                </p>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
