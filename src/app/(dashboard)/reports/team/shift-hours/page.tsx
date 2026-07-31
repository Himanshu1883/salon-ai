import { format, subDays } from "date-fns";
import { getTeamShiftHours } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";

export default async function ShiftHoursPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const dateTo = params.dateTo ?? format(new Date(), "yyyy-MM-dd");
  const dateFrom =
    params.dateFrom ?? format(subDays(new Date(), 7), "yyyy-MM-dd");

  const data = await getTeamShiftHours(dateFrom, dateTo);

  return (
    <ReportPageShell
      title="Shift hours"
      description="Scheduled working hours per team member."
      dateFrom={dateFrom}
      dateTo={dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Total hours", value: String(data.totalHours) },
          { label: "Team members", value: String(data.rows.length) },
        ]}
      />
      <ReportDataTable
        title="Hours by employee"
        columns={[
          { key: "name", header: "Employee" },
          { key: "role", header: "Role" },
          { key: "shifts", header: "Shifts", align: "right" },
          { key: "hours", header: "Hours", align: "right" },
        ]}
        rows={data.rows.map((r) => ({
          name: r.name,
          role: r.role,
          shifts: r.shiftCount,
          hours: r.hours,
        }))}
      />
    </ReportPageShell>
  );
}
