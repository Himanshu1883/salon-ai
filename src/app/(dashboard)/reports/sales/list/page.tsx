import { format } from "date-fns";
import { getPaidSales } from "@/actions/sales";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  other: "Other",
};

export default async function SalesListReportPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const sales = await getPaidSales({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });
  const total = sales.reduce((s, inv) => s + inv.total, 0);

  return (
    <ReportPageShell
      title="Sales list"
      description="All paid invoices for the selected period."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
      exportType="sales-list"
    >
      <ReportStatCards
        stats={[
          { label: "Invoices", value: String(sales.length) },
          { label: "Total (INR)", value: formatCurrency(total) },
        ]}
      />
      <ReportDataTable
        title="Paid invoices"
        columns={[
          { key: "date", header: "Date" },
          { key: "customer", header: "Customer" },
          { key: "total", header: "Total (INR)", align: "right" },
          { key: "method", header: "Payment" },
          { key: "employee", header: "Employee" },
        ]}
        rows={sales.map((r) => ({
          date: r.paidAt ? format(new Date(r.paidAt), "dd MMM yyyy HH:mm") : "—",
          customer: r.customerName,
          total: formatCurrency(r.total),
          method:
            paymentLabels[r.paymentMethod ?? "other"] ?? r.paymentMethod ?? "—",
          employee: r.employee?.name ?? "—",
        }))}
      />
    </ReportPageShell>
  );
}
