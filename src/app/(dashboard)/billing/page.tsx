import { getInvoices, getBillingStats } from "@/actions/billing";
import { generateTrialInvoice, getSalonSubscriptionStatus } from "@/actions/subscription";
import { BillingClient } from "./billing-client";
import { getServiceOptions } from "@/actions/services";
import { getActiveEmployees } from "@/actions/employees";
import { getSeats } from "@/actions/seats";
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
  const plan = await getSalonPlan(session.user.salonId);
  const basicBilling = isBasicPlan(plan);

  const [invoices, stats, services, employees, seats, salon, platformBilling, whatsappSettings] =
    await Promise.all([
      getInvoices({
        status: params.status,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        employeeId: params.employeeId,
      }),
      getBillingStats(),
      getServiceOptions(),
      getActiveEmployees(),
      getSeats(),
      prisma.salon.findUnique({
        where: { id: session.user.salonId },
        select: { name: true, gstEnabled: true },
      }),
      getSalonSubscriptionStatus(session.user.salonId),
      getWhatsAppSettingsAction(),
    ]);

  if (
    platformBilling.subscription?.status === "trial" &&
    platformBilling.subscription.trialEndsAt
  ) {
    await generateTrialInvoice(session.user.salonId).catch(() => undefined);
    const refreshed = await getSalonSubscriptionStatus(session.user.salonId);
    platformBilling.invoices = refreshed.invoices;
  }

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
      seats={seats.map((s) => ({ id: s.id, number: s.number }))}
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
      platformInvoices={platformBilling.invoices}
      subscriptionPlanName={
        platformBilling.subscription?.planName ?? "Enterprise"
      }
      initialTab={params.tab === "subscription" ? "subscription" : "customers"}
    />
  );
}
