import { getDashboardKpis } from "@/actions/dashboard";
import { KpiGrid } from "@/components/dashboard/widgets/kpi-grid";
import { QuickActionsWidget } from "./widgets/quick-actions-widget";

export async function DashboardKpiSection() {
  const kpis = await getDashboardKpis();
  return (
    <div className="@container min-w-0 space-y-3 sm:space-y-4 xl:space-y-5">
      <QuickActionsWidget delay={0.05} />
      <KpiGrid
        revenueToday={kpis.revenueToday}
        pendingAppointmentsToday={kpis.pendingAppointmentsToday}
        activeQueue={kpis.activeQueue}
        employeesOnDuty={kpis.employeesOnDuty}
        unpaidInvoices={kpis.unpaidInvoices}
      />
    </div>
  );
}
