import { getSalesByItemType } from "@/actions/sales";
import { getActiveEmployees } from "@/actions/employees";
import { ItemTypeSalesClient } from "@/components/sales/item-type-sales-client";

export default async function GiftCardsSoldPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const [{ sales, totalAmount, totalQty }, employees] = await Promise.all([
    getSalesByItemType("GIFT_CARD", {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getActiveEmployees(),
  ]);

  return (
    <ItemTypeSalesClient
      title="Gift cards sold"
      subtitle="Track gift card sales and revenue."
      itemType="GIFT_CARD"
      addButtonLabel="Add gift card sale"
      addDialogTitle="Record gift card sale"
      descriptionPlaceholder="e.g. ₹2,000 gift card"
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
