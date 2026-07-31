"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { createItemTypeSale, type ItemTypeSale } from "@/actions/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { formatCurrency } from "@/lib/currency";
import type { ItemType } from "@/lib/validations";

type Employee = { id: string; name: string };

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  other: "Other",
};

function AddSaleForm({
  itemType,
  title,
  descriptionPlaceholder,
  employees,
  onSuccess,
}: {
  itemType: "GIFT_CARD" | "PACKAGE" | "MEMBERSHIP";
  title: string;
  descriptionPlaceholder: string;
  employees: Employee[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [employeeId, setEmployeeId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("itemType", itemType);
    formData.set("paymentMethod", paymentMethod);
    formData.set("employeeId", employeeId);

    const result = await createItemTypeSale(formData);
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
          <Label htmlFor="customerName">Customer name</Label>
          <Input id="customerName" name="customerName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone</Label>
          <Input id="customerPhone" name="customerPhone" type="tel" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">{title}</Label>
          <Input
            id="description"
            name="description"
            placeholder={descriptionPlaceholder}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (INR)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="saleDate">Sale date</Label>
          <Input
            id="saleDate"
            name="saleDate"
            type="date"
            defaultValue={format(new Date(), "yyyy-MM-dd")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Payment method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sold by</Label>
          <Select value={employeeId} onValueChange={setEmployeeId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Recording…" : "Record sale"}
      </Button>
    </form>
  );
}

export function ItemTypeSalesClient({
  title,
  subtitle,
  itemType,
  addButtonLabel,
  addDialogTitle,
  descriptionPlaceholder,
  sales,
  totalAmount,
  totalQty,
  employees,
  filters,
}: {
  title: string;
  subtitle: string;
  itemType: ItemType;
  addButtonLabel: string;
  addDialogTitle: string;
  descriptionPlaceholder: string;
  sales: ItemTypeSale[];
  totalAmount: number;
  totalQty: number;
  employees: Employee[];
  filters: { dateFrom: string; dateTo: string };
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);

  function applyFilters() {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const basePath =
      itemType === "GIFT_CARD"
        ? "/sales/gift-cards"
        : itemType === "PACKAGE"
          ? "/sales/packages"
          : "/sales/memberships";
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
          <p className="mt-1 max-w-2xl text-stone-500">{subtitle}</p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{addDialogTitle}</DialogTitle>
            </DialogHeader>
            <AddSaleForm
              itemType={itemType as "GIFT_CARD" | "PACKAGE" | "MEMBERSHIP"}
              title={addDialogTitle}
              descriptionPlaceholder={descriptionPlaceholder}
              employees={employees}
              onSuccess={() => {
                setAddOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Total sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-stone-900">{totalQty}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Total revenue (INR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-stone-900">
              {formatCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">Sales history</CardTitle>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="dateFrom" className="text-xs">
                From
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-auto"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dateTo" className="text-xs">
                To
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-auto"
              />
            </div>
            <Button size="sm" variant="outline" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50">
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sold by</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount (INR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-stone-500"
                  >
                    No sales recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="whitespace-nowrap">
                      {sale.paidAt
                        ? format(new Date(sale.paidAt), "d MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.customerName}</p>
                        {sale.customerPhone && (
                          <p className="text-xs text-stone-500">
                            {sale.customerPhone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{sale.description}</TableCell>
                    <TableCell>{sale.employeeName ?? "—"}</TableCell>
                    <TableCell>
                      {paymentLabels[sale.paymentMethod ?? "other"] ?? "Other"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(sale.total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
