import { redirect } from "next/navigation";
import {
  getStaffAnalytics,
  type StaffAnalyticsSearchParams,
} from "@/actions/staff-analytics";
import { StaffAnalyticsClient } from "@/components/team/analytics/staff-analytics-client";
import { PermissionDeniedError } from "@/lib/permissions/require";

export default async function StaffAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<StaffAnalyticsSearchParams>;
}) {
  const params = await searchParams;

  try {
    const data = await getStaffAnalytics(params);

    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <StaffAnalyticsClient data={data} searchParams={params} />
      </div>
    );
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      redirect("/team/members");
    }
    throw error;
  }
}
