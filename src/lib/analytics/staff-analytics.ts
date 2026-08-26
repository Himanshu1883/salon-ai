import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  format,
  startOfDay,
} from "date-fns";
import type { AnalyticsDateRange } from "./date-range";
import { growthPercent } from "./date-range";

export type StaffAnalyticsFilters = {
  salonId: string;
  employeeId: string | null;
  range: AnalyticsDateRange;
};

type RevenueRow = {
  employeeId: string;
  revenue: number;
  invoiceCount: number;
};

type DailyRevenueRow = {
  day: Date;
  revenue: number;
};

type HourBucket = {
  hour: number;
  count: number;
};

type ServiceRow = {
  serviceId: string | null;
  serviceName: string;
  appointments: number;
  revenue: number;
};

type CustomerRow = {
  customerId: string;
  customerName: string;
  visits: number;
  revenue: number;
  lastVisit: string;
};

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function shiftMinutes(startTime?: string | null, endTime?: string | null) {
  if (!startTime || !endTime) return 0;
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return Math.max(0, end - start);
}

async function getAttributedRevenueBothPeriods(
  salonId: string,
  from: Date,
  to: Date,
  prevFrom: Date,
  prevTo: Date,
  employeeId: string | null
): Promise<{ current: RevenueRow[]; previous: RevenueRow[] }> {
  const employeeFilter = employeeId
    ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
    : Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") IS NOT NULL`;

  const rangeStart =
    prevFrom.getTime() < from.getTime() ? prevFrom : from;
  const rangeEnd = prevTo.getTime() > to.getTime() ? prevTo : to;

  const rows = await prisma.$queryRaw<
    {
      employeeId: string;
      currentRevenue: number;
      currentInvoiceCount: bigint;
      previousRevenue: number;
      previousInvoiceCount: bigint;
    }[]
  >(Prisma.sql`
    SELECT
      COALESCE(li."employeeId", i."employeeId") AS "employeeId",
      SUM(CASE WHEN i."paidAt" >= ${from} AND i."paidAt" <= ${to} THEN li.total ELSE 0 END)::float AS "currentRevenue",
      COUNT(DISTINCT CASE WHEN i."paidAt" >= ${from} AND i."paidAt" <= ${to} THEN i.id END)::bigint AS "currentInvoiceCount",
      SUM(CASE WHEN i."paidAt" >= ${prevFrom} AND i."paidAt" <= ${prevTo} THEN li.total ELSE 0 END)::float AS "previousRevenue",
      COUNT(DISTINCT CASE WHEN i."paidAt" >= ${prevFrom} AND i."paidAt" <= ${prevTo} THEN i.id END)::bigint AS "previousInvoiceCount"
    FROM "Invoice" i
    INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
    WHERE i."salonId" = ${salonId}
      AND i.status = 'paid'
      AND i."paidAt" >= ${rangeStart}
      AND i."paidAt" <= ${rangeEnd}
      ${employeeFilter}
    GROUP BY COALESCE(li."employeeId", i."employeeId")
  `);

  return {
    current: rows.map((row) => ({
      employeeId: row.employeeId,
      revenue: row.currentRevenue ?? 0,
      invoiceCount: Number(row.currentInvoiceCount),
    })),
    previous: rows.map((row) => ({
      employeeId: row.employeeId,
      revenue: row.previousRevenue ?? 0,
      invoiceCount: Number(row.previousInvoiceCount),
    })),
  };
}

async function getAttributedRevenue(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
): Promise<RevenueRow[]> {
  const employeeFilter = employeeId
    ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
    : Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") IS NOT NULL`;

  const rows = await prisma.$queryRaw<
    { employeeId: string; revenue: number; invoiceCount: bigint }[]
  >(Prisma.sql`
    SELECT
      COALESCE(li."employeeId", i."employeeId") AS "employeeId",
      SUM(li.total)::float AS revenue,
      COUNT(DISTINCT i.id)::bigint AS "invoiceCount"
    FROM "Invoice" i
    INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
    WHERE i."salonId" = ${salonId}
      AND i.status = 'paid'
      AND i."paidAt" >= ${from}
      AND i."paidAt" <= ${to}
      ${employeeFilter}
    GROUP BY COALESCE(li."employeeId", i."employeeId")
  `);

  return rows.map((row) => ({
    employeeId: row.employeeId,
    revenue: row.revenue ?? 0,
    invoiceCount: Number(row.invoiceCount),
  }));
}

async function getDailyRevenueTrend(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
): Promise<DailyRevenueRow[]> {
  const employeeFilter = employeeId
    ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
    : Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") IS NOT NULL`;

  const rows = await prisma.$queryRaw<{ day: Date; revenue: number }[]>(
    Prisma.sql`
      SELECT DATE(i."paidAt") AS day, SUM(li.total)::float AS revenue
      FROM "Invoice" i
      INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
      WHERE i."salonId" = ${salonId}
        AND i.status = 'paid'
        AND i."paidAt" >= ${from}
        AND i."paidAt" <= ${to}
        ${employeeFilter}
      GROUP BY DATE(i."paidAt")
      ORDER BY day ASC
    `
  );

  return rows.map((row) => ({ day: row.day, revenue: row.revenue ?? 0 }));
}

async function getServicePerformance(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
): Promise<ServiceRow[]> {
  const employeeFilter = employeeId
    ? Prisma.sql`AND a."employeeId" = ${employeeId}`
    : Prisma.sql`AND a."employeeId" IS NOT NULL`;

  const [apptRows, revenueRows] = await Promise.all([
    prisma.$queryRaw<
      { serviceId: string; serviceName: string; appointments: bigint }[]
    >(Prisma.sql`
      SELECT s.id AS "serviceId", s.name AS "serviceName", COUNT(*)::bigint AS appointments
      FROM "Appointment" a
      INNER JOIN "Service" s ON s.id = a."serviceId"
      WHERE a."salonId" = ${salonId}
        AND a."scheduledAt" >= ${from}
        AND a."scheduledAt" <= ${to}
        AND a.status NOT IN ('cancelled')
        ${employeeFilter}
      GROUP BY s.id, s.name
      ORDER BY appointments DESC
      LIMIT 10
    `),
    prisma.$queryRaw<{ serviceId: string | null; revenue: number }[]>(
      Prisma.sql`
        SELECT li."serviceId" AS "serviceId", SUM(li.total)::float AS revenue
        FROM "Invoice" i
        INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
        WHERE i."salonId" = ${salonId}
          AND i.status = 'paid'
          AND i."paidAt" >= ${from}
          AND i."paidAt" <= ${to}
          AND li."itemType" = 'SERVICE'
          ${
            employeeId
              ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
              : Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") IS NOT NULL`
          }
        GROUP BY li."serviceId"
      `
    ),
  ]);

  const revenueByService = new Map(
    revenueRows.map((row) => [row.serviceId, row.revenue ?? 0])
  );

  return apptRows.map((row) => ({
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    appointments: Number(row.appointments),
    revenue: revenueByService.get(row.serviceId) ?? 0,
  }));
}

async function getCustomerPerformance(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null,
  limit = 20
): Promise<{ rows: CustomerRow[]; totalCustomers: number; newCustomers: number }> {
  const employeeFilter = employeeId
    ? Prisma.sql`AND a."employeeId" = ${employeeId}`
    : Prisma.sql`AND a."employeeId" IS NOT NULL`;

  const revenueFilter = employeeId
    ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
    : Prisma.sql``;

  const [customerRows, revenueByCustomer, allCustomers, newCustomers] =
    await Promise.all([
      prisma.$queryRaw<
        {
          customerId: string;
          customerName: string;
          visits: bigint;
          lastVisit: Date;
        }[]
      >(Prisma.sql`
        SELECT
          c.id AS "customerId",
          c.name AS "customerName",
          COUNT(*)::bigint AS visits,
          MAX(a."scheduledAt") AS "lastVisit"
        FROM "Appointment" a
        INNER JOIN "Customer" c ON c.id = a."customerId"
        WHERE a."salonId" = ${salonId}
          AND a."scheduledAt" >= ${from}
          AND a."scheduledAt" <= ${to}
          AND a.status IN ('completed', 'checked_in', 'scheduled')
          ${employeeFilter}
        GROUP BY c.id, c.name
        ORDER BY visits DESC, "lastVisit" DESC
        LIMIT ${limit}
      `),
      employeeId
        ? prisma.$queryRaw<{ customerId: string; revenue: number }[]>(
            Prisma.sql`
              SELECT i."customerId" AS "customerId", SUM(li.total)::float AS revenue
              FROM "Invoice" i
              INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
              WHERE i."salonId" = ${salonId}
                AND i.status = 'paid'
                AND i."paidAt" >= ${from}
                AND i."paidAt" <= ${to}
                AND i."customerId" IS NOT NULL
                ${revenueFilter}
              GROUP BY i."customerId"
            `
          )
        : Promise.resolve([]),
      prisma.$queryRaw<{ count: bigint }[]>(
        Prisma.sql`
          SELECT COUNT(DISTINCT a."customerId")::bigint AS count
          FROM "Appointment" a
          WHERE a."salonId" = ${salonId}
            AND a."scheduledAt" >= ${from}
            AND a."scheduledAt" <= ${to}
            AND a.status NOT IN ('cancelled', 'no_show')
            ${employeeFilter}
        `
      ),
      prisma.$queryRaw<{ count: bigint }[]>(
        Prisma.sql`
          SELECT COUNT(*)::bigint AS count
          FROM "Customer" c
          WHERE c."salonId" = ${salonId}
            AND c."createdAt" >= ${from}
            AND c."createdAt" <= ${to}
            AND EXISTS (
              SELECT 1 FROM "Appointment" a
              WHERE a."customerId" = c.id
                AND a."salonId" = ${salonId}
                AND a."scheduledAt" >= ${from}
                AND a."scheduledAt" <= ${to}
                ${employeeFilter}
            )
        `
      ),
    ]);

  const revenueMap = new Map(
    revenueByCustomer.map((row) => [row.customerId, row.revenue ?? 0])
  );

  return {
    rows: customerRows.map((row) => ({
      customerId: row.customerId,
      customerName: row.customerName,
      visits: Number(row.visits),
      revenue: revenueMap.get(row.customerId) ?? 0,
      lastVisit: row.lastVisit.toISOString(),
    })),
    totalCustomers: Number(allCustomers[0]?.count ?? 0),
    newCustomers: Number(newCustomers[0]?.count ?? 0),
  };
}

async function getBusyHours(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
): Promise<HourBucket[]> {
  const employeeFilter = employeeId
    ? Prisma.sql`AND a."employeeId" = ${employeeId}`
    : Prisma.sql`AND a."employeeId" IS NOT NULL`;

  const rows = await prisma.$queryRaw<{ hour: number; count: bigint }[]>(
    Prisma.sql`
      SELECT EXTRACT(HOUR FROM a."scheduledAt")::int AS hour, COUNT(*)::bigint AS count
      FROM "Appointment" a
      WHERE a."salonId" = ${salonId}
        AND a."scheduledAt" >= ${from}
        AND a."scheduledAt" <= ${to}
        AND a.status NOT IN ('cancelled')
        ${employeeFilter}
      GROUP BY hour
      ORDER BY hour ASC
    `
  );

  return rows.map((row) => ({ hour: row.hour, count: Number(row.count) }));
}

async function getUtilization(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const employeeFilter = employeeId
    ? Prisma.sql`AND a."employeeId" = ${employeeId}`
    : Prisma.sql`AND a."employeeId" IS NOT NULL`;

  const [shifts, bookedRows] = await Promise.all([
    prisma.shift.findMany({
      where: {
        salonId,
        date: { gte: from, lte: to },
        isWorking: true,
        ...(employeeId ? { employeeId } : {}),
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.$queryRaw<{ bookedMinutes: number }[]>(Prisma.sql`
      SELECT COALESCE(SUM(s.duration), 0)::float AS "bookedMinutes"
      FROM "Appointment" a
      INNER JOIN "Service" s ON s.id = a."serviceId"
      WHERE a."salonId" = ${salonId}
        AND a."scheduledAt" >= ${from}
        AND a."scheduledAt" <= ${to}
        AND a.status IN ('scheduled', 'checked_in', 'completed')
        ${employeeFilter}
    `),
  ]);

  const availableMinutes = shifts.reduce(
    (sum, shift) => sum + shiftMinutes(shift.startTime, shift.endTime),
    0
  );
  const bookedMinutes = bookedRows[0]?.bookedMinutes ?? 0;

  return {
    bookedMinutes,
    availableMinutes,
    utilizationPercent:
      availableMinutes > 0
        ? Math.round((bookedMinutes / availableMinutes) * 1000) / 10
        : null,
    hasScheduleData: availableMinutes > 0,
  };
}

async function getAttendanceSummary(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const [records, shifts] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: {
        salonId,
        date: { gte: from, lte: to },
        ...(employeeId ? { employeeId } : {}),
      },
      select: { checkInAt: true, checkOutAt: true },
    }),
    prisma.shift.findMany({
      where: {
        salonId,
        date: { gte: from, lte: to },
        isWorking: true,
        ...(employeeId ? { employeeId } : {}),
      },
      select: { date: true, startTime: true },
    }),
  ]);

  let daysPresent = records.length;
  let hoursWorked = 0;
  for (const record of records) {
    if (record.checkOutAt) {
      hoursWorked +=
        (record.checkOutAt.getTime() - record.checkInAt.getTime()) / 3600000;
    }
  }

  let lateArrivals = 0;
  for (const record of records) {
    const dayShift = shifts.find(
      (shift) =>
        startOfDay(shift.date).getTime() ===
          startOfDay(record.checkInAt).getTime() && shift.startTime
    );
    if (dayShift?.startTime) {
      const checkIn = new Date(record.checkInAt);
      const actual = checkIn.getHours() * 60 + checkIn.getMinutes();
      if (actual > parseTimeToMinutes(dayShift.startTime) + 5) lateArrivals++;
    }
  }

  const scheduledDays = shifts.length;
  return {
    daysPresent,
    daysAbsent: Math.max(0, scheduledDays - daysPresent),
    lateArrivals,
    hoursWorked: Math.round(hoursWorked * 10) / 10,
    averageHoursPerDay:
      daysPresent > 0 ? Math.round((hoursWorked / daysPresent) * 10) / 10 : 0,
    hasData: records.length > 0 || shifts.length > 0,
  };
}

async function getProductSales(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const employeeFilter = employeeId
    ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
    : Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") IS NOT NULL`;

  const rows = await prisma.$queryRaw<
    { revenue: number; quantity: bigint; saleCount: bigint }[]
  >(Prisma.sql`
    SELECT
      SUM(li.total)::float AS revenue,
      SUM(li.quantity)::bigint AS quantity,
      COUNT(DISTINCT i.id)::bigint AS "saleCount"
    FROM "Invoice" i
    INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
    WHERE i."salonId" = ${salonId}
      AND i.status = 'paid'
      AND i."paidAt" >= ${from}
      AND i."paidAt" <= ${to}
      AND li."itemType" = 'PRODUCT'
      ${employeeFilter}
  `);

  const row = rows[0];
  const revenue = row?.revenue ?? 0;
  const quantity = Number(row?.quantity ?? 0);
  const saleCount = Number(row?.saleCount ?? 0);
  return {
    revenue,
    productsSold: quantity,
    saleCount,
    averageSale: saleCount > 0 ? Math.round((revenue / saleCount) * 100) / 100 : 0,
    hasData: revenue > 0,
  };
}

async function getCompletedCountsBothPeriods(
  salonId: string,
  from: Date,
  to: Date,
  prevFrom: Date,
  prevTo: Date,
  employeeId: string | null
) {
  const employeeFilter = employeeId
    ? Prisma.sql`AND a."employeeId" = ${employeeId}`
    : Prisma.sql`AND a."employeeId" IS NOT NULL`;

  const rows = await prisma.$queryRaw<
    { currentCompleted: bigint; previousCompleted: bigint }[]
  >(Prisma.sql`
    SELECT
      COUNT(*) FILTER (
        WHERE a."scheduledAt" >= ${from}
          AND a."scheduledAt" <= ${to}
          AND a.status = 'completed'
      )::bigint AS "currentCompleted",
      COUNT(*) FILTER (
        WHERE a."scheduledAt" >= ${prevFrom}
          AND a."scheduledAt" <= ${prevTo}
          AND a.status = 'completed'
      )::bigint AS "previousCompleted"
    FROM "Appointment" a
    WHERE a."salonId" = ${salonId}
      AND a."scheduledAt" >= ${prevFrom}
      AND a."scheduledAt" <= ${to}
      ${employeeFilter}
  `);

  return {
    currentCompleted: Number(rows[0]?.currentCompleted ?? 0),
    previousCompleted: Number(rows[0]?.previousCompleted ?? 0),
  };
}

async function getDayOfWeekBuckets(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  return prisma.$queryRaw<{ day: number; count: bigint }[]>(Prisma.sql`
    SELECT EXTRACT(DOW FROM a."scheduledAt")::int AS day, COUNT(*)::bigint AS count
    FROM "Appointment" a
    WHERE a."salonId" = ${salonId}
      AND a."scheduledAt" >= ${from}
      AND a."scheduledAt" <= ${to}
      AND a.status NOT IN ('cancelled')
      ${employeeId ? Prisma.sql`AND a."employeeId" = ${employeeId}` : Prisma.sql`AND a."employeeId" IS NOT NULL`}
    GROUP BY day
    ORDER BY count DESC
  `);
}

export async function fetchStaffAnalytics(filters: StaffAnalyticsFilters) {
  const { salonId, employeeId, range } = filters;
  const { from, to, prevFrom, prevTo } = range;

  const appointmentWhere = {
    salonId,
    scheduledAt: { gte: from, lte: to },
    ...(employeeId ? { employeeId } : { employeeId: { not: null } }),
  } as const;

  const [
    revenueByPeriod,
    statusGroups,
    dailyRevenue,
    services,
    customers,
    busyHours,
    utilization,
    attendance,
    productSales,
    employees,
    upcomingAppointments,
    completedCounts,
    dayBuckets,
  ] = await Promise.all([
    getAttributedRevenueBothPeriods(
      salonId,
      from,
      to,
      prevFrom,
      prevTo,
      employeeId
    ),
    prisma.appointment.groupBy({
      by: ["status"],
      where: appointmentWhere,
      _count: { _all: true },
    }),
    getDailyRevenueTrend(salonId, from, to, employeeId),
    getServicePerformance(salonId, from, to, employeeId),
    getCustomerPerformance(salonId, from, to, employeeId),
    getBusyHours(salonId, from, to, employeeId),
    getUtilization(salonId, from, to, employeeId),
    getAttendanceSummary(salonId, from, to, employeeId),
    getProductSales(salonId, from, to, employeeId),
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        specialties: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        salonId,
        scheduledAt: { gte: new Date() },
        status: { in: ["scheduled", "checked_in"] },
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true, duration: true, price: true } },
        employee: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 8,
    }),
    getCompletedCountsBothPeriods(
      salonId,
      from,
      to,
      prevFrom,
      prevTo,
      employeeId
    ),
    getDayOfWeekBuckets(salonId, from, to, employeeId),
  ]);

  const currentRevenueRows = revenueByPeriod.current;
  const previousRevenueRows = revenueByPeriod.previous;
  const completedCount = completedCounts.currentCompleted;
  const prevCompletedCount = completedCounts.previousCompleted;
  const nextAppointment = upcomingAppointments[0] ?? null;

  const revenue = currentRevenueRows.reduce((sum, row) => sum + row.revenue, 0);
  const previousRevenue = previousRevenueRows.reduce(
    (sum, row) => sum + row.revenue,
    0
  );

  const statusMap = Object.fromEntries(
    statusGroups.map((group) => [group.status, group._count._all])
  );
  const totalAppointments = statusGroups.reduce(
    (sum, group) => sum + group._count._all,
    0
  );
  const completed = statusMap.completed ?? 0;
  const upcomingCount = (statusMap.scheduled ?? 0) + (statusMap.checked_in ?? 0);
  const cancelled = statusMap.cancelled ?? 0;
  const noShow = statusMap.no_show ?? 0;

  const billableDenominator = completed > 0 ? completed : completedCount;
  const averageTicket =
    billableDenominator > 0
      ? Math.round((revenue / billableDenominator) * 100) / 100
      : 0;

  const prevRevenueForTicket =
    previousRevenueRows.reduce((sum, row) => sum + row.revenue, 0) /
    Math.max(prevCompletedCount, 1);
  const averageTicketGrowth = growthPercent(
    averageTicket,
    Math.round(prevRevenueForTicket * 100) / 100
  );

  const returningCustomers = Math.max(
    0,
    customers.totalCustomers - customers.newCustomers
  );
  const repeatRate =
    customers.totalCustomers > 0
      ? Math.round((returningCustomers / customers.totalCustomers) * 1000) / 10
      : 0;

  const peakHourBucket = [...busyHours].sort((a, b) => b.count - a.count)[0];
  const leastBusyHourBucket = [...busyHours]
    .filter((bucket) => bucket.count > 0)
    .sort((a, b) => a.count - b.count)[0];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const peakDay = dayBuckets[0]
    ? dayNames[dayBuckets[0].day] ?? "—"
    : "—";

  const teamRanking = employeeId
    ? []
    : await buildTeamRanking(salonId, from, to, employees);

  const insights = buildInsights({
    employeeId,
    revenue,
    revenueGrowth: growthPercent(revenue, previousRevenue),
    utilization: utilization.utilizationPercent,
    repeatRate,
    peakHour: peakHourBucket?.hour,
    peakDay,
    topService: services[0]?.serviceName,
    cancellationRate:
      totalAppointments > 0
        ? Math.round((cancelled / totalAppointments) * 1000) / 10
        : 0,
    upcomingCount,
  });

  const alerts = buildAlerts({
    cancellationRate:
      totalAppointments > 0 ? (cancelled / totalAppointments) * 100 : 0,
    utilization: utilization.utilizationPercent,
    upcomingTomorrow: upcomingCount,
    revenueGrowth: growthPercent(revenue, previousRevenue),
  });

  return {
    range: {
      label: range.label,
      from: from.toISOString(),
      to: to.toISOString(),
    },
    employee: employeeId
      ? employees.find((employee) => employee.id === employeeId) ?? null
      : null,
    overview: {
      revenue,
      revenueGrowth: growthPercent(revenue, previousRevenue),
      previousRevenue,
      appointments: totalAppointments,
      customers: customers.totalCustomers,
      utilization: utilization.utilizationPercent,
      utilizationLabel: utilization.hasScheduleData
        ? "Shift-based utilization"
        : "Schedule shifts to calculate utilization",
      averageTicket,
      averageTicketGrowth,
      completionRate:
        totalAppointments > 0
          ? Math.round((completed / totalAppointments) * 1000) / 10
          : 0,
      cancellationRate:
        totalAppointments > 0
          ? Math.round((cancelled / totalAppointments) * 1000) / 10
          : 0,
      noShowRate:
        totalAppointments > 0
          ? Math.round((noShow / totalAppointments) * 1000) / 10
          : 0,
    },
    appointments: {
      total: totalAppointments,
      completed,
      upcoming: upcomingCount,
      cancelled,
      noShow,
      scheduled: statusMap.scheduled ?? 0,
      checkedIn: statusMap.checked_in ?? 0,
    },
    revenueTrend: dailyRevenue.map((row) => ({
      label: format(row.day, "MMM d"),
      revenue: row.revenue,
    })),
    utilization: {
      bookedMinutes: utilization.bookedMinutes,
      availableMinutes: utilization.availableMinutes,
      utilizationPercent: utilization.utilizationPercent,
      hasScheduleData: utilization.hasScheduleData,
    },
    customers: {
      total: customers.totalCustomers,
      new: customers.newCustomers,
      returning: returningCustomers,
      repeatRate,
      rows: customers.rows,
    },
    services,
    busyHours: busyHours.map((bucket) => ({
      hour: bucket.hour,
      label: format(new Date().setHours(bucket.hour, 0, 0, 0), "ha"),
      count: bucket.count,
    })),
    attendance,
    productSales,
    upcoming: upcomingAppointments.map((apt) => ({
      id: apt.id,
      scheduledAt: apt.scheduledAt.toISOString(),
      status: apt.status,
      customerName: apt.customer.name,
      serviceName: apt.service.name,
      duration: apt.service.duration,
      price: apt.service.price,
      employeeName: apt.employee?.name ?? null,
    })),
    nextAppointment: nextAppointment
      ? {
          id: nextAppointment.id,
          scheduledAt: nextAppointment.scheduledAt.toISOString(),
          status: nextAppointment.status,
          customerName: nextAppointment.customer.name,
          serviceName: nextAppointment.service.name,
          duration: nextAppointment.service.duration,
          price: nextAppointment.service.price,
          employeeName: nextAppointment.employee?.name ?? null,
        }
      : null,
    teamRanking,
    insights,
    alerts,
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      status: employee.status,
      avatarUrl: employee.avatarUrl,
    })),
  };
}

async function buildTeamRanking(
  salonId: string,
  from: Date,
  to: Date,
  employees: { id: string; name: string; role: string }[]
) {
  const [revenueRows, appointmentRows, allShifts, allAppointments] =
    await Promise.all([
      getAttributedRevenue(salonId, from, to, null),
      prisma.appointment.groupBy({
        by: ["employeeId"],
        where: {
          salonId,
          scheduledAt: { gte: from, lte: to },
          employeeId: { not: null },
          status: { not: "cancelled" },
        },
        _count: { _all: true },
      }),
      prisma.shift.findMany({
        where: {
          salonId,
          date: { gte: from, lte: to },
          isWorking: true,
        },
        select: { employeeId: true, startTime: true, endTime: true },
      }),
      prisma.appointment.findMany({
        where: {
          salonId,
          scheduledAt: { gte: from, lte: to },
          employeeId: { not: null },
          status: { in: ["scheduled", "checked_in", "completed"] },
        },
        select: {
          employeeId: true,
          service: { select: { duration: true } },
        },
      }),
    ]);

  const revenueMap = new Map(
    revenueRows.map((row) => [row.employeeId, row.revenue])
  );
  const appointmentMap = new Map(
    appointmentRows.map((row) => [row.employeeId!, row._count._all])
  );

  const availableByEmployee = new Map<string, number>();
  for (const shift of allShifts) {
    availableByEmployee.set(
      shift.employeeId,
      (availableByEmployee.get(shift.employeeId) ?? 0) +
        shiftMinutes(shift.startTime, shift.endTime)
    );
  }

  const bookedByEmployee = new Map<string, number>();
  for (const apt of allAppointments) {
    if (!apt.employeeId) continue;
    bookedByEmployee.set(
      apt.employeeId,
      (bookedByEmployee.get(apt.employeeId) ?? 0) + apt.service.duration
    );
  }

  return employees
    .map((employee) => {
      const available = availableByEmployee.get(employee.id) ?? 0;
      const booked = bookedByEmployee.get(employee.id) ?? 0;
      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        revenue: revenueMap.get(employee.id) ?? 0,
        appointments: appointmentMap.get(employee.id) ?? 0,
        utilization:
          available > 0
            ? Math.round((booked / available) * 1000) / 10
            : null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function buildInsights(input: {
  employeeId: string | null;
  revenue: number;
  revenueGrowth: number | null;
  utilization: number | null;
  repeatRate: number;
  peakHour?: number;
  peakDay: string;
  topService?: string;
  cancellationRate: number;
  upcomingCount: number;
}) {
  const insights: string[] = [];
  const subject = input.employeeId ? "This employee" : "The team";

  if (input.peakDay !== "—") {
    insights.push(`${subject} is busiest on ${input.peakDay}s.`);
  }
  if (input.peakHour != null) {
    insights.push(
      `Peak booking time is ${format(new Date().setHours(input.peakHour, 0, 0, 0), "h a")}.`
    );
  }
  if (input.topService) {
    insights.push(`${input.topService} is the most booked service.`);
  }
  if (input.repeatRate > 0) {
    insights.push(`Repeat customer rate is ${input.repeatRate}%.`);
  }
  if (input.revenueGrowth != null && input.revenueGrowth !== 0) {
    insights.push(
      `Revenue is ${input.revenueGrowth > 0 ? "up" : "down"} ${Math.abs(input.revenueGrowth)}% vs the previous period.`
    );
  }
  if (input.utilization != null) {
    insights.push(`Utilization is ${input.utilization}% for the selected period.`);
  }
  if (input.upcomingCount === 0) {
    insights.push("No upcoming appointments are scheduled in the current pipeline.");
  }
  return insights.slice(0, 5);
}

function buildAlerts(input: {
  cancellationRate: number;
  utilization: number | null;
  upcomingTomorrow: number;
  revenueGrowth: number | null;
}) {
  const alerts: { type: "warning" | "success" | "info"; message: string }[] =
    [];
  if (input.cancellationRate >= 10) {
    alerts.push({
      type: "warning",
      message: `Cancellation rate is ${Math.round(input.cancellationRate)}%.`,
    });
  }
  if (input.utilization != null && input.utilization < 60) {
    alerts.push({
      type: "warning",
      message: `Utilization is below 60% (${input.utilization}%).`,
    });
  }
  if (input.upcomingTomorrow === 0) {
    alerts.push({
      type: "info",
      message: "No upcoming appointments in the current status pipeline.",
    });
  }
  if (input.revenueGrowth != null && input.revenueGrowth > 0) {
    alerts.push({
      type: "success",
      message: `Revenue is above the previous period (+${input.revenueGrowth}%).`,
    });
  }
  return alerts;
}

export function staffAnalyticsToCsv(
  data: Awaited<ReturnType<typeof fetchStaffAnalytics>>
) {
  const lines = [
    "Staff Analytics Export",
    `Period,${data.range.label}`,
    "",
    "Metric,Value",
    `Revenue,${data.overview.revenue}`,
    `Appointments,${data.overview.appointments}`,
    `Customers,${data.overview.customers}`,
    `Average Ticket,${data.overview.averageTicket}`,
    "",
    "Team Ranking,Revenue,Appointments,Utilization",
    ...data.teamRanking.map(
      (row) =>
        `${row.name},${row.revenue},${row.appointments},${row.utilization ?? ""}`
    ),
  ];
  return lines.join("\n");
}
