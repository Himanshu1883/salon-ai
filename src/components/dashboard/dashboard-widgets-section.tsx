import { getDashboardWidgets } from "@/actions/dashboard";
import { getEstimatedWaitMinutes } from "@/actions/queue";
import dynamic from "next/dynamic";
import { QueueAlertWidget } from "@/components/dashboard/widgets/queue-alert-widget";
import { ScheduleWidget } from "@/components/dashboard/widgets/schedule-widget";
import { ChartLoadingSkeleton } from "@/components/dashboard/loading-skeletons";
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

export async function DashboardWidgetsSection() {
  const [widgets, estimatedWait] = await Promise.all([
    getDashboardWidgets(),
    getEstimatedWaitMinutes(),
  ]);

  return (
    <>
      <QuickActionsWidget delay={0.05} />

      <QueueAlertWidget
        waitingCount={widgets.waitingCount}
        estimatedWait={estimatedWait}
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ScheduleWidget
            appointments={widgets.upcomingAppointments}
            delay={0.1}
          />
        </div>
        <div className="xl:col-span-2">
          <RevenueAreaChart
            data={widgets.revenueByDay}
            revenueMonth={widgets.revenueMonth}
            delay={0.15}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <TopStaffWidget topEarners={widgets.topEarners} delay={0.45} />
        <RecentCustomersWidget
          recentCustomers={widgets.recentCustomers}
          delay={0.5}
        />
        <MembershipSalesWidget delay={0.55} />
        <BirthdaysWidget delay={0.6} />
      </div>
    </>
  );
}
