import { getDashboardKpis } from "@/actions/dashboard";
import { KpiGrid } from "@/components/dashboard/widgets/kpi-grid";
import { getAuthSession } from "@/lib/auth";
import { normalizeSalonPlan } from "@/lib/plans";
import { QuickActionsWidget } from "./widgets/quick-actions-widget";

export async function DashboardKpiSection() {
  const session = await getAuthSession();
  const plan = normalizeSalonPlan(session?.user?.plan);

  const kpis = await getDashboardKpis();
  return (<>
    <QuickActionsWidget delay={0.05} />
    <KpiGrid
      plan={plan}
      revenueToday={kpis.revenueToday}
      revenueMonth={kpis.revenueMonth}
      revenueTrend={kpis.revenueTrend}
      revenueByDay={kpis.revenueByDay}
      todayAppointments={kpis.todayAppointments}
      activeQueue={kpis.activeQueue}
      waitingCount={kpis.waitingCount}
      employeesOnDuty={kpis.employeesOnDuty}
      lowStockCount={kpis.lowStockCount}
      unpaidInvoices={kpis.unpaidInvoices}
      totalCustomers={kpis.totalCustomers}

      
    />

</>
  );
}
