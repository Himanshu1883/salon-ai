"use client";

import Link from "next/link";
import {
  UserPlus,
  Calendar,
  Receipt,
  ListOrdered,
  PackageMinus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePlan } from "@/components/plans/plan-provider";
import { useRecordSale } from "@/components/dashboard/record-sale-provider";

const actions = [
  {
    href: "/check-in",
    label: "Check-in",
    description: "Add walk-in customer",
    icon: UserPlus,
    className:
      "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-sm hover:from-fuchsia-600 hover:to-pink-700",
    iconClassName: "bg-white/15",
    descriptionClassName: "text-white/80",
  },
  {
    href: "/sales/appointments",
    label: "New Appointment",
    description: "Book a time slot",
    icon: Calendar,
    className:
      "bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-sm hover:from-violet-700 hover:to-violet-800",
    iconClassName: "bg-white/15",
    descriptionClassName: "text-white/80",
  },
  {
    label: "Record Sale",
    description: "Create invoice",
    icon: Receipt,
    action: "record-sale" as const,
    className:
      "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm hover:from-indigo-600 hover:to-violet-700",
    iconClassName: "bg-white/15",
    descriptionClassName: "text-white/80",
  },
  {
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
    href: "/queue",
    label: "View Queue",
    description: "Manage live queue",
    icon: ListOrdered,
    className:
      "border-2 border-emerald-200 bg-white text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/50",
    iconClassName: "bg-emerald-100 text-emerald-600",
    descriptionClassName: "text-emerald-600/80",
  },
] as const;

export function DashboardQuickActions() {
  const { isEnterprise } = usePlan();
  const { openRecordSale } = useRecordSale();
  const visibleActions = actions.filter((action) => {
    if ("href" in action && (action.href === "/check-in" || action.href === "/queue")) {
      return isEnterprise;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border-zinc-100 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {visibleActions.map((action) => {
              const cardClassName = cn(
                "flex flex-col gap-3 rounded-xl px-4 py-4 transition-all hover:scale-[1.01]",
                action.className
              );
              const cardContent = (
                <>
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
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

              if ("action" in action && action.action === "record-sale") {
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={openRecordSale}
                    className={cardClassName}
                  >
                    {cardContent}
                  </button>
                );
              }

              return (
                <Link
                  key={"href" in action ? action.href : action.label}
                  href={"href" in action ? action.href : "#"}
                  className={cardClassName}
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Link
        href="/schedule/ai"
        className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm transition-colors hover:bg-violet-100/60"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
        <p className="min-w-0 flex-1 text-sm text-violet-800">
          <span className="font-semibold">AI Schedule</span>
          <span className="text-violet-600">
            {" "}
            — find optimal time slots for your salon
          </span>
        </p>
        <ArrowRight className="h-4 w-4 shrink-0 text-violet-500" />
      </Link>
    </div>
  );
}
