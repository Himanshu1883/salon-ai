import { getMembershipDashboardStats } from "@/actions/memberships";
import { MembershipDashboardClient } from "@/components/memberships/membership-dashboard-client";

export default async function MembershipsDashboardPage() {
  const stats = await getMembershipDashboardStats();
  return <MembershipDashboardClient stats={stats} />;
}
