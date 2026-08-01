import {
  getMembershipPlans,
  getMembershipBenefits,
} from "@/actions/memberships";
import { MembershipPlansClient } from "@/components/memberships/membership-plans-client";

export default async function MembershipPlansPage() {
  const [plans, benefits] = await Promise.all([
    getMembershipPlans(true),
    getMembershipBenefits(),
  ]);

  return <MembershipPlansClient plans={plans} benefits={benefits} />;
}
