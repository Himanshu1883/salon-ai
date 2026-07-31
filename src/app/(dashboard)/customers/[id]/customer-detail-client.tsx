"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateCustomer } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Pencil,
  UserPlus,
  FileText,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { usePlan } from "@/components/plans/plan-provider";

type CustomerStats = {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    createdAt: Date;
  };
  totalPaid: number;
  visitCount: number;
  invoices: {
    id: string;
    status: string;
    total: number;
    createdAt: Date;
  }[];
  serviceHistory: {
    id: string;
    type: "check-in" | "appointment";
    date: Date;
    services: string;
    employee: string | null;
    status: string;
  }[];
};

const invoiceStatusVariant: Record<
  string,
  "success" | "secondary" | "warning" | "destructive" | "default"
> = {
  paid: "success",
  draft: "secondary",
  sent: "default",
  overdue: "destructive",
  cancelled: "secondary",
};

function EditCustomerForm({
  customer,
  onSuccess,
}: {
  customer: CustomerStats["customer"];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await updateCustomer(
      customer.id,
      new FormData(e.currentTarget)
    );
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
          <Input id="name" name="name" required defaultValue={customer.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={customer.phone ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer.email ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={customer.notes ?? ""}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Update customer"}
      </Button>
    </form>
  );
}

export function CustomerDetailClient({
  stats,
}: {
  stats: CustomerStats;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const { isEnterprise } = usePlan();
  const { customer } = stats;

  const checkInUrl = `/check-in?customerId=${customer.id}&name=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone ?? "")}`;
  const appointmentUrl = `/sales/appointments?customerId=${customer.id}&name=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone ?? "")}`;
  const billingUrl = `/billing?customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone ?? "")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
              Back to clients
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-stone-900">{customer.name}</h1>
          <p className="mt-1 text-stone-500">
            Member since{" "}
            {format(new Date(customer.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEnterprise && (
            <Button asChild variant="outline" size="sm">
              <Link href={checkInUrl}>
                <UserPlus className="h-4 w-4" />
                Check-in
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={appointmentUrl}>
              <Calendar className="h-4 w-4" />
              Appointment
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={billingUrl}>
              <Receipt className="h-4 w-4" />
              Create invoice
            </Link>
          </Button>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit customer</DialogTitle>
              </DialogHeader>
              <EditCustomerForm
                customer={customer}
                onSuccess={() => {
                  setEditOpen(false);
                  router.refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Total paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-rose-600" />
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalPaid)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Completed visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.visitCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{customer.phone || "—"}</p>
            <p className="text-xs text-stone-500">{customer.email || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-stone-500">Phone</p>
              <p className="font-medium">{customer.phone || "—"}</p>
            </div>
            <div>
              <p className="text-stone-500">Email</p>
              <p className="font-medium">{customer.email || "—"}</p>
            </div>
            <div>
              <p className="text-stone-500">Notes</p>
              <p className="font-medium">{customer.notes || "No notes"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service history</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.serviceHistory.length === 0 ? (
              <p className="text-sm text-stone-500">No service history yet</p>
            ) : (
              <div className="space-y-3">
                {stats.serviceHistory.map((entry) => (
                  <div
                    key={`${entry.type}-${entry.id}`}
                    className="flex items-start justify-between rounded-lg border border-stone-100 p-3"
                  >
                    <div>
                      <p className="font-medium">{entry.services}</p>
                      <p className="text-xs text-stone-500">
                        {format(new Date(entry.date), "MMM d, yyyy · h:mm a")}
                        {entry.employee ? ` · ${entry.employee}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="capitalize">
                        {entry.type.replace("-", " ")}
                      </Badge>
                      <Badge
                        variant={
                          entry.status === "completed"
                            ? "success"
                            : entry.status === "cancelled"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {entry.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.invoices.length === 0 ? (
            <p className="text-sm text-stone-500">No invoices yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoiceStatusVariant[invoice.status] ?? "secondary"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/billing/${invoice.id}`}>
                          <FileText className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
