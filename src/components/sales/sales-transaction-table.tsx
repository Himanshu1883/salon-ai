"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  MoreHorizontal,
  Pencil,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { deleteInvoice } from "@/actions/billing";
import { formatCurrency, getInitials, cn } from "@/lib/utils";
import { MemberAvatar } from "@/components/team/member-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_BADGE_STYLES,
  PAYMENT_LABELS,
  type Sale,
} from "./types";

type SalesTransactionTableProps = {
  sales: Sale[];
};

export function SalesTransactionTable({ sales }: SalesTransactionTableProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    await deleteInvoice(id);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[#F8F9FC]">
          <tr className="border-b border-[#ECECEC]">
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date & Time
              </span>
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Customer
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Services
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Stylist
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Payment
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
          {sales.map((sale, index) => {
            const method = sale.paymentMethod ?? "other";
            const badgeStyle =
              PAYMENT_BADGE_STYLES[method] ?? PAYMENT_BADGE_STYLES.other;

            return (
              <tr
                key={sale.id}
                className={cn(
                  "border-b border-[#ECECEC] transition-colors duration-150 hover:bg-[#F8F9FC]/80",
                  index % 2 === 1 && "bg-[#FAFBFD]"
                )}
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-[#6B7280]">
                  {sale.paidAt
                    ? format(new Date(sale.paidAt), "d MMM yyyy, h:mm a")
                    : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-semibold text-[#6C3CF0]">
                      {getInitials(sale.customerName)}
                    </div>
                    <div>
                      <p className="font-medium text-[#1C103D]">
                        {sale.customerName}
                      </p>
                      {sale.customerPhone && (
                        <p className="text-xs text-[#9CA3AF]">
                          {sale.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="max-w-[200px] truncate px-5 py-3.5 text-[#6B7280]">
                  {sale.lineItems.map((li) => li.description).join(", ") || "—"}
                </td>
                <td className="px-5 py-3.5">
                  {sale.employee ? (
                    <div className="flex items-center gap-2">
                      <MemberAvatar
                        name={sale.employee.name}
                        className="h-7 w-7 text-xs"
                      />
                      <span className="text-[#1C103D]">{sale.employee.name}</span>
                    </div>
                  ) : (
                    <span className="text-[#9CA3AF]">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      badgeStyle
                    )}
                  >
                    {PAYMENT_LABELS[method] ?? "Other"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/billing/${sale.id}`}
                    className="font-bold tabular-nums text-[#EF4444] transition-colors duration-150 hover:text-[#DC2626]"
                  >
                    {formatCurrency(sale.total)}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-lg p-0 hover:bg-[#EDE9FE]"
                      >
                        <MoreHorizontal className="h-4 w-4 text-[#6B7280]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem asChild>
                        <Link href={`/billing/${sale.id}`}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <RotateCcw className="h-4 w-4" />
                        Refund
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/billing/${sale.id}`}>
                          <Printer className="h-4 w-4" />
                          Print Invoice
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(sale.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
