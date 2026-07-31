import { getSalesSummary } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import {
  ReportDataTable,
  ReportStatCards,
} from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function SalesSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const data = await getSalesSummary(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="Sales summary"
      description="Aggregate paid invoice quantity and value by category."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Total invoices", value: String(data.invoiceCount) },
          { label: "Total quantity", value: String(data.totalQty) },
          { label: "Total value (INR)", value: formatCurrency(data.totalValue) },
        ]}
      />
      <ReportDataTable
        title="Sales by category"
        columns={[
          { key: "category", header: "Category" },
          { key: "quantity", header: "Qty", align: "right" },
          { key: "value", header: "Value (INR)", align: "right" },
        ]}
        rows={data.rows.map((r) => ({
          category: r.category,
          quantity: r.quantity,
          value: formatCurrency(r.value),
        }))}
        footer={
          <tr className="bg-stone-50 font-semibold">
            <td className="p-3">Total</td>
            <td className="p-3 text-right tabular-nums">{data.totalQty}</td>
            <td className="p-3 text-right tabular-nums">
              {formatCurrency(data.totalValue)}
            </td>
          </tr>
        }
      />
    </ReportPageShell>
  );
}
