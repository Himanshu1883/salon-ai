"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, BarChart3, Download } from "lucide-react";
import { exportStaffAnalyticsCsv } from "@/actions/staff-analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ANALYTICS_PERIOD_OPTIONS } from "@/lib/analytics/date-range";
import type { StaffAnalyticsSearchParams } from "@/actions/staff-analytics";

type EmployeeOption = {
  id: string;
  name: string;
};

export function StaffAnalyticsFilters({
  employees,
  searchParams,
  rangeLabel,
}: {
  employees: EmployeeOption[];
  searchParams: StaffAnalyticsSearchParams;
  rangeLabel?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState(searchParams.period ?? "this_month");
  const [employeeId, setEmployeeId] = useState(searchParams.employeeId ?? "all");
  const [from, setFrom] = useState(searchParams.from ?? "");
  const [to, setTo] = useState(searchParams.to ?? "");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setPeriod(searchParams.period ?? "this_month");
    setEmployeeId(searchParams.employeeId ?? "all");
    setFrom(searchParams.from ?? "");
    setTo(searchParams.to ?? "");
  }, [searchParams]);

  function applyFilters(next?: Partial<StaffAnalyticsSearchParams>) {
    const params = new URLSearchParams();
    const nextEmployee = next?.employeeId ?? employeeId;
    const nextPeriod = next?.period ?? period;
    const nextFrom = next?.from ?? from;
    const nextTo = next?.to ?? to;

    if (nextEmployee && nextEmployee !== "all") {
      params.set("employeeId", nextEmployee);
    }
    if (nextPeriod) params.set("period", nextPeriod);
    if (nextPeriod === "custom" && nextFrom) params.set("from", nextFrom);
    if (nextPeriod === "custom" && nextTo) params.set("to", nextTo);

    startTransition(() => {
      router.push(`/team/analytics?${params.toString()}`);
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportStaffAnalyticsCsv({
        employeeId,
        period,
        from: from || undefined,
        to: to || undefined,
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `staff-analytics-${period}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={employees.length <= 1 ? "/dashboard" : "/team/members"}
            className="mb-3 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#6C3BFF]"
          >
            <ArrowLeft className="h-4 w-4" />
            {employees.length <= 1 ? "Back to dashboard" : "Back to team"}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6C3BFF]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1C103D] sm:text-3xl">
              {employees.length <= 1 ? "My Performance" : "Staff Analytics"}
              </h1>
              {rangeLabel && (
                <p className="text-sm text-[#6B7280]">{rangeLabel}</p>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={handleExport}
          disabled={exporting || isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <Card className="rounded-[20px] border-[#E8ECF4] shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:p-6">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {employees.length > 1 && (
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={employeeId}
                onValueChange={(value) => {
                  setEmployeeId(value);
                  applyFilters({ employeeId: value });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            )}
            <div className="space-y-2">
              <Label>Date range</Label>
              <Select
                value={period}
                onValueChange={(value) => {
                  setPeriod(value);
                  applyFilters({ period: value });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANALYTICS_PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </>
            )}
          </div>
          {period === "custom" && (
            <Button
              className="rounded-xl bg-[#6C3BFF] hover:bg-[#5B2FE0]"
              onClick={() => applyFilters()}
              disabled={isPending}
            >
              Apply range
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}
