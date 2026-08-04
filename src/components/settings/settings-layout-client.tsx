"use client";

import { usePathname } from "next/navigation";
import { SettingsNav } from "@/components/settings/settings-nav";
import type { SalonPlan } from "@/lib/plans";

export function SettingsLayoutClient({
  children,
  showOwnerSettings = true,
  plan = "ENTERPRISE",
}: {
  children: React.ReactNode;
  showOwnerSettings?: boolean;
  plan?: SalonPlan;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-stone-900">Settings</h1>
        <p className="mt-1 text-stone-500">
          Manage your salon profile and Go Tix subscription
        </p>
      </div>
      <SettingsNav pathname={pathname} showOwnerSettings={showOwnerSettings} plan={plan} />
      {children}
    </div>
  );
}
