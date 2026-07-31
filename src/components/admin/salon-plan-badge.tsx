import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS, type SalonPlan } from "@/lib/plans";

const planStyles: Record<SalonPlan, string> = {
  BASIC: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  ENTERPRISE: "bg-violet-100 text-violet-700 hover:bg-violet-100",
};

export function SalonPlanBadge({ plan }: { plan: string }) {
  const normalized = plan === "BASIC" ? "BASIC" : "ENTERPRISE";
  return (
    <Badge className={planStyles[normalized]}>
      {PLAN_LABELS[normalized]}
    </Badge>
  );
}
