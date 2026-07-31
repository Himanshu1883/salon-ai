import { format } from "date-fns";
import { getNoShows } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";

export default async function NoShowsPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const appointments = await getNoShows(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="No-shows"
      description="Appointments marked as no-show."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[{ label: "No-shows", value: String(appointments.length) }]}
      />
      <ReportDataTable
        title="No-show appointments"
        columns={[
          { key: "date", header: "Scheduled" },
          { key: "customer", header: "Customer" },
          { key: "service", header: "Service" },
          { key: "employee", header: "Employee" },
        ]}
        rows={appointments.map((r) => ({
          date: format(new Date(r.scheduledAt), "dd MMM yyyy HH:mm"),
          customer: r.customer.name,
          service: r.service.name,
          employee: r.employee?.name ?? "—",
        }))}
      />
    </ReportPageShell>
  );
}
