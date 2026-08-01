import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS, type SalonPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";

const planStyles: Record<SalonPlan, { className: string; icon: typeof Sparkles }> = {
  BASIC: {
    className: "border-slate-200/80 bg-slate-50 text-slate-700",
    icon: Sparkles,
  },
  ENTERPRISE: {
    className: "border-violet-200/80 bg-violet-50 text-violet-700",
    icon: Crown,
  },
};

export function SalonPlanBadge({ plan }: { plan: string }) {
  const normalized = plan === "BASIC" ? "BASIC" : "ENTERPRISE";
  const { className, icon: Icon } = planStyles[normalized];

  return (
    <Badge className={cn("gap-1.5 px-2.5 py-1 text-xs font-semibold shadow-sm", className)}>
      <Icon className="h-3 w-3" />
      {PLAN_LABELS[normalized]}
    </Badge>
  );
}
