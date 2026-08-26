import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsLayoutClient } from "@/components/settings/settings-layout-client";
import { getSalonPlan } from "@/lib/plan-access";
import { normalizeSalonPlan } from "@/lib/plans";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/");
  if (!session.user.salonId) redirect("/");

  const role = session.user.role ?? "owner";
  const showOwnerSettings = role === "owner" || role === "manager";
  const plan = session.user.plan
    ? normalizeSalonPlan(session.user.plan)
    : await getSalonPlan(session.user.salonId);

  return (
    <SettingsLayoutClient showOwnerSettings={showOwnerSettings} plan={plan}>
      {children}
    </SettingsLayoutClient>
  );
}
