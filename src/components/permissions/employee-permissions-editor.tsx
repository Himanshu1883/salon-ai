"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  resetUserPermissionsToRoleDefaultsAction,
  updateUserPermissionOverridesAction,
  updateUserSalonRoleAction,
} from "@/actions/permissions";
import { getModuleLabel } from "@/lib/permissions/catalog";
import type { PermissionKey } from "@/lib/permissions/catalog";

type PermissionRow = {
  key: PermissionKey;
  name: string;
  granted: boolean;
  source: "owner" | "role" | "grant" | "deny" | "legacy";
};

type ModuleGroup = {
  module: string;
  permissions: PermissionRow[];
};

const ROLE_OPTIONS = [
  { key: "OWNER", label: "Owner" },
  { key: "MANAGER", label: "Manager" },
  { key: "RECEPTIONIST", label: "Receptionist" },
  { key: "EMPLOYEE", label: "Employee" },
] as const;

function sourceLabel(source: PermissionRow["source"]) {
  switch (source) {
    case "role":
    case "legacy":
      return "Role";
    case "grant":
      return "Custom";
    case "deny":
      return "Denied";
    case "owner":
      return "Owner";
    default:
      return "Role";
  }
}

export function EmployeePermissionsEditor({
  userId,
  userName,
  initialRoleKey,
  initialModules,
  canEdit,
}: {
  userId: string;
  userName: string;
  initialRoleKey: string | null;
  initialModules: ModuleGroup[];
  canEdit: boolean;
}) {
  const [roleKey, setRoleKey] = useState(initialRoleKey ?? "EMPLOYEE");
  const [modules, setModules] = useState(initialModules);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const flatState = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const group of modules) {
      for (const perm of group.permissions) {
        map.set(perm.key, perm.granted);
      }
    }
    return map;
  }, [modules]);

  function setPermission(key: string, granted: boolean) {
    setModules((current) =>
      current.map((group) => ({
        ...group,
        permissions: group.permissions.map((perm) =>
          perm.key === key
            ? { ...perm, granted, source: "grant" as const }
            : perm
        ),
      }))
    );
  }

  function handleSaveRole() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await updateUserSalonRoleAction({ userId, roleKey });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setMessage("Role updated.");
    });
  }

  function handleSavePermissions() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const overrides = Array.from(flatState.entries()).map(
        ([permissionKey, granted]) => ({
          permissionKey: permissionKey as PermissionKey,
          granted,
        })
      );

      const result = await updateUserPermissionOverridesAction({
        userId,
        overrides,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setMessage("Permissions saved.");
    });
  }

  function handleReset() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await resetUserPermissionsToRoleDefaultsAction(userId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-dashboard-card">
        <h2 className="text-lg font-semibold text-dashboard-text">
          Employee permissions
        </h2>
        <p className="mt-1 text-sm text-stone-500">{userName}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-stone-700">Role</label>
            <select
              value={roleKey}
              disabled={!canEdit || pending}
              onChange={(event) => setRoleKey(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-sm"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {canEdit && (
            <Button type="button" disabled={pending} onClick={handleSaveRole}>
              Save role
            </Button>
          )}
        </div>
      </div>

      {modules.map((group) => (
        <div
          key={group.module}
          className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-dashboard-card"
        >
          <h3 className="font-semibold text-dashboard-text">
            {getModuleLabel(group.module as never)}
          </h3>
          <div className="mt-4 space-y-3">
            {group.permissions.map((perm) => (
              <label
                key={perm.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={perm.granted}
                    disabled={!canEdit || pending}
                    onChange={(event) =>
                      setPermission(perm.key, event.target.checked)
                    }
                  />
                  <span className="text-sm text-stone-700">{perm.name}</span>
                </div>
                <Badge variant="secondary">{sourceLabel(perm.source)}</Badge>
              </label>
            ))}
          </div>
        </div>
      ))}

      {canEdit && (
        <div className="flex flex-wrap gap-3">
          <Button type="button" disabled={pending} onClick={handleSavePermissions}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save permissions"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleReset}
          >
            Reset to role defaults
          </Button>
        </div>
      )}

      {message && (
        <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
