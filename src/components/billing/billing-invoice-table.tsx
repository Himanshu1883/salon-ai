"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
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
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
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

function InvoiceRowActions({
  inv,
  loading,
  onMarkPaid,
  onMarkSent,
  onDelete,
}: {
  inv: BillingInvoice;
  loading: boolean;
  onMarkPaid: (invoiceId: string, method: string) => void;
  onMarkSent: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
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
            className="h-10 w-10 min-h-[var(--touch-target)] min-w-[var(--touch-target)] rounded-lg sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0"
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
              <DropdownMenuItem onClick={() => onMarkSent(inv.id)}>
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
  );
}

function BillingInvoiceMobileCards({
  invoices,
  loading,
  isBasicPlan,
  onMarkPaid,
  onMarkSent,
  onDelete,
}: BillingInvoiceTableProps) {
  return (
    <div className="divide-y divide-[#ECECEC]">
      {invoices.map((inv) => {
        const statusStyle = STATUS_STYLES[inv.status] ?? STATUS_STYLES.draft;
        const paymentMethod = inv.paymentMethod ?? "other";
        const paymentBadge =
          PAYMENT_BADGE_STYLES[paymentMethod] ?? PAYMENT_BADGE_STYLES.other;
        const services = inv.lineItems
          .map((l) =>
            resolveLineItemLabel({
              serviceName: l.service?.name,
              description: l.description,
            })
          )
          .join(", ");

        return (
          <div key={inv.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-sm font-semibold text-[#6C3CF0]">
                  {getInitials(inv.customerName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1C103D]">
                    {inv.customerName}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {format(new Date(inv.createdAt), "d MMM yyyy")}
                    {inv.dueDate &&
                      ` · Due ${format(new Date(inv.dueDate), "d MMM")}`}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-base font-bold tabular-nums text-[#EF4444]">
                {formatCurrency(inv.total)}
              </p>
            </div>

            {services && (
              <p className="line-clamp-2 text-sm text-[#6B7280]">{services}</p>
            )}

            {!isBasicPlan && inv.employee && (
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <MemberAvatar
                  name={inv.employee.name}
                  className="h-6 w-6 text-[10px]"
                />
                {inv.employee.name}
              </div>
            )}

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

            <InvoiceRowActions
              inv={inv}
              loading={loading}
              onMarkPaid={onMarkPaid}
              onMarkSent={onMarkSent}
              onDelete={onDelete}
            />
          </div>
        );
      })}
    </div>
  );
}

export function BillingInvoiceTable({
  invoices,
  loading,
  isBasicPlan,
  onMarkPaid,
  onMarkSent,
  onDelete,
}: BillingInvoiceTableProps) {
  return (
    <ResponsiveTableWrapper
      cards={
        <BillingInvoiceMobileCards
          invoices={invoices}
          loading={loading}
          isBasicPlan={isBasicPlan}
          onMarkPaid={onMarkPaid}
          onMarkSent={onMarkSent}
          onDelete={onDelete}
        />
      }
      table={
        <table className="w-full min-w-[720px] border-collapse text-sm lg:min-w-[960px]">
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
              <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] lg:table-cell">
                Services
              </th>
              {!isBasicPlan && (
                <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] xl:table-cell">
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
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#1C103D]">
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
                  <td className="hidden max-w-[200px] truncate px-5 py-3.5 text-[#6B7280] lg:table-cell">
                    {services || "—"}
                  </td>
                  {!isBasicPlan && (
                    <td className="hidden px-5 py-3.5 xl:table-cell">
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
                    <InvoiceRowActions
                      inv={inv}
                      loading={loading}
                      onMarkPaid={onMarkPaid}
                      onMarkSent={onMarkSent}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
    />
  );
}
