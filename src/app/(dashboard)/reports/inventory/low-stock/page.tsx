import { getLowStockReport } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";
import { getStockStatusLabel } from "@/lib/stock";

export default async function LowStockPage() {
  const items = await getLowStockReport();

  return (
    <ReportPageShell
      title="Low stock"
      description="Items at or below their reorder level."
      showDateFilter={false}
    >
      <ReportStatCards
        stats={[{ label: "Low stock items", value: String(items.length) }]}
      />
      <ReportDataTable
        title="Low stock items"
        columns={[
          { key: "name", header: "Item" },
          { key: "category", header: "Category" },
          { key: "qty", header: "On hand", align: "right" },
          { key: "reorder", header: "Reorder level", align: "right" },
          { key: "status", header: "Status" },
        ]}
        rows={items.map((r) => ({
          name: r.name,
          category: r.category,
          qty: `${r.quantityOnHand} ${r.unit}`,
          reorder: r.reorderLevel ?? "—",
          status: getStockStatusLabel(r.status),
        }))}
      />
    </ReportPageShell>
  );
}
