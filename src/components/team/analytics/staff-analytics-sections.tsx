import dynamic from "next/dynamic";
import {
  getStaffAnalyticsCharts,
  getStaffAnalyticsDetails,
  getStaffAnalyticsOverview,
  getStaffAnalyticsRangeLabel,
  type StaffAnalyticsSearchParams,
} from "@/actions/staff-analytics";
import { StaffAnalyticsOverviewUi } from "@/components/team/analytics/staff-analytics-overview-ui";
import { StaffAnalyticsDetailsUi } from "@/components/team/analytics/staff-analytics-details-ui";
import { StaffAnalyticsChartsSkeleton } from "@/components/team/analytics/staff-analytics-skeletons";

const StaffAnalyticsChartsUi = dynamic(
  () =>
    import("@/components/team/analytics/staff-analytics-charts-ui").then(
      (mod) => mod.StaffAnalyticsChartsUi
    ),
  { loading: () => <StaffAnalyticsChartsSkeleton /> }
);

export async function StaffAnalyticsOverviewSection({
  params,
}: {
  params: StaffAnalyticsSearchParams;
}) {
  const data = await getStaffAnalyticsOverview(params);
  return <StaffAnalyticsOverviewUi data={data} />;
}

export async function StaffAnalyticsChartsSection({
  params,
}: {
  params: StaffAnalyticsSearchParams;
}) {
  const [charts, overview] = await Promise.all([
    getStaffAnalyticsCharts(params),
    getStaffAnalyticsOverview(params),
  ]);

  return (
    <StaffAnalyticsChartsUi
      charts={charts}
      appointments={overview.appointments}
      overview={overview.overview}
    />
  );
}

export async function StaffAnalyticsDetailsSection({
  params,
}: {
  params: StaffAnalyticsSearchParams;
}) {
  const [details, overview] = await Promise.all([
    getStaffAnalyticsDetails(params),
    getStaffAnalyticsOverview(params),
  ]);

  return (
    <StaffAnalyticsDetailsUi
      details={details}
      overviewExtras={{
        utilization: overview.utilization,
        attendance: overview.attendance,
        productSales: overview.productSales,
        customers: overview.customers,
      }}
      searchParams={params}
    />
  );
}
