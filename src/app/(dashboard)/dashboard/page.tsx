import { Suspense } from "react";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { DashboardKpiSection } from "@/components/dashboard/dashboard-kpi-section";
import { DashboardWidgetsSection } from "@/components/dashboard/dashboard-widgets-section";
import { DashboardStaleRefresh } from "@/components/dashboard/dashboard-stale-refresh";
import { EmployeeDashboardSection } from "@/components/dashboard/employee-dashboard-section";
import { getDataScopeContext } from "@/lib/permissions/data-scope";
import { ChartLoadingSkeleton } from "@/components/dashboard/loading-skeletons";

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-[60px] rounded-2xl bg-white shadow-sm sm:h-[64px]" />
      ))}
    </div>
  );
}

function WidgetsSkeleton() {
  return (
    <>
      <div className="h-16 rounded-[20px] bg-[#E8ECF4] animate-pulse" />
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-72 rounded-[20px] border border-[#E8ECF4] bg-white lg:col-span-3 animate-pulse xl:h-80" />
        <ChartLoadingSkeleton />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-[20px] border border-[#E8ECF4] bg-white animate-pulse"
          />
        ))}
      </div>
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const scope = await getDataScopeContext();

  if (scope.dataScope === "own") {
    return (
      <div className="space-y-4 xl:space-y-6">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-[20px] bg-[#E8ECF4]" />
          }
        >
          <EmployeeDashboardSection
            period={params.period}
            from={params.from}
            to={params.to}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-4 xl:space-y-6">
      <DashboardStaleRefresh />
      <Suspense fallback={null}>
        <WelcomeBanner />
      </Suspense>

      <Suspense fallback={<KpiSkeleton />}>
        <DashboardKpiSection />
      </Suspense>

      <Suspense fallback={<WidgetsSkeleton />}>
        <DashboardWidgetsSection />
      </Suspense>
    </div>
  );
}
