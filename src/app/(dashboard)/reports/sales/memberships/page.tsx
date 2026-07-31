import { format } from "date-fns";
import { getSalesByItemType } from "@/actions/sales";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function MembershipsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const { sales, totalAmount, totalQty } = await getSalesByItemType("MEMBERSHIP", {
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  return (
    <ReportPageShell
      title="Membership list"
      description="Memberships sold in the selected period."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Sales", value: String(sales.length) },
          { label: "Quantity", value: String(totalQty) },
          { label: "Total (INR)", value: formatCurrency(totalAmount) },
        ]}
      />
      <ReportDataTable
        title="Membership sales"
        columns={[
          { key: "date", header: "Date" },
          { key: "customer", header: "Customer" },
          { key: "desc", header: "Description" },
          { key: "total", header: "Total (INR)", align: "right" },
        ]}
        rows={sales.map((r) => ({
          date: r.paidAt ? format(new Date(r.paidAt), "dd MMM yyyy") : "—",
          customer: r.customerName,
          desc: r.description,
          total: formatCurrency(r.total),
        }))}
      />
    </ReportPageShell>
  );
}
