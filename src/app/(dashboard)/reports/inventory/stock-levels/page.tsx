import { getStockLevelsReport } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { getStockStatusLabel } from "@/lib/stock";

export default async function StockLevelsPage() {
  const items = await getStockLevelsReport();

  return (
    <ReportPageShell
      title="Stock levels"
      description="Current quantity on hand for all items."
      showDateFilter={false}
    >
      <ReportStatCards
        stats={[{ label: "Items", value: String(items.length) }]}
      />
      <ReportDataTable
        title="Stock levels"
        columns={[
          { key: "name", header: "Item" },
          { key: "sku", header: "SKU" },
          { key: "category", header: "Category" },
          { key: "qty", header: "On hand", align: "right" },
          { key: "status", header: "Status" },
        ]}
        rows={items.map((r) => ({
          name: r.name,
          sku: r.sku ?? "—",
          category: r.category,
          qty: `${r.quantityOnHand} ${r.unit}`,
          status: getStockStatusLabel(r.status),
        }))}
      />
    </ReportPageShell>
  );
}
