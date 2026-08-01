import { Check, Crown, Zap } from "lucide-react";
import {
  PLAN_FEATURES,
  PLAN_LABELS,
  PLAN_PRICING,
  SUBSCRIPTION_PLANS,
  type SalonPlan,
} from "@/lib/plans";
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<SalonPlan, typeof Zap> = {
  BASIC: Zap,
  ENTERPRISE: Crown,
};

export function PlatformPlansOverview() {
  return (
    <AdminCard>
      <AdminCardHeader
        title="Platform Plans"
        description="Two subscription tiers available to all salons"
        icon={Crown}
      />
      <AdminCardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = PLAN_ICONS[plan];
            const pricing = PLAN_PRICING[plan];
            const isEnterprise = plan === "ENTERPRISE";

            return (
              <div
                key={plan}
                className={cn(
                  "rounded-2xl border p-5",
                  isEnterprise
                    ? "border-dashboard-primary/30 bg-gradient-to-br from-violet-50/80 to-white"
                    : "border-dashboard-border/60 bg-white"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        isEnterprise
                          ? "bg-dashboard-primary text-white"
                          : "bg-slate-100 text-dashboard-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-dashboard-text">
                        {PLAN_LABELS[plan]}
                      </p>
                      <p className="text-xs text-dashboard-muted">{pricing.tagline}</p>
                    </div>
                  </div>
                  <p className="text-right">
                    <span className="text-2xl font-bold tabular-nums text-dashboard-text">
                      ₹{pricing.monthly.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-dashboard-muted">/mo</span>
                  </p>
                </div>

                <ul className="mt-4 space-y-2">
                  {PLAN_FEATURES[plan].slice(0, 4).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-dashboard-text"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-dashboard-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}
