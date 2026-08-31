"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmployeeRoleSelect } from "@/components/team/employee-role-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type Employee = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  specialties: string | null;
  status: string;
  services: { service: { id: string; name: string } }[];
  earnings: {
    totalEarnings: number;
    monthEarnings: number;
    paidInvoiceCount: number;
    monthInvoiceCount: number;
  };
};

type Service = { id: string; name: string };

const statusVariant: Record<string, "success" | "secondary" | "warning"> = {
  active: "success",
  inactive: "secondary",
  on_break: "warning",
};

function EmployeeForm({
  employee,
  services,
  onSuccess,
}: {
  employee?: Omit<Employee, "earnings">;
  services: Service[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(employee?.role ?? "stylist");
  const [status, setStatus] = useState(employee?.status ?? "active");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    employee?.services.map((s) => s.service.id) ?? []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    selectedServices.forEach((id) => formData.append("serviceIds", id));

    const result = employee
      ? await updateEmployee(employee.id, formData)
      : await createEmployee(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={employee?.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <input type="hidden" name="role" value={role} />
          <EmployeeRoleSelect
            value={role}
            onChange={setRole}
            includeOwner={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={employee?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={employee?.email ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="specialties">Specialties</Label>
          <Input
            id="specialties"
            name="specialties"
            placeholder="Color, cuts, extensions..."
            defaultValue={employee?.specialties ?? ""}
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
                    ? "border-rose-400 bg-rose-50 text-rose-700"
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
        {loading ? "Saving..." : employee ? "Update employee" : "Add employee"}
      </Button>
    </form>
  );
}

export function EmployeesClient({
  employees: initialEmployees,
  services,
}: {
  employees: Employee[];
  services: Service[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Omit<Employee, "earnings"> | null>(null);

  const employees = initialEmployees.filter(
    (e) =>
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Delete this employee?")) return;
    await deleteEmployee(id);
    void router.refresh();
  }

  function handleSuccess() {
    setOpen(false);
    setEditing(null);
    void router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Employees</h1>
          <p className="mt-1 text-stone-500">
            Manage your salon team and their specialties
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" />
              Add employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm services={services} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          placeholder="Search employees..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Earnings (month)</TableHead>
                <TableHead>Total earnings</TableHead>
                <TableHead>Services</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-stone-500">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-stone-500">
                          {employee.phone || employee.email || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[employee.status] ?? "secondary"}>
                        {employee.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(employee.earnings.monthEarnings)}</p>
                        <p className="text-xs text-stone-500">
                          {employee.earnings.monthInvoiceCount} paid invoice
                          {employee.earnings.monthInvoiceCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(employee.earnings.totalEarnings)}</p>
                        <p className="text-xs text-stone-500">
                          {employee.earnings.paidInvoiceCount} total
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employee.services.length === 0 ? (
                          <span className="text-xs text-stone-400">All</span>
                        ) : (
                          employee.services.slice(0, 2).map((s) => (
                            <Badge key={s.service.id} variant="outline">
                              {s.service.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditing(employee);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!editing && open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
          </DialogHeader>
          {editing && (
            <EmployeeForm
              employee={editing}
              services={services}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
