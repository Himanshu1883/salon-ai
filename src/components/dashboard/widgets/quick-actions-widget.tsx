"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserPlus,
  Calendar,
  Receipt,
  ListOrdered,
  PackageMinus,
} from "lucide-react";
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
    description: "Walk-in customer",
    icon: UserPlus,
    enterpriseOnly: true,
    className:
      "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-md shadow-fuchsia-200/50 hover:from-fuchsia-600 hover:to-pink-700 border-transparent",
    iconClassName: "bg-white/15 text-white",
    descriptionClassName: "text-white/80",
  },
  {
    type: "link",
    href: "/sales/appointments",
    label: "New Appointment",
    description: "Book a time slot",
    icon: Calendar,
    className:
      "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200/50 hover:from-violet-700 hover:to-purple-800 border-transparent",
    iconClassName: "bg-white/15 text-white",
    descriptionClassName: "text-white/80",
  },
  {
    type: "button",
    id: "record-sale",
    label: "Record Sale",
    description: "Create invoice",
    icon: Receipt,
    className:
      "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 border-transparent",
    iconClassName: "bg-white/15 text-white",
    descriptionClassName: "text-white/80",
  },
  {
    type: "link",
    href: "/inventory/low-stock",
    label: "Low Stock",
    description: "Restock inventory",
    icon: PackageMinus,
    className:
      "bg-white text-stone-900 shadow-[0_4px_18px_rgba(15,23,42,0.05)] hover:bg-stone-50/80",
    iconClassName: "bg-red-100 text-red-600",
    descriptionClassName: "text-stone-500",
  },
  {
    type: "link",
    href: "/queue",
    label: "View Queue",
    description: "Manage live queue",
    icon: ListOrdered,
    enterpriseOnly: true,
    className:
      "bg-white text-stone-900 shadow-[0_4px_18px_rgba(15,23,42,0.05)] hover:bg-stone-50/80",
    iconClassName: "bg-emerald-100 text-emerald-600",
    descriptionClassName: "text-stone-500",
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
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl xl:h-11 xl:w-11",
          action.iconClassName
        )}
      >
        <action.icon className="h-5 w-5" />
      </div>
      <div className="hidden min-w-0 text-left sm:block">
        <p className="text-[11px] font-semibold leading-tight sm:text-sm">{action.label}</p>
        <p className={cn("truncate text-[10px] sm:text-xs", action.descriptionClassName)}>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="flex gap-2 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 @min-[68rem]:grid-cols-5"
    >
      {visibleActions.map((action) => {
        const cardClassName = cn(
          "flex aspect-square min-w-0 flex-1 items-center justify-center rounded-2xl border-0 p-2 transition-all hover:scale-[1.01] hover:shadow-md sm:aspect-auto sm:w-full sm:flex-none sm:justify-start sm:gap-3 sm:px-4 sm:py-3.5 xl:px-5 xl:py-4",
          action.className
        );

        if (action.type === "button") {
          return (
            <button
              key={action.id}
              type="button"
              aria-label={action.label}
              title={action.label}
              onClick={() => openRecordSale()}
              className={cardClassName}
            >
              <ActionCardContent action={action} />
            </button>
          );
        }

        return (
          <Link
            key={action.href}
            href={action.href}
            aria-label={action.label}
            title={action.label}
            className={cardClassName}
          >
            <ActionCardContent action={action} />
          </Link>
        );
      })}
    </motion.div>
  );
}
