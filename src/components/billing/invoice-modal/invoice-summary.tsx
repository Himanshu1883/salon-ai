"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

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
    <div className="sticky top-0 rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] p-6">
      <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Invoice Summary
      </h3>

      {items.length > 0 && (
        <div className="mb-5 space-y-2.5 border-b border-[#E5E7EB] pb-5">
          {items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="leading-snug text-[#6B7280]">{item.name}</span>
              <span className="shrink-0 font-medium tabular-nums text-[#1C103D]">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between text-[#6B7280]">
          <dt>Subtotal</dt>
          <dd className="font-medium text-[#1C103D]">
            <AnimatedAmount value={subtotal} />
          </dd>
        </div>
        <div className="flex items-center justify-between text-[#6B7280]">
          <dt>Discount</dt>
          <dd className="font-medium text-[#22C55E]">
            −<AnimatedAmount value={discount} />
          </dd>
        </div>
        <div className="flex items-center justify-between text-[#6B7280]">
          <dt>GST</dt>
          <dd className="font-medium text-[#1C103D]">
            <AnimatedAmount value={tax} />
          </dd>
        </div>
        <div className="border-t border-[#E5E7EB] pt-4">
          <div className="flex items-baseline justify-between">
            <dt className="text-sm font-semibold text-[#1C103D]">Grand total</dt>
            <dd className="text-2xl font-bold text-[#6D5DF6]">
              <AnimatedAmount value={total} />
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
