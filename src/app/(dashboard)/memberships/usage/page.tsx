import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function MembershipUsagePage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Membership Usage"
        description="Track benefit usage and service redemptions."
      />
      <MembershipComingSoon
        title="Membership Usage"
        description="View detailed logs of membership benefits used per visit and invoice."
      />
    </div>
  );
}
