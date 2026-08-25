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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-stone-900">Login password</p>
            <p className="text-xs text-stone-500">
              Set a new password if the team member forgot theirs or you need to
              rotate access.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPasswordOpen(true)}
          >
            <KeyRound className="mr-2 h-4 w-4" />
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
