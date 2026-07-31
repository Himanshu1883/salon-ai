import { getPaymentsBreakdown } from "@/actions/sales";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const { breakdown, grandTotal } = await getPaymentsBreakdown({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  return (
    <ReportPageShell
      title="Payment methods breakdown"
      description="Revenue split by payment method."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Total (INR)", value: formatCurrency(grandTotal) },
          { label: "Methods", value: String(breakdown.length) },
        ]}
      />
      <ReportDataTable
        title="By payment method"
        columns={[
          { key: "label", header: "Method" },
          { key: "count", header: "Transactions", align: "right" },
          { key: "total", header: "Total (INR)", align: "right" },
        ]}
        rows={breakdown.map((r) => ({
          label: r.label,
          count: r.count,
          total: formatCurrency(r.total),
        }))}
      />
    </ReportPageShell>
  );
}
