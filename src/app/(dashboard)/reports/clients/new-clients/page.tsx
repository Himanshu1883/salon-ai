import { format } from "date-fns";
import { getNewClients } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";

export default async function NewClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const clients = await getNewClients(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="New clients"
      description="Clients added during the selected period."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[{ label: "New clients", value: String(clients.length) }]}
      />
      <ReportDataTable
        title="New clients"
        columns={[
          { key: "name", header: "Name" },
          { key: "phone", header: "Phone" },
          { key: "email", header: "Email" },
          { key: "created", header: "Added" },
        ]}
        rows={clients.map((r) => ({
          name: r.name,
          phone: r.phone ?? "—",
          email: r.email ?? "—",
          created: format(new Date(r.createdAt), "dd MMM yyyy"),
        }))}
      />
    </ReportPageShell>
  );
}
