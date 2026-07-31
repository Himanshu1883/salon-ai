"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  Building2,
  Clock,
  CreditCard,
  FileText,
  MoreHorizontal,
  Smartphone,
  Split,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SplitPayment } from "./split-payment";

export type PaymentMethodId =
  | "cash"
  | "upi"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "wallet"
  | "cheque"
  | "pay_later"
  | "split"
  | "other";

export type PaymentOption = {
  id: PaymentMethodId;
  label: string;
  icon: typeof Banknote;
  iconClassName: string;
  backendValue: string | null;
};

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "cash",
    label: "Cash",
    icon: Banknote,
    iconClassName: "text-emerald-600 bg-emerald-50",
    backendValue: "cash",
  },
  {
    id: "upi",
    label: "UPI",
    icon: Smartphone,
    iconClassName: "text-violet-600 bg-violet-50",
    backendValue: "upi",
  },
  {
    id: "credit_card",
    label: "Credit Card",
    icon: CreditCard,
    iconClassName: "text-blue-600 bg-blue-50",
    backendValue: "card",
  },
  {
    id: "debit_card",
    label: "Debit Card",
    icon: CreditCard,
    iconClassName: "text-indigo-600 bg-indigo-50",
    backendValue: "card",
  },
  {
    id: "net_banking",
    label: "Net Banking",
    icon: Building2,
    iconClassName: "text-cyan-600 bg-cyan-50",
    backendValue: "other",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    iconClassName: "text-orange-600 bg-orange-50",
    backendValue: "wallet",
  },
  {
    id: "cheque",
    label: "Cheque",
    icon: FileText,
    iconClassName: "text-slate-600 bg-slate-100",
    backendValue: "other",
  },
  {
    id: "pay_later",
    label: "Pay Later",
    icon: Clock,
    iconClassName: "text-amber-600 bg-amber-50",
    backendValue: null,
  },
  {
    id: "split",
    label: "Split Payment",
    icon: Split,
    iconClassName: "text-[#6D5DF6] bg-[#6D5DF6]/10",
    backendValue: "other",
  },
  {
    id: "other",
    label: "Other",
    icon: MoreHorizontal,
    iconClassName: "text-gray-600 bg-gray-100",
    backendValue: "other",
  },
];

type PaymentSelectorProps = {
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
  splitRows: Array<{ key: string; method: string; amount: number }>;
  onSplitRowsChange: (
    rows: Array<{ key: string; method: string; amount: number }>
  ) => void;
  invoiceTotal: number;
  splitError?: string;
};

export function PaymentSelector({
  selected,
  onSelect,
  splitRows,
  onSplitRowsChange,
  invoiceTotal,
  splitError,
}: PaymentSelectorProps) {
  return (
    <section aria-labelledby="payment-section">
      <h3
        id="payment-section"
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
      >
        Choose payment method
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PAYMENT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-[18px] border-2 bg-white p-4 text-center transition-all",
                isSelected
                  ? "border-[#6D5DF6] shadow-[0_0_0_1px_#6D5DF6]"
                  : "border-[#E5E7EB] hover:border-[#6D5DF6]/40"
              )}
            >
              <span
                className={cn(
                  "absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border-2",
                  isSelected
                    ? "border-[#6D5DF6] bg-[#6D5DF6]"
                    : "border-[#D1D5DB] bg-white"
                )}
              >
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  option.iconClassName
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-[#1C103D]">
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selected === "split" && (
        <SplitPayment
          rows={splitRows}
          onChange={onSplitRowsChange}
          invoiceTotal={invoiceTotal}
          error={splitError}
        />
      )}
    </section>
  );
}

export function getBackendPaymentMethod(selected: PaymentMethodId): string {
  const option = PAYMENT_OPTIONS.find((o) => o.id === selected);
  return option?.backendValue ?? "other";
}
