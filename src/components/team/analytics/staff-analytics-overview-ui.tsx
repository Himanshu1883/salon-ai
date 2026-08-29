"use client";

import Link from "next/link";
import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import { CalendarClock, TrendingDown, TrendingUp } from "lucide-react";
import { MemberAvatar } from "@/components/team/member-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { getRoleLabel } from "@/lib/team";
import type { getStaffAnalyticsOverview } from "@/actions/staff-analytics";

type OverviewData = Awaited<ReturnType<typeof getStaffAnalyticsOverview>>;

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

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#E8ECF4] px-4 text-center text-sm text-[#9CA3AF]">
      {message}
    </div>
  );
}

export function StaffAnalyticsOverviewUi({ data }: { data: OverviewData }) {
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
    <div className="space-y-4">
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
                <p className="font-semibold">
                  {formatCurrency(data.overview.revenue)}
                </p>
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
                {"hint" in card && card.hint && (
                  <p className="text-[11px] text-[#9CA3AF]">{card.hint}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
                  {formatAppointmentDateTime(
                    data.nextAppointment.scheduledAt,
                    "EEE, MMM d · h:mm a"
                  )}
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
                    <p className="font-medium text-[#1C103D]">
                      {formatAppointmentDateTime(apt.scheduledAt, "EEE, MMM d")}
                    </p>
                    <p className="font-medium text-[#6C3BFF]">
                      {formatAppointmentDateTime(apt.scheduledAt, "h:mm a")}
                    </p>
                    <p className="text-[#6B7280]">{apt.duration} min</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
