"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { ReportCatalogItem } from "@/actions/reports";
import type { ReportCategory } from "@/lib/reports-catalog";
import type { RevenueDay } from "@/actions/dashboard";
import { exportReportCsv } from "@/actions/reports";
import { ReportsHeader, ReportsCatalogKpis } from "@/components/reports/reports-header";
import { ReportsKpiGrid } from "@/components/reports/reports-kpi-grid";
import { ReportsFilterToolbar } from "@/components/reports/reports-filter-toolbar";
import {
  ReportsCategoryTabs,
  filterReportsByTab,
  mapTabToUrlCategory,
  type BiCategoryTab,
} from "@/components/reports/reports-category-tabs";
import { ReportBiCard } from "@/components/reports/report-bi-card";
import { ReportsAnalyticsPanel } from "@/components/reports/reports-analytics-panel";
import { ReportsAiInsights } from "@/components/reports/reports-ai-insights";
import { ReportsStubDialog } from "@/components/reports/reports-stub-dialogs";

export type ReportsDashboardMetrics = {
  revenueToday: number;
  revenueMonth: number;
  revenueTrend: number;
  revenueByDay: RevenueDay[];
  todayAppointments: number;
  activeQueue: number;
  waitingCount: number;
  employeesOnDuty: number;
  lowStockCount: number;
  unpaidInvoices: number;
  totalCustomers: number;
  favoriteCount: number;
  retailSales: number;
  membershipSales: number;
  packageSales: number;
  productSales: number;
  serviceSales: number;
  avgBill: number;
  invoiceCountMonth: number;
  noShowCount: number;
  cancellationRate: number;
  completionRate: number;
  inventoryValue: number;
  newCustomersMonth: number;
  staffUtilization: number;
  topServices: { name: string; value: number }[];
  topCustomers: { name: string; total: number }[];
  topEarners: { id: string; name: string; monthEarnings: number }[];
  viewsThisMonth: number;
};

type Props = {
  reports: ReportCatalogItem[];
  metrics: ReportsDashboardMetrics;
  filters: {
    category: ReportCategory | "all";
    search: string;
    createdBy: string;
  };
};

export function ReportsBiDashboard({ reports, metrics, filters }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const [createdBy, setCreatedBy] = useState(filters.createdBy);
  const [activeTab, setActiveTab] = useState<BiCategoryTab>(
    filters.category === "all" ? "all" : filters.category
  );
  const [stubDialog, setStubDialog] = useState<
    "schedule" | "generate" | "export-pdf" | "export-excel" | null
  >(null);
  const [exportLoading, startExport] = useTransition();

  function applyFilters(category?: ReportCategory | "all") {
    const params = new URLSearchParams();
    const cat = category ?? mapTabToUrlCategory(activeTab);
    if (cat && cat !== "all") params.set("category", cat);
    if (search) params.set("search", search);
    if (createdBy && createdBy !== "all") params.set("createdBy", createdBy);
    router.push(`/reports?${params.toString()}`);
  }

  function handleTabChange(tab: BiCategoryTab) {
    setActiveTab(tab);
    const urlCategory = mapTabToUrlCategory(tab);
    if (urlCategory !== "all") {
      applyFilters(urlCategory);
    } else if (
      tab === "memberships" ||
      tab === "packages" ||
      tab === "marketing" ||
      tab === "branches"
    ) {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (createdBy && createdBy !== "all") params.set("createdBy", createdBy);
      router.push(`/reports?${params.toString()}`);
    }
  }

  function handleReset() {
    setSearch("");
    setCreatedBy("all");
    setActiveTab("all");
    router.push("/reports");
  }

  function handleExport() {
    startExport(async () => {
      const csv = await exportReportCsv("sales-list");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sales-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const filteredReports = useMemo(() => {
    let result = filterReportsByTab(reports, activeTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [reports, activeTab, search]);

  const emptyMessage =
    activeTab === "marketing"
      ? "Marketing reports are coming soon."
      : activeTab === "branches"
        ? "Multi-branch reports are coming soon."
        : "No reports match your filters.";

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <ReportsHeader
        onGenerateReport={() => setStubDialog("generate")}
        onScheduleReport={() => setStubDialog("schedule")}
        onExport={handleExport}
        exportLoading={exportLoading}
      />

      <ReportsCatalogKpis
        favoriteCount={metrics.favoriteCount}
        viewsThisMonth={metrics.viewsThisMonth}
      />

      <ReportsKpiGrid metrics={metrics} />

      <ReportsFilterToolbar
        search={search}
        createdBy={createdBy}
        category={filters.category}
        onSearchChange={setSearch}
        onCreatedByChange={setCreatedBy}
        onApplyFilters={applyFilters}
        onReset={handleReset}
        onExportPdf={() => setStubDialog("export-pdf")}
        onExportExcel={() => setStubDialog("export-excel")}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <ReportsCategoryTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {filteredReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E8ECF4] bg-white py-16 text-center text-[#6B7280]">
              {emptyMessage}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredReports.map((report) => (
                <ReportBiCard key={report.slug} report={report} />
              ))}
            </div>
          )}
        </div>

        <ReportsAnalyticsPanel metrics={metrics} />
      </div>

      <ReportsAiInsights metrics={metrics} />

      {stubDialog && (
        <ReportsStubDialog
          open={!!stubDialog}
          onOpenChange={(open) => !open && setStubDialog(null)}
          type={stubDialog}
        />
      )}
    </div>
  );
}
