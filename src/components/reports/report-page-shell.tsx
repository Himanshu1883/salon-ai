"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import { exportReportCsv } from "@/actions/reports";

type Props = {
  title: string;
  description?: string;
  isPremium?: boolean;
  dateFrom?: string;
  dateTo?: string;
  showDateFilter?: boolean;
  exportType?: string;
  children: React.ReactNode;
  extraFilters?: React.ReactNode;
};

export function ReportPageShell({
  title,
  description,
  isPremium,
  dateFrom = "",
  dateTo = "",
  showDateFilter = true,
  exportType,
  children,
  extraFilters,
}: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);
  const [exporting, setExporting] = useState(false);

  function applyDates() {
    const params = new URLSearchParams(window.location.search);
    if (from) params.set("dateFrom", from);
    else params.delete("dateFrom");
    if (to) params.set("dateTo", to);
    else params.delete("dateTo");
    router.push(`${window.location.pathname}?${params.toString()}`);
  }

  async function handleExport() {
    if (!exportType) return;
    setExporting(true);
    try {
      const csv = await exportReportCsv(exportType, from || undefined, to || undefined);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportType}-${from || "all"}-${to || "all"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <Link
          href="/reports"
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
          {isPremium && (
            <Badge className="border-transparent bg-violet-600 text-white">
              Premium
            </Badge>
          )}
        </div>
        {description && (
          <p className="mt-1 text-stone-500">{description}</p>
        )}
      </div>

      {(showDateFilter || exportType || extraFilters) && (
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="hidden flex-wrap items-end gap-4 lg:flex">
            {showDateFilter && (
              <>
                <div>
                  <Label htmlFor="dateFrom">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="mt-1 w-40"
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="mt-1 w-40"
                  />
                </div>
                <Button onClick={applyDates} size="sm" className="h-9">
                  Apply
                </Button>
              </>
            )}
            {extraFilters}
            {exportType && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exporting}
                className="ml-auto gap-1"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>

          <div className="space-y-3 lg:hidden">
            {showDateFilter && (
              <FilterDrawer
                triggerLabel="Date range"
                onApply={applyDates}
                onReset={() => {
                  setFrom("");
                  setTo("");
                  const params = new URLSearchParams(window.location.search);
                  params.delete("dateFrom");
                  params.delete("dateTo");
                  router.push(`${window.location.pathname}?${params.toString()}`);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="dateFrom-mobile">From</Label>
                  <Input
                    id="dateFrom-mobile"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-11 w-full rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo-mobile">To</Label>
                  <Input
                    id="dateTo-mobile"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-11 w-full rounded-xl"
                  />
                </div>
              </FilterDrawer>
            )}
            {extraFilters}
            {exportType && (
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
                className="h-11 min-h-[48px] w-full gap-1 rounded-xl"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
