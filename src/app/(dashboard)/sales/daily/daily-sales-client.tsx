"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  format,
  isToday,
  parseISO,
  subDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
} from "lucide-react";
import {
  exportDailySalesCsv,
  recordManualSale,
  type DailySalesCashRow,
  type DailySalesSummary,
  type DailySalesTransactionRow,
} from "@/actions/daily-sales";
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

type Service = { id: string; name: string; price: number };
type Employee = { id: string; name: string };

function SummaryTable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function TransactionSummaryTable({
  rows,
}: {
  rows: DailySalesTransactionRow[];
}) {
  return (
    <SummaryTable title="Transaction summary">
      <Table>
        <TableHeader>
          <TableRow className="bg-stone-50 hover:bg-stone-50">
            <TableHead>Item type</TableHead>
            <TableHead className="text-right">Sales qty</TableHead>
            <TableHead className="text-right">Refund qty</TableHead>
            <TableHead className="text-right">Gross total (INR ₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.label}
              className={row.isTotal ? "bg-stone-50 font-semibold" : undefined}
            >
              <TableCell>{row.label}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.isTotal ? "—" : row.salesQty}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.isTotal ? "—" : row.refundQty}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.grossTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SummaryTable>
  );
}

function CashMovementTable({ rows }: { rows: DailySalesCashRow[] }) {
  return (
    <SummaryTable title="Cash movement summary">
      <Table>
        <TableHeader>
          <TableRow className="bg-stone-50 hover:bg-stone-50">
            <TableHead>Payment type</TableHead>
            <TableHead className="text-right">Payments collected</TableHead>
            <TableHead className="text-right">Refunds paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.label}
              className={
                row.isTotal
                  ? "bg-stone-50 font-semibold"
                  : row.isSubtotal
                    ? "text-stone-600"
                    : undefined
              }
            >
              <TableCell>{row.label}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.paymentsCollected)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.refundsPaid)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SummaryTable>
  );
}

function ManualSaleForm({
  services,
  employees,
  saleDate,
  onSuccess,
}: {
  services: Service[];
  employees: Employee[];
  saleDate: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [employeeId, setEmployeeId] = useState("");
  const [amount, setAmount] = useState("");

  function handleServiceChange(value: string) {
    setServiceId(value);
    const service = services.find((s) => s.id === value);
    if (service) {
      setAmount(String(service.price));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("serviceId", serviceId);
    formData.set("paymentMethod", paymentMethod);
    formData.set("employeeId", employeeId);
    formData.set("amount", amount);
    formData.set("saleDate", saleDate);

    const result = await recordManualSale(formData);
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
        <div className="space-y-2">
          <Label>Service</Label>
          <Select value={serviceId} onValueChange={handleServiceChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} ({formatCurrency(service.price)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
          <Label>Assigned stylist</Label>
          <Select value={employeeId} onValueChange={setEmployeeId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select stylist" />
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

export function DailySalesClient({
  summary,
  services,
  employees,
}: {
  summary: DailySalesSummary;
  services: Service[];
  employees: Employee[];
}) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const selectedDate = parseISO(summary.date);
  const displayDate = format(selectedDate, "EEEE, d MMM yyyy");

  function navigateToDate(date: Date) {
    router.push(`/sales/daily?date=${format(date, "yyyy-MM-dd")}`);
  }

  async function handleExport() {
    setExporting(true);
    const result = await exportDailySalesCsv(summary.date);
    setExporting(false);
    setExportOpen(false);

    if ("error" in result) return;

    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Daily sales</h1>
          <p className="mt-1 max-w-2xl text-stone-500">
            View, filter and export the transactions and cash movement for the
            day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Export daily sales</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-stone-500">
                Download a CSV report for {displayDate} including transaction
                summary and cash movement.
              </p>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? "Exporting…" : "Download CSV"}
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add new
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Record manual sale</DialogTitle>
              </DialogHeader>
              <ManualSaleForm
                services={services}
                employees={employees}
                saleDate={summary.date}
                onSuccess={() => {
                  setAddOpen(false);
                  router.refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-white p-3">
        <Button
          variant={isToday(selectedDate) ? "default" : "outline"}
          size="sm"
          onClick={() => navigateToDate(new Date())}
        >
          Today
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateToDate(subDays(selectedDate, 1))}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[200px] px-3 text-center text-sm font-medium text-stone-800">
            {displayDate}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateToDate(addDays(selectedDate, 1))}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Input
          type="date"
          value={summary.date}
          onChange={(e) => {
            if (e.target.value) navigateToDate(parseISO(e.target.value));
          }}
          className="ml-auto w-auto"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionSummaryTable rows={summary.transactionSummary} />
        <CashMovementTable rows={summary.cashMovement} />
      </div>
    </div>
  );
}
