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
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";

type Row = {
  period: string;
  label: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
};

export function AppointmentsByPeriodClient({
  rows,
  totalAppointments,
  dateFrom,
  dateTo,
  groupBy,
}: {
  rows: Row[];
  totalAppointments: number;
  dateFrom: string;
  dateTo: string;
  groupBy: "daily" | "weekly";
}) {
  const router = useRouter();

  return (
    <ReportPageShell
      title="Appointments by period"
      description="Appointment counts grouped by day or week."
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
        stats={[{ label: "Total appointments", value: String(totalAppointments) }]}
      />
      <ReportDataTable
        title="Appointments by period"
        columns={[
          { key: "label", header: "Period" },
          { key: "total", header: "Total", align: "right" },
          { key: "completed", header: "Completed", align: "right" },
          { key: "noShow", header: "No-shows", align: "right" },
          { key: "cancelled", header: "Cancelled", align: "right" },
        ]}
        rows={rows.map((r) => ({
          label: r.label,
          total: r.total,
          completed: r.completed,
          noShow: r.noShow,
          cancelled: r.cancelled,
        }))}
      />
    </ReportPageShell>
  );
}
