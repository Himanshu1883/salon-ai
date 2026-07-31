import { format } from "date-fns";
import { getSalesLog } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function SalesLogPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const rows = await getSalesLog(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="Sales log detail"
      description="Line-item breakdown of every sale."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
      exportType="sales-log"
    >
      <ReportDataTable
        title="Line items"
        columns={[
          { key: "date", header: "Date" },
          { key: "customer", header: "Customer" },
          { key: "desc", header: "Description" },
          { key: "type", header: "Type" },
          { key: "qty", header: "Qty", align: "right" },
          { key: "total", header: "Total (INR)", align: "right" },
          { key: "employee", header: "Employee" },
        ]}
        rows={rows.map((r) => ({
          date: r.date ? format(new Date(r.date), "dd MMM yyyy HH:mm") : "—",
          customer: r.customerName,
          desc: r.description,
          type: r.itemType,
          qty: r.quantity,
          total: formatCurrency(r.total),
          employee: r.employeeName ?? "—",
        }))}
      />
    </ReportPageShell>
  );
}
