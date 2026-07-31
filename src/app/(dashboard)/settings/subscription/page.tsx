import { getSalonPlanDetails } from "@/actions/plans";
import { SubscriptionClient } from "./subscription-client";

export default async function SubscriptionSettingsPage() {
  const details = await getSalonPlanDetails();

  return <SubscriptionClient plan={details.plan} planLabel={details.planLabel} />;
}
