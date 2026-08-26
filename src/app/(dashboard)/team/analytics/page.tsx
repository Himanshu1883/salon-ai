import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  getStaffAnalyticsEmployees,
  getStaffAnalyticsRangeLabel,
  type StaffAnalyticsSearchParams,
} from "@/actions/staff-analytics";
import { StaffAnalyticsFilters } from "@/components/team/analytics/staff-analytics-filters";
import {
  StaffAnalyticsChartsSection,
  StaffAnalyticsDetailsSection,
  StaffAnalyticsOverviewSection,
} from "@/components/team/analytics/staff-analytics-sections";
import {
  StaffAnalyticsChartsSkeleton,
  StaffAnalyticsDetailsSkeleton,
  StaffAnalyticsOverviewSkeleton,
} from "@/components/team/analytics/staff-analytics-skeletons";
import { PermissionDeniedError } from "@/lib/permissions/require";

async function StaffAnalyticsHeader({
  params,
}: {
  params: StaffAnalyticsSearchParams;
}) {
  const [employees, rangeLabel] = await Promise.all([
    getStaffAnalyticsEmployees(),
    getStaffAnalyticsRangeLabel(params),
  ]);

  return (
    <StaffAnalyticsFilters
      employees={employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
      }))}
      searchParams={params}
      rangeLabel={rangeLabel}
    />
  );
}

export default async function StaffAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<StaffAnalyticsSearchParams>;
}) {
  const params = await searchParams;

  try {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<StaffAnalyticsOverviewSkeleton />}>
          <StaffAnalyticsHeader params={params} />
        </Suspense>

        <Suspense fallback={<StaffAnalyticsOverviewSkeleton />}>
          <StaffAnalyticsOverviewSection params={params} />
        </Suspense>

        <Suspense fallback={<StaffAnalyticsChartsSkeleton />}>
          <StaffAnalyticsChartsSection params={params} />
        </Suspense>

        <Suspense fallback={<StaffAnalyticsDetailsSkeleton />}>
          <StaffAnalyticsDetailsSection params={params} />
        </Suspense>
      </div>
    );
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      redirect("/team/members");
    }
    throw error;
  }
}
