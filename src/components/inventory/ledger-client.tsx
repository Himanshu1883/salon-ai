"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { InventoryPageHeader } from "@/components/inventory/inventory-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import { InventoryFilterBar } from "@/components/inventory/inventory-filter-bar";
import {
  InventoryMobileCard,
  InventoryMobileField,
} from "@/components/inventory/inventory-list-helpers";
import { MOVEMENT_LABELS } from "@/lib/inventory/constants";
import type { MovementType } from "@/lib/inventory/constants";

type LedgerEntry = Awaited<
  ReturnType<typeof import("@/actions/inventory/ledger").getLedgerEntries>
>[number];

export function LedgerClient({
  entries,
  movementTypes,
}: {
  entries: LedgerEntry[];
  movementTypes: Array<{ value: MovementType; label: string }>;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? entries
      : entries.filter((e) => e.movementType === filter);

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Stock Ledger"
        description="Complete product timeline — all stock movements and audit trail."
      />

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="mb-4">
            <InventoryFilterBar
              triggerLabel="Filter movements"
              mobileChildren={
                <Select
                  value={filter}
                  onValueChange={(v) => {
                    setFilter(v);
                    router.push(v === "all" ? "/inventory/ledger" : `/inventory/ledger?type=${v}`);
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Movement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All movements</SelectItem>
                    {movementTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            >
              <Select
                value={filter}
                onValueChange={(v) => {
                  setFilter(v);
                  router.push(v === "all" ? "/inventory/ledger" : `/inventory/ledger?type=${v}`);
                }}
              >
                <SelectTrigger className="w-[200px] rounded-xl">
                  <SelectValue placeholder="Movement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All movements</SelectItem>
                  {movementTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InventoryFilterBar>
          </div>

          <ResponsiveTableWrapper
            cards={
              filtered.length === 0 ? (
                <p className="py-8 text-center text-stone-500">No ledger entries yet.</p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {filtered.map((e) => (
                    <InventoryMobileCard key={e.id}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-[#9CA3AF]">
                          {format(new Date(e.createdAt), "MMM d, yyyy HH:mm")}
                        </p>
                        <Badge variant="secondary" className="shrink-0 rounded-lg">
                          {MOVEMENT_LABELS[e.movementType as MovementType] ?? e.movementType}
                        </Badge>
                      </div>
                      <p className="font-semibold text-[#1C103D]">{e.stockItem.name}</p>
                      <p className="text-xs text-stone-500">{e.stockItem.sku}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <InventoryMobileField label="Qty change">
                          <span className={e.quantity >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {e.quantity >= 0 ? "+" : ""}{e.quantity}
                          </span>
                        </InventoryMobileField>
                        <InventoryMobileField label="Balance">{e.quantityAfter}</InventoryMobileField>
                      </div>
                      <p className="text-xs text-stone-500">
                        {e.appointment?.service?.name ??
                          e.customer?.name ??
                          e.employee?.name ??
                          e.notes ??
                          "—"}
                      </p>
                    </InventoryMobileCard>
                  ))}
                </div>
              )
            }
            table={
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-stone-500">
                          No ledger entries yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="whitespace-nowrap text-sm">
                            {format(new Date(e.createdAt), "MMM d, yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{e.stockItem.name}</p>
                            <p className="text-xs text-stone-500">{e.stockItem.sku}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-lg">
                              {MOVEMENT_LABELS[e.movementType as MovementType] ?? e.movementType}
                            </Badge>
                          </TableCell>
                          <TableCell className={e.quantity >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {e.quantity >= 0 ? "+" : ""}{e.quantity}
                          </TableCell>
                          <TableCell>{e.quantityAfter}</TableCell>
                          <TableCell className="text-xs text-stone-500">
                            {e.appointment?.service?.name ??
                              e.customer?.name ??
                              e.employee?.name ??
                              e.notes ??
                              "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
