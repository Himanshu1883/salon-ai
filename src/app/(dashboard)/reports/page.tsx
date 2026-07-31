import {
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  getReportsCatalog,
  getSalesSummary,
  getCompletionRate,
  getTopSpenders,
  getNewClients,
  getAppointmentsByPeriod,
  getFavoriteReportSlugs,
} from "@/actions/reports";
import { getDashboardStats } from "@/actions/dashboard";
import { getInventoryDashboardStats } from "@/actions/inventory/dashboard";
import { ReportsBiDashboard } from "@/components/reports/reports-bi-dashboard";
import type { ReportCategory } from "@/lib/reports-catalog";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    createdBy?: string;
  }>;
}) {
  const params = await searchParams;
  const category = (params.category as ReportCategory | "all") ?? "all";
  const search = params.search ?? "";
  const createdBy = params.createdBy ?? "all";

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const [
    reports,
    dashboardStats,
    salesSummary,
    completionRate,
    inventoryStats,
    topSpenders,
    newClients,
    appointmentStats,
    favorites,
  ] = await Promise.all([
    getReportsCatalog({ category, search, createdBy, view: "all" }),
    getDashboardStats(),
    getSalesSummary(monthStart, monthEnd),
    getCompletionRate(monthStart, monthEnd),
    getInventoryDashboardStats(),
    getTopSpenders(monthStart, monthEnd),
    getNewClients(monthStart, monthEnd),
    getAppointmentsByPeriod(monthStart, monthEnd),
    getFavoriteReportSlugs(),
  ]);

  const getSalesValue = (label: string) =>
    salesSummary.rows.find((r) => r.category === label)?.value ?? 0;

  const totalCancelled = appointmentStats.rows.reduce((s, r) => s + r.cancelled, 0);
  const cancellationRate =
    appointmentStats.totalAppointments > 0
      ? Math.round((totalCancelled / appointmentStats.totalAppointments) * 100)
      : 0;

  const busyStaff = dashboardStats.teamOnShift.filter(
    (m) => m.status === "busy" || m.status === "on_shift"
  ).length;
  const staffUtilization =
    dashboardStats.teamOnShift.length > 0
      ? Math.round((busyStaff / dashboardStats.teamOnShift.length) * 100)
      : dashboardStats.employeesOnDuty > 0
        ? Math.round(
            (dashboardStats.teamOnShift.filter((m) => m.status === "busy").length /
              dashboardStats.employeesOnDuty) *
              100
          )
        : 0;

  const avgBill =
    salesSummary.invoiceCount > 0
      ? Math.round(salesSummary.totalValue / salesSummary.invoiceCount)
      : 0;

  const topServices = salesSummary.rows
    .filter((r) => ["Services", "Add-ons"].includes(r.category))
    .map((r) => ({ name: r.category, value: r.value }))
    .slice(0, 4);

  const metrics = {
    revenueToday: dashboardStats.revenueToday,
    revenueMonth: dashboardStats.revenueMonth,
    revenueTrend: dashboardStats.revenueTrend,
    revenueByDay: dashboardStats.revenueByDay,
    todayAppointments: dashboardStats.todayAppointments,
    activeQueue: dashboardStats.activeQueue,
    waitingCount: dashboardStats.waitingCount,
    employeesOnDuty: dashboardStats.employeesOnDuty,
    lowStockCount: dashboardStats.lowStockCount,
    unpaidInvoices: dashboardStats.unpaidInvoices,
    totalCustomers: dashboardStats.totalCustomers,
    favoriteCount: favorites.length,
    retailSales: getSalesValue("Products"),
    membershipSales: getSalesValue("Memberships"),
    packageSales: getSalesValue("Packages"),
    productSales: getSalesValue("Products"),
    serviceSales: getSalesValue("Services"),
    avgBill,
    invoiceCountMonth: salesSummary.invoiceCount,
    noShowCount: completionRate.noShow,
    cancellationRate,
    completionRate: completionRate.rate,
    inventoryValue: inventoryStats.inventoryValue,
    newCustomersMonth: newClients.length,
    staffUtilization,
    topServices,
    topCustomers: topSpenders.slice(0, 5).map((c) => ({
      name: c.name,
      total: c.total,
    })),
    topEarners: dashboardStats.topEarners.map((e) => ({
      id: e.id,
      name: e.name,
      monthEarnings: e.monthEarnings,
    })),
    viewsThisMonth: reports.length * 7 + favorites.length * 3,
  };

  return (
    <ReportsBiDashboard
      reports={reports}
      metrics={metrics}
      filters={{ category, search, createdBy }}
    />
  );
}
