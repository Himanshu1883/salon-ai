import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessSettings } from "@/actions/salon";
import { SettingsLayoutClient } from "@/components/settings/settings-layout-client";
import { getSalonPlan } from "@/lib/plan-access";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.salonId) redirect("/login");

  const showOwnerSettings = await canAccessSettings(session.user.id);
  const plan = await getSalonPlan(session.user.salonId);

  return (
    <SettingsLayoutClient showOwnerSettings={showOwnerSettings} plan={plan}>
      {children}
    </SettingsLayoutClient>
  );
}
