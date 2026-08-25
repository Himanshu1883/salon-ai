"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateSalonLoginDialog } from "@/components/permissions/create-salon-login-dialog";
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

  useEffect(() => {
    if (preselectedEmployeeId) {
      setDialogOpen(true);
    }
  }, [preselectedEmployeeId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dashboard-text">
            Team Access
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Pick a team member, then create their login and choose what they can
            see and update.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="rounded-xl"
            disabled={employees.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create login
          </Button>
          <Button asChild variant="outline">
            <Link href="/team/members">Team members</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/team/roles">View roles</Link>
          </Button>
        </div>
      </div>

      {employees.length === 0 && users.filter((u) => u.role !== "owner").length === 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add staff in{" "}
          <Link href="/team/members" className="font-semibold underline">
            Team → Members
          </Link>{" "}
          first, then come back here to create their login and permissions.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-dashboard-border bg-white shadow-dashboard-card">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <p className="text-sm text-stone-500">
              No login accounts yet. Create one for managers, receptionists, or
              staff.
            </p>
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              disabled={employees.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create first login
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-50/80">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Login
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Team member
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Role
                </th>
                <th className="px-4 py-3 text-right font-medium text-stone-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-dashboard-text">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {user.employee ? (
                      <Link
                        href={`/team/members/${user.employee.id}`}
                        className="hover:text-dashboard-primary hover:underline"
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
                  <td className="px-4 py-3 text-stone-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {user.salonRole?.name ?? user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/team/access/${user.id}`}
                      className="font-medium text-dashboard-primary hover:underline"
                    >
                      Permissions
                    </Link>
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
    </div>
  );
}
