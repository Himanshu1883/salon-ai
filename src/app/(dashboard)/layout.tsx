import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccessGate } from "@/components/dashboard/access-gate";
import { PlanGate } from "@/components/plans/plan-gate";
import { PlanProvider } from "@/components/plans/plan-provider";
import { PermissionLayoutGate } from "@/components/permissions/permission-layout-gate";
import { getSalonLayoutContext } from "@/lib/salon-layout-context";
import { getBillingInvoiceFormDataForSalon } from "@/actions/billing";
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

  if (
    !isOwner &&
    session.user.email &&
    !(await isStaffDashboardAccessAllowed(salonId, {
      id: session.user.id,
      email: session.user.email,
      role: userRole,
    }))
  ) {
    redirect(
      session.user.salonSlug
        ? `/${session.user.salonSlug}/login?error=account_disabled`
        : "/login?error=account_disabled"
    );
  }

  const sessionPlan = session.user.plan
    ? normalizeSalonPlan(session.user.plan)
    : null;

  const [layoutContext, resolved, ownerBillingPrefetch] = await Promise.all([
    getSalonLayoutContext(salonId),
    isOwner
      ? Promise.resolve(resolveOwnerPermissions(session.user.id, salonId))
      : getResolvedPermissions(session.user.id, salonId),
    isOwner ? getBillingInvoiceFormDataForSalon(salonId) : Promise.resolve(null),
  ]);

  const plan = sessionPlan ?? layoutContext.plan;
  const blocked = layoutContext.accessBlocked;

  const permissionKeys = isOwner
    ? (DEFAULT_ROLE_PERMISSIONS.OWNER as PermissionKey[])
    : (Array.from(resolved.permissions) as PermissionKey[]);

  const canRecordSale =
    isOwner || permissionKeys.includes("sales.create" as PermissionKey);
  const recordSaleFormData =
    ownerBillingPrefetch ??
    (canRecordSale ? await getBillingInvoiceFormDataForSalon(salonId) : null);

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
        recordSaleFormData={recordSaleFormData}
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
