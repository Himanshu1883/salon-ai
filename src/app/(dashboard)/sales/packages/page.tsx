import { getSalesByItemType } from "@/actions/sales";
import { getActiveEmployees } from "@/actions/employees";
import { ItemTypeSalesClient } from "@/components/sales/item-type-sales-client";

export default async function PackagesSoldPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const [{ sales, totalAmount, totalQty }, employees] = await Promise.all([
    getSalesByItemType("PACKAGE", {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getActiveEmployees(),
  ]);

  return (
    <ItemTypeSalesClient
      title="Packages sold"
      subtitle="Track package sales and bundled service revenue."
      itemType="PACKAGE"
      addButtonLabel="Add package sale"
      addDialogTitle="Record package sale"
      descriptionPlaceholder="e.g. Bridal package — 5 sessions"
      sales={sales}
      totalAmount={totalAmount}
      totalQty={totalQty}
      employees={employees.map((e) => ({ id: e.id, name: e.name }))}
      filters={{
        dateFrom: params.dateFrom ?? "",
        dateTo: params.dateTo ?? "",
      }}
    />
  );
}
