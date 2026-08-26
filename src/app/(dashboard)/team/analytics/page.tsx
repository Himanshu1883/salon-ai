import { redirect } from "next/navigation";
import {
  canAccessStaffAnalytics,
  getStaffAnalytics,
  type StaffAnalyticsSearchParams,
} from "@/actions/staff-analytics";
import { StaffAnalyticsClient } from "@/components/team/analytics/staff-analytics-client";

export default async function StaffAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<StaffAnalyticsSearchParams>;
}) {
  const allowed = await canAccessStaffAnalytics();
  if (!allowed) {
    redirect("/team/members");
  }

  const params = await searchParams;
  const data = await getStaffAnalytics(params);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <StaffAnalyticsClient data={data} searchParams={params} />
    </div>
  );
}
