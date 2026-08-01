import { getSellMembershipData } from "@/actions/memberships";
import { SellMembershipClient } from "@/components/memberships/sell-membership-client";

export default async function SellMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const params = await searchParams;
  const data = await getSellMembershipData(params.customerId);

  return (
    <SellMembershipClient
      plans={data.plans}
      customer={data.customer}
      analytics={data.analytics}
      recommendation={data.recommendation}
      comparisons={data.comparisons}
    />
  );
}
