"use client";

import Link from "next/link";
import {
  UserPlus,
  Calendar,
  Receipt,
  ListOrdered,
  PackageMinus,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import { usePlan } from "@/components/plans/plan-provider";
import { useRecordSale } from "@/components/dashboard/record-sale-provider";

type ActionStyle = {
  label: string;
  description: string;
  icon: typeof UserPlus;
  className: string;
  iconClassName: string;
  descriptionClassName: string;
};

type LinkAction = ActionStyle & {
  type: "link";
  href: string;
  enterpriseOnly?: boolean;
};

type ButtonAction = ActionStyle & {
  type: "button";
  id: string;
};

type QuickAction = LinkAction | ButtonAction;

const quickActions: QuickAction[] = [
  {
    type: "link",
    href: "/check-in",
    label: "Check-in",
    description: "Add walk-in customer",
    icon: UserPlus,
    enterpriseOnly: true,
    className:
      "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-md shadow-fuchsia-200/50 hover:from-fuchsia-600 hover:to-pink-700",
    iconClassName: "bg-white/15",
    descriptionClassName: "text-white/80",
  },
  {
    type: "link",
    href: "/sales/appointments",
    label: "New Appointment",
    description: "Book a time slot",
    icon: Calendar,
    className:
      "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200/50 hover:from-violet-700 hover:to-purple-800",
    iconClassName: "bg-white/15",
    descriptionClassName: "text-white/80",
  },
  {
    type: "button",
    id: "record-sale",
    label: "Record Sale",
    description: "Create invoice",
    icon: Receipt,
    className:
      "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700",
    iconClassName: "bg-white/15",
    descriptionClassName: "text-white/80",
  },
  {
    type: "link",
    href: "/inventory/low-stock",
    label: "Low Stock",
    description: "Restock inventory",
    icon: PackageMinus,
    className:
      "border-2 border-red-200 bg-white text-red-700 shadow-sm hover:border-red-300 hover:bg-red-50/50",
    iconClassName: "bg-red-100 text-red-600",
    descriptionClassName: "text-red-600/80",
  },
  {
    type: "link",
    href: "/queue",
    label: "View Queue",
    description: "Manage live queue",
    icon: ListOrdered,
    enterpriseOnly: true,
    className:
      "border-2 border-emerald-200 bg-white text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/50",
    iconClassName: "bg-emerald-100 text-emerald-600",
    descriptionClassName: "text-emerald-600/80",
  },
];

type QuickActionsWidgetProps = {
  delay?: number;
};

function ActionCardContent({ action }: { action: ActionStyle }) {
  return (
    <>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl xl:h-10 xl:w-10 xl:rounded-2xl",
          action.iconClassName
        )}
      >
        <action.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{action.label}</p>
        <p className={cn("text-xs", action.descriptionClassName)}>
          {action.description}
        </p>
      </div>
    </>
  );
}

export function QuickActionsWidget({ delay = 0 }: QuickActionsWidgetProps) {
  const { isEnterprise } = usePlan();
  const { openRecordSale } = useRecordSale();

  const visibleActions = quickActions.filter(
    (action) =>
      action.type === "button" ||
      !action.enterpriseOnly ||
      isEnterprise
  );

  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="p-4 pb-3 xl:p-6 xl:pb-4">
        <h3 className="text-base font-semibold text-dashboard-text xl:text-lg">Quick Actions</h3>
      </div>
      <div className="grid gap-2.5 px-4 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3 xl:px-6 xl:pb-6">
        {visibleActions.map((action) => {
          const cardClassName = cn(
            "flex flex-col gap-2 rounded-xl px-3 py-3 transition-all hover:scale-[1.02] xl:gap-3 xl:rounded-2xl xl:px-4 xl:py-4",
            action.className
          );

          if (action.type === "button") {
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => openRecordSale()}
                className={cardClassName}
              >
                <ActionCardContent action={action} />
              </button>
            );
          }

          return (
            <Link key={action.href} href={action.href} className={cardClassName}>
              <ActionCardContent action={action} />
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}
