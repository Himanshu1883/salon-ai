import { format } from "date-fns";
import { getUnpaidInvoices } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function UnpaidInvoicesPage() {
  const invoices = await getUnpaidInvoices();
  const total = invoices.reduce((s, inv) => s + inv.total, 0);

  return (
    <ReportPageShell
      title="Unpaid invoices"
      description="Outstanding invoices awaiting payment."
      showDateFilter={false}
    >
      <ReportStatCards
        stats={[
          { label: "Unpaid count", value: String(invoices.length) },
          { label: "Total due (INR)", value: formatCurrency(total) },
        ]}
      />
      <ReportDataTable
        title="Unpaid invoices"
        columns={[
          { key: "created", header: "Created" },
          { key: "customer", header: "Customer" },
          { key: "status", header: "Status" },
          { key: "total", header: "Total (INR)", align: "right" },
          { key: "due", header: "Due date" },
        ]}
        rows={invoices.map((r) => ({
          created: format(new Date(r.createdAt), "dd MMM yyyy"),
          customer: r.customerName,
          status: r.status,
          total: formatCurrency(r.total),
          due: r.dueDate ? format(new Date(r.dueDate), "dd MMM yyyy") : "—",
        }))}
      />
    </ReportPageShell>
  );
}
