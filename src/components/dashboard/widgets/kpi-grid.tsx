import {
  Calendar,
  IndianRupee,
  Package,
  FileText,
  Users,
  ListOrdered,
  Repeat,
  BarChart3,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/cards/kpi-card";
import { formatCurrency } from "@/lib/currency";
import { isBasicPlan, type SalonPlan } from "@/lib/plans";
import type { RevenueDay } from "@/actions/dashboard";

type KpiGridProps = {
  plan: SalonPlan;
  revenueToday: number;
  revenueMonth: number;
  revenueTrend: number;
  revenueByDay: RevenueDay[];
  todayAppointments: number;
  activeQueue: number;
  waitingCount: number;
  employeesOnDuty: number;
  lowStockCount: number;
  unpaidInvoices: number;
  totalCustomers: number;
};

export function KpiGrid({
  plan,
  revenueToday,
  revenueMonth,
  revenueTrend,
  revenueByDay,
  todayAppointments,
  activeQueue,
  waitingCount,
  employeesOnDuty,
  lowStockCount,
  unpaidInvoices,
  totalCustomers,
}: KpiGridProps) {
  const sparkline = revenueByDay.map((d) => ({ value: d.revenue }));

  const weekTotal = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
  const weekDays = revenueByDay.filter((d) => d.revenue > 0).length || 1;
  const avgSale =
    weekTotal > 0 ? formatCurrency(Math.round(weekTotal / weekDays)) : "—";

  if (isBasicPlan(plan)) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-4">
        <KpiCard
          delay={0}
          label="Today's Revenue"
          value={formatCurrency(revenueToday)}
          sublabel={`${formatCurrency(revenueMonth)} this month`}
          href="/sales/daily"
          trend={revenueTrend}
          sparkline={sparkline}
          icon={<IndianRupee className="h-5 w-5 text-white" />}
          iconGradient="from-violet-600 to-purple-500 text-white"
        />
        <KpiCard
          delay={0.05}
          label="Appointments"
          value={String(todayAppointments)}
          sublabel={`${todayAppointments} scheduled today`}
          href="/sales/appointments"
          icon={<Calendar className="h-5 w-5 text-white" />}
          iconGradient="from-rose-500 to-pink-500 text-white"
        />
        <KpiCard
          delay={0.1}
          label="Low Stock"
          value={String(lowStockCount)}
          sublabel={lowStockCount > 0 ? "Items need restocking" : "All stocked"}
          href="/inventory/stock"
          icon={<Package className="h-5 w-5 text-white" />}
          iconGradient="from-red-500 to-rose-500 text-white"
        />
        <KpiCard
          delay={0.15}
          label="Avg Sale (7d)"
          value={avgSale}
          sublabel="Daily average"
          href="/reports"
          icon={<BarChart3 className="h-5 w-5 text-white" />}
          iconGradient="from-fuchsia-500 to-purple-600 text-white"
        />
        <KpiCard
          delay={0.2}
          label="Monthly Revenue"
          value={formatCurrency(revenueMonth)}
          sublabel="Month to date"
          href="/sales/daily"
          sparkline={sparkline}
          icon={<IndianRupee className="h-5 w-5 text-white" />}
          iconGradient="from-purple-600 to-violet-700 text-white"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-4">
      <KpiCard
        delay={0}
        label="Today's Revenue"
        value={formatCurrency(revenueToday)}
        sublabel={`${formatCurrency(revenueMonth)} this month`}
        href="/sales/daily"
        trend={revenueTrend}
        sparkline={sparkline}
        icon={<IndianRupee className="h-5 w-5 text-white" />}
        iconGradient="from-violet-600 to-purple-500 text-white"
      />
      <KpiCard
        delay={0.05}
        label="Appointments"
        value={String(todayAppointments)}
        sublabel={`${todayAppointments} scheduled today`}
        href="/sales/appointments"
        icon={<Calendar className="h-5 w-5 text-white" />}
        iconGradient="from-rose-500 to-pink-500 text-white"
      />
      <KpiCard
        delay={0.1}
        label="Walk-ins / Queue"
        value={String(activeQueue)}
        sublabel={`${waitingCount} waiting`}
        href="/queue"
        icon={<ListOrdered className="h-5 w-5 text-white" />}
        iconGradient="from-orange-500 to-amber-500 text-white"
      />
      <KpiCard
        delay={0.15}
        label="Customers Waiting"
        value={String(waitingCount)}
        sublabel={waitingCount > 0 ? "In queue now" : "Queue clear"}
        href="/queue"
        icon={<Users className="h-5 w-5 text-white" />}
        iconGradient="from-sky-500 to-cyan-500 text-white"
      />
      <KpiCard
        delay={0.2}
        label="Staff On Duty"
        value={String(employeesOnDuty)}
        sublabel="Active team members"
        href="/team/members"
        icon={<Users className="h-5 w-5 text-white" />}
        iconGradient="from-indigo-500 to-violet-500 text-white"
      />
      <KpiCard
        delay={0.25}
        label="Low Stock"
        value={String(lowStockCount)}
        sublabel={lowStockCount > 0 ? "Items need restocking" : "All stocked"}
        href="/inventory/stock"
        icon={<Package className="h-5 w-5 text-white" />}
        iconGradient="from-red-500 to-rose-500 text-white"
      />
      <KpiCard
        delay={0.3}
        label="Pending Payments"
        value={String(unpaidInvoices)}
        sublabel="Awaiting payment"
        href="/billing"
        icon={<FileText className="h-5 w-5 text-white" />}
        iconGradient="from-emerald-500 to-teal-500 text-white"
      />
      <KpiCard
        delay={0.35}
        label="Avg Sale (7d)"
        value={avgSale}
        sublabel="Daily average"
        href="/reports/finance/revenue-summary"
        icon={<BarChart3 className="h-5 w-5 text-white" />}
        iconGradient="from-fuchsia-500 to-purple-600 text-white"
      />
      <KpiCard
        delay={0.4}
        label="Total Customers"
        value={String(totalCustomers)}
        sublabel="Repeat rate —"
        href="/clients"
        icon={<Repeat className="h-5 w-5 text-white" />}
        iconGradient="from-violet-500 to-indigo-500 text-white"
      />
      <KpiCard
        delay={0.45}
        label="Monthly Revenue"
        value={formatCurrency(revenueMonth)}
        sublabel="Month to date"
        href="/sales/daily"
        sparkline={sparkline}
        icon={<IndianRupee className="h-5 w-5 text-white" />}
        iconGradient="from-purple-600 to-violet-700 text-white"
      />
    </div>
  );
}
