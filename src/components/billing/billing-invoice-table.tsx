"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  CreditCard,
  MoreHorizontal,
  Printer,
  Send,
  Trash2,
} from "lucide-react";
import { formatCurrency, getInitials, cn } from "@/lib/utils";
import { resolveLineItemLabel } from "@/lib/service-display";
import { MemberAvatar } from "@/components/team/member-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PAYMENT_BADGE_STYLES,
  PAYMENT_LABELS,
  STATUS_STYLES,
  type BillingInvoice,
} from "./types";
import { BillingMarkPaidDialog } from "./billing-mark-paid-dialog";

type BillingInvoiceTableProps = {
  invoices: BillingInvoice[];
  loading: boolean;
  isBasicPlan?: boolean;
  onMarkPaid: (invoiceId: string, method: string) => void;
  onMarkSent: (id: string) => void;
  onDelete: (id: string) => void;
};

export function BillingInvoiceTable({
  invoices,
  loading,
  isBasicPlan,
  onMarkPaid,
  onMarkSent,
  onDelete,
}: BillingInvoiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[#F8F9FC]">
          <tr className="border-b border-[#ECECEC]">
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date
              </span>
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Customer
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Services
            </th>
            {!isBasicPlan && (
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Stylist
              </th>
            )}
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Status
            </th>
            <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Amount
            </th>
            <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, index) => {
            const statusStyle =
              STATUS_STYLES[inv.status] ?? STATUS_STYLES.draft;
            const paymentMethod = inv.paymentMethod ?? "other";
            const paymentBadge =
              PAYMENT_BADGE_STYLES[paymentMethod] ??
              PAYMENT_BADGE_STYLES.other;
            const services = inv.lineItems
              .map((l) =>
                resolveLineItemLabel({
                  serviceName: l.service?.name,
                  description: l.description,
                })
              )
              .join(", ");

            return (
              <tr
                key={inv.id}
                className={cn(
                  "border-b border-[#ECECEC] transition-colors duration-150 hover:bg-[#F8F9FC]/80",
                  index % 2 === 1 && "bg-[#FAFBFD]"
                )}
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-[#6B7280]">
                  <div>
                    <p>{format(new Date(inv.createdAt), "d MMM yyyy")}</p>
                    {inv.dueDate && (
                      <p className="text-xs text-[#9CA3AF]">
                        Due {format(new Date(inv.dueDate), "d MMM")}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-semibold text-[#6C3CF0]">
                      {getInitials(inv.customerName)}
                    </div>
                    <div>
                      <p className="font-medium text-[#1C103D]">
                        {inv.customerName}
                      </p>
                      {inv.customerPhone && (
                        <p className="text-xs text-[#9CA3AF]">
                          {inv.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="max-w-[200px] truncate px-5 py-3.5 text-[#6B7280]">
                  {services || "—"}
                </td>
                {!isBasicPlan && (
                  <td className="px-5 py-3.5">
                    {inv.employee ? (
                      <div className="flex items-center gap-2">
                        <MemberAvatar
                          name={inv.employee.name}
                          className="h-7 w-7 text-xs"
                        />
                        <span className="text-[#1C103D]">
                          {inv.employee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </td>
                )}
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusStyle.className
                      )}
                    >
                      {statusStyle.label}
                    </span>
                    {inv.status === "paid" && inv.paymentMethod && (
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          paymentBadge
                        )}
                      >
                        {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-[#EF4444]">
                  {formatCurrency(inv.total)}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {inv.status !== "paid" && inv.status !== "cancelled" && (
                      <BillingMarkPaidDialog
                        invoiceId={inv.id}
                        onSuccess={(method) => onMarkPaid(inv.id, method)}
                      />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          disabled={loading}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem asChild>
                          <Link href={`/billing/${inv.id}`}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print invoice
                          </Link>
                        </DropdownMenuItem>
                        {inv.status !== "paid" && inv.status !== "cancelled" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onMarkSent(inv.id)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Mark sent
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onDelete(inv.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
