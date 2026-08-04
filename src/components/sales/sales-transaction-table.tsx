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
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
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

function SaleRowActions({
  sale,
  onDelete,
}: {
  sale: Sale;
  onDelete: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 min-h-[var(--touch-target)] min-w-[var(--touch-target)] rounded-lg p-0 hover:bg-[#EDE9FE] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0"
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
          onClick={() => onDelete(sale.id)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SalesMobileCards({
  sales,
  onDelete,
}: {
  sales: Sale[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-[#ECECEC]">
      {sales.map((sale) => {
        const method = sale.paymentMethod ?? "other";
        const badgeStyle =
          PAYMENT_BADGE_STYLES[method] ?? PAYMENT_BADGE_STYLES.other;

        return (
          <div key={sale.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-sm font-semibold text-[#6C3CF0]">
                  {getInitials(sale.customerName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1C103D]">
                    {sale.customerName}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {sale.paidAt
                      ? format(new Date(sale.paidAt), "d MMM yyyy, h:mm a")
                      : "—"}
                  </p>
                </div>
              </div>
              <Link
                href={`/billing/${sale.id}`}
                className="shrink-0 text-base font-bold tabular-nums text-[#EF4444]"
              >
                {formatCurrency(sale.total)}
              </Link>
            </div>

            <p className="line-clamp-2 text-sm text-[#6B7280]">
              {sale.lineItems.map((li) => li.description).join(", ") || "—"}
            </p>

            {sale.employee && (
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <MemberAvatar
                  name={sale.employee.name}
                  className="h-6 w-6 text-[10px]"
                />
                {sale.employee.name}
              </div>
            )}

            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                badgeStyle
              )}
            >
              {PAYMENT_LABELS[method] ?? "Other"}
            </span>

            <div className="flex justify-end border-t border-[#ECECEC] pt-2">
              <SaleRowActions sale={sale} onDelete={onDelete} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SalesTransactionTable({ sales }: SalesTransactionTableProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    await deleteInvoice(id);
    router.refresh();
  }

  return (
    <ResponsiveTableWrapper
      cards={<SalesMobileCards sales={sales} onDelete={handleDelete} />}
      table={
        <table className="w-full min-w-[640px] border-collapse text-sm md:min-w-[900px]">
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
              <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] lg:table-cell">
                Services
              </th>
              <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] xl:table-cell">
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
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#1C103D]">
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
                  <td className="hidden max-w-[200px] truncate px-5 py-3.5 text-[#6B7280] lg:table-cell">
                    {sale.lineItems.map((li) => li.description).join(", ") ||
                      "—"}
                  </td>
                  <td className="hidden px-5 py-3.5 xl:table-cell">
                    {sale.employee ? (
                      <div className="flex items-center gap-2">
                        <MemberAvatar
                          name={sale.employee.name}
                          className="h-7 w-7 text-xs"
                        />
                        <span className="text-[#1C103D]">
                          {sale.employee.name}
                        </span>
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
                    <SaleRowActions sale={sale} onDelete={handleDelete} />
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
