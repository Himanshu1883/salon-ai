import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function GiftCardsPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Gift Cards"
        description="Sell and redeem digital gift cards."
      />
      <MembershipComingSoon
        title="Gift Cards"
        description="Create, sell, and track gift card balances for your salon."
      />
    </div>
  );
}
