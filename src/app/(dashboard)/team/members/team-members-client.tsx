"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createTeamMember,
  updateTeamMember,
  deactivateTeamMember,
} from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  Search,
  MoreHorizontal,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { MemberAvatar } from "@/components/team/member-avatar";
import { getRoleLabel } from "@/lib/team";

type TeamMember = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  specialties: string | null;
  avatarUrl: string | null;
  status: string;
  services: { service: { id: string; name: string } }[];
};

type Service = { id: string; name: string };

function MemberForm({
  member,
  services,
  onSuccess,
}: {
  member?: TeamMember;
  services: Service[];
  onSuccess: (member: TeamMember) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(member?.role ?? "stylist");
  const [status, setStatus] = useState(member?.status ?? "active");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    member?.services.map((s) => s.service.id) ?? []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    selectedServices.forEach((id) => formData.append("serviceIds", id));

    const result = member
      ? await updateTeamMember(member.id, formData)
      : await createTeamMember(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const form = e.currentTarget;
    onSuccess({
      id: member?.id ?? ("id" in result ? String(result.id) : ""),
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value || null,
      email: (form.elements.namedItem("email") as HTMLInputElement).value || null,
      role,
      specialties:
        (form.elements.namedItem("specialties") as HTMLInputElement).value || null,
      avatarUrl: member?.avatarUrl ?? null,
      status,
      services: selectedServices.map((serviceId) => ({
        service: {
          id: serviceId,
          name: services.find((s) => s.id === serviceId)?.name ?? "",
        },
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={member?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <input type="hidden" name="role" value={role} />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Workspace owner</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="stylist">Stylist</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={member?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={member?.email ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="specialties">Specialties</Label>
          <Input
            id="specialties"
            name="specialties"
            placeholder="Color, cuts, extensions..."
            defaultValue={member?.specialties ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <input type="hidden" name="status" value={status} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_break">On break</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {services.length > 0 && (
        <div className="space-y-2">
          <Label>Services they can perform</Label>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() =>
                  setSelectedServices((prev) =>
                    prev.includes(service.id)
                      ? prev.filter((id) => id !== service.id)
                      : [...prev, service.id]
                  )
                }
                className={`rounded-full border px-3 py-1 text-xs ${
                  selectedServices.includes(service.id)
                    ? "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-stone-200"
                }`}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : member ? "Update member" : "Add member"}
      </Button>
    </form>
  );
}

export function TeamMembersClient({
  members: initialMembers,
  services,
}: {
  members: TeamMember[];
  services: Service[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const filteredMembers = useMemo(() => {
    let list = members;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((m) => m.role === roleFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((m) => m.status === statusFilter);
    }
    return list;
  }, [members, search, roleFilter, statusFilter]);

  function handleSuccess(member: TeamMember) {
    setOpen(false);
    setEditing(null);
    setMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === member.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = member;
        return next;
      }
      return [member, ...prev];
    });
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this team member?")) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "inactive" } : m))
    );
    const result = await deactivateTeamMember(id);
    if (result.error) {
      setMembers(initialMembers);
    }
  }

  function toggleAll() {
    if (selected.size === filteredMembers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredMembers.map((m) => m.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-stone-900">Team members</h1>
          <Badge variant="secondary" className="rounded-full px-2.5">
            {filteredMembers.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Options
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowFilters(!showFilters)}>
                Toggle filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditing(null)}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit team member" : "Add team member"}
                </DialogTitle>
              </DialogHeader>
              <MemberForm
                member={editing ?? undefined}
                services={services}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search by name, email or phone"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4" />
          Custom order
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="space-y-1">
            <Label className="text-xs text-stone-500">Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="owner">Workspace owner</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="stylist">Stylist</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-stone-500">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_break">On break</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/80">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={
                    filteredMembers.length > 0 &&
                    selected.size === filteredMembers.length
                  }
                  onChange={toggleAll}
                  className="rounded border-stone-300"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-stone-500">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggleOne(member.id)}
                      className="rounded border-stone-300"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/team/members/${member.id}`}
                      className="flex items-center gap-3 hover:opacity-80"
                    >
                      <MemberAvatar
                        name={member.name}
                        avatarUrl={member.avatarUrl}
                      />
                      <span className="font-medium text-stone-900">
                        {member.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {member.email && (
                        <p className="text-stone-700">{member.email}</p>
                      )}
                      {member.phone && (
                        <p className="text-stone-500">{member.phone}</p>
                      )}
                      {!member.email && !member.phone && (
                        <span className="text-stone-400">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-stone-700">
                      {member.status === "inactive"
                        ? "No access"
                        : getRoleLabel(member.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(member);
                            setOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeactivate(member.id)}
                        >
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/team/shifts?employee=${member.id}`}>
                            View shifts
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
