import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccessGate } from "@/components/dashboard/access-gate";
import { PlanGate } from "@/components/plans/plan-gate";
import { PlanProvider } from "@/components/plans/plan-provider";
import { PermissionLayoutGate } from "@/components/permissions/permission-layout-gate";
import { getSalonAccessBlocked } from "@/actions/subscription";
import { getSalonPlan } from "@/lib/plan-access";
import { getResolvedPermissions, resolveOwnerPermissions } from "@/lib/permissions/resolve";
import type { PermissionKey } from "@/lib/permissions/catalog";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/permissions/defaults";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/");
  if (session.user.isSuperAdmin) redirect("/admin");
  const salonId = session.user.salonId;
  if (!salonId) redirect("/");

  const userRole = session.user.role ?? "owner";
  const showSettings = userRole === "owner" || userRole === "manager";
  const isOwner = userRole === "owner";

  const [blocked, plan, resolved] = await Promise.all([
    getSalonAccessBlocked(salonId),
    getSalonPlan(salonId),
    isOwner
      ? Promise.resolve(resolveOwnerPermissions(session.user.id, salonId))
      : getResolvedPermissions(session.user.id, salonId),
  ]);

  const permissionKeys = isOwner
    ? (DEFAULT_ROLE_PERMISSIONS.OWNER as PermissionKey[])
    : (Array.from(resolved.permissions) as PermissionKey[]);

  return (
    <PlanProvider plan={plan}>
      <DashboardShell
        salonName={session.user.salonName ?? "Salon"}
        salonSlug={session.user.salonSlug}
        userName={session.user.name}
        userRole={userRole}
        showSettings={showSettings}
        accessBlocked={blocked}
        plan={plan}
        permissionKeys={permissionKeys}
        isOwner={resolved.isOwner}
      >
        <AccessGate blocked={blocked}>
          <PlanGate plan={plan}>
            <PermissionLayoutGate
              permissions={permissionKeys}
              isOwner={resolved.isOwner}
            >
              {children}
            </PermissionLayoutGate>
          </PlanGate>
        </AccessGate>
      </DashboardShell>
    </PlanProvider>
  );
}
