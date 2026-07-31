import { getSalesByItemType } from "@/actions/sales";
import { getActiveEmployees } from "@/actions/employees";
import { ItemTypeSalesClient } from "@/components/sales/item-type-sales-client";

export default async function MembershipsSoldPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const [{ sales, totalAmount, totalQty }, employees] = await Promise.all([
    getSalesByItemType("MEMBERSHIP", {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getActiveEmployees(),
  ]);

  return (
    <ItemTypeSalesClient
      title="Memberships sold"
      subtitle="Manage membership sales and recurring revenue."
      itemType="MEMBERSHIP"
      addButtonLabel="Add membership sale"
      addDialogTitle="Record membership sale"
      descriptionPlaceholder="e.g. Gold membership — 12 months"
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
