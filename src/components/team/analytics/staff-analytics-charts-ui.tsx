"use client";

import { useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { getStaffAnalyticsCharts } from "@/actions/staff-analytics";
import type { getStaffAnalyticsOverview } from "@/actions/staff-analytics";

type ChartsData = Awaited<ReturnType<typeof getStaffAnalyticsCharts>>;
type AppointmentsSummary = Awaited<
  ReturnType<typeof getStaffAnalyticsOverview>
>["appointments"];
type OverviewSummary = Awaited<
  ReturnType<typeof getStaffAnalyticsOverview>
>["overview"];

const PIE_COLORS = ["#6C3BFF", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"];

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

export function StaffAnalyticsChartsUi({
  charts,
  appointments,
  overview,
}: {
  charts: ChartsData;
  appointments: AppointmentsSummary;
  overview: OverviewSummary;
}) {
  const serviceMix = useMemo(() => {
    const total = charts.services.reduce((sum, service) => sum + service.revenue, 0);
    return charts.services.slice(0, 5).map((service) => ({
      name: service.serviceName,
      value: service.revenue,
      percent: total > 0 ? Math.round((service.revenue / total) * 100) : 0,
    }));
  }, [charts.services]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[20px] border-[#E8ECF4] xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue performance</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {charts.revenueTrend.length === 0 ? (
              <EmptyBlock message="No paid revenue in this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueTrend}>
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
            <StatLine label="Total" value={appointments.total} />
            <StatLine label="Completed" value={appointments.completed} />
            <StatLine label="Upcoming" value={appointments.upcoming} />
            <StatLine label="Cancelled" value={appointments.cancelled} />
            <StatLine label="No-show" value={appointments.noShow} />
            <div className="border-t border-[#EEF1F6] pt-3 text-sm text-[#6B7280]">
              Completion rate: {overview.completionRate}%
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
            {charts.busyHours.length === 0 ? (
              <EmptyBlock message="No appointment activity in this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.busyHours}>
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

      <Card className="rounded-[20px] border-[#E8ECF4]">
        <CardHeader>
          <CardTitle>Top services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {charts.services.length === 0 ? (
            <EmptyBlock message="No service activity in this period." />
          ) : (
            charts.services.map((service) => (
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
    </div>
  );
}
