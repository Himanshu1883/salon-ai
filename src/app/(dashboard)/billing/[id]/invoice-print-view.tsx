"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { resolveLineItemLabel } from "@/lib/service-display";
import { format } from "date-fns";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Invoice = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: Date | null;
  paidAt: Date | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: Date;
  salon: { name: string; phone: string | null; address: string | null };
  employee: { name: string } | null;
  seat: { number: number } | null;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    service?: { name: string } | null;
  }[];
};

export function InvoicePrintView({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Button variant="outline" asChild>
          <Link href="/billing">
            <ArrowLeft className="h-4 w-4" /> Back to billing
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print invoice
        </Button>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-8 shadow-sm print:border-none print:shadow-none">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{invoice.salon.name}</h1>
            {invoice.salon.address && (
              <p className="text-sm text-stone-500">{invoice.salon.address}</p>
            )}
            {invoice.salon.phone && (
              <p className="text-sm text-stone-500">{invoice.salon.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">INVOICE</p>
            <p className="text-xs text-stone-500">#{invoice.id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-stone-500">
              {format(new Date(invoice.createdAt), "MMM d, yyyy")}
            </p>
            <p className="mt-1 text-sm capitalize text-rose-600">{invoice.status}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs font-medium uppercase text-stone-400">Bill to</p>
          <p className="font-medium">{invoice.customerName}</p>
          {invoice.customerPhone && (
            <p className="text-sm text-stone-500">{invoice.customerPhone}</p>
          )}
        </div>

        {(invoice.employee || invoice.seat) && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {invoice.employee && (
              <div>
                <p className="text-xs font-medium uppercase text-stone-400">Assigned stylist</p>
                <p className="font-medium">{invoice.employee.name}</p>
              </div>
            )}
            {invoice.seat && (
              <div>
                <p className="text-xs font-medium uppercase text-stone-400">Seat</p>
                <p className="font-medium">Seat {invoice.seat.number}</p>
              </div>
            )}
          </div>
        )}

        <table className="mb-8 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-stone-500">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-center">Qty</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, i) => (
              <tr key={i} className="border-b border-stone-100">
                <td className="py-2">
                  {resolveLineItemLabel({
                    serviceName: item.service?.name,
                    description: item.description,
                  })}
                </td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Tax</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {invoice.dueDate && (
          <p className="mt-6 text-sm text-stone-500">
            Due date: {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
          </p>
        )}

        {invoice.status === "paid" && invoice.paidAt && (
          <p className="mt-2 text-sm text-emerald-600">
            Paid on {format(new Date(invoice.paidAt), "MMM d, yyyy")}
            {invoice.paymentMethod && ` via ${invoice.paymentMethod}`}
          </p>
        )}

        {invoice.notes && (
          <p className="mt-4 text-sm text-stone-500">Notes: {invoice.notes}</p>
        )}

        <p className="mt-8 text-center text-xs text-stone-400">
          Thank you for your business!
        </p>
      </div>
    </div>
  );
}
