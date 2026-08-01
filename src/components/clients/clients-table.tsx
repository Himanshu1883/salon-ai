"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse">
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
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Membership</th>
                <th className="px-4 py-3">Loyalty Pts</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="px-4 py-3">Upcoming</th>
                <th className="px-4 py-3">Lifetime Spend</th>
                <th className="px-4 py-3">Avg Ticket</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
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
                        <div>
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
                    <td className="max-w-[160px] truncate px-4 py-3 text-sm text-[#6B7280]">
                      {customer.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">—</td>
                    <td className="px-4 py-3 text-sm font-medium tabular-nums text-[#1C103D]">
                      {customer.loyaltyPoints}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {formatLastVisit(customer.lastVisit)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">—</td>
                    <td className="px-4 py-3 text-sm font-medium tabular-nums text-[#1C103D]">
                      {formatCurrency(customer.totalSales)}
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-[#374151]">
                      {avgTicket !== null ? formatCurrency(avgTicket) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
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
                    <td className="px-4 py-3 text-sm text-[#6B7280]">
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
        </div>
      </div>
  );
}
