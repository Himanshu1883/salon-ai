"use client";

import Link from "next/link";
import { FileBarChart, CalendarClock, Download, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getReportCounts } from "@/lib/reports-catalog";

type Props = {
  onGenerateReport: () => void;
  onScheduleReport: () => void;
  onExport: () => void;
  exportLoading?: boolean;
};

export function ReportsHeader({
  onGenerateReport,
  onScheduleReport,
  onExport,
  exportLoading,
}: Props) {
  const counts = getReportCounts();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#1C103D]">
            Reporting & Analytics
          </h1>
          <Badge className="border-0 bg-[#EDE9FE] text-[#6C3BFF] tabular-nums">
            {counts.total}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-[#6B7280]">
          Access all of your salon reports and insights in one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-[#E8ECF4] bg-white text-[#374151] hover:border-[#6C3BFF]/30 hover:bg-[#F7F8FC]"
          onClick={onGenerateReport}
        >
          <FileBarChart className="mr-1.5 h-4 w-4 text-[#6C3BFF]" />
          Generate Report
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-[#E8ECF4] bg-white text-[#374151] hover:border-[#6C3BFF]/30 hover:bg-[#F7F8FC]"
          onClick={onScheduleReport}
        >
          <CalendarClock className="mr-1.5 h-4 w-4 text-[#6C3BFF]" />
          Schedule Report
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-[#E8ECF4] bg-white text-[#374151] hover:border-[#6C3BFF]/30 hover:bg-[#F7F8FC]"
          onClick={onExport}
          disabled={exportLoading}
        >
          <Download className="mr-1.5 h-4 w-4 text-[#6C3BFF]" />
          {exportLoading ? "Exporting…" : "Export"}
        </Button>
        <Button
          asChild
          size="sm"
          className="h-9 rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-white shadow-md shadow-[#6C3BFF]/20 hover:from-[#5B2FE6] hover:to-[#7C3AED]"
        >
          <Link href="/reports/custom">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Custom Report
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function ReportsCatalogKpis({
  favoriteCount,
  viewsThisMonth,
}: {
  favoriteCount: number;
  viewsThisMonth: number;
}) {
  const counts = getReportCounts();

  const items = [
    {
      label: "Total reports",
      value: String(counts.total),
      sub: "Available in catalog",
      color: "#6C3BFF",
      bg: "bg-[#EDE9FE]",
    },
    {
      label: "Most used",
      value: "8",
      sub: "This month",
      color: "#10B981",
      bg: "bg-emerald-50",
    },
    {
      label: "Views this month",
      value: String(viewsThisMonth),
      sub: "+24% vs last month",
      color: "#EC4899",
      bg: "bg-pink-50",
    },
    {
      label: "Favourites",
      value: String(favoriteCount),
      sub: "Saved reports",
      color: "#F97316",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}
          >
            <Sparkles className="h-5 w-5" style={{ color: item.color }} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">{item.label}</p>
            <p className="text-xl font-bold text-[#1C103D]">{item.value}</p>
            <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
