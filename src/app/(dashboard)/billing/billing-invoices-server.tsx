import { getInvoices } from "@/actions/billing";
import { BillingInvoiceListClient } from "./billing-invoice-list-client";

type BillingInvoicesServerProps = {
  searchParams: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    employeeId?: string;
    page?: string;
  };
  isBasicPlan: boolean;
};

export async function BillingInvoicesServer({
  searchParams,
  isBasicPlan,
}: BillingInvoicesServerProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const { invoices, totalCount, pageSize } = await getInvoices({
    status: searchParams.status,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    employeeId: searchParams.employeeId,
    page,
    pageSize: 50,
  });

  return (
    <BillingInvoiceListClient
      invoices={invoices}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      isBasicPlan={isBasicPlan}
    />
  );
}
