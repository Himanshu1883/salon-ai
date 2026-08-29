import { getBillingOverview } from "@/actions/billing";
import { requireSession } from "@/lib/auth";
import { BillingClient } from "./billing-client";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    employeeId?: string;
    customerName?: string;
    customerPhone?: string;
    tab?: string;
    page?: string;
  }>;
}) {
  await requireSession();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const overview = await getBillingOverview({
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    employeeId: params.employeeId,
    page,
  });

  return (
    <BillingClient
      overview={overview}
      filters={{
        status: params.status ?? "all",
        dateFrom: params.dateFrom ?? "",
        dateTo: params.dateTo ?? "",
        employeeId: params.employeeId ?? "all",
      }}
      prefilledCustomer={{
        name: params.customerName ?? "",
        phone: params.customerPhone ?? "",
      }}
      autoOpenCreate={Boolean(params.customerName)}
      initialTab={params.tab === "subscription" ? "subscription" : "customers"}
    />
  );
}
