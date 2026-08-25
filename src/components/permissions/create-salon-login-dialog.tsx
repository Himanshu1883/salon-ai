"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Copy, Loader2, Plus } from "lucide-react";
import { createSalonLoginUserAction } from "@/actions/permissions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getPermissionsByModule,
  getModuleLabel,
  type PermissionKey,
} from "@/lib/permissions/catalog";
import {
  DEFAULT_ROLE_PERMISSIONS,
  type SystemRoleKey,
} from "@/lib/permissions/defaults";

const CREATE_ROLE_OPTIONS = [
  { key: "MANAGER" as const, label: "Manager" },
  { key: "RECEPTIONIST" as const, label: "Receptionist" },
  { key: "EMPLOYEE" as const, label: "Employee" },
];

type ModuleGroup = {
  module: string;
  permissions: Array<{
    key: PermissionKey;
    name: string;
    granted: boolean;
  }>;
};

function buildModulesForRole(roleKey: SystemRoleKey): ModuleGroup[] {
  const granted = new Set(DEFAULT_ROLE_PERMISSIONS[roleKey]);
  const grouped = getPermissionsByModule();

  return Object.entries(grouped).map(([module, defs]) => ({
    module,
    permissions: defs.map((def) => ({
      key: def.key as PermissionKey,
      name: def.name,
      granted: granted.has(def.key as PermissionKey),
    })),
  }));
}

type SuccessPayload = {
  name: string;
  email: string;
  password: string;
  loginPath: string;
};

export function CreateSalonLoginDialog({
  salonSlug,
  open,
  onOpenChange,
  onCreated,
}: {
  salonSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleKey, setRoleKey] = useState<SystemRoleKey>("EMPLOYEE");
  const [modules, setModules] = useState<ModuleGroup[]>(() =>
    buildModulesForRole("EMPLOYEE")
  );
  const [showPermissions, setShowPermissions] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessPayload | null>(null);
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

  useEffect(() => {
    if (open && !success) {
      setModules(buildModulesForRole(roleKey));
    }
  }, [roleKey, open, success]);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRoleKey("EMPLOYEE");
    setModules(buildModulesForRole("EMPLOYEE"));
    setShowPermissions(false);
    setError("");
    setSuccess(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function setPermission(key: string, granted: boolean) {
    setModules((current) =>
      current.map((group) => ({
        ...group,
        permissions: group.permissions.map((perm) =>
          perm.key === key ? { ...perm, granted } : perm
        ),
      }))
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const overrides = Array.from(flatState.entries()).map(
        ([permissionKey, granted]) => ({
          permissionKey: permissionKey as PermissionKey,
          granted,
        })
      );

      const result = await createSalonLoginUserAction({
        name,
        email,
        password,
        roleKey,
        overrides,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      setSuccess({
        name,
        email: result.email ?? email.toLowerCase(),
        password,
        loginPath: `/${salonSlug}/login`,
      });
      onCreated?.();
    });
  }

  async function copyCredentials() {
    if (!success) return;
    const text = [
      `Login URL: ${window.location.origin}${success.loginPath}`,
      `Email: ${success.email}`,
      `Password: ${success.password}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle>Login created</DialogTitle>
              <DialogDescription>
                Share these credentials with {success.name}. They can sign in at
                your salon login page.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm">
              <div>
                <p className="font-medium text-stone-600">Login URL</p>
                <p className="font-mono text-dashboard-text">{success.loginPath}</p>
              </div>
              <div>
                <p className="font-medium text-stone-600">Email</p>
                <p className="text-dashboard-text">{success.email}</p>
              </div>
              <div>
                <p className="font-medium text-stone-600">Password</p>
                <p className="font-mono text-dashboard-text">{success.password}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={copyCredentials}>
                <Copy className="mr-2 h-4 w-4" />
                Copy credentials
              </Button>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create employee login</DialogTitle>
              <DialogDescription>
                Add email and password for a team member. They will only access
                what you assign below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Manager"
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@salon.ai"
                  required
                  disabled={pending}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  disabled={pending}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Role</label>
                <select
                  value={roleKey}
                  onChange={(e) =>
                    setRoleKey(e.target.value as SystemRoleKey)
                  }
                  disabled={pending}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-sm"
                >
                  {CREATE_ROLE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-stone-500">
                  Permissions start from the role defaults. Customize below if
                  needed.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  className="text-sm font-medium text-dashboard-primary hover:underline"
                  onClick={() => setShowPermissions((v) => !v)}
                >
                  {showPermissions ? "Hide" : "Customize"} permissions
                </button>
              </div>

              {showPermissions &&
                modules.map((group) => (
                  <div
                    key={group.module}
                    className="rounded-xl border border-stone-100 p-3"
                  >
                    <h3 className="text-sm font-semibold text-dashboard-text">
                      {getModuleLabel(group.module as never)}
                    </h3>
                    <div className="mt-2 space-y-2">
                      {group.permissions.map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center justify-between gap-2 rounded-lg px-1 py-1"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={perm.granted}
                              disabled={pending}
                              onChange={(e) =>
                                setPermission(perm.key, e.target.checked)
                              }
                            />
                            <span className="text-sm text-stone-700">
                              {perm.name}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {perm.granted ? "On" : "Off"}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

              {error && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create login
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
