import { getSalonPlanDetails } from "@/actions/plans";
import { getSubscriptionPageData } from "@/actions/subscription";
import { canAccessSettings } from "@/actions/salon";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubscriptionClient } from "./subscription-client";

export default async function SubscriptionSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const allowed = await canAccessSettings(session.user.id);
  if (!allowed) redirect("/dashboard");

  const [details, billing] = await Promise.all([
    getSalonPlanDetails(),
    getSubscriptionPageData(),
  ]);

  return (
    <SubscriptionClient
      plan={details.plan}
      planLabel={details.planLabel}
      subscription={billing.subscription}
      invoices={billing.invoices}
    />
  );
}
