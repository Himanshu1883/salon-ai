import { getPackagesSummary } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function PackagesSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const data = await getPackagesSummary(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="Packages summary"
      description="Aggregated package sales by type."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Total quantity", value: String(data.totalQty) },
          { label: "Total value (INR)", value: formatCurrency(data.totalValue) },
        ]}
      />
      <ReportDataTable
        title="Packages by type"
        columns={[
          { key: "name", header: "Package" },
          { key: "qty", header: "Qty", align: "right" },
          { key: "total", header: "Total (INR)", align: "right" },
        ]}
        rows={data.rows.map((r) => ({
          name: r.name,
          qty: r.qty,
          total: formatCurrency(r.total),
        }))}
      />
    </ReportPageShell>
  );
}
