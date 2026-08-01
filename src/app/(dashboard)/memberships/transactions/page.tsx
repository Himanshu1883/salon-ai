import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function MembershipTransactionsPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Transactions"
        description="Full membership transaction history."
      />
      <MembershipComingSoon
        title="Transactions"
        description="Browse all membership purchases, renewals, wallet and loyalty transactions."
      />
    </div>
  );
}
