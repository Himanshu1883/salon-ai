import { MembershipComingSoon, MembershipPageHeader } from "@/components/memberships/memberships-shell";

export default function MembershipReportsPage() {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Membership Reports"
        description="Analytics and exportable membership reports."
      />
      <MembershipComingSoon
        title="Reports"
        description="Revenue, retention, plan performance, and loyalty analytics reports."
      />
    </div>
  );
}
