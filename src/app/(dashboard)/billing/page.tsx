import { Suspense } from "react";
import { getBillingStats } from "@/actions/billing";
import { getEmployeeOptions } from "@/actions/employees";
import { requireSession } from "@/lib/auth";
import { normalizeSalonPlan, isBasicPlan } from "@/lib/plans";
import { BillingClient } from "./billing-client";
import { BillingInvoicesServer } from "./billing-invoices-server";
import { BillingTableSkeleton } from "@/components/billing/billing-table-skeleton";

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
  const session = await requireSession();
  const params = await searchParams;
  const plan = normalizeSalonPlan(session.user.plan ?? "ENTERPRISE");

  const [stats, employees] = await Promise.all([
    getBillingStats(),
    getEmployeeOptions(),
  ]);

  const invoiceFilters = {
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    employeeId: params.employeeId,
    page: params.page,
  };

  return (
    <BillingClient
      stats={stats}
      employees={employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
      }))}
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
      isBasicPlan={isBasicPlan(plan)}
      initialTab={params.tab === "subscription" ? "subscription" : "customers"}
      invoicesContent={
        <Suspense
          key={JSON.stringify(invoiceFilters)}
          fallback={<BillingTableSkeleton />}
        >
          <BillingInvoicesServer
            searchParams={invoiceFilters}
            isBasicPlan={isBasicPlan(plan)}
          />
        </Suspense>
      }
    />
  );
}
