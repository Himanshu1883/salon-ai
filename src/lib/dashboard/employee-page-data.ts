import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { cachedRead } from "@/lib/memory-cache";
import { unstable_cache } from "next/cache";
import { salonCacheTag } from "@/lib/salon-cache";
import {
  fetchStaffAnalyticsCharts,
  fetchStaffAnalyticsOverview,
} from "@/lib/analytics/staff-analytics";
import {
  resolveAnalyticsDateRange,
  type AnalyticsPeriod,
} from "@/lib/analytics/date-range";
import {
  currentSalonDayBounds,
  DEFAULT_SALON_TIMEZONE,
  formatZonedTime,
  getBusinessDateKey,
  businessDateFromKey,
} from "@/lib/attendance/business-day";
import { employeeInvoiceFilter } from "@/lib/analytics/staff-analytics-sql";
import { getDataScopeContext } from "@/lib/permissions/data-scope";
import { PermissionDeniedError } from "@/lib/permissions/require";

function formatMinutesLabel(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

async function attributedRevenue(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string
) {
  const employeeFilter = employeeInvoiceFilter(employeeId);
  const rows = await prisma.$queryRaw<{ revenue: number }[]>(Prisma.sql`
    SELECT COALESCE(SUM(li.total), 0)::float AS revenue
    FROM "Invoice" i
    INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
    WHERE i."salonId" = ${salonId}
      AND i.status = 'paid'
      AND i."paidAt" >= ${from}
      AND i."paidAt" <= ${to}
      ${employeeFilter}
  `);
  return rows[0]?.revenue ?? 0;
}

export async function fetchEmployeeDashboardData(params: {
  period?: string;
  from?: string;
  to?: string;
}) {
  const ctx = await getDataScopeContext();
  if (ctx.dataScope !== "own" || !ctx.employeeId) {
    throw new PermissionDeniedError("dashboard.view");
  }

  const employeeId = ctx.employeeId;
  const salonId = ctx.salonId;
  const period = (params.period as AnalyticsPeriod) || "today";
  const range = resolveAnalyticsDateRange(period, params.from, params.to);
  const todayBounds = currentSalonDayBounds();
  const todayDate = businessDateFromKey(getBusinessDateKey());
  const weekRange = resolveAnalyticsDateRange("this_week");
  const monthRange = resolveAnalyticsDateRange("this_month");
  const cacheKey = [
    employeeId,
    period,
    params.from ?? "",
    params.to ?? "",
  ].join(":");

  return cachedRead(
    `employee-dash:${salonId}:${cacheKey}`,
    30,
    () =>
      unstable_cache(
        async () => {
          const [
            todayAppointments,
            attendance,
            todayRevenue,
            weekRevenue,
            monthRevenue,
            weekAppointments,
            monthAppointments,
            overview,
            charts,
            greetingName,
          ] = await Promise.all([
            prisma.appointment.findMany({
              where: {
                salonId,
                employeeId,
                scheduledAt: { gte: todayBounds.start, lte: todayBounds.end },
              },
              select: {
                id: true,
                scheduledAt: true,
                status: true,
                customer: { select: { name: true } },
                service: {
                  select: { name: true, duration: true, price: true },
                },
              },
              orderBy: { scheduledAt: "asc" },
            }),
            prisma.attendanceRecord.findUnique({
              where: {
                employeeId_date: { employeeId, date: todayDate },
              },
              select: {
                checkInAt: true,
                checkOutAt: true,
                totalWorkedMinutes: true,
                status: true,
                lateMinutes: true,
                earlyCheckoutMinutes: true,
              },
            }),
            attributedRevenue(
              salonId,
              todayBounds.start,
              todayBounds.end,
              employeeId
            ),
            attributedRevenue(
              salonId,
              weekRange.from,
              weekRange.to,
              employeeId
            ),
            attributedRevenue(
              salonId,
              monthRange.from,
              monthRange.to,
              employeeId
            ),
            prisma.appointment.count({
              where: {
                salonId,
                employeeId,
                scheduledAt: { gte: weekRange.from, lte: weekRange.to },
                status: { not: "cancelled" },
              },
            }),
            prisma.appointment.count({
              where: {
                salonId,
                employeeId,
                scheduledAt: { gte: monthRange.from, lte: monthRange.to },
                status: { not: "cancelled" },
              },
            }),
            fetchStaffAnalyticsOverview({
              salonId,
              employeeId,
              range,
            }),
            fetchStaffAnalyticsCharts({
              salonId,
              employeeId,
              range,
            }),
            prisma.employee.findFirst({
              where: { id: employeeId, salonId },
              select: { name: true },
            }),
          ]);

          const completedToday = todayAppointments.filter(
            (row) => row.status === "completed"
          );
          const upcomingToday = todayAppointments.filter(
            (row) =>
              row.status !== "cancelled" &&
              row.status !== "no_show" &&
              row.status !== "completed"
          );
          const customersToday = new Set(
            todayAppointments
              .filter((row) => row.status !== "cancelled")
              .map((row) => row.customer.name)
          ).size;
          const durationToday = completedToday.reduce(
            (sum, row) => sum + row.service.duration,
            0
          );
          const workedMinutes =
            attendance?.totalWorkedMinutes ??
            (attendance?.checkInAt
              ? Math.round(
                  ((attendance.checkOutAt ?? new Date()).getTime() -
                    attendance.checkInAt.getTime()) /
                    60000
                )
              : 0);

          const nextAppointment = upcomingToday.find(
            (row) => row.scheduledAt.getTime() >= Date.now()
          ) ?? upcomingToday[0] ?? null;

          return {
            employeeName: greetingName?.name ?? ctx.employeeName ?? "there",
            timezone: DEFAULT_SALON_TIMEZONE,
            period,
            rangeLabel: range.label,
            today: {
              earnings: todayRevenue,
              appointments: todayAppointments.filter(
                (row) => row.status !== "cancelled"
              ).length,
              completedServices: completedToday.length,
              customersServed: customersToday,
              workedMinutes,
              workedLabel: formatMinutesLabel(workedMinutes),
              checkIn: attendance?.checkInAt
                ? formatZonedTime(attendance.checkInAt)
                : null,
              checkOut: attendance?.checkOutAt
                ? formatZonedTime(attendance.checkOutAt)
                : null,
              status: attendance?.status ?? "none",
              lateMinutes: attendance?.lateMinutes ?? 0,
            },
            secondary: {
              weekEarnings: weekRevenue,
              monthEarnings: monthRevenue,
              weekAppointments,
              monthAppointments,
            },
            overview,
            charts,
            schedule: todayAppointments.map((row) => ({
              id: row.id,
              time: formatZonedTime(row.scheduledAt),
              at: row.scheduledAt.toISOString(),
              customer: row.customer.name,
              service: row.service.name,
              price: row.service.price,
              status: row.status,
              duration: row.service.duration,
            })),
            nextAppointment: nextAppointment
              ? {
                  time: formatZonedTime(nextAppointment.scheduledAt),
                  customer: nextAppointment.customer.name,
                  service: nextAppointment.service.name,
                  price: nextAppointment.service.price,
                  status: nextAppointment.status,
                  duration: nextAppointment.service.duration,
                }
              : null,
            averageDurationMinutes:
              completedToday.length > 0
                ? Math.round(durationToday / completedToday.length)
                : 0,
          };
        },
        ["employee-dashboard", salonId, cacheKey],
        {
          revalidate: 30,
          tags: [
            salonCacheTag(salonId, "appointments"),
            salonCacheTag(salonId, "staff-analytics"),
          ],
        }
      )()
  );
}
