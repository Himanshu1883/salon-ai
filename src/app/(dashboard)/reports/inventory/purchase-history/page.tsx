import { format } from "date-fns";
import { getPurchaseHistoryReport } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { formatCurrency } from "@/lib/currency";

export default async function PurchaseHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const purchases = await getPurchaseHistoryReport(
    params.dateFrom,
    params.dateTo
  );
  const total = purchases.reduce((s, p) => s + p.amount, 0);

  return (
    <ReportPageShell
      title="Purchase history"
      description="Stock purchase records with cost details."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Purchases", value: String(purchases.length) },
          { label: "Total spent (INR)", value: formatCurrency(total) },
        ]}
      />
      <ReportDataTable
        title="Purchases"
        columns={[
          { key: "date", header: "Date" },
          { key: "item", header: "Item" },
          { key: "qty", header: "Qty", align: "right" },
          { key: "amount", header: "Amount (INR)", align: "right" },
          { key: "supplier", header: "Supplier" },
        ]}
        rows={purchases.map((r) => ({
          date: format(new Date(r.purchaseDate), "dd MMM yyyy"),
          item: r.stockItem.name,
          qty: r.quantityPurchased,
          amount: formatCurrency(r.amount),
          supplier: r.supplierName ?? "—",
        }))}
      />
    </ReportPageShell>
  );
}
