"use client";

import { usePathname } from "next/navigation";
import { canAccessPath, type SalonPlan } from "@/lib/plans";
import { getModuleForPath, getRestrictedModuleLabel } from "@/lib/plans";
import { UpgradeScreen } from "@/components/plans/upgrade-screen";

export function PlanGate({
  plan,
  children,
}: {
  plan: SalonPlan;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (canAccessPath(plan, pathname)) {
    return <>{children}</>;
  }

  const module = getModuleForPath(pathname);

  return (
    <UpgradeScreen
      currentPlan={plan}
      module={module}
      featureName={module ? getRestrictedModuleLabel(module) : "This feature"}
    />
  );
}
