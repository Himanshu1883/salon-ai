import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function LoyaltyProgramPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Loyalty Program"
        description="Points earning, redemption, and tier rewards."
      />
      <MembershipComingSoon
        title="Loyalty Program"
        description="Configure points per rupee, redemption rates, and loyalty tiers."
      />
    </div>
  );
}
