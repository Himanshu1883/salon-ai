import { getDashboardKpis } from "@/actions/dashboard";
import { KpiGrid } from "@/components/dashboard/widgets/kpi-grid";
import { getAuthSession } from "@/lib/auth";
import { getSalonPlan } from "@/lib/plan-access";
import { normalizeSalonPlan } from "@/lib/plans";

export async function DashboardKpiSection() {
  const session = await getAuthSession();
  const salonId = session?.user?.salonId;

  const [kpis, plan] = await Promise.all([
    getDashboardKpis(),
    salonId ? getSalonPlan(salonId) : Promise.resolve(normalizeSalonPlan(null)),
  ]);

  return (
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
  );
}
