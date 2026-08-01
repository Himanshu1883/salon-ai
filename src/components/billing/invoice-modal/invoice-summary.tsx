"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { invoiceModalStyles } from "./styles";

export type SummaryLineItem = {
  name: string;
  amount: number;
};

type InvoiceSummaryProps = {
  items?: SummaryLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

function AnimatedAmount({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) => formatCurrency(Math.round(v)));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function InvoiceSummary({
  items = [],
  subtotal,
  discount,
  tax,
  total,
}: InvoiceSummaryProps) {
  return (
    <div className={invoiceModalStyles.summaryCard}>
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className="h-4 w-1 rounded-full bg-gradient-to-b from-violet-500 to-violet-400"
          aria-hidden
        />
        <h3 className="text-sm font-semibold tracking-tight text-dashboard-text">
          Invoice Summary
        </h3>
      </div>

      {items.length > 0 && (
        <div className="mb-5 space-y-3 border-b border-violet-100/80 pb-5">
          {items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="leading-snug text-dashboard-muted">{item.name}</span>
              <span className="shrink-0 font-medium tabular-nums text-dashboard-text">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <dl className="space-y-3.5 text-sm">
        <div className="flex items-center justify-between text-dashboard-muted">
          <dt>Subtotal</dt>
          <dd className="font-medium text-dashboard-text">
            <AnimatedAmount value={subtotal} />
          </dd>
        </div>
        <div className="flex items-center justify-between text-dashboard-muted">
          <dt>Discount</dt>
          <dd className="font-medium text-emerald-600">
            −<AnimatedAmount value={discount} />
          </dd>
        </div>
        <div className="flex items-center justify-between text-dashboard-muted">
          <dt>GST</dt>
          <dd className="font-medium text-dashboard-text">
            <AnimatedAmount value={tax} />
          </dd>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-50/80 to-violet-50/40 px-4 py-4 ring-1 ring-violet-100/60">
          <div className="flex items-baseline justify-between">
            <dt className="text-sm font-semibold text-dashboard-text">Grand total</dt>
            <dd className="text-2xl font-bold text-violet-600">
              <AnimatedAmount value={total} />
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
