import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function MembershipOffersPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Offers & Promotions"
        description="Limited-time membership deals and campaigns."
      />
      <MembershipComingSoon
        title="Offers & Promotions"
        description="Create promotional offers and discount campaigns for membership plans."
      />
    </div>
  );
}
