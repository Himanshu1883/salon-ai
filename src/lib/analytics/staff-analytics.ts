import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { format } from "date-fns";
import type { AnalyticsDateRange } from "./date-range";
import { growthPercent } from "./date-range";
import {
  SHIFT_MINUTES_CASE,
  employeeAppointmentFilter,
  employeeInvoiceFilter,
  employeeShiftFilter,
} from "./staff-analytics-sql";

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

type EmployeeOption = {
  id: string;
  name: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  specialties: string | null;
};

type UpcomingRow = {
  id: string;
  scheduledAt: string;
  status: string;
  customerName: string;
  serviceName: string;
  duration: number;
  price: number;
  employeeName: string | null;
};

async function getAttributedRevenueBothPeriods(
  salonId: string,
  from: Date,
  to: Date,
  prevFrom: Date,
  prevTo: Date,
  employeeId: string | null
): Promise<{ current: RevenueRow[]; previous: RevenueRow[] }> {
  const employeeFilter = employeeInvoiceFilter(employeeId);
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
  const employeeFilter = employeeInvoiceFilter(employeeId);

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
  const employeeFilter = employeeInvoiceFilter(employeeId);

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
  const rows = await prisma.$queryRaw<
    {
      serviceId: string;
      serviceName: string;
      appointments: bigint;
      revenue: number;
    }[]
  >(Prisma.sql`
    WITH appt_counts AS (
      SELECT s.id AS "serviceId", s.name AS "serviceName", COUNT(*)::bigint AS appointments
      FROM "AppointmentServiceItem" asi
      INNER JOIN "Appointment" a ON a.id = asi."appointmentId"
      INNER JOIN "Service" s ON s.id = asi."serviceId"
      WHERE a."salonId" = ${salonId}
        AND asi."scheduledAt" >= ${from}
        AND asi."scheduledAt" <= ${to}
        AND asi.status NOT IN ('cancelled')
        AND a.status NOT IN ('cancelled')
        ${
          employeeId
            ? Prisma.sql`AND asi."employeeId" = ${employeeId}`
            : Prisma.sql`AND asi."employeeId" IS NOT NULL`
        }
      GROUP BY s.id, s.name
    ),
    revenue_totals AS (
      SELECT li."serviceId", SUM(li.total)::float AS revenue
      FROM "Invoice" i
      INNER JOIN "InvoiceLineItem" li ON li."invoiceId" = i.id
      WHERE i."salonId" = ${salonId}
        AND i.status = 'paid'
        AND i."paidAt" >= ${from}
        AND i."paidAt" <= ${to}
        AND li."itemType" = 'SERVICE'
        ${employeeInvoiceFilter(employeeId)}
      GROUP BY li."serviceId"
    )
    SELECT
      ac."serviceId",
      ac."serviceName",
      ac.appointments,
      COALESCE(rt.revenue, 0)::float AS revenue
    FROM appt_counts ac
    LEFT JOIN revenue_totals rt ON rt."serviceId" = ac."serviceId"
    ORDER BY ac.appointments DESC
    LIMIT 10
  `);

  return rows.map((row) => ({
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    appointments: Number(row.appointments),
    revenue: row.revenue ?? 0,
  }));
}

async function getCustomerPerformance(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null,
  limit = 20
): Promise<{ rows: CustomerRow[]; totalCustomers: number; newCustomers: number }> {
  const employeeFilter = employeeAppointmentFilter(employeeId);
  const revenueFilter = employeeId
    ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
    : Prisma.sql``;

  const [customerRows, revenueByCustomer, counts] = await Promise.all([
    limit > 0
      ? prisma.$queryRaw<
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
        `)
      : Promise.resolve([]),
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
    prisma.$queryRaw<{ totalCustomers: bigint; newCustomers: bigint }[]>(
      Prisma.sql`
        SELECT
          COUNT(DISTINCT a."customerId") FILTER (
            WHERE a.status NOT IN ('cancelled', 'no_show')
          )::bigint AS "totalCustomers",
          COUNT(DISTINCT c.id) FILTER (
            WHERE c."createdAt" >= ${from}
              AND c."createdAt" <= ${to}
          )::bigint AS "newCustomers"
        FROM "Appointment" a
        LEFT JOIN "Customer" c
          ON c.id = a."customerId"
          AND c."salonId" = ${salonId}
          AND c."createdAt" >= ${from}
          AND c."createdAt" <= ${to}
        WHERE a."salonId" = ${salonId}
          AND a."scheduledAt" >= ${from}
          AND a."scheduledAt" <= ${to}
          ${employeeFilter}
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
    totalCustomers: Number(counts[0]?.totalCustomers ?? 0),
    newCustomers: Number(counts[0]?.newCustomers ?? 0),
  };
}

async function getBusyHours(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
): Promise<HourBucket[]> {
  const employeeFilter = employeeAppointmentFilter(employeeId);

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

async function getShiftAvailableMinutes(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const shiftFilter = employeeShiftFilter(employeeId);

  const rows = await prisma.$queryRaw<{ availableMinutes: number }[]>(
    Prisma.sql`
      SELECT COALESCE(SUM(${SHIFT_MINUTES_CASE}), 0)::float AS "availableMinutes"
      FROM "Shift" sh
      WHERE sh."salonId" = ${salonId}
        AND sh.date >= ${from}
        AND sh.date <= ${to}
        AND sh."isWorking" = true
        ${shiftFilter}
    `
  );

  return rows[0]?.availableMinutes ?? 0;
}

async function getBookedMinutes(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const rows = await prisma.$queryRaw<{ bookedMinutes: number }[]>(Prisma.sql`
    SELECT COALESCE(SUM(asi.duration), 0)::float AS "bookedMinutes"
    FROM "AppointmentServiceItem" asi
    INNER JOIN "Appointment" a ON a.id = asi."appointmentId"
    WHERE a."salonId" = ${salonId}
      AND asi."scheduledAt" >= ${from}
      AND asi."scheduledAt" <= ${to}
      AND asi.status IN ('scheduled', 'in_progress', 'completed')
      AND a.status IN ('scheduled', 'checked_in', 'completed')
      ${
        employeeId
          ? Prisma.sql`AND asi."employeeId" = ${employeeId}`
          : Prisma.sql`AND asi."employeeId" IS NOT NULL`
      }
  `);

  return rows[0]?.bookedMinutes ?? 0;
}

async function getUtilization(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const [availableMinutes, bookedMinutes] = await Promise.all([
    getShiftAvailableMinutes(salonId, from, to, employeeId),
    getBookedMinutes(salonId, from, to, employeeId),
  ]);

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
  const employeeFilter = employeeId
    ? Prisma.sql`AND ar."employeeId" = ${employeeId}`
    : Prisma.sql``;
  const shiftEmployeeFilter = employeeId
    ? Prisma.sql`AND sh."employeeId" = ${employeeId}`
    : Prisma.sql``;

  const rows = await prisma.$queryRaw<
    {
      daysPresent: bigint;
      hoursWorked: number;
      scheduledDays: bigint;
      lateArrivals: bigint;
    }[]
  >(Prisma.sql`
    WITH attendance AS (
      SELECT
        COUNT(*)::bigint AS "daysPresent",
        COALESCE(
          SUM(
            EXTRACT(EPOCH FROM (ar."checkOutAt" - ar."checkInAt")) / 3600
          ),
          0
        )::float AS "hoursWorked"
      FROM "AttendanceRecord" ar
      WHERE ar."salonId" = ${salonId}
        AND ar.date >= ${from}
        AND ar.date <= ${to}
        ${employeeFilter}
    ),
    shifts AS (
      SELECT COUNT(*)::bigint AS "scheduledDays"
      FROM "Shift" sh
      WHERE sh."salonId" = ${salonId}
        AND sh.date >= ${from}
        AND sh.date <= ${to}
        AND sh."isWorking" = true
        ${shiftEmployeeFilter}
    ),
    late AS (
      SELECT COUNT(*)::bigint AS "lateArrivals"
      FROM "AttendanceRecord" ar
      INNER JOIN "Shift" sh
        ON sh."employeeId" = ar."employeeId"
        AND sh."salonId" = ar."salonId"
        AND DATE(sh.date) = DATE(ar.date)
        AND sh."isWorking" = true
        AND sh."startTime" IS NOT NULL
      WHERE ar."salonId" = ${salonId}
        AND ar.date >= ${from}
        AND ar.date <= ${to}
        ${employeeFilter}
        AND (
          EXTRACT(HOUR FROM ar."checkInAt")::int * 60 +
          EXTRACT(MINUTE FROM ar."checkInAt")::int
        ) > (
          split_part(sh."startTime", ':', 1)::int * 60 +
          split_part(sh."startTime", ':', 2)::int + 5
        )
    )
    SELECT
      attendance."daysPresent",
      attendance."hoursWorked",
      shifts."scheduledDays",
      late."lateArrivals"
    FROM attendance, shifts, late
  `);

  const row = rows[0];
  const daysPresent = Number(row?.daysPresent ?? 0);
  const scheduledDays = Number(row?.scheduledDays ?? 0);
  const hoursWorked = row?.hoursWorked ?? 0;

  return {
    daysPresent,
    daysAbsent: Math.max(0, scheduledDays - daysPresent),
    lateArrivals: Number(row?.lateArrivals ?? 0),
    hoursWorked: Math.round(hoursWorked * 10) / 10,
    averageHoursPerDay:
      daysPresent > 0 ? Math.round((hoursWorked / daysPresent) * 10) / 10 : 0,
    hasData: daysPresent > 0 || scheduledDays > 0,
  };
}

async function getProductSales(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const employeeFilter = employeeInvoiceFilter(employeeId);

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
  const employeeFilter = employeeAppointmentFilter(employeeId);

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
  const employeeFilter = employeeAppointmentFilter(employeeId);

  return prisma.$queryRaw<{ day: number; count: bigint }[]>(Prisma.sql`
    SELECT EXTRACT(DOW FROM a."scheduledAt")::int AS day, COUNT(*)::bigint AS count
    FROM "Appointment" a
    WHERE a."salonId" = ${salonId}
      AND a."scheduledAt" >= ${from}
      AND a."scheduledAt" <= ${to}
      AND a.status NOT IN ('cancelled')
      ${employeeFilter}
    GROUP BY day
    ORDER BY count DESC
  `);
}

async function getAppointmentStatusCounts(
  salonId: string,
  from: Date,
  to: Date,
  employeeId: string | null
) {
  const employeeFilter = employeeAppointmentFilter(employeeId);

  const rows = await prisma.$queryRaw<{ status: string; count: bigint }[]>(
    Prisma.sql`
      SELECT a.status, COUNT(*)::bigint AS count
      FROM "Appointment" a
      WHERE a."salonId" = ${salonId}
        AND a."scheduledAt" >= ${from}
        AND a."scheduledAt" <= ${to}
        ${employeeFilter}
      GROUP BY a.status
    `
  );

  return rows.map((row) => ({
    status: row.status,
    count: Number(row.count),
  }));
}

async function getUpcomingAppointments(
  salonId: string,
  employeeId: string | null,
  take = 8
) {
  return prisma.appointment.findMany({
    where: {
      salonId,
      scheduledAt: { gte: new Date() },
      status: { in: ["scheduled", "checked_in"] },
      ...(employeeId
        ? {
            OR: [
              { employeeId },
              { serviceItems: { some: { employeeId } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      scheduledAt: true,
      status: true,
      customer: { select: { name: true } },
      service: { select: { name: true, duration: true, price: true } },
      employee: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take,
  });
}

export async function fetchStaffAnalyticsEmployees(salonId: string) {
  return prisma.employee.findMany({
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
  });
}

function mapUpcoming(
  apt: Awaited<ReturnType<typeof getUpcomingAppointments>>[number]
): UpcomingRow {
  return {
    id: apt.id,
    scheduledAt: apt.scheduledAt.toISOString(),
    status: apt.status,
    customerName: apt.customer.name,
    serviceName: apt.service.name,
    duration: apt.service.duration,
    price: apt.service.price,
    employeeName: apt.employee?.name ?? null,
  };
}

function computeOverviewFromParts(input: {
  range: AnalyticsDateRange;
  employeeId: string | null;
  employees: EmployeeOption[];
  revenueByPeriod: Awaited<ReturnType<typeof getAttributedRevenueBothPeriods>>;
  statusGroups: Awaited<ReturnType<typeof getAppointmentStatusCounts>>;
  completedCounts: Awaited<ReturnType<typeof getCompletedCountsBothPeriods>>;
  customers: { totalCustomers: number; newCustomers: number };
  utilization: Awaited<ReturnType<typeof getUtilization>>;
}) {
  const {
    range,
    employeeId,
    employees,
    revenueByPeriod,
    statusGroups,
    completedCounts,
    customers,
    utilization,
  } = input;

  const currentRevenueRows = revenueByPeriod.current;
  const previousRevenueRows = revenueByPeriod.previous;
  const revenue = currentRevenueRows.reduce((sum, row) => sum + row.revenue, 0);
  const previousRevenue = previousRevenueRows.reduce(
    (sum, row) => sum + row.revenue,
    0
  );

  const statusMap = Object.fromEntries(
    statusGroups.map((group) => [group.status, group.count])
  );
  const totalAppointments = statusGroups.reduce((sum, group) => sum + group.count, 0);
  const completed = statusMap.completed ?? 0;
  const upcomingCount = (statusMap.scheduled ?? 0) + (statusMap.checked_in ?? 0);
  const cancelled = statusMap.cancelled ?? 0;
  const noShow = statusMap.no_show ?? 0;

  const billableDenominator =
    completed > 0 ? completed : completedCounts.currentCompleted;
  const averageTicket =
    billableDenominator > 0
      ? Math.round((revenue / billableDenominator) * 100) / 100
      : 0;

  const prevRevenueForTicket =
    previousRevenueRows.reduce((sum, row) => sum + row.revenue, 0) /
    Math.max(completedCounts.previousCompleted, 1);
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

  return {
    range: {
      label: range.label,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
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
    },
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      status: employee.status,
      avatarUrl: employee.avatarUrl,
    })),
  };
}

export async function fetchStaffAnalyticsOverview(
  filters: StaffAnalyticsFilters
) {
  const { salonId, employeeId, range } = filters;
  const { from, to, prevFrom, prevTo } = range;

  const [
    revenueByPeriod,
    statusGroups,
    completedCounts,
    utilization,
    customerCounts,
    employees,
    upcomingAppointments,
    attendance,
    productSales,
  ] = await Promise.all([
    getAttributedRevenueBothPeriods(
      salonId,
      from,
      to,
      prevFrom,
      prevTo,
      employeeId
    ),
    getAppointmentStatusCounts(salonId, from, to, employeeId),
    getCompletedCountsBothPeriods(
      salonId,
      from,
      to,
      prevFrom,
      prevTo,
      employeeId
    ),
    getUtilization(salonId, from, to, employeeId),
    getCustomerPerformance(salonId, from, to, employeeId, 0),
    employeeId
      ? prisma.employee.findMany({
          where: { salonId, id: employeeId },
          select: {
            id: true,
            name: true,
            role: true,
            status: true,
            avatarUrl: true,
            specialties: true,
          },
        })
      : fetchStaffAnalyticsEmployees(salonId),
    getUpcomingAppointments(salonId, employeeId),
    getAttendanceSummary(salonId, from, to, employeeId),
    getProductSales(salonId, from, to, employeeId),
  ]);

  const core = computeOverviewFromParts({
    range,
    employeeId,
    employees,
    revenueByPeriod,
    statusGroups,
    completedCounts,
    customers: {
      totalCustomers: customerCounts.totalCustomers,
      newCustomers: customerCounts.newCustomers,
    },
    utilization,
  });

  const upcoming = upcomingAppointments.map(mapUpcoming);

  return {
    ...core,
    attendance,
    productSales,
    upcoming,
    nextAppointment: upcoming[0] ?? null,
  };
}

export async function fetchStaffAnalyticsCharts(
  filters: StaffAnalyticsFilters
) {
  const { salonId, employeeId, range } = filters;
  const { from, to } = range;

  const [dailyRevenue, services, busyHours, dayBuckets] = await Promise.all([
    getDailyRevenueTrend(salonId, from, to, employeeId),
    getServicePerformance(salonId, from, to, employeeId),
    getBusyHours(salonId, from, to, employeeId),
    getDayOfWeekBuckets(salonId, from, to, employeeId),
  ]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const peakDay = dayBuckets[0]
    ? dayNames[dayBuckets[0].day] ?? "—"
    : "—";

  return {
    revenueTrend: dailyRevenue.map((row) => ({
      label: format(row.day, "MMM d"),
      revenue: row.revenue,
    })),
    services,
    busyHours: busyHours.map((bucket) => ({
      hour: bucket.hour,
      label: format(new Date().setHours(bucket.hour, 0, 0, 0), "ha"),
      count: bucket.count,
    })),
    peakDay,
    peakHour: [...busyHours].sort((a, b) => b.count - a.count)[0]?.hour,
  };
}

export async function fetchStaffAnalyticsDetailsOnly(
  filters: StaffAnalyticsFilters,
  context: {
    overview: Awaited<ReturnType<typeof fetchStaffAnalyticsOverview>>;
    charts: Awaited<ReturnType<typeof fetchStaffAnalyticsCharts>>;
  }
) {
  const { salonId, employeeId, range } = filters;
  const { from, to } = range;
  const { overview, charts } = context;

  const [customers, teamRanking] = await Promise.all([
    getCustomerPerformance(salonId, from, to, employeeId, 20),
    employeeId
      ? Promise.resolve([])
      : buildTeamRanking(salonId, from, to, overview.employees),
  ]);

  const insights = buildInsights({
    employeeId,
    revenue: overview.overview.revenue,
    revenueGrowth: overview.overview.revenueGrowth,
    utilization: overview.utilization.utilizationPercent,
    repeatRate: overview.customers.repeatRate,
    peakHour: charts.peakHour,
    peakDay: charts.peakDay,
    topService: charts.services[0]?.serviceName,
    cancellationRate: overview.overview.cancellationRate,
    upcomingCount: overview.appointments.upcoming,
  });

  const alerts = buildAlerts({
    cancellationRate: overview.overview.cancellationRate,
    utilization: overview.utilization.utilizationPercent,
    upcomingTomorrow: overview.appointments.upcoming,
    revenueGrowth: overview.overview.revenueGrowth,
  });

  return {
    customers: {
      ...overview.customers,
      rows: customers.rows,
    },
    teamRanking,
    insights,
    alerts,
  };
}

export async function fetchStaffAnalyticsDetails(
  filters: StaffAnalyticsFilters,
  context?: {
    overview?: Awaited<ReturnType<typeof fetchStaffAnalyticsOverview>>;
    charts?: Awaited<ReturnType<typeof fetchStaffAnalyticsCharts>>;
  }
) {
  const [overview, charts] = await Promise.all([
    context?.overview ?? fetchStaffAnalyticsOverview(filters),
    context?.charts ?? fetchStaffAnalyticsCharts(filters),
  ]);
  return fetchStaffAnalyticsDetailsOnly(filters, { overview, charts });
}

/** Full payload — used for CSV export and backward compatibility. */
export async function fetchStaffAnalytics(filters: StaffAnalyticsFilters) {
  const [overview, charts] = await Promise.all([
    fetchStaffAnalyticsOverview(filters),
    fetchStaffAnalyticsCharts(filters),
  ]);
  const details = await fetchStaffAnalyticsDetailsOnly(filters, { overview, charts });

  return {
    range: overview.range,
    employee: overview.employee,
    overview: overview.overview,
    appointments: overview.appointments,
    revenueTrend: charts.revenueTrend,
    utilization: overview.utilization,
    customers: details.customers,
    services: charts.services,
    busyHours: charts.busyHours,
    attendance: overview.attendance,
    productSales: overview.productSales,
    upcoming: overview.upcoming,
    nextAppointment: overview.nextAppointment,
    teamRanking: details.teamRanking,
    insights: details.insights,
    alerts: details.alerts,
    employees: overview.employees,
  };
}

async function getBookedMinutesByEmployee(
  salonId: string,
  from: Date,
  to: Date
) {
  return prisma.$queryRaw<{ employeeId: string; bookedMinutes: number }[]>(
    Prisma.sql`
      SELECT asi."employeeId", COALESCE(SUM(asi.duration), 0)::float AS "bookedMinutes"
      FROM "AppointmentServiceItem" asi
      INNER JOIN "Appointment" a ON a.id = asi."appointmentId"
      WHERE a."salonId" = ${salonId}
        AND asi."scheduledAt" >= ${from}
        AND asi."scheduledAt" <= ${to}
        AND asi."employeeId" IS NOT NULL
        AND asi.status IN ('scheduled', 'in_progress', 'completed')
        AND a.status IN ('scheduled', 'checked_in', 'completed')
      GROUP BY asi."employeeId"
    `
  );
}

async function getAvailableMinutesByEmployee(
  salonId: string,
  from: Date,
  to: Date
) {
  return prisma.$queryRaw<{ employeeId: string; availableMinutes: number }[]>(
    Prisma.sql`
      SELECT sh."employeeId",
        SUM(${SHIFT_MINUTES_CASE})::float AS "availableMinutes"
      FROM "Shift" sh
      WHERE sh."salonId" = ${salonId}
        AND sh.date >= ${from}
        AND sh.date <= ${to}
        AND sh."isWorking" = true
      GROUP BY sh."employeeId"
    `
  );
}

async function buildTeamRanking(
  salonId: string,
  from: Date,
  to: Date,
  employees: { id: string; name: string; role: string }[]
) {
  const [revenueRows, appointmentRows, availableRows, bookedRows] =
    await Promise.all([
      getAttributedRevenue(salonId, from, to, null),
      prisma.$queryRaw<{ employeeId: string; appointments: bigint }[]>(
        Prisma.sql`
          SELECT a."employeeId", COUNT(*)::bigint AS appointments
          FROM "Appointment" a
          WHERE a."salonId" = ${salonId}
            AND a."scheduledAt" >= ${from}
            AND a."scheduledAt" <= ${to}
            AND a."employeeId" IS NOT NULL
            AND a.status NOT IN ('cancelled')
          GROUP BY a."employeeId"
        `
      ),
      getAvailableMinutesByEmployee(salonId, from, to),
      getBookedMinutesByEmployee(salonId, from, to),
    ]);

  const revenueMap = new Map(
    revenueRows.map((row) => [row.employeeId, row.revenue])
  );
  const appointmentMap = new Map(
    appointmentRows.map((row) => [row.employeeId, Number(row.appointments)])
  );
  const availableMap = new Map(
    availableRows.map((row) => [row.employeeId, row.availableMinutes ?? 0])
  );
  const bookedMap = new Map(
    bookedRows.map((row) => [row.employeeId, row.bookedMinutes ?? 0])
  );

  return employees
    .map((employee) => {
      const available = availableMap.get(employee.id) ?? 0;
      const booked = bookedMap.get(employee.id) ?? 0;
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
