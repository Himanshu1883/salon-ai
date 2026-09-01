"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Receipt } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import type { CheckInService } from "./types";
import { computeEstimatedFinish } from "./utils";
import { CheckInCard, CheckInCardContent } from "./check-in-card";

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
        transition={{ duration: 0.3 }}
      >
        <CheckInCard glow className="sticky top-4">
          <CheckInCardContent>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-dashboard-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-dashboard-text">
                  Estimated Bill
                </h3>
                <p className="text-xs text-dashboard-muted">
                  {selected.length} service{selected.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <ul className="mb-4 space-y-2.5 border-b border-dashboard-border/50 pb-4">
              {selected.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="min-w-0 truncate text-dashboard-text/80 pr-2">
                    {service.name}
                  </span>
                  <span className="font-medium tabular-nums text-dashboard-text">
                    {formatCurrency(service.price)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 text-sm">
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Membership discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-dashboard-muted">
                <span>Tax (18% GST)</span>
                <span className="tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-dashboard-border/50 pt-2.5 text-base font-bold text-dashboard-text">
                <span>Grand total</span>
                <span className="tabular-nums text-dashboard-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-violet-50/60 px-3.5 py-2.5 ring-1 ring-violet-100/80">
              <div className="flex items-center gap-2 text-xs text-dashboard-muted">
                <Clock className="h-3.5 w-3.5 text-dashboard-primary" />
                <span>{totalDuration} min total</span>
              </div>
              <span className="text-xs font-medium text-dashboard-text">
                Finish ~ {format(finishTime, "h:mm a")}
              </span>
            </div>
          </CheckInCardContent>
        </CheckInCard>
      </motion.div>
    </AnimatePresence>
  );
}
