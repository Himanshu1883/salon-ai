import {
  getActiveMemberships,
  getMembershipPlans,
} from "@/actions/memberships";
import { ActiveMembershipsClient } from "@/components/memberships/active-memberships-client";

export default async function ActiveMembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    planId?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const [memberships, plans] = await Promise.all([
    getActiveMemberships({
      status: (params.status as "ACTIVE" | "EXPIRED" | "all") ?? "ACTIVE",
      planId: params.planId,
      search: params.search,
    }),
    getMembershipPlans(),
  ]);

  return (
    <ActiveMembershipsClient
      memberships={memberships}
      plans={plans.map((p) => ({ id: p.id, name: p.name }))}
      filters={params}
    />
  );
}
