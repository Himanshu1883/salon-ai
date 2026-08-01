"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "@/components/reports/report-card";
import { ReportsAddButton } from "@/components/reports/reports-sidebar";
import {
  REPORT_CATEGORIES,
  getReportCounts,
  type ReportCategory,
} from "@/lib/reports-catalog";
import type { ReportCatalogItem } from "@/actions/reports";
import { cn } from "@/lib/utils";

type Props = {
  reports: ReportCatalogItem[];
  filters: {
    category: ReportCategory | "all";
    search: string;
    createdBy: string;
  };
  view: "all" | "favourites" | "standard" | "premium" | "custom";
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
};

export function ReportsCatalogClient({
  reports,
  filters,
  view,
  title = "Reporting and analytics",
  subtitle = "Access all of your salon reports.",
  emptyMessage = "No reports match your filters.",
}: Props) {
  const router = useRouter();
  const counts = getReportCounts();
  const [search, setSearch] = useState(filters.search);
  const [createdBy, setCreatedBy] = useState(filters.createdBy);

  const basePath =
    view === "all"
      ? "/reports"
      : view === "favourites"
        ? "/reports/favourites"
        : view === "standard"
          ? "/reports/standard"
          : view === "premium"
            ? "/reports/premium"
            : "/reports/custom";

  function applyFilters(category?: ReportCategory | "all") {
    const params = new URLSearchParams();
    const cat = category ?? filters.category;
    if (cat && cat !== "all") params.set("category", cat);
    if (search) params.set("search", search);
    if (createdBy && createdBy !== "all") params.set("createdBy", createdBy);
    router.push(`${basePath}?${params.toString()}`);
  }

  function setCategory(category: ReportCategory | "all") {
    applyFilters(category);
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
            <Badge variant="secondary" className="tabular-nums">
              {counts.total}
            </Badge>
          </div>
          <p className="mt-1 text-stone-500">{subtitle}</p>
        </div>
        <ReportsAddButton />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search by report name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-9"
          />
        </div>
        <Select value={createdBy} onValueChange={setCreatedBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Created by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Created by</SelectItem>
            <SelectItem value="Glow Desk">Glow Desk</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.category}
          onValueChange={(v) => setCategory(v as ReportCategory | "all")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-stone-200 pb-1">
        {REPORT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filters.category === cat.id
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.slug} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
