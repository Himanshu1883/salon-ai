import { getDashboardWidgets } from "@/actions/dashboard";
import { getEstimatedWaitMinutes } from "@/actions/queue";
import dynamic from "next/dynamic";
import { QueueAlertWidget } from "@/components/dashboard/widgets/queue-alert-widget";
import { ChartLoadingSkeleton } from "@/components/dashboard/loading-skeletons";
import { ScheduleWidget } from "@/components/dashboard/widgets/schedule-widget";
import { InventoryWidget } from "@/components/dashboard/widgets/inventory-widget";
import { ActivityWidget } from "@/components/dashboard/widgets/activity-widget";
import { TeamStatusWidget } from "@/components/dashboard/widgets/team-status-widget";
import { AlertsWidget } from "@/components/dashboard/widgets/alerts-widget";
import { QuickActionsWidget } from "@/components/dashboard/widgets/quick-actions-widget";
import { AiInsightsWidget } from "@/components/dashboard/widgets/ai-insights-widget";
import { TopStaffWidget } from "@/components/dashboard/widgets/top-staff-widget";
import { RecentCustomersWidget } from "@/components/dashboard/widgets/recent-customers-widget";
import {
  BirthdaysWidget,
  MembershipSalesWidget,
} from "@/components/dashboard/widgets/stub-widgets";

const RevenueAreaChart = dynamic(
  () =>
    import("@/components/dashboard/charts/revenue-area-chart").then(
      (m) => m.RevenueAreaChart
    ),
  { loading: () => <ChartLoadingSkeleton /> }
);

const AverageSaleChart = dynamic(
  () =>
    import("@/components/dashboard/charts/average-sale-chart").then(
      (m) => m.AverageSaleChart
    ),
  { loading: () => <ChartLoadingSkeleton /> }
);

const TotalCustomersChart = dynamic(
  () =>
    import("@/components/dashboard/charts/total-customers-chart").then(
      (m) => m.TotalCustomersChart
    ),
  { loading: () => <ChartLoadingSkeleton /> }
);

export async function DashboardWidgetsSection() {
  const [widgets, estimatedWait] = await Promise.all([
    getDashboardWidgets(),
    getEstimatedWaitMinutes(),
  ]);

  return (
    <div className="@container min-w-0 space-y-3 sm:space-y-4 xl:space-y-6">
      {/* <QuickActionsWidget delay={0.05} /> */}

      <QueueAlertWidget
        waitingCount={widgets.waitingCount}
        estimatedWait={estimatedWait}
      />

      <div className="grid min-w-0 grid-cols-1 gap-3 @min-[56rem]:grid-cols-3 xl:gap-4">
        <TotalCustomersChart
          data={widgets.customersByDay}
          totalCustomers={widgets.totalCustomers}
          delay={0.1}
        />
        <RevenueAreaChart
          data={widgets.revenueByDay}
          revenueMonth={widgets.revenueMonth}
          delay={0.15}
        />
        <AverageSaleChart data={widgets.revenueByDay} delay={0.2} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 @min-[40rem]:grid-cols-2 xl:gap-4">
        <ScheduleWidget
          appointments={widgets.todayAppointmentList ?? widgets.upcomingAppointments}
          delay={0.22}
        />
        <InventoryWidget
          items={widgets.lowStockItems}
          lowStockCount={widgets.lowStockCount}
          totalStockItems={widgets.totalStockItems}
          delay={0.25}
        />
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 @min-[56rem]:grid-cols-3 xl:gap-6">
        <ActivityWidget recentActivity={widgets.recentActivity} delay={0.2} />
        <TeamStatusWidget team={widgets.teamOnShift} delay={0.25} />
        <AlertsWidget
          lowStockCount={widgets.lowStockCount}
          unpaidInvoices={widgets.unpaidInvoices}
          pendingSms={widgets.pendingSms}
          trialEndingSoon={widgets.trialEndingSoon}
          trialEndsAt={widgets.trialEndsAt}
          overduePlatformInvoice={widgets.overduePlatformInvoice}
          delay={0.3}
        />
      </div>

      <AiInsightsWidget
        revenueToday={widgets.revenueToday}
        todayAppointments={widgets.todayAppointments}
        waitingCount={widgets.waitingCount}
        delay={0.35}
      />

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 @min-[56rem]:grid-cols-4 xl:gap-6">
        <TopStaffWidget topEarners={widgets.topEarners} delay={0.45} />
        <RecentCustomersWidget
          recentCustomers={widgets.recentCustomers}
          delay={0.5}
        />
        <MembershipSalesWidget delay={0.55} />
        <BirthdaysWidget delay={0.6} />
      </div>
    </div>
  );
}
