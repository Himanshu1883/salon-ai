"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import {
  ReportDataTable,
  ReportStatCards,
} from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";
import type { PeriodSalesRow } from "@/actions/reports";

export function SalesByPeriodClient({
  rows,
  grandTotal,
  dateFrom,
  dateTo,
  groupBy,
}: {
  rows: PeriodSalesRow[];
  grandTotal: number;
  dateFrom: string;
  dateTo: string;
  groupBy: "daily" | "weekly";
}) {
  const router = useRouter();

  function setGroupBy(value: "daily" | "weekly") {
    const params = new URLSearchParams(window.location.search);
    params.set("groupBy", value);
    router.push(`${window.location.pathname}?${params.toString()}`);
  }

  return (
    <ReportPageShell
      title="Sales by time period"
      description="Daily or weekly sales totals for the selected range."
      isPremium
      dateFrom={dateFrom}
      dateTo={dateTo}
      extraFilters={
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "daily" | "weekly")}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <ReportStatCards
        stats={[
          { label: "Periods", value: String(rows.length) },
          { label: "Total sales (INR)", value: formatCurrency(grandTotal) },
        ]}
      />
      <ReportDataTable
        title="Sales by period"
        columns={[
          { key: "label", header: "Period" },
          { key: "count", header: "Invoices", align: "right" },
          { key: "total", header: "Total (INR)", align: "right" },
        ]}
        rows={rows.map((r) => ({
          label: r.label,
          count: r.invoiceCount,
          total: formatCurrency(r.total),
        }))}
      />
    </ReportPageShell>
  );
}
