import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function MembershipRenewalsPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Renewals"
        description="Upcoming renewals and auto-renew management."
      />
      <MembershipComingSoon
        title="Renewals"
        description="Track expiring memberships and process renewals in one place."
      />
    </div>
  );
}
