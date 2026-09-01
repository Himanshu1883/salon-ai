"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { resolveLineItemLabel } from "@/lib/service-display";
import { format } from "date-fns";
import { Printer, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { InvoiceWhatsAppActions } from "./invoice-whatsapp-actions";
import { formatInvoiceNumber } from "@/components/billing/invoice-modal/utils";
import { PAYMENT_LABELS } from "@/components/billing/types";
import { SalonLogoMark } from "@/components/salon/salon-logo-mark";

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
  salon: {
    name: string;
    phone: string | null;
    address: string | null;
    logoUrl?: string | null;
    businessEmail?: string | null;
    businessPhone?: string | null;
  };
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

export function InvoicePrintView({
  invoice,
  whatsappSettings,
  variant = "staff",
}: {
  invoice: Invoice;
  whatsappSettings?: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
  variant?: "staff" | "public";
}) {
  const invoiceNumber = formatInvoiceNumber(
    invoice.id,
    new Date(invoice.createdAt)
  );
  const isPublic = variant === "public";
  const displayNumber = isPublic
    ? invoiceNumber
    : invoice.id.slice(-8).toUpperCase();
  const paymentLabel = invoice.paymentMethod
    ? PAYMENT_LABELS[invoice.paymentMethod] ??
      invoice.paymentMethod.replace(/_/g, " ")
    : null;
  const salonPhone = invoice.salon.businessPhone || invoice.salon.phone;
  const salonEmail = invoice.salon.businessEmail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        {isPublic ? (
          <p className="text-sm font-medium text-[#6B7280]">
            {invoice.salon.name} · {invoiceNumber}
          </p>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/billing">
              <ArrowLeft className="h-4 w-4" /> Back to billing
            </Link>
          </Button>
        )}
        <div className="flex flex-wrap gap-2">
          {!isPublic && whatsappSettings ? (
            <InvoiceWhatsAppActions
              invoice={invoice}
              billingMessageTemplate={whatsappSettings.billingMessageTemplate}
            />
          ) : null}
          {isPublic ? (
            <Button
              type="button"
              onClick={() => window.print()}
              className="bg-[#7C3AED] hover:bg-[#6D28D9]"
            >
              <Download className="h-4 w-4" />
              Download invoice
            </Button>
          ) : null}
          <Button
            type="button"
            variant={isPublic ? "outline" : "default"}
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Print invoice
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] bg-white px-6 py-8 shadow-[0_12px_40px_rgba(17,24,39,0.08)] sm:px-10 sm:py-10 print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <SalonLogoMark
              logoUrl={invoice.salon.logoUrl}
              fallbackInitial={invoice.salon.name}
              size="lg"
              shape="rounded"
              variant="dark"
              alt={`${invoice.salon.name} logo`}
            />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold tracking-tight text-[#1F2937]">
                {invoice.salon.name}
              </h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C3AED]">
                Salon invoice
              </p>
            </div>
          </div>
          <div className="relative -mr-6 shrink-0 pt-1 text-right sm:-mr-10">
            <p className="relative z-[1] text-[34px] font-black leading-none tracking-tight text-[#1F2937] sm:text-[42px]">
              INVOICE
            </p>
            <div className="absolute bottom-[5px] left-4 right-0 z-0 h-3 bg-[#7C3AED] sm:bottom-[6px] sm:h-3.5" />
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-[#1F2937]">Invoice to:</p>
            <p className="mt-1 text-base font-semibold capitalize text-[#111827]">
              {invoice.customerName}
            </p>
            {invoice.customerPhone ? (
              <p className="mt-0.5 text-sm text-[#4B5563]">{invoice.customerPhone}</p>
            ) : null}
            {invoice.employee ? (
              <p className="mt-2 text-sm text-[#4B5563]">
                Stylist: {invoice.employee.name}
                {invoice.seat ? ` · Seat ${invoice.seat.number}` : ""}
              </p>
            ) : null}
          </div>
          <div className="text-sm sm:text-right">
            <p>
              <span className="font-bold text-[#1F2937]">Invoice#</span>{" "}
              <span className="text-[#4B5563]">{displayNumber}</span>
            </p>
            <p className="mt-1">
              <span className="font-bold text-[#1F2937]">Date</span>{" "}
              <span className="text-[#4B5563]">
                {format(new Date(invoice.createdAt), "dd / MM / yyyy")}
              </span>
            </p>
            {invoice.dueDate ? (
              <p className="mt-1">
                <span className="font-bold text-[#1F2937]">Due</span>{" "}
                <span className="text-[#4B5563]">
                  {format(new Date(invoice.dueDate), "dd / MM / yyyy")}
                </span>
              </p>
            ) : null}
            <p className="mt-1 capitalize">
              <span className="font-bold text-[#1F2937]">Status</span>{" "}
              <span className="text-[#7C3AED]">{invoice.status}</span>
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[4px] border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1F2937] text-white">
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide">
                  SL.
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide">
                  Item Description
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide">
                  Price
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide">
                  Qty.
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? "bg-[#F3F4F6]" : "bg-white"}
                >
                  <td className="px-3 py-3 text-[#4B5563]">{i + 1}</td>
                  <td className="px-3 py-3 font-medium text-[#111827]">
                    {resolveLineItemLabel({
                      serviceName: item.service?.name,
                      description: item.description,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right text-[#4B5563]">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-3 py-3 text-center text-[#4B5563]">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-[#111827]">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div className="text-sm text-[#4B5563]">
            <p className="font-bold text-[#1F2937]">Thank you for your business</p>
            {invoice.notes ? (
              <>
                <p className="mt-3 font-bold text-[#1F2937]">Notes</p>
                <p className="mt-1 whitespace-pre-wrap">{invoice.notes}</p>
              </>
            ) : (
              <>
                <p className="mt-3 font-bold text-[#1F2937]">Terms & Conditions</p>
                <p className="mt-1">
                  Please keep this invoice for your records. For any billing questions,
                  contact the salon using the details below.
                </p>
              </>
            )}
            <p className="mt-3 font-bold text-[#1F2937]">Payment Info:</p>
            <p className="mt-1">
              Status: <span className="capitalize">{invoice.status}</span>
              {paymentLabel ? ` · ${paymentLabel}` : ""}
            </p>
            {invoice.status === "paid" && invoice.paidAt ? (
              <p>Paid on {format(new Date(invoice.paidAt), "d MMM yyyy")}</p>
            ) : null}
          </div>
          <div>
            <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-[#1F2937]">Sub Total:</span>
                <span className="text-[#111827]">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#1F2937]">Tax:</span>
                <span className="text-[#111827]">{formatCurrency(invoice.tax)}</span>
              </div>
            </div>
            <div className="ml-auto mt-3 flex w-full max-w-xs items-center justify-between bg-[#7C3AED] px-4 py-2.5 text-[#111827]">
              <span className="font-extrabold text-white">Total:</span>
              <span className="text-lg font-extrabold text-white">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            <div className="ml-auto mt-10 w-full max-w-xs text-center">
              <div className="mx-auto w-40 border-t border-[#9CA3AF]" />
              <p className="mt-1 text-xs font-semibold text-[#1F2937]">
                Authorised Sign
              </p>
              <p className="text-[11px] text-[#6B7280]">{invoice.salon.name}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t-2 border-[#7C3AED] pt-3 text-center text-xs font-medium text-[#1F2937]">
          {[salonPhone, invoice.salon.address, salonEmail]
            .filter(Boolean)
            .join("  |  ") || invoice.salon.name}
        </div>
      </div>
    </div>
  );
}
