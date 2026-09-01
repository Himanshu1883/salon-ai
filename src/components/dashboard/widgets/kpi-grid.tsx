import {
  Calendar,
  IndianRupee,
  FileText,
  Users,
  ListOrdered,
} from "lucide-react";
import { CompactKpiCard } from "@/components/dashboard/cards/compact-kpi-card";
import { formatCurrency } from "@/lib/currency";

type KpiGridProps = {
  revenueToday: number;
  pendingAppointmentsToday: number;
  activeQueue: number;
  employeesOnDuty: number;
  unpaidInvoices: number;
};

export function KpiGrid({
  revenueToday,
  pendingAppointmentsToday,
  activeQueue,
  employeesOnDuty,
  unpaidInvoices,
}: KpiGridProps) {
  const cards = [
    {
      delay: 0,
      label: "Today's Revenue",
      value: formatCurrency(revenueToday),
      href: "/sales/daily",
      icon: <IndianRupee className="h-5 w-5 text-white" />,
      iconGradient: "from-violet-600 to-purple-500 text-white",
    },
    {
      delay: 0.03,
      label: "Appointments",
      value: String(pendingAppointmentsToday),
      href: "/sales/appointments",
      icon: <Calendar className="h-5 w-5 text-white" />,
      iconGradient: "from-rose-500 to-pink-500 text-white",
    },
    {
      delay: 0.06,
      label: "Walk-ins / Queue",
      value: String(activeQueue),
      href: "/queue",
      icon: <ListOrdered className="h-5 w-5 text-white" />,
      iconGradient: "from-orange-500 to-amber-500 text-white",
    },
    {
      delay: 0.09,
      label: "Staff On Duty",
      value: String(employeesOnDuty),
      href: "/team/members",
      icon: <Users className="h-5 w-5 text-white" />,
      iconGradient: "from-indigo-500 to-violet-500 text-white",
    },
    {
      delay: 0.12,
      label: "Pending Payments",
      value: String(unpaidInvoices),
      href: "/billing?status=unpaid",
      icon: <FileText className="h-5 w-5 text-white" />,
      iconGradient: "from-emerald-500 to-teal-500 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 @min-[68rem]:grid-cols-5">
      {cards.map((card, index) => (
        <CompactKpiCard
          key={card.label}
          size="lg"
          {...card}
          className={index === 0 ? "max-sm:col-span-2" : undefined}
        />
      ))}
    </div>
  );
}
