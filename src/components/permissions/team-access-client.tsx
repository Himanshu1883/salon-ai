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
import {
  Users,
  User,
  Mail,
  Shield,
  Crown,
  ChevronRight,
  // Add any other icons you need
} from "lucide-react";
import { cn } from "@/lib/utils";

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

<div className="overflow-hidden rounded-2xl border border-dashboard-border/60 bg-white shadow-[0_4px_24px_rgba(28,16,61,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(28,16,61,0.08)]">
  {users.length === 0 ? (
    <div className="relative flex flex-col items-center gap-4 px-6 py-14 text-center">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-transparent to-transparent" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-100/30 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-100/20 blur-3xl" />
      
      <div className="relative z-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 shadow-lg shadow-violet-500/10">
          <Users className="h-7 w-7 text-violet-600" />
        </div>
        <p className="max-w-sm text-sm font-medium text-dashboard-muted">
          No login accounts yet. Create one for managers, receptionists, or staff.
        </p>
        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="mt-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-105 hover:shadow-violet-500/30"
          disabled={employees.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create first login
        </Button>
      </div>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-dashboard-border/40 text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-violet-50/60 via-indigo-50/30 to-transparent">
            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-dashboard-muted/70 sm:px-5 sm:py-3.5 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-violet-400" />
                Login
              </span>
            </th>
            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-dashboard-muted/70 sm:px-5 sm:py-3.5 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-violet-400" />
                Team member
              </span>
            </th>
            <th className="hidden px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-dashboard-muted/70 sm:table-cell sm:px-5 sm:py-3.5 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-violet-400" />
                Email
              </span>
            </th>
            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-dashboard-muted/70 sm:px-5 sm:py-3.5 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-violet-400" />
                Role
              </span>
            </th>
            <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-dashboard-muted/70 sm:px-5 sm:py-3.5 sm:text-xs">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashboard-border/30">
          {users.map((user) => (
            <tr 
              key={user.id} 
              className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-50/40 hover:via-indigo-50/20 hover:to-transparent"
            >
              <td className="px-3 py-2.5 font-medium text-dashboard-text sm:px-5 sm:py-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm transition-all duration-200 group-hover:shadow-violet-500/20 sm:h-8 sm:w-8">
                    <span className="text-xs font-semibold uppercase sm:text-sm">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="truncate text-xs sm:text-sm">{user.name}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-dashboard-muted sm:px-5 sm:py-3.5">
                {user.employee ? (
                  <Link
                    href={`/team/members/${user.employee.id}`}
                    className="group/link inline-flex items-center gap-1 text-dashboard-text transition-all duration-200 hover:text-violet-600"
                  >
                    <span className="text-xs sm:text-sm">{user.employee.name}</span>
                    <span className="hidden text-[10px] text-stone-400 sm:inline">
                      ({getRoleLabel(user.employee.role)})
                    </span>
                    <span className="inline text-[10px] text-stone-400 sm:hidden">
                      · {getRoleLabel(user.employee.role).substring(0, 8)}
                    </span>
                    <ChevronRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover/link:opacity-100" />
                  </Link>
                ) : user.role === "owner" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                    <Crown className="h-3 w-3" />
                    Owner
                  </span>
                ) : (
                  <span className="text-xs text-stone-400">Not linked</span>
                )}
              </td>
              <td className="hidden px-3 py-2.5 text-dashboard-muted sm:table-cell sm:px-5 sm:py-3.5">
                <span className="text-xs sm:text-sm">{user.email}</span>
              </td>
              <td className="px-3 py-2.5 sm:px-5 sm:py-3.5">
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-full border-0 px-2.5 py-0.5 font-medium transition-all duration-200",
                    user.salonRole?.name === "Admin" || user.role === "admin"
                      ? "bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700"
                      : user.salonRole?.name === "Manager"
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700"
                      : "bg-stone-100 text-stone-600",
                    "text-[10px] sm:text-xs"
                  )}
                >
                  {user.salonRole?.name ?? user.role}
                </Badge>
              </td>
              <td className="px-3 py-2.5 text-right sm:px-5 sm:py-3.5">
                <div className="flex flex-col items-end gap-1">
                  <Link
                    href={`/team/access/${user.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 transition-all duration-200 hover:text-violet-700 hover:underline sm:text-sm"
                  >
                    <Shield className="h-3 w-3" />
                    Permissions
                  </Link>
                  {user.role !== "owner" && (
                    <button
                      type="button"
                      className="text-[10px] text-dashboard-muted transition-all duration-200 hover:text-stone-700 hover:underline sm:text-xs"
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
    </div>
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
