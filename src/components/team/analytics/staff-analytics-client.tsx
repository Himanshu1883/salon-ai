"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Clock,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { exportStaffAnalyticsCsv } from "@/actions/staff-analytics";
import { MemberAvatar } from "@/components/team/member-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { getRoleLabel } from "@/lib/team";
import { ANALYTICS_PERIOD_OPTIONS } from "@/lib/analytics/date-range";
import type { StaffAnalyticsSearchParams } from "@/actions/staff-analytics";

type AnalyticsData = Awaited<
  ReturnType<typeof import("@/actions/staff-analytics").getStaffAnalytics>
>;

const PIE_COLORS = ["#6C3BFF", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"];

function GrowthBadge({ value }: { value: number | null }) {
  if (value == null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        positive ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {positive ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

export function StaffAnalyticsClient({
  data,
  searchParams,
}: {
  data: AnalyticsData;
  searchParams: StaffAnalyticsSearchParams;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState(searchParams.period ?? "this_month");
  const [employeeId, setEmployeeId] = useState(searchParams.employeeId ?? "all");
  const [from, setFrom] = useState(searchParams.from ?? "");
  const [to, setTo] = useState(searchParams.to ?? "");
  const [exporting, setExporting] = useState(false);

  const serviceMix = useMemo(() => {
    const total = data.services.reduce((sum, service) => sum + service.revenue, 0);
    return data.services.slice(0, 5).map((service) => ({
      name: service.serviceName,
      value: service.revenue,
      percent: total > 0 ? Math.round((service.revenue / total) * 100) : 0,
    }));
  }, [data.services]);

  function applyFilters(next?: Partial<StaffAnalyticsSearchParams>) {
    const params = new URLSearchParams();
    const nextEmployee = next?.employeeId ?? employeeId;
    const nextPeriod = next?.period ?? period;
    const nextFrom = next?.from ?? from;
    const nextTo = next?.to ?? to;

    if (nextEmployee && nextEmployee !== "all") params.set("employeeId", nextEmployee);
    if (nextPeriod) params.set("period", nextPeriod);
    if (nextPeriod === "custom" && nextFrom) params.set("from", nextFrom);
    if (nextPeriod === "custom" && nextTo) params.set("to", nextTo);

    startTransition(() => {
      router.push(`/team/analytics?${params.toString()}`);
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportStaffAnalyticsCsv({
        employeeId,
        period,
        from: from || undefined,
        to: to || undefined,
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `staff-analytics-${period}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const overviewCards = [
    {
      label: "Revenue",
      value: formatCurrency(data.overview.revenue),
      growth: data.overview.revenueGrowth,
    },
    {
      label: "Appointments",
      value: String(data.overview.appointments),
      growth: null,
    },
    {
      label: "Customers",
      value: String(data.overview.customers),
      growth: null,
    },
    {
      label: "Utilization",
      value:
        data.overview.utilization != null
          ? `${data.overview.utilization}%`
          : "—",
      growth: null,
      hint: data.overview.utilizationLabel,
    },
    {
      label: "Average Ticket",
      value: formatCurrency(data.overview.averageTicket),
      growth: data.overview.averageTicketGrowth,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/team/members"
            className="mb-3 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#6C3BFF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to team
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6C3BFF]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1C103D] sm:text-3xl">
                Staff Analytics
              </h1>
              <p className="text-sm text-[#6B7280]">{data.range.label}</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={handleExport}
          disabled={exporting || isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <Card className="rounded-[20px] border-[#E8ECF4] shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:p-6">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={employeeId}
                onValueChange={(value) => {
                  setEmployeeId(value);
                  applyFilters({ employeeId: value });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {data.employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date range</Label>
              <Select
                value={period}
                onValueChange={(value) => {
                  setPeriod(value);
                  applyFilters({ period: value });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANALYTICS_PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </>
            )}
          </div>
          {period === "custom" && (
            <Button
              className="rounded-xl bg-[#6C3BFF] hover:bg-[#5B2FE0]"
              onClick={() => applyFilters()}
              disabled={isPending}
            >
              Apply range
            </Button>
          )}
        </CardContent>
      </Card>

      {data.employee && (
        <Card className="rounded-[20px] border-[#E8ECF4] bg-gradient-to-r from-[#FAFAFF] to-white shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <MemberAvatar
                name={data.employee.name}
                avatarUrl={data.employee.avatarUrl}
                className="h-14 w-14 text-base"
              />
              <div>
                <h2 className="text-xl font-semibold text-[#1C103D]">
                  {data.employee.name}
                </h2>
                <p className="text-sm text-[#6B7280]">
                  {getRoleLabel(data.employee.role)}
                  {data.employee.specialties
                    ? ` · ${data.employee.specialties}`
                    : ""}
                </p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {data.employee.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-[#6B7280]">Revenue</p>
                <p className="font-semibold">{formatCurrency(data.overview.revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Appointments</p>
                <p className="font-semibold">{data.overview.appointments}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Customers</p>
                <p className="font-semibold">{data.overview.customers}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Busy</p>
                <p className="font-semibold">
                  {data.overview.utilization != null
                    ? `${data.overview.utilization}%`
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        {overviewCards.map((card) => (
          <Card key={card.label} className="rounded-[20px] border-[#E8ECF4]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-[#6B7280] sm:text-sm">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold tabular-nums text-[#1C103D] sm:text-2xl">
                {card.value}
              </p>
              <div className="mt-1 min-h-[18px]">
                {card.growth != null && <GrowthBadge value={card.growth} />}
                {card.hint && (
                  <p className="text-[11px] text-[#9CA3AF]">{card.hint}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[20px] border-[#E8ECF4] xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue performance</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {data.revenueTrend.length === 0 ? (
              <EmptyBlock message="No paid revenue in this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6C3BFF"
                    fill="#EDE9FE"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Appointment performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatLine label="Total" value={data.appointments.total} />
            <StatLine label="Completed" value={data.appointments.completed} />
            <StatLine label="Upcoming" value={data.appointments.upcoming} />
            <StatLine label="Cancelled" value={data.appointments.cancelled} />
            <StatLine label="No-show" value={data.appointments.noShow} />
            <div className="border-t border-[#EEF1F6] pt-3 text-sm text-[#6B7280]">
              Completion rate: {data.overview.completionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Busy hours</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data.busyHours.length === 0 ? (
              <EmptyBlock message="No appointment activity in this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.busyHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6C3BFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Service mix</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {serviceMix.length === 0 ? (
              <EmptyBlock message="No service revenue in this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                  >
                    {serviceMix.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[20px] border-[#E8ECF4] xl:col-span-2">
          <CardHeader>
            <CardTitle>Top services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.services.length === 0 ? (
              <EmptyBlock message="No service activity in this period." />
            ) : (
              data.services.map((service) => (
                <div
                  key={service.serviceId ?? service.serviceName}
                  className="flex items-center justify-between rounded-xl border border-[#EEF1F6] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[#1C103D]">{service.serviceName}</p>
                    <p className="text-sm text-[#6B7280]">
                      {service.appointments} appointments
                    </p>
                  </div>
                  <p className="font-semibold text-[#6C3BFF]">
                    {formatCurrency(service.revenue)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Customer performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatLine label="Total customers" value={data.customers.total} />
            <StatLine label="New customers" value={data.customers.new} />
            <StatLine label="Returning" value={data.customers.returning} />
            <StatLine label="Repeat rate" value={`${data.customers.repeatRate}%`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Next appointment</CardTitle>
            <Link
              href="/sales/appointments"
              className="text-sm font-medium text-[#6C3BFF] hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {!data.nextAppointment ? (
              <EmptyBlock message="No upcoming appointments." />
            ) : (
              <div className="rounded-2xl border border-[#E8ECF4] bg-[#FAFAFF] p-4">
                <div className="flex items-center gap-2 text-sm text-[#6C3BFF]">
                  <CalendarClock className="h-4 w-4" />
                  {format(parseISO(data.nextAppointment.scheduledAt), "EEE · h:mm a")}
                </div>
                <p className="mt-2 text-lg font-semibold text-[#1C103D]">
                  {data.nextAppointment.customerName}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {data.nextAppointment.serviceName}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#6B7280]">
                  <span>{data.nextAppointment.duration} min</span>
                  <span>{formatCurrency(data.nextAppointment.price)}</span>
                  {data.nextAppointment.employeeName && (
                    <span>{data.nextAppointment.employeeName}</span>
                  )}
                </div>
                <Button asChild className="mt-4 rounded-xl" size="sm">
                  <Link href="/sales/appointments">View appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#E8ECF4]">
          <CardHeader>
            <CardTitle>Upcoming schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming.length === 0 ? (
              <EmptyBlock message="No upcoming appointments scheduled." />
            ) : (
              data.upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[#EEF1F6] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[#1C103D]">{apt.customerName}</p>
                    <p className="text-sm text-[#6B7280]">{apt.serviceName}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-[#6C3BFF]">
                      {format(parseISO(apt.scheduledAt), "h:mm a")}
                    </p>
                    <p className="text-[#6B7280]">{apt.duration} min</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {data.teamRanking.length > 0 && (
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
                {data.teamRanking.map((row, index) => (
                  <tr key={row.id} className="border-b border-[#F3F4F8]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#9CA3AF]">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          className="font-medium text-[#1C103D] hover:text-[#6C3BFF]"
                          onClick={() => applyFilters({ employeeId: row.id })}
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
              value={`${Math.round(data.utilization.bookedMinutes / 60)}h`}
            />
            <StatLine
              label="Available"
              value={
                data.utilization.availableMinutes > 0
                  ? `${Math.round(data.utilization.availableMinutes / 60)}h`
                  : "Add shifts to measure"
              }
            />
            <StatLine
              label="Utilization"
              value={
                data.utilization.utilizationPercent != null
                  ? `${data.utilization.utilizationPercent}%`
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
            {!data.attendance.hasData ? (
              <EmptyBlock message="No attendance records in this period." />
            ) : (
              <>
                <StatLine label="Present" value={`${data.attendance.daysPresent} days`} />
                <StatLine label="Absent" value={`${data.attendance.daysAbsent} days`} />
                <StatLine label="Late" value={`${data.attendance.lateArrivals} times`} />
                <StatLine
                  label="Hours worked"
                  value={`${data.attendance.hoursWorked}h`}
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
            {!data.productSales.hasData ? (
              <EmptyBlock message="No attributed product sales in this period." />
            ) : (
              <>
                <StatLine
                  label="Product revenue"
                  value={formatCurrency(data.productSales.revenue)}
                />
                <StatLine
                  label="Products sold"
                  value={String(data.productSales.productsSold)}
                />
                <StatLine
                  label="Average sale"
                  value={formatCurrency(data.productSales.averageSale)}
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
            {data.insights.length === 0 ? (
              <EmptyBlock message="Insights will appear once there is enough activity." />
            ) : (
              data.insights.map((insight) => (
                <p key={insight} className="rounded-xl bg-[#FAFAFF] px-4 py-3 text-sm text-[#4B5563]">
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
            {data.alerts.length === 0 ? (
              <EmptyBlock message="No alerts for the selected period." />
            ) : (
              data.alerts.map((alert) => (
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

      <Card className="rounded-[20px] border-[#E8ECF4]">
        <CardHeader>
          <CardTitle>Top customers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {data.customers.rows.length === 0 ? (
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
                {data.customers.rows.map((row) => (
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

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#E8ECF4] px-4 text-center text-sm text-[#9CA3AF]">
      {message}
    </div>
  );
}
