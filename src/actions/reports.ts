"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions/require";
import { revalidatePath } from "next/cache";
import {
  startOfDay,
  endOfDay,
  parseISO,
  isValid,
  format,
  startOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
} from "date-fns";
import {
  REPORTS_CATALOG,
  type ReportCategory,
  type ReportDefinition,
} from "@/lib/reports-catalog";
import { getStockStatus } from "@/lib/stock";

function parseDate(dateStr: string): Date {
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : new Date();
}

function dateRangeFilter(dateFrom?: string, dateTo?: string) {
  const filter: Record<string, Date> = {};
  if (dateFrom) filter.gte = startOfDay(parseDate(dateFrom));
  if (dateTo) filter.lte = endOfDay(parseDate(dateTo));
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export type ReportsCatalogFilters = {
  category?: ReportCategory | "all";
  search?: string;
  view?: "all" | "favourites" | "standard" | "premium";
  createdBy?: string;
};

export type ReportCatalogItem = ReportDefinition & {
  isFavorited: boolean;
};

export async function getReportsCatalog(
  filters?: ReportsCatalogFilters
): Promise<ReportCatalogItem[]> {
  const session = await requirePermission("reports.view");
  const salonId = session.user.salonId;
  const userId = session.user.id;

  const favorites = await prisma.reportFavorite.findMany({
    where: { salonId, userId },
    select: { reportSlug: true },
  });
  const favoriteSet = new Set(favorites.map((f) => f.reportSlug));

  let reports = REPORTS_CATALOG.map((report) => ({
    ...report,
    isFavorited: favoriteSet.has(report.slug),
  }));

  if (filters?.view === "favourites") {
    reports = reports.filter((r) => r.isFavorited);
  } else if (filters?.view === "standard") {
    reports = reports.filter((r) => !r.isPremium);
  } else if (filters?.view === "premium") {
    reports = reports.filter((r) => r.isPremium);
  }

  if (filters?.category && filters.category !== "all") {
    reports = reports.filter((r) => r.category === filters.category);
  }

  if (filters?.createdBy && filters.createdBy !== "all") {
    reports = reports.filter((r) => r.createdBy === filters.createdBy);
  }

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    reports = reports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }

  return reports;
}

export const getFavoriteReportSlugs = cache(async (): Promise<string[]> => {
  const session = await requirePermission("reports.view");
  const favorites = await prisma.reportFavorite.findMany({
    where: {
      salonId: session.user.salonId,
      userId: session.user.id,
    },
    select: { reportSlug: true },
  });
  return favorites.map((f) => f.reportSlug);
});

export async function toggleReportFavorite(reportSlug: string) {
  const session = await requirePermission("reports.view");
  const salonId = session.user.salonId;
  const userId = session.user.id;

  const report = REPORTS_CATALOG.find((r) => r.slug === reportSlug);
  if (!report) return { error: "Report not found" };

  const existing = await prisma.reportFavorite.findUnique({
    where: {
      salonId_userId_reportSlug: { salonId, userId, reportSlug },
    },
  });

  if (existing) {
    await prisma.reportFavorite.delete({ where: { id: existing.id } });
    revalidatePath("/reports");
    return { success: true, favorited: false };
  }

  await prisma.reportFavorite.create({
    data: { salonId, userId, reportSlug },
  });
  revalidatePath("/reports");
  return { success: true, favorited: true };
}

// --- Sales reports ---

export type SalesSummaryRow = {
  category: string;
  quantity: number;
  value: number;
};

export async function getSalesSummary(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const paidAt = dateRangeFilter(dateFrom, dateTo);

  const invoices = await prisma.invoice.findMany({
    where: {
      salonId: session.user.salonId,
      status: "paid",
      ...(paidAt ? { paidAt } : {}),
    },
    include: { lineItems: true },
  });

  const categoryMap = new Map<string, { quantity: number; value: number }>();
  const typeLabels: Record<string, string> = {
    SERVICE: "Services",
    ADDON: "Add-ons",
    PRODUCT: "Products",
    GIFT_CARD: "Gift cards",
    PACKAGE: "Packages",
    MEMBERSHIP: "Memberships",
    FEE: "Fees",
  };

  for (const invoice of invoices) {
    for (const item of invoice.lineItems) {
      const label = typeLabels[item.itemType] ?? item.itemType;
      const existing = categoryMap.get(label) ?? { quantity: 0, value: 0 };
      existing.quantity += item.quantity;
      existing.value += item.total;
      categoryMap.set(label, existing);
    }
  }

  const rows: SalesSummaryRow[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.value - a.value);

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const invoiceCount = invoices.length;

  return { rows, totalQty, totalValue, invoiceCount };
}

export type PeriodSalesRow = {
  period: string;
  label: string;
  invoiceCount: number;
  total: number;
};

export async function getSalesByPeriod(
  dateFrom: string,
  dateTo: string,
  groupBy: "daily" | "weekly" = "daily"
) {
  const session = await requirePermission("reports.view");
  const from = startOfDay(parseDate(dateFrom));
  const to = endOfDay(parseDate(dateTo));

  const invoices = await prisma.invoice.findMany({
    where: {
      salonId: session.user.salonId,
      status: "paid",
      paidAt: { gte: from, lte: to },
    },
    select: { total: true, paidAt: true },
  });

  const grouped = new Map<string, { count: number; total: number }>();

  if (groupBy === "daily") {
    for (const day of eachDayOfInterval({ start: from, end: to })) {
      grouped.set(format(day, "yyyy-MM-dd"), { count: 0, total: 0 });
    }
    for (const inv of invoices) {
      if (!inv.paidAt) continue;
      const key = format(inv.paidAt, "yyyy-MM-dd");
      const existing = grouped.get(key) ?? { count: 0, total: 0 };
      existing.count += 1;
      existing.total += inv.total;
      grouped.set(key, existing);
    }
  } else {
    const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
    for (const week of weeks) {
      grouped.set(format(week, "yyyy-MM-dd"), { count: 0, total: 0 });
    }
    for (const inv of invoices) {
      if (!inv.paidAt) continue;
      const weekStart = startOfWeek(inv.paidAt, { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");
      const existing = grouped.get(key) ?? { count: 0, total: 0 };
      existing.count += 1;
      existing.total += inv.total;
      grouped.set(key, existing);
    }
  }

  const rows: PeriodSalesRow[] = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      label:
        groupBy === "daily"
          ? format(parseISO(period), "dd MMM yyyy")
          : `Week of ${format(parseISO(period), "dd MMM yyyy")}`,
      invoiceCount: data.count,
      total: data.total,
    }));

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  return { rows, grandTotal };
}

export type SalesLogRow = {
  id: string;
  date: Date | null;
  customerName: string;
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  total: number;
  employeeName: string | null;
  paymentMethod: string | null;
};

export async function getSalesLog(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const paidAt = dateRangeFilter(dateFrom, dateTo);

  const lineItems = await prisma.invoiceLineItem.findMany({
    where: {
      invoice: {
        salonId: session.user.salonId,
        status: "paid",
        ...(paidAt ? { paidAt } : {}),
      },
    },
    include: {
      invoice: { include: { employee: true } },
    },
    orderBy: { invoice: { paidAt: "desc" } },
  });

  const rows: SalesLogRow[] = lineItems.map((item) => ({
    id: item.id,
    date: item.invoice.paidAt,
    customerName: item.invoice.customerName,
    description: item.description,
    itemType: item.itemType,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
    employeeName: item.invoice.employee?.name ?? null,
    paymentMethod: item.invoice.paymentMethod,
  }));

  return rows;
}

export async function exportSalesListCsv(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const paidAt = dateRangeFilter(dateFrom, dateTo);

  const invoices = await prisma.invoice.findMany({
    where: {
      salonId: session.user.salonId,
      status: "paid",
      ...(paidAt ? { paidAt } : {}),
    },
    include: { employee: true },
    orderBy: { paidAt: "desc" },
  });

  const header = "Date,Customer,Phone,Total,Payment Method,Employee\n";
  const rows = invoices
    .map((inv) => {
      const date = inv.paidAt ? format(inv.paidAt, "yyyy-MM-dd HH:mm") : "";
      return [
        date,
        `"${inv.customerName.replace(/"/g, '""')}"`,
        inv.customerPhone ?? "",
        inv.total.toFixed(2),
        inv.paymentMethod ?? "",
        inv.employee?.name ?? "",
      ].join(",");
    })
    .join("\n");

  return header + rows;
}

export async function getGiftCardsByPeriod(
  dateFrom: string,
  dateTo: string,
  groupBy: "daily" | "weekly" = "daily"
) {
  const session = await requirePermission("reports.view");
  const from = startOfDay(parseDate(dateFrom));
  const to = endOfDay(parseDate(dateTo));

  const lineItems = await prisma.invoiceLineItem.findMany({
    where: {
      itemType: "GIFT_CARD",
      invoice: {
        salonId: session.user.salonId,
        status: "paid",
        paidAt: { gte: from, lte: to },
      },
    },
    include: { invoice: true },
  });

  const grouped = new Map<string, { qty: number; total: number }>();

  if (groupBy === "daily") {
    for (const day of eachDayOfInterval({ start: from, end: to })) {
      grouped.set(format(day, "yyyy-MM-dd"), { qty: 0, total: 0 });
    }
  }

  for (const item of lineItems) {
    if (!item.invoice.paidAt) continue;
    const key =
      groupBy === "daily"
        ? format(item.invoice.paidAt, "yyyy-MM-dd")
        : format(startOfWeek(item.invoice.paidAt, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const existing = grouped.get(key) ?? { qty: 0, total: 0 };
    existing.qty += item.quantity;
    existing.total += item.total;
    grouped.set(key, existing);
  }

  const rows = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      label:
        groupBy === "daily"
          ? format(parseISO(period), "dd MMM yyyy")
          : `Week of ${format(parseISO(period), "dd MMM yyyy")}`,
      quantity: data.qty,
      total: data.total,
    }));

  return { rows, grandTotal: rows.reduce((s, r) => s + r.total, 0) };
}

export async function getPackagesSummary(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const paidAt = dateRangeFilter(dateFrom, dateTo);

  const lineItems = await prisma.invoiceLineItem.findMany({
    where: {
      itemType: "PACKAGE",
      invoice: {
        salonId: session.user.salonId,
        status: "paid",
        ...(paidAt ? { paidAt } : {}),
      },
    },
  });

  const byDescription = new Map<string, { qty: number; total: number }>();
  for (const item of lineItems) {
    const existing = byDescription.get(item.description) ?? { qty: 0, total: 0 };
    existing.qty += item.quantity;
    existing.total += item.total;
    byDescription.set(item.description, existing);
  }

  const rows = Array.from(byDescription.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  return {
    rows,
    totalQty: rows.reduce((s, r) => s + r.qty, 0),
    totalValue: rows.reduce((s, r) => s + r.total, 0),
  };
}

// --- Finance reports ---

export async function getRevenueSummary(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const paidAt = dateRangeFilter(dateFrom, dateTo);

  const invoices = await prisma.invoice.findMany({
    where: {
      salonId: session.user.salonId,
      status: "paid",
      ...(paidAt ? { paidAt } : {}),
    },
    select: { subtotal: true, tax: true, total: true },
  });

  return {
    invoiceCount: invoices.length,
    subtotal: invoices.reduce((s, i) => s + i.subtotal, 0),
    tax: invoices.reduce((s, i) => s + i.tax, 0),
    total: invoices.reduce((s, i) => s + i.total, 0),
  };
}

export async function getUnpaidInvoices() {
  const session = await requirePermission("reports.view");

  return prisma.invoice.findMany({
    where: {
      salonId: session.user.salonId,
      status: { in: ["draft", "sent", "overdue"] },
    },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });
}

// --- Appointments reports ---

export async function getAppointmentsByPeriod(
  dateFrom: string,
  dateTo: string,
  groupBy: "daily" | "weekly" = "daily"
) {
  const session = await requirePermission("reports.view");
  const from = startOfDay(parseDate(dateFrom));
  const to = endOfDay(parseDate(dateTo));

  const appointments = await prisma.appointment.findMany({
    where: {
      salonId: session.user.salonId,
      scheduledAt: { gte: from, lte: to },
    },
    select: { scheduledAt: true, status: true },
  });

  const grouped = new Map<string, { total: number; completed: number; cancelled: number; noShow: number }>();

  if (groupBy === "daily") {
    for (const day of eachDayOfInterval({ start: from, end: to })) {
      grouped.set(format(day, "yyyy-MM-dd"), { total: 0, completed: 0, cancelled: 0, noShow: 0 });
    }
  }

  for (const apt of appointments) {
    const key =
      groupBy === "daily"
        ? format(apt.scheduledAt, "yyyy-MM-dd")
        : format(startOfWeek(apt.scheduledAt, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const existing = grouped.get(key) ?? { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    existing.total += 1;
    if (apt.status === "completed") existing.completed += 1;
    if (apt.status === "cancelled") existing.cancelled += 1;
    if (apt.status === "no_show") existing.noShow += 1;
    grouped.set(key, existing);
  }

  const rows = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      label:
        groupBy === "daily"
          ? format(parseISO(period), "dd MMM yyyy")
          : `Week of ${format(parseISO(period), "dd MMM yyyy")}`,
      ...data,
    }));

  return { rows, totalAppointments: appointments.length };
}

export async function getNoShows(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const scheduledAt = dateRangeFilter(dateFrom, dateTo);

  return prisma.appointment.findMany({
    where: {
      salonId: session.user.salonId,
      status: "no_show",
      ...(scheduledAt ? { scheduledAt } : {}),
    },
    include: { customer: true, service: true, employee: true },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function getCompletionRate(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const scheduledAt = dateRangeFilter(dateFrom, dateTo);

  const appointments = await prisma.appointment.findMany({
    where: {
      salonId: session.user.salonId,
      ...(scheduledAt ? { scheduledAt } : {}),
      status: { not: "cancelled" },
    },
    select: { status: true },
  });

  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const noShow = appointments.filter((a) => a.status === "no_show").length;
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, noShow, scheduled, rate };
}

// --- Team reports ---

function parseTimeToHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh + em / 60) - (sh + sm / 60);
}

export async function getTeamShiftHours(dateFrom: string, dateTo: string) {
  const session = await requirePermission("reports.view");
  const from = startOfDay(parseDate(dateFrom));
  const to = endOfDay(parseDate(dateTo));

  const [employees, shifts] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId: session.user.salonId, status: "active" },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({
      where: {
        salonId: session.user.salonId,
        date: { gte: from, lte: to },
        isWorking: true,
      },
    }),
  ]);

  const rows = employees.map((emp) => {
    const empShifts = shifts.filter((s) => s.employeeId === emp.id);
    const hours = empShifts.reduce((total, shift) => {
      if (!shift.startTime || !shift.endTime) return total;
      return total + parseTimeToHours(shift.startTime, shift.endTime);
    }, 0);
    return {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      shiftCount: empShifts.length,
      hours: Math.round(hours * 10) / 10,
    };
  });

  const totalHours = rows.reduce((s, r) => s + r.hours, 0);
  return { rows, totalHours };
}

// --- Clients reports ---

export async function getNewClients(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const createdAt = dateRangeFilter(dateFrom, dateTo);

  return prisma.customer.findMany({
    where: {
      salonId: session.user.salonId,
      ...(createdAt ? { createdAt } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientSegmentsSummary() {
  const session = await requirePermission("reports.view");

  const segments = await prisma.customSegment.findMany({
    where: { salonId: session.user.salonId },
    orderBy: { name: "asc" },
  });

  const totalClients = await prisma.customer.count({
    where: { salonId: session.user.salonId },
  });

  return { segments, totalClients };
}

export async function getTopSpenders(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const paidAt = dateRangeFilter(dateFrom, dateTo);

  const invoices = await prisma.invoice.findMany({
    where: {
      salonId: session.user.salonId,
      status: "paid",
      customerId: { not: null },
      ...(paidAt ? { paidAt } : {}),
    },
    select: { customerId: true, customerName: true, total: true },
  });

  const byCustomer = new Map<
    string,
    { name: string; total: number; count: number }
  >();

  for (const inv of invoices) {
    if (!inv.customerId) continue;
    const existing = byCustomer.get(inv.customerId) ?? {
      name: inv.customerName,
      total: 0,
      count: 0,
    };
    existing.total += inv.total;
    existing.count += 1;
    byCustomer.set(inv.customerId, existing);
  }

  return Array.from(byCustomer.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 50);
}

// --- Inventory reports ---

export async function getStockLevelsReport() {
  const session = await requirePermission("reports.view");

  const items = await prisma.stockItem.findMany({
    where: { salonId: session.user.salonId },
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return items.map((item) => ({
    ...item,
    category: item.category.name,
    status: getStockStatus(item),
  }));
}

export async function getLowStockReport() {
  const items = await getStockLevelsReport();
  return items.filter((item) => item.status === "low" || item.status === "out");
}

export async function getPurchaseHistoryReport(dateFrom?: string, dateTo?: string) {
  const session = await requirePermission("reports.view");
  const purchaseDate = dateRangeFilter(dateFrom, dateTo);

  return prisma.stockPurchase.findMany({
    where: {
      salonId: session.user.salonId,
      ...(purchaseDate ? { purchaseDate } : {}),
    },
    include: { stockItem: true },
    orderBy: { purchaseDate: "desc" },
  });
}

export async function exportReportCsv(
  reportType: string,
  dateFrom?: string,
  dateTo?: string
): Promise<string> {
  switch (reportType) {
    case "sales-list":
      return exportSalesListCsv(dateFrom, dateTo);
    case "sales-log": {
      const rows = await getSalesLog(dateFrom, dateTo);
      const header = "Date,Customer,Description,Type,Qty,Unit Price,Total,Employee,Payment\n";
      const body = rows
        .map((r) =>
          [
            r.date ? format(r.date, "yyyy-MM-dd HH:mm") : "",
            `"${r.customerName.replace(/"/g, '""')}"`,
            `"${r.description.replace(/"/g, '""')}"`,
            r.itemType,
            r.quantity,
            r.unitPrice.toFixed(2),
            r.total.toFixed(2),
            r.employeeName ?? "",
            r.paymentMethod ?? "",
          ].join(",")
        )
        .join("\n");
      return header + body;
    }
    default:
      return "No data";
  }
}
