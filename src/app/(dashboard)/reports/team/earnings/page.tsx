import { getEmployeeEarnings } from "@/actions/billing";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function TeamEarningsPage() {
  const earnings = await getEmployeeEarnings();
  const totalMonth = earnings.reduce((s, e) => s + e.monthEarnings, 0);
  const totalAll = earnings.reduce((s, e) => s + e.totalEarnings, 0);

  return (
    <ReportPageShell
      title="Employee earnings"
      description="Revenue attributed to each team member."
      showDateFilter={false}
    >
      <ReportStatCards
        stats={[
          { label: "This month (INR)", value: formatCurrency(totalMonth) },
          { label: "All time (INR)", value: formatCurrency(totalAll) },
        ]}
      />
      <ReportDataTable
        title="Earnings by employee"
        columns={[
          { key: "name", header: "Employee" },
          { key: "role", header: "Role" },
          { key: "month", header: "This month (INR)", align: "right" },
          { key: "total", header: "All time (INR)", align: "right" },
          { key: "count", header: "Invoices", align: "right" },
        ]}
        rows={earnings.map((r) => ({
          name: r.name,
          role: r.role,
          month: formatCurrency(r.monthEarnings),
          total: formatCurrency(r.totalEarnings),
          count: r.paidInvoiceCount,
        }))}
      />
    </ReportPageShell>
  );
}
