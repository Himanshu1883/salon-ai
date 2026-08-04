"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import { formatCurrency } from "@/lib/currency";
import { getInitials, cn } from "@/lib/utils";
import type { CustomerListItem } from "@/actions/customers";
import {
  computeAvgTicket,
  formatLastVisit,
  getClientDetailPath,
  getClientStatus,
} from "./clients-utils";
import { ClientsRowActions } from "./clients-row-actions";
import { ClientsEmptyState } from "./clients-empty-state";

const STATUS_STYLES = {
  new: "bg-[#EDE9FE] text-[#6C3BFF]",
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-[#F3F4F6] text-[#6B7280]",
  vip: "bg-amber-50 text-amber-700",
};

type ClientsTableProps = {
  customers: CustomerListItem[];
  selected: Set<string>;
  isPending: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string, checked: boolean) => void;
  onAdd?: () => void;
  onImport?: () => void;
};

function ClientsMobileCards({
  customers,
  selected,
  onToggleOne,
  pathname,
  openDetail,
}: {
  customers: CustomerListItem[];
  selected: Set<string>;
  onToggleOne: (id: string, checked: boolean) => void;
  pathname: string;
  openDetail: (customer: CustomerListItem) => void;
}) {
  return (
    <div className="divide-y divide-[#E8ECF4]">
      {customers.map((customer) => {
        const status = getClientStatus(customer);
        const avgTicket = computeAvgTicket(customer);

        return (
          <div
            key={customer.id}
            className="flex gap-3 p-4"
            onClick={() => openDetail(customer)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openDetail(customer);
            }}
            role="button"
            tabIndex={0}
          >
            <div
              className="pt-1"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={selected.has(customer.id)}
                onChange={(e) => onToggleOne(customer.id, e.target.checked)}
                aria-label={`Select ${customer.name}`}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF]/15 to-[#FF2D6F]/15 text-sm font-semibold text-[#6C3BFF]">
                    {getInitials(customer.name)}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={getClientDetailPath(pathname, customer.id)}
                      className="block truncate font-semibold text-[#1C103D]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {customer.name}
                    </Link>
                    <p className="truncate text-sm text-[#6B7280]">
                      {customer.phone || customer.email || "—"}
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "shrink-0 rounded-lg border-0 font-medium",
                    STATUS_STYLES[status.variant]
                  )}
                >
                  {status.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-[#9CA3AF]">Last visit</p>
                  <p className="font-medium text-[#374151]">
                    {formatLastVisit(customer.lastVisit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Lifetime spend</p>
                  <p className="font-medium tabular-nums text-[#1C103D]">
                    {formatCurrency(customer.totalSales)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Avg ticket</p>
                  <p className="tabular-nums text-[#374151]">
                    {avgTicket !== null ? formatCurrency(avgTicket) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Loyalty pts</p>
                  <p className="font-medium tabular-nums text-[#1C103D]">
                    {customer.loyaltyPoints}
                  </p>
                </div>
              </div>

              {customer.reviewCount > 0 && (
                <span className="inline-flex items-center gap-1 text-sm text-[#374151]">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {customer.reviewCount} reviews
                </span>
              )}

              <div
                className="flex justify-end border-t border-[#E8ECF4] pt-2"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <ClientsRowActions customer={customer} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ClientsTable({
  customers,
  selected,
  isPending,
  onToggleAll,
  onToggleOne,
  onAdd,
  onImport,
}: ClientsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const allSelected =
    customers.length > 0 && customers.every((c) => selected.has(c.id));

  function openDetail(customer: CustomerListItem) {
    router.push(getClientDetailPath(pathname, customer.id));
  }

  if (customers.length === 0) {
    return (
      <div className="overflow-hidden rounded-[20px] border border-[#E8ECF4] bg-white shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
        <ClientsEmptyState
          isLoading={isPending}
          onAdd={onAdd}
          onImport={onImport}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E8ECF4] bg-white shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
      <ResponsiveTableWrapper
        breakpoint="lg"
        cards={
          <ClientsMobileCards
            customers={customers}
            selected={selected}
            onToggleOne={onToggleOne}
            pathname={pathname}
            openDetail={openDetail}
          />
        }
        table={
          <table className="w-full min-w-[720px] border-collapse lg:min-w-[960px] xl:min-w-[1100px]">
            <thead className="sticky top-0 z-10 bg-[#F7F8FC]">
              <tr className="border-b border-[#E8ECF4] text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    onChange={(e) => onToggleAll(e.target.checked)}
                    aria-label="Select all clients"
                  />
                </th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Phone</th>
                <th className="hidden px-4 py-3 lg:table-cell">Email</th>
                <th className="hidden px-4 py-3 xl:table-cell">Membership</th>
                <th className="hidden px-4 py-3 md:table-cell">Loyalty Pts</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="hidden px-4 py-3 xl:table-cell">Upcoming</th>
                <th className="px-4 py-3">Lifetime Spend</th>
                <th className="hidden px-4 py-3 lg:table-cell">Avg Ticket</th>
                <th className="hidden px-4 py-3 xl:table-cell">Reviews</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 2xl:table-cell">Created</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => {
                const status = getClientStatus(customer);
                const avgTicket = computeAvgTicket(customer);

                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="group cursor-pointer border-b border-[#E8ECF4]/60 transition-all hover:bg-[#F7F8FC] hover:shadow-[0_2px_12px_rgba(28,16,61,0.04)]"
                    onClick={() => openDetail(customer)}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected.has(customer.id)}
                        onChange={(e) =>
                          onToggleOne(customer.id, e.target.checked)
                        }
                        aria-label={`Select ${customer.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF]/15 to-[#FF2D6F]/15 text-sm font-semibold text-[#6C3BFF]">
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={getClientDetailPath(pathname, customer.id)}
                            className="font-semibold text-[#1C103D] transition-colors hover:text-[#6C3BFF] hover:underline"
                          >
                            {customer.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {customer.phone || "—"}
                    </td>
                    <td className="hidden max-w-[160px] truncate px-4 py-3 text-sm text-[#6B7280] lg:table-cell">
                      {customer.email || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#9CA3AF] xl:table-cell">
                      —
                    </td>
                    <td className="hidden px-4 py-3 text-sm font-medium tabular-nums text-[#1C103D] md:table-cell">
                      {customer.loyaltyPoints}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {formatLastVisit(customer.lastVisit)}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#9CA3AF] xl:table-cell">
                      —
                    </td>
                    <td className="px-4 py-3 text-sm font-medium tabular-nums text-[#1C103D]">
                      {formatCurrency(customer.totalSales)}
                    </td>
                    <td className="hidden px-4 py-3 text-sm tabular-nums text-[#374151] lg:table-cell">
                      {avgTicket !== null ? formatCurrency(avgTicket) : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-sm xl:table-cell">
                      {customer.reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#374151]">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {customer.reviewCount}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "rounded-lg border-0 font-medium",
                          STATUS_STYLES[status.variant]
                        )}
                      >
                        {status.label}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#6B7280] 2xl:table-cell">
                      {format(new Date(customer.createdAt), "d MMM yyyy")}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ClientsRowActions customer={customer} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        }
      />
    </div>
  );
}
