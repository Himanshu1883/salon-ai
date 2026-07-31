import { Suspense } from "react";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { DashboardKpiSection } from "@/components/dashboard/dashboard-kpi-section";
import { DashboardWidgetsSection } from "@/components/dashboard/dashboard-widgets-section";
import {
  DashboardLoadingSkeleton,
  ChartLoadingSkeleton,
} from "@/components/dashboard/loading-skeletons";

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-[20px] border border-[#E8ECF4] bg-white"
        />
      ))}
    </div>
  );
}

function WidgetsSkeleton() {
  return (
    <>
      <div className="h-16 rounded-[20px] bg-[#E8ECF4] animate-pulse" />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
        <div className="h-80 rounded-[20px] border border-[#E8ECF4] bg-white xl:col-span-3 animate-pulse" />
        <ChartLoadingSkeleton />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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
