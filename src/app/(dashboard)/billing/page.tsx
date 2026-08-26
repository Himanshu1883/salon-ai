import { getInvoices, getBillingStats } from "@/actions/billing";
import { getBillingSubscriptionTabData } from "@/actions/subscription";
import { BillingClient } from "./billing-client";
import { getServiceOptions } from "@/actions/services";
import { getEmployeeOptions } from "@/actions/employees";
import { getSeatOptions } from "@/actions/seats";
import { getSalonPlan } from "@/lib/plan-access";
import { isBasicPlan } from "@/lib/plans";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWhatsAppSettingsAction } from "@/actions/whatsapp";

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
  }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const loadSubscription = params.tab === "subscription";

  const [
    plan,
    invoices,
    stats,
    services,
    employees,
    seats,
    salon,
    subscriptionTab,
    whatsappSettings,
  ] = await Promise.all([
    getSalonPlan(session.user.salonId),
    getInvoices({
      status: params.status,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      employeeId: params.employeeId,
    }),
    getBillingStats(),
    getServiceOptions(),
    getEmployeeOptions(),
    getSeatOptions(),
    prisma.salon.findUnique({
      where: { id: session.user.salonId },
      select: { name: true, gstEnabled: true },
    }),
    loadSubscription ? getBillingSubscriptionTabData() : Promise.resolve(null),
    getWhatsAppSettingsAction(),
  ]);

  const basicBilling = isBasicPlan(plan);

  return (
    <BillingClient
      invoices={invoices}
      stats={stats}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        categoryName: s.category?.name ?? "Other",
        description: s.description,
      }))}
      employees={employees.map((e) => ({ id: e.id, name: e.name }))}
      seats={seats}
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
      isBasicPlan={basicBilling}
      salonName={salon?.name ?? "Salon"}
      gstEnabled={salon?.gstEnabled ?? true}
      whatsappSettings={whatsappSettings}
      platformInvoices={subscriptionTab?.invoices ?? []}
      subscriptionPlanName={subscriptionTab?.subscriptionPlanName ?? "Enterprise"}
      initialTab={loadSubscription ? "subscription" : "customers"}
    />
  );
}
