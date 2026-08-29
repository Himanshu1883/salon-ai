"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceCustomer } from "../customer-search";
import { PaymentSelector, type PaymentMethodId } from "../payment-selector";
import { PartialPaymentFields } from "../partial-payment-fields";
import { SuccessBanner } from "../success-banner";
import { NotesSection } from "./notes-section";

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
  partialPaymentEnabled?: boolean;
  onPartialPaymentEnabledChange?: (enabled: boolean) => void;
  partialAmount?: string;
  onPartialAmountChange?: (value: string) => void;
  partialError?: string;
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
  partialPaymentEnabled = false,
  onPartialPaymentEnabledChange,
  partialAmount = "",
  onPartialAmountChange,
  partialError,
  onSendWhatsApp,
  notesMaxLength,
}: PaymentStepContentProps) {
  return (
    <div className="space-y-4">
      <SuccessBanner
        invoiceNumber={invoiceNumber}
        onSendWhatsApp={onSendWhatsApp}
      />

      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-[12px] border border-[#ECECF5] bg-white p-3"
      >
        <div className="grid gap-3 text-[12px] sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Customer
            </p>
            <p className="mt-0.5 font-medium text-[#111827]">{customer.name}</p>
            {customer.phone && (
              <p className="text-[11px] text-[#6B7280]">{customer.phone}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Due Date
            </p>
            <p className="mt-0.5 font-medium text-[#111827]">
              {dueDate ? format(new Date(dueDate), "d MMM yyyy") : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Total
            </p>
            <p className="mt-0.5 text-base font-bold text-[#7C3AED]">
              {formatCurrency(displayTotal)}
            </p>
          </div>
        </div>
      </motion.section>

      {onPartialPaymentEnabledChange && onPartialAmountChange && (
        <PartialPaymentFields
          enabled={partialPaymentEnabled}
          onEnabledChange={onPartialPaymentEnabledChange}
          amount={partialAmount}
          onAmountChange={onPartialAmountChange}
          total={displayTotal}
          error={partialError}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.03 }}
        className="rounded-[12px] border border-[#ECECF5] bg-white p-3"
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
        <p className="text-[12px] text-red-500">{paymentError}</p>
      )}

      <NotesSection
        id="payment-notes"
        label="Payment notes"
        value={paymentNotes}
        onChange={onPaymentNotesChange}
        maxLength={notesMaxLength}
        placeholder="Payment reference or notes…"
      />
    </div>
  );
}
