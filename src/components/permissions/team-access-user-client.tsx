"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeePermissionsEditor } from "@/components/permissions/employee-permissions-editor";
import { ResetStaffPasswordDialog } from "@/components/permissions/reset-staff-password-dialog";
import type { PermissionKey } from "@/lib/permissions/catalog";

type ModuleGroup = {
  module: string;
  permissions: Array<{
    key: PermissionKey;
    name: string;
    granted: boolean;
    source: "owner" | "role" | "grant" | "deny" | "legacy";
  }>;
};

export function TeamAccessUserClient({
  userId,
  userName,
  canResetPassword,
  initialRoleKey,
  initialModules,
  canEdit,
}: {
  userId: string;
  userName: string;
  canResetPassword: boolean;
  initialRoleKey: string | null;
  initialModules: ModuleGroup[];
  canEdit: boolean;
}) {
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <div className="space-y-6">
      {canResetPassword && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashboard-border bg-white p-5 shadow-dashboard-card">
          <div>
            <p className="text-sm font-semibold text-dashboard-text">Login password</p>
            <p className="mt-0.5 text-xs text-dashboard-muted">
              Set a new password if the team member forgot theirs or you need to
              rotate access.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-dashboard-border bg-white shadow-sm hover:bg-violet-50/60"
            onClick={() => setPasswordOpen(true)}
          >
            <KeyRound className="mr-2 h-4 w-4 text-dashboard-muted" />
            Reset password
          </Button>
        </div>
      )}

      <EmployeePermissionsEditor
        userId={userId}
        userName={userName}
        initialRoleKey={initialRoleKey}
        initialModules={initialModules}
        canEdit={canEdit}
      />

      <ResetStaffPasswordDialog
        userId={userId}
        staffName={userName}
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
    </div>
  );
}
