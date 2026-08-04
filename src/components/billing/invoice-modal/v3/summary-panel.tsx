"use client";

import { useState } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Loader2, Wallet } from "lucide-react";
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
  gstEnabled?: boolean;
  customer?: InvoiceCustomer;
  paymentStatus?: string;
  outstandingBalance?: number;
  loading?: boolean;
  onProceed?: () => void;
  proceedLabel?: string;
  disableProceed?: boolean;
  /** Hide proceed button (e.g. when footer handles actions on mobile) */
  hideProceed?: boolean;
  compact?: boolean;
};

export function SummaryPanel({
  step,
  subtotal,
  discount,
  tax,
  total,
  gstEnabled = true,
  customer,
  paymentStatus = "Unpaid",
  outstandingBalance = 0,
  loading = false,
  onProceed,
  proceedLabel,
  disableProceed = false,
  hideProceed = false,
  compact = false,
}: SummaryPanelProps) {
  const label =
    proceedLabel ??
    (step === 1 ? "Proceed to Payment" : "Receive Payment & Complete");

  return (
    <aside
      className={cn(
        v3.summaryPanel,
        compact ? "w-full" : "w-full lg:w-[280px] xl:w-[320px]"
      )}
    >
      <h3 className="mb-2 text-[12px] font-semibold text-[#111827] sm:mb-3 sm:text-[13px]">
        Summary
      </h3>

      <dl className="space-y-1.5 text-[12px] sm:space-y-2">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Discount" value={discount} negative />
        {gstEnabled ? <Row label="GST" value={tax} /> : null}
      </dl>

      <div className="my-2 h-px bg-[#ECECF5] sm:my-3" />

      <div className="mb-2 flex items-baseline justify-between sm:mb-3">
        <span className="text-[12px] font-semibold text-[#111827]">Total</span>
        <span className="text-lg font-bold text-[#7C3AED] sm:text-xl">
          <AnimatedAmount value={total} />
        </span>
      </div>

      {!compact && (
        <div className="mb-3 space-y-1.5 rounded-[12px] bg-[#FAFBFF] p-2.5 text-[11px] sm:p-3">
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
      )}

      {onProceed && !hideProceed && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={loading || disableProceed}
          onClick={onProceed}
          className={cn(v3.primaryButton, "hidden w-full lg:inline-flex")}
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

type MobileSummaryBarProps = Omit<
  SummaryPanelProps,
  "hideProceed" | "compact"
> & {
  onBack?: () => void;
  onCancel?: () => void;
  onSaveDraft?: () => void;
  showSaveDraft?: boolean;
};

export function MobileSummaryBar({
  onBack,
  onCancel,
  onSaveDraft,
  showSaveDraft = false,
  ...props
}: MobileSummaryBarProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    total,
    paymentStatus,
    step,
    loading,
    onProceed,
    proceedLabel,
    disableProceed,
  } = props;

  const label =
    proceedLabel ??
    (step === 1 ? "Proceed to Payment" : "Receive Payment & Complete");
  const shortLabel = step === 1 ? "Continue" : "Complete";

  return (
    <div className="shrink-0 border-t border-[#ECECF5] bg-white shadow-[0_-8px_24px_rgba(17,24,39,0.06)] lg:hidden">
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="mobile-invoice-summary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-[#ECECF5] bg-[#FAFBFF]"
          >
            <div className="px-3 py-3 sm:px-4">
              <SummaryPanel {...props} hideProceed compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 2 && (
        <div className="flex items-center gap-2 border-b border-[#ECECF5]/80 px-3 py-2 sm:px-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className={cn(v3.ghostButton, "h-10 px-3 text-[12px]")}
            >
              Back
            </button>
          )}
          {showSaveDraft && onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={loading}
              className={cn(v3.outlineButton, "h-10 flex-1 px-3 text-[12px]")}
            >
              Save Draft
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={cn(v3.ghostButton, "ml-auto h-10 px-3 text-[12px]")}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2 rounded-[12px] px-2 text-left transition-colors hover:bg-[#FAFBFF]"
          aria-expanded={expanded}
          aria-controls="mobile-invoice-summary"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                Total
              </span>
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
              )}
            </div>
            <span className="text-xl font-bold text-[#7C3AED]">
              <AnimatedAmount value={total} />
            </span>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
              paymentStatus === "Paid"
                ? "bg-green-50 text-[#22C55E]"
                : paymentStatus === "Draft"
                  ? "bg-[#FAFBFF] text-[#6B7280]"
                  : "bg-amber-50 text-amber-600"
            )}
          >
            {paymentStatus}
          </span>
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={loading || disableProceed}
          onClick={onProceed}
          className={cn(
            v3.primaryButton,
            "h-12 min-w-[7.5rem] shrink-0 px-4 text-[14px] sm:min-w-[9rem]"
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden max-w-[9rem] truncate sm:inline">{label}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </div>
    </div>
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
