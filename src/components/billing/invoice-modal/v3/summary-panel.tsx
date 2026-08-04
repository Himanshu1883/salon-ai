"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Loader2, Wallet } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { InvoiceCustomer } from "../customer-search";
import type { SummaryLineItem } from "../invoice-summary";
import { v3 } from "./tokens";

function AnimatedAmount({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  const display = useTransform(spring, (v) => formatCurrency(Math.round(v)));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

type SummaryPanelProps = {
  step: 1 | 2;
  items?: SummaryLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  coupon?: number;
  roundOff?: number;
  total: number;
  customer?: InvoiceCustomer;
  paymentStatus?: string;
  outstandingBalance?: number;
  loading?: boolean;
  onProceed?: () => void;
  proceedLabel?: string;
  disableProceed?: boolean;
};

export function SummaryPanel({
  step,
  subtotal,
  discount,
  tax,
  total,
  customer,
  paymentStatus = "Unpaid",
  outstandingBalance = 0,
  loading = false,
  onProceed,
  proceedLabel,
  disableProceed = false,
}: SummaryPanelProps) {
  const label =
    proceedLabel ??
    (step === 1 ? "Proceed to Payment" : "Receive Payment & Complete");

  return (
    <aside className={cn(v3.summaryPanel, "w-[320px] max-w-full")}>
      <h3 className="mb-3 text-[13px] font-semibold text-[#111827]">Summary</h3>

      <dl className="space-y-2 text-[12px]">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Discount" value={discount} negative />
        <Row label="GST" value={tax} />
      </dl>

      <div className="my-3 h-px bg-[#ECECF5]" />

      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-[#111827]">Total</span>
        <span className="text-xl font-bold text-[#7C3AED]">
          <AnimatedAmount value={total} />
        </span>
      </div>

      <div className="mb-3 space-y-1.5 rounded-[12px] bg-[#FAFBFF] p-3 text-[11px]">
        <InfoRow
          icon={<Wallet className="h-3.5 w-3.5 text-[#7C3AED]" />}
          label="Wallet"
          value={formatCurrency(0)}
        />
        <InfoRow
          label="Reward Points"
          value={`${customer?.loyaltyPoints ?? 0} pts`}
        />
        <InfoRow
          label="Outstanding"
          value={formatCurrency(outstandingBalance)}
        />
        <InfoRow
          label="Payment Status"
          value={paymentStatus}
          valueClassName={
            paymentStatus === "Paid"
              ? "text-[#22C55E]"
              : paymentStatus === "Draft"
                ? "text-[#6B7280]"
                : "text-amber-600"
          }
        />
      </div>

      {onProceed && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={loading || disableProceed}
          onClick={onProceed}
          className={cn(v3.primaryButton, "w-full")}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              {label}
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </motion.button>
      )}
    </aside>
  );
}

function Row({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[#6B7280]">
      <dt>{label}</dt>
      <dd
        className={cn(
          "font-medium tabular-nums",
          negative ? "text-[#22C55E]" : "text-[#111827]"
        )}
      >
        {negative && value > 0 ? "−" : ""}
        <AnimatedAmount value={value} />
      </dd>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 text-[#6B7280]">
        {icon}
        {label}
      </span>
      <span className={cn("font-medium text-[#111827]", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
