import { getPaymentsBreakdown } from "@/actions/sales";
import { PaymentsClient } from "@/components/sales/payments-client";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const { breakdown, invoices, grandTotal } = await getPaymentsBreakdown({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  return (
    <PaymentsClient
      breakdown={breakdown}
      grandTotal={grandTotal}
      invoices={invoices}
      filters={{
        dateFrom: params.dateFrom ?? "",
        dateTo: params.dateTo ?? "",
      }}
    />
  );
}
