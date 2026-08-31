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
    <div className="@container min-w-0 space-y-3 sm:space-y-4 xl:space-y-5 animate-pulse">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 @min-[68rem]:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`action-${i}`} className="h-[68px] rounded-2xl bg-white shadow-sm xl:h-[76px]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 @min-[68rem]:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`kpi-${i}`} className="h-[68px] rounded-2xl bg-white shadow-sm xl:h-[76px]" />
        ))}
      </div>
    </div>
  );
}

function WidgetsSkeleton() {
  return (
    <div className="@container min-w-0 space-y-3 sm:space-y-4 xl:space-y-6">
      <div className="h-16 rounded-[20px] bg-[#E8ECF4] animate-pulse" />
      <div className="grid min-w-0 grid-cols-1 gap-3 @min-[56rem]:grid-cols-3">
        <ChartLoadingSkeleton />
        <ChartLoadingSkeleton />
        <ChartLoadingSkeleton />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-3 @min-[40rem]:grid-cols-2">
        <div className="h-[22rem] rounded-[20px] border border-[#E8ECF4] bg-white animate-pulse sm:h-[28rem] lg:h-[34rem]" />
        <div className="h-[22rem] rounded-[20px] border border-[#E8ECF4] bg-white animate-pulse sm:h-[28rem] lg:h-[34rem]" />
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-[20px] border border-[#E8ECF4] bg-white animate-pulse"
          />
        ))}
      </div>
    </div>
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
      <div className="min-w-0 space-y-3 sm:space-y-4 xl:space-y-6">
        <DashboardStaleRefresh />
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
    <div className="min-w-0 space-y-3 sm:space-y-4 xl:space-y-6">
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
