"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateSalonLoginDialog } from "@/components/permissions/create-salon-login-dialog";
import { ResetStaffPasswordDialog } from "@/components/permissions/reset-staff-password-dialog";
import { getRoleLabel } from "@/lib/team";

export type SalonAccessUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string | null;
  salonRole: { key: string; name: string } | null;
  employee: { id: string; name: string; role: string } | null;
};

export type StaffForLoginRow = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  phone: string | null;
};

export function TeamAccessClient({
  users,
  employees,
  salonSlug,
  preselectedEmployeeId,
}: {
  users: SalonAccessUserRow[];
  employees: StaffForLoginRow[];
  salonSlug: string;
  preselectedEmployeeId?: string | null;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordReset, setPasswordReset] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedEmployeeId) {
      setDialogOpen(true);
    }
  }, [preselectedEmployeeId]);

  const loginCount = users.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-dashboard-text">
              Team Access
            </h1>
            {loginCount > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 font-normal text-dashboard-muted"
              >
                {loginCount}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-dashboard-muted">
            Pick a team member, then create their login and choose what they can
            see and update.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="rounded-full px-5 shadow-sm"
            disabled={employees.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create login
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-dashboard-border bg-white shadow-sm hover:bg-violet-50/60"
          >
            <Link href="/team/members">Team members</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-dashboard-border bg-white shadow-sm hover:bg-violet-50/60"
          >
            <Link href="/team/roles">View roles</Link>
          </Button>
        </div>
      </div>

      {employees.length === 0 && users.filter((u) => u.role !== "owner").length === 0 && (
        <div className="rounded-2xl border border-violet-200/80 bg-violet-50/80 px-4 py-3 text-sm text-violet-900">
          Add staff in{" "}
          <Link
            href="/team/members"
            className="font-semibold text-dashboard-primary hover:underline"
          >
            Team → Members
          </Link>{" "}
          first, then come back here to create their login and permissions.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-dashboard-border bg-white shadow-dashboard-card">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <p className="max-w-sm text-sm text-dashboard-muted">
              No login accounts yet. Create one for managers, receptionists, or
              staff.
            </p>
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="rounded-full px-5 shadow-sm"
              disabled={employees.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create first login
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-dashboard-border/60 text-sm">
            <thead className="bg-violet-50/40">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
                  Login
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
                  Team member
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
                  Email
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
                  Role
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashboard-border/40">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-violet-50/30">
                  <td className="px-5 py-3.5 font-medium text-dashboard-text">
                    {user.name}
                  </td>
                  <td className="px-5 py-3.5 text-dashboard-muted">
                    {user.employee ? (
                      <Link
                        href={`/team/members/${user.employee.id}`}
                        className="text-dashboard-text hover:text-dashboard-primary hover:underline"
                      >
                        {user.employee.name}
                        <span className="ml-1 text-xs text-stone-400">
                          ({getRoleLabel(user.employee.role)})
                        </span>
                      </Link>
                    ) : user.role === "owner" ? (
                      <span className="text-stone-400">Owner account</span>
                    ) : (
                      <span className="text-stone-400">Not linked</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-dashboard-muted">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant="secondary"
                      className="rounded-full border-0 bg-stone-100 px-2.5 py-0.5 font-normal text-stone-600"
                    >
                      {user.salonRole?.name ?? user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <Link
                        href={`/team/access/${user.id}`}
                        className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover hover:underline"
                      >
                        Permissions
                      </Link>
                      {user.role !== "owner" && (
                        <button
                          type="button"
                          className="text-xs text-dashboard-muted hover:text-stone-700 hover:underline"
                          onClick={() =>
                            setPasswordReset({ userId: user.id, name: user.name })
                          }
                        >
                          Reset password
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateSalonLoginDialog
        salonSlug={salonSlug}
        employees={employees}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        preselectedEmployeeId={preselectedEmployeeId}
        onCreated={() => router.refresh()}
      />

      <ResetStaffPasswordDialog
        userId={passwordReset?.userId ?? null}
        staffName={passwordReset?.name ?? ""}
        open={passwordReset !== null}
        onOpenChange={(next) => {
          if (!next) setPasswordReset(null);
        }}
      />
    </div>
  );
}
