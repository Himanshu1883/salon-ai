"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import {
  createPlatformUser,
  deletePlatformUser,
  updatePlatformUser,
  type PlatformUserRow,
} from "@/actions/platform-users";
import {
  PLATFORM_ROLE_LABELS,
  type PlatformRole,
} from "@/lib/platform-permissions";
import { cn } from "@/lib/utils";

type UserFormState = {
  name: string;
  email: string;
  password: string;
  role: PlatformRole;
  isActive: boolean;
};

const EMPTY_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "CUSTOMER_SUPPORT",
  isActive: true,
};

function RoleBadge({ role }: { role: PlatformRole }) {
  const isAdmin = role === "SUPER_ADMIN";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isAdmin
          ? "bg-violet-100 text-violet-800 ring-1 ring-violet-200"
          : "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
      )}
    >
      {isAdmin ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
      {PLATFORM_ROLE_LABELS[role]}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isActive
          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      )}
    >
      {isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export function UsersListClient({ users }: { users: PlatformUserRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUserRow | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<PlatformUserRow | null>(null);

  function openCreate() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(user: PlatformUserRow) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.platformRole,
      isActive: user.isActive,
    });
    setError("");
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      if (editingUser) {
        const result = await updatePlatformUser({
          id: editingUser.id,
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password || undefined,
          isActive: form.isActive,
        });
        if ("error" in result) {
          setError(result.error);
          return;
        }
      } else {
        if (!form.password) {
          setError("Password is required for new users");
          return;
        }
        const result = await createPlatformUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        if ("error" in result) {
          setError(result.error);
          return;
        }
      }

      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingUser(null);
    });
  }

  function handleDelete() {
    if (!deleteConfirm) return;
    setError("");

    startTransition(async () => {
      const result = await deletePlatformUser(deleteConfirm.id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setDeleteConfirm(null);
    });
  }

  const activeCount = users.filter((u) => u.isActive).length;
  const adminCount = users.filter((u) => u.platformRole === "SUPER_ADMIN").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-50 ring-1 ring-violet-100">
            <Users className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
              Platform Users
            </h1>
            <p className="mt-1.5 text-sm text-dashboard-muted">
              Manage admin and customer support accounts
            </p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminCard>
          <AdminCardContent className="py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
              Total Users
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-violet-600">{users.length}</p>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
              Active
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-emerald-600">{activeCount}</p>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
              Admins
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-violet-600">{adminCount}</p>
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard className="overflow-hidden">
        <AdminCardHeader
          title="All Platform Users"
          description="Super admins have full access; customer support is limited to support chat and read-only salon views"
          icon={Users}
        />
        <AdminCardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border/60 bg-gradient-to-r from-slate-50/90 to-violet-50/30 hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-violet-50/30">
                  <TableHead className="pl-6 text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
                    Name
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
                    Email
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
                    Role
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
                    Created
                  </TableHead>
                  <TableHead className="pr-6 text-right text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isPrimaryAdmin = user.email === "admin@salon.ai";
                  return (
                    <TableRow
                      key={user.id}
                      className="border-dashboard-border/40 transition-colors hover:bg-violet-50/40"
                    >
                      <TableCell className="pl-6">
                        <div className="font-semibold text-dashboard-text">{user.name}</div>
                        {isPrimaryAdmin && (
                          <p className="mt-0.5 text-xs text-violet-600">Primary super admin</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-dashboard-muted">{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.platformRole} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge isActive={user.isActive} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm tabular-nums text-dashboard-muted">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-lg p-0"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {!isPrimaryAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => setDeleteConfirm(user)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </AdminCardContent>
      </AdminCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update platform user details and permissions"
                : "Add a new platform admin or customer support user"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password{editingUser && " (leave blank to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required={!editingUser}
                minLength={editingUser ? undefined : 8}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value: PlatformRole) =>
                  setForm((f) => ({ ...f, role: value }))
                }
                disabled={editingUser?.email === "admin@salon.ai"}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Admin</SelectItem>
                  <SelectItem value="CUSTOMER_SUPPORT">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingUser && editingUser.email !== "admin@salon.ai" && (
              <div className="flex items-center gap-3 rounded-xl border border-dashboard-border bg-slate-50/80 px-4 py-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-dashboard-primary focus:ring-dashboard-primary"
                />
                <Label htmlFor="isActive" className="cursor-pointer font-normal">
                  Account is active
                </Label>
              </div>
            )}
            {error && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
              >
                {isPending ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Permanently delete {deleteConfirm?.name}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
