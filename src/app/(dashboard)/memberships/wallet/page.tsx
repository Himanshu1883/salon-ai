import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function WalletMembershipPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Wallet Membership"
        description="Prepaid wallet balances and top-up management."
      />
      <MembershipComingSoon
        title="Wallet Membership"
        description="Manage client wallet balances, top-ups, and membership-linked credits."
      />
    </div>
  );
}
