import { getTopSpenders } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function TopSpendersPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const spenders = await getTopSpenders(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="Top spenders"
      description="Clients ranked by total spend."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[{ label: "Clients", value: String(spenders.length) }]}
      />
      <ReportDataTable
        title="Top spenders"
        columns={[
          { key: "name", header: "Client" },
          { key: "count", header: "Visits", align: "right" },
          { key: "total", header: "Total spend (INR)", align: "right" },
        ]}
        rows={spenders.map((r) => ({
          name: r.name,
          count: r.count,
          total: formatCurrency(r.total),
        }))}
      />
    </ReportPageShell>
  );
}
