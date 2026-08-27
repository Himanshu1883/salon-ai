import { Suspense } from "react";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccessGate } from "@/components/dashboard/access-gate";
import { PlanGate } from "@/components/plans/plan-gate";
import { PlanProvider } from "@/components/plans/plan-provider";
import { PermissionLayoutGate } from "@/components/permissions/permission-layout-gate";
import { LayoutHeaderAlerts } from "@/components/dashboard/layout-header-alerts";
import { getSalonLayoutContext, getSalonAccessBlocked } from "@/lib/salon-layout-context";
import { isStaffDashboardAccessAllowed } from "@/lib/employee-login-link";
import { getResolvedPermissions, resolveOwnerPermissions } from "@/lib/permissions/resolve";
import type { PermissionKey } from "@/lib/permissions/catalog";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/permissions/defaults";
import { normalizeSalonPlan } from "@/lib/plans";

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

  const sessionPlan = session.user.plan
    ? normalizeSalonPlan(session.user.plan)
    : null;

  const skipStaffAccessCheck =
    isOwner || session.user.dashboardAccessVerified === true;

  const [staffAccessOk, layoutContext, blockedOnly, resolved] = await Promise.all([
    skipStaffAccessCheck
      ? Promise.resolve(true)
      : session.user.email
        ? isStaffDashboardAccessAllowed(salonId, {
            id: session.user.id,
            email: session.user.email,
            role: userRole,
          })
        : Promise.resolve(false),
    sessionPlan ? Promise.resolve(null) : getSalonLayoutContext(salonId),
    sessionPlan ? getSalonAccessBlocked(salonId) : Promise.resolve(null),
    isOwner
      ? Promise.resolve(resolveOwnerPermissions(session.user.id, salonId))
      : getResolvedPermissions(session.user.id, salonId),
  ]);

  if (!staffAccessOk) {
    redirect(
      session.user.salonSlug
        ? `/${session.user.salonSlug}/login?error=account_disabled`
        : "/login?error=account_disabled"
    );
  }

  const plan = sessionPlan ?? layoutContext!.plan;
  const blocked = blockedOnly ?? layoutContext!.accessBlocked;

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
        headerAlerts={
          <Suspense fallback={null}>
            <LayoutHeaderAlerts salonId={salonId} />
          </Suspense>
        }
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
