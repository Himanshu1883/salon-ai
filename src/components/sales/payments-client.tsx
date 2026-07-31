"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import type { PaymentMethodBreakdown } from "@/actions/sales";

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  other: "Other",
};

export function PaymentsClient({
  breakdown,
  grandTotal,
  invoices,
  filters,
}: {
  breakdown: PaymentMethodBreakdown[];
  grandTotal: number;
  invoices: {
    id: string;
    total: number;
    paymentMethod: string | null;
    paidAt: Date | null;
    customerName: string;
  }[];
  filters: { dateFrom: string; dateTo: string };
}) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);

  function applyFilters() {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    router.push(`/sales/payments?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Payments</h1>
        <p className="mt-1 text-stone-500">
          Payment breakdown by method for collected revenue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {breakdown.map((row) => (
          <Card key={row.method}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">
                {row.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-stone-900">
                {formatCurrency(row.total)}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {row.count} payment{row.count !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-rose-200 bg-rose-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700">
              Total collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-700">
              {formatCurrency(grandTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">
            Payment records
          </CardTitle>
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
                <TableHead>Payment method</TableHead>
                <TableHead className="text-right">Amount (INR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-stone-500"
                  >
                    No payments found for the selected period.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="whitespace-nowrap">
                      {invoice.paidAt
                        ? format(new Date(invoice.paidAt), "d MMM yyyy, h:mm a")
                        : "—"}
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>
                      {paymentLabels[invoice.paymentMethod ?? "other"] ??
                        "Other"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      <Link
                        href={`/billing/${invoice.id}`}
                        className="text-rose-600 hover:underline"
                      >
                        {formatCurrency(invoice.total)}
                      </Link>
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
