import { getSalonRolesAction } from "@/actions/permissions";
import { requirePermission } from "@/lib/permissions/require";
import { Badge } from "@/components/ui/badge";

export default async function TeamRolesPage() {
  await requirePermission("roles.view");
  const roles = await getSalonRolesAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dashboard-text">
          Roles & Permissions
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          System roles define default access. Customize individual employees from
          Team → Members → Permissions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-dashboard-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-dashboard-text">
                  {role.name}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {role.description ?? "Salon role"}
                </p>
              </div>
              {role.isSystemRole && (
                <Badge variant="secondary">System</Badge>
              )}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-stone-500">Hierarchy</dt>
                <dd className="font-medium text-dashboard-text">
                  {role.hierarchyLevel}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Employees</dt>
                <dd className="font-medium text-dashboard-text">
                  {role.userCount}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-stone-500">Default permissions</dt>
                <dd className="font-medium text-dashboard-text">
                  {role.permissionCount}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
