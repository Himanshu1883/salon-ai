import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function FamilyMembershipPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Family Membership"
        description="Shared memberships for families and groups."
      />
      <MembershipComingSoon
        title="Family Membership"
        description="Add family members to shared membership plans with linked benefits."
      />
    </div>
  );
}
