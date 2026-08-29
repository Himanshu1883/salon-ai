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
import { CompactKpiCard } from "@/components/dashboard/cards/compact-kpi-card";
import { formatCurrency } from "@/lib/currency";
import { isBasicPlan, type SalonPlan } from "@/lib/plans";
import type { RevenueDay } from "@/actions/dashboard";

type KpiGridProps = {
  plan: SalonPlan;
  revenueToday: number;
  revenueMonth: number;
  revenueTrend: number;
  revenueByDay: RevenueDay[];
  pendingAppointmentsToday: number;
  completedAppointmentsToday: number;
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
  revenueByDay,
  pendingAppointmentsToday,
  activeQueue,
  waitingCount,
  employeesOnDuty,
  lowStockCount,
  unpaidInvoices,
  totalCustomers,
}: KpiGridProps) {
  const weekTotal = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
  const weekDays = revenueByDay.filter((d) => d.revenue > 0).length || 1;
  const avgSale =
    weekTotal > 0 ? formatCurrency(Math.round(weekTotal / weekDays)) : "—";

  const cards = isBasicPlan(plan)
    ? [
        {
          delay: 0,
          label: "Today's Revenue",
          value: formatCurrency(revenueToday),
          href: "/sales/daily",
          icon: <IndianRupee className="h-4 w-4 text-white" />,
          iconGradient: "from-violet-600 to-purple-500 text-white",
        },
        {
          delay: 0.03,
          label: "Appointments",
          value: String(pendingAppointmentsToday),
          href: "/sales/appointments",
          icon: <Calendar className="h-4 w-4 text-white" />,
          iconGradient: "from-rose-500 to-pink-500 text-white",
        },
        {
          delay: 0.06,
          label: "Low Stock",
          value: String(lowStockCount),
          href: "/inventory/stock",
          icon: <Package className="h-4 w-4 text-white" />,
          iconGradient: "from-red-500 to-rose-500 text-white",
        },
        {
          delay: 0.09,
          label: "Avg Sale (7d)",
          value: avgSale,
          href: "/reports",
          icon: <BarChart3 className="h-4 w-4 text-white" />,
          iconGradient: "from-fuchsia-500 to-purple-600 text-white",
        },
        {
          delay: 0.12,
          label: "Monthly Revenue",
          value: formatCurrency(revenueMonth),
          href: "/sales/daily",
          icon: <IndianRupee className="h-4 w-4 text-white" />,
          iconGradient: "from-purple-600 to-violet-700 text-white",
        },
      ]
    : [
        {
          delay: 0,
          label: "Today's Revenue",
          value: formatCurrency(revenueToday),
          href: "/sales/daily",
          icon: <IndianRupee className="h-4 w-4 text-white" />,
          iconGradient: "from-violet-600 to-purple-500 text-white",
        },
        {
          delay: 0.03,
          label: "Appointments",
          value: String(pendingAppointmentsToday),
          href: "/sales/appointments",
          icon: <Calendar className="h-4 w-4 text-white" />,
          iconGradient: "from-rose-500 to-pink-500 text-white",
        },
        {
          delay: 0.06,
          label: "Walk-ins / Queue",
          value: String(activeQueue),
          href: "/queue",
          icon: <ListOrdered className="h-4 w-4 text-white" />,
          iconGradient: "from-orange-500 to-amber-500 text-white",
        },
        {
          delay: 0.09,
          label: "Customers Waiting",
          value: String(waitingCount),
          href: "/queue",
          icon: <Users className="h-4 w-4 text-white" />,
          iconGradient: "from-sky-500 to-cyan-500 text-white",
        },
        {
          delay: 0.12,
          label: "Staff On Duty",
          value: String(employeesOnDuty),
          href: "/team/members",
          icon: <Users className="h-4 w-4 text-white" />,
          iconGradient: "from-indigo-500 to-violet-500 text-white",
        },
        {
          delay: 0.15,
          label: "Low Stock",
          value: String(lowStockCount),
          href: "/inventory/stock",
          icon: <Package className="h-4 w-4 text-white" />,
          iconGradient: "from-red-500 to-rose-500 text-white",
        },
        {
          delay: 0.18,
          label: "Pending Payments",
          value: String(unpaidInvoices),
          href: "/billing?status=unpaid",
          icon: <FileText className="h-4 w-4 text-white" />,
          iconGradient: "from-emerald-500 to-teal-500 text-white",
        },
        {
          delay: 0.21,
          label: "Avg Sale (7d)",
          value: avgSale,
          href: "/reports/finance/revenue-summary",
          icon: <BarChart3 className="h-4 w-4 text-white" />,
          iconGradient: "from-fuchsia-500 to-purple-600 text-white",
        },
        {
          delay: 0.24,
          label: "Total Customers",
          value: String(totalCustomers),
          href: "/clients",
          icon: <Repeat className="h-4 w-4 text-white" />,
          iconGradient: "from-violet-500 to-indigo-500 text-white",
        },
        {
          delay: 0.27,
          label: "Monthly Revenue",
          value: formatCurrency(revenueMonth),
          href: "/sales/daily",
          icon: <IndianRupee className="h-4 w-4 text-white" />,
          iconGradient: "from-purple-600 to-violet-700 text-white",
        },
      ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3">
      {cards.map((card) => (
        <CompactKpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
