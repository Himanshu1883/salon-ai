"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceCustomer } from "../customer-search";
import { PaymentSelector, type PaymentMethodId } from "../payment-selector";
import { SuccessBanner } from "../success-banner";
import { NotesSection } from "./notes-section";
import { v2 } from "./tokens";

type PaymentStepContentProps = {
  invoiceNumber: string;
  customer: InvoiceCustomer;
  dueDate: string;
  displayTotal: number;
  selectedPayment: PaymentMethodId;
  onSelectPayment: (id: PaymentMethodId) => void;
  splitRows: Array<{ key: string; method: string; amount: number }>;
  onSplitRowsChange: (
    rows: Array<{ key: string; method: string; amount: number }>
  ) => void;
  paymentNotes: string;
  onPaymentNotesChange: (value: string) => void;
  splitError?: string;
  paymentError?: string;
  onSendWhatsApp: () => void;
  notesMaxLength: number;
};

export function PaymentStepContent({
  invoiceNumber,
  customer,
  dueDate,
  displayTotal,
  selectedPayment,
  onSelectPayment,
  splitRows,
  onSplitRowsChange,
  paymentNotes,
  onPaymentNotesChange,
  splitError,
  paymentError,
  onSendWhatsApp,
  notesMaxLength,
}: PaymentStepContentProps) {
  return (
    <div className="space-y-6">
      <SuccessBanner
        invoiceNumber={invoiceNumber}
        onSendWhatsApp={onSendWhatsApp}
      />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={v2.card}
      >
        <h3 className="mb-4 text-[15px] font-semibold text-[#111827]">
          Invoice Overview
        </h3>
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              Customer
            </dt>
            <dd className="mt-1 font-medium text-[#111827]">
              {customer.name}
              {customer.phone && (
                <span className="mt-0.5 block text-xs font-normal text-[#6B7280]">
                  {customer.phone}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              Due Date
            </dt>
            <dd className="mt-1 font-medium text-[#111827]">
              {dueDate ? format(new Date(dueDate), "d MMM yyyy") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              Total Amount
            </dt>
            <dd className="mt-1 text-lg font-bold text-[#7C3AED]">
              {formatCurrency(displayTotal)}
            </dd>
          </div>
        </dl>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className={v2.card}
      >
        <PaymentSelector
          selected={selectedPayment}
          onSelect={onSelectPayment}
          splitRows={splitRows}
          onSplitRowsChange={onSplitRowsChange}
          invoiceTotal={displayTotal}
          splitError={splitError}
        />
      </motion.div>

      {paymentError && (
        <p className="text-sm text-red-500">{paymentError}</p>
      )}

      <NotesSection
        id="payment-notes"
        label="Payment notes (optional)"
        value={paymentNotes}
        onChange={onPaymentNotesChange}
        maxLength={notesMaxLength}
        placeholder="Payment reference or notes…"
      />
    </div>
  );
}
