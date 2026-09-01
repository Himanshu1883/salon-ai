"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  CheckCircle2,
  Download,
  Eye,
  Mail,
  MessageCircle,
  Plus,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_LABELS } from "../types";
import type { WhatsAppInvoiceContext } from "./types";

type PaymentSuccessScreenProps = {
  context: WhatsAppInvoiceContext;
  onSendWhatsApp: () => void;
  onNewInvoice: () => void;
  onClose?: () => void;
};

export function PaymentSuccessScreen({
  context,
  onSendWhatsApp,
  onNewInvoice,
}: PaymentSuccessScreenProps) {
  const paymentLabel =
    PAYMENT_LABELS[context.paymentMethod] ??
    context.paymentMethod.replace(/_/g, " ");

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#F8FAFC]">
      <div className="flex flex-1 flex-col items-center px-6 py-10 sm:px-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
        >
          <CheckCircle2 className="h-11 w-11 text-[#10B981]" strokeWidth={2} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-2xl font-bold text-[#111827]"
        >
          {context.isPartial ? "Partial Payment Recorded" : "Payment Recorded"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-2 max-w-md text-center text-sm text-[#6B7280]"
        >
          Send the invoice to the customer on WhatsApp.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
        >
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight text-[#111827]">
              {formatCurrency(context.amount)}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#10B981]">
              {context.isPartial ? "Partial payment saved" : "Paid Successfully"}
            </p>
            {context.isPartial && context.balanceDue != null && (
              <p className="mt-2 text-sm text-amber-700">
                Balance pending: {formatCurrency(context.balanceDue)}
              </p>
            )}
          </div>

          <dl className="mt-6 grid gap-3 border-t border-[#E5E7EB] pt-6 text-sm sm:grid-cols-2">
            {[
              { label: "Invoice Number", value: context.invoiceNumber },
              { label: "Customer Name", value: context.customerName },
              { label: "Phone Number", value: context.customerPhone || "—" },
              { label: "Payment Method", value: paymentLabel },
              {
                label: "Date & Time",
                value: format(context.paidAt, "d MMM yyyy, h:mm a"),
              },
              { label: "Staff Name", value: context.staffName },
              ...(context.invoiceTotal != null
                ? [{ label: "Invoice Total", value: formatCurrency(context.invoiceTotal) }]
                : []),
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                  {row.label}
                </dt>
                <dd className="mt-0.5 font-semibold text-[#111827]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-8 flex w-full max-w-lg flex-col gap-3"
        >
          <button
            type="button"
            onClick={onSendWhatsApp}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-base font-semibold text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-all hover:bg-[#1EBE5A] hover:shadow-[0_12px_28px_rgba(37,211,102,0.4)] active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" />
            Send Invoice on WhatsApp
          </button>

          <div className="grid grid-cols-2 gap-3">
            <ActionBtn icon={Printer} label="Print Receipt" onClick={() => window.print()} />
            <ActionBtn
              icon={Download}
              label="Download PDF"
              onClick={() => window.open(`/billing/${context.invoiceId}`, "_blank")}
            />
            <ActionBtn icon={Mail} label="Email Invoice" />
            <ActionBtn
              icon={Eye}
              label="View Invoice"
              href={`/billing/${context.invoiceId}`}
            />
          </div>

          <button
            type="button"
            onClick={onNewInvoice}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#7C3AED] transition-colors hover:bg-violet-50"
          >
            <Plus className="h-4 w-4" />
            Create New Invoice
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  href,
}: {
  icon: typeof Printer;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] transition-colors hover:border-[#7C3AED]/30 hover:bg-violet-50/50";

  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon className="h-4 w-4 text-[#6B7280]" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-4 w-4 text-[#6B7280]" />
      {label}
    </button>
  );
}
