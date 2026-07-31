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

type Row = {
  period: string;
  label: string;
  quantity: number;
  total: number;
};

export function GiftCardsPeriodClient({
  rows,
  grandTotal,
  dateFrom,
  dateTo,
  groupBy,
}: {
  rows: Row[];
  grandTotal: number;
  dateFrom: string;
  dateTo: string;
  groupBy: "daily" | "weekly";
}) {
  const router = useRouter();

  return (
    <ReportPageShell
      title="Gift card by time period"
      description="Gift card sales aggregated by day or week."
      isPremium
      dateFrom={dateFrom}
      dateTo={dateTo}
      extraFilters={
        <Select
          value={groupBy}
          onValueChange={(v) => {
            const params = new URLSearchParams(window.location.search);
            params.set("groupBy", v);
            router.push(`${window.location.pathname}?${params.toString()}`);
          }}
        >
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
          { label: "Total (INR)", value: formatCurrency(grandTotal) },
          {
            label: "Total qty",
            value: String(rows.reduce((s, r) => s + r.quantity, 0)),
          },
        ]}
      />
      <ReportDataTable
        title="Gift card sales"
        columns={[
          { key: "label", header: "Period" },
          { key: "qty", header: "Qty", align: "right" },
          { key: "total", header: "Total (INR)", align: "right" },
        ]}
        rows={rows.map((r) => ({
          label: r.label,
          qty: r.quantity,
          total: formatCurrency(r.total),
        }))}
      />
    </ReportPageShell>
  );
}
