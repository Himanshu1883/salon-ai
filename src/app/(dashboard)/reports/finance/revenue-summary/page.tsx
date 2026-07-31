import { getRevenueSummary } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function RevenueSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const data = await getRevenueSummary(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="Revenue summary"
      description="Total revenue, tax, and invoice counts."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Invoices", value: String(data.invoiceCount) },
          { label: "Subtotal (INR)", value: formatCurrency(data.subtotal) },
          { label: "Tax (INR)", value: formatCurrency(data.tax) },
          { label: "Total (INR)", value: formatCurrency(data.total) },
        ]}
      />
    </ReportPageShell>
  );
}
