"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Receipt } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import type { CheckInService } from "./types";
import { computeEstimatedFinish } from "./utils";

type EstimatedBillCardProps = {
  services: CheckInService[];
  selectedIds: string[];
  membershipDiscount?: number;
};

export function EstimatedBillCard({
  services,
  selectedIds,
  membershipDiscount = 0,
}: EstimatedBillCardProps) {
  const selected = services.filter((s) => selectedIds.includes(s.id));

  if (selected.length === 0) return null;

  const subtotal = selected.reduce((sum, s) => sum + s.price, 0);
  const discount = membershipDiscount;
  const taxRate = 0.18;
  const taxable = subtotal - discount;
  const tax = Math.max(0, taxable * taxRate);
  const total = taxable + tax;
  const totalDuration = selected.reduce((sum, s) => sum + s.duration, 0);
  const finishTime = computeEstimatedFinish(totalDuration);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="sticky top-4 rounded-[20px] border border-[#EDE9FE] bg-white p-5 shadow-lg shadow-[#6C3BFF]/10"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE9FE]">
            <Receipt className="h-4 w-4 text-[#6C3BFF]" />
          </div>
          <h3 className="font-semibold text-[#1C103D]">Estimated Bill</h3>
        </div>

        <ul className="mb-4 space-y-2 border-b border-[#F3F4F6] pb-4">
          {selected.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-[#374151]">{service.name}</span>
              <span className="font-medium text-[#1C103D]">
                {formatCurrency(service.price)}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-1.5 text-sm">
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Membership discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#6B7280]">
            <span>Tax (18% GST)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-[#F3F4F6] pt-2 text-base font-bold text-[#1C103D]">
            <span>Grand total</span>
            <span className="text-[#6C3BFF]">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F7F8FC] px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Clock className="h-3.5 w-3.5 text-[#6C3BFF]" />
            <span>{totalDuration} min total</span>
          </div>
          <span className="text-xs font-medium text-[#1C103D]">
            Finish ~ {format(finishTime, "h:mm a")}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
