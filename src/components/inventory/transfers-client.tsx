"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  createTransfer,
  receiveTransfer,
} from "@/actions/inventory/transfers";
import { InventoryPageHeader } from "@/components/inventory/inventory-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Trash2 } from "lucide-react";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import {
  InventoryMobileCard,
  InventoryMobileField,
} from "@/components/inventory/inventory-list-helpers";

type Transfer = Awaited<
  ReturnType<typeof import("@/actions/inventory/transfers").getTransfers>
>[number];

export function TransfersClient({
  transfers,
  branches,
  products,
  canWrite,
}: {
  transfers: Transfer[];
  branches: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string }>;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fromBranchId, setFromBranchId] = useState(branches[0]?.id ?? "");
  const [toBranchId, setToBranchId] = useState(branches[1]?.id ?? branches[0]?.id ?? "");
  const [lines, setLines] = useState<Array<{ stockItemId: string; quantity: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Add line items");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("fromBranchId", fromBranchId);
    formData.set("toBranchId", toBranchId);
    formData.set("lines", JSON.stringify(lines));
    const result = await createTransfer(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <InventoryPageHeader title="Branch Transfers" description="Move stock between salon branches.">
        {canWrite && branches.length >= 1 && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF]" onClick={() => lines.length === 0 && products[0] && setLines([{ stockItemId: products[0].id, quantity: 1 }])}>
                <Plus className="mr-2 h-4 w-4" /> New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Branch transfer</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select value={fromBranchId} onValueChange={setFromBranchId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Select value={toBranchId} onValueChange={setToBranchId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_32px] gap-2">
                    <Select value={line.stockItemId} onValueChange={(v) => setLines((prev) => prev.map((l, j) => j === i ? { ...l, stockItemId: v } : l))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="number" min={1} value={line.quantity} onChange={(e) => setLines((prev) => prev.map((l, j) => j === i ? { ...l, quantity: Number(e.target.value) } : l))} />
                    <Button type="button" size="icon" variant="ghost" onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => products[0] && setLines((prev) => [...prev, { stockItemId: products[0].id, quantity: 1 }])}>Add line</Button>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">Create transfer</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </InventoryPageHeader>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <ResponsiveTableWrapper
            cards={
              transfers.length === 0 ? (
                <p className="py-8 text-center text-stone-500">No transfers yet.</p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {transfers.map((t) => (
                    <InventoryMobileCard key={t.id}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#1C103D]">{t.transferNumber}</p>
                        <Badge variant="secondary" className="capitalize rounded-lg">{t.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <InventoryMobileField label="Route">
                        {t.fromBranch.name} → {t.toBranch.name}
                      </InventoryMobileField>
                      <div className="grid grid-cols-2 gap-2">
                        <InventoryMobileField label="Date">{format(new Date(t.transferDate), "MMM d, yyyy")}</InventoryMobileField>
                        <InventoryMobileField label="Items">{t.lineItems.length}</InventoryMobileField>
                      </div>
                      {canWrite && t.status === "in_transit" && (
                        <Button size="sm" variant="outline" className="h-11 min-h-[48px] w-full rounded-lg" onClick={async () => { await receiveTransfer(t.id); router.refresh(); }}>
                          Receive
                        </Button>
                      )}
                    </InventoryMobileCard>
                  ))}
                </div>
              )
            }
            table={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer #</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    {canWrite && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-stone-500">No transfers yet.</TableCell></TableRow>
                  ) : (
                    transfers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.transferNumber}</TableCell>
                        <TableCell>{t.fromBranch.name} → {t.toBranch.name}</TableCell>
                        <TableCell>{format(new Date(t.transferDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>{t.lineItems.length}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize rounded-lg">{t.status.replace(/_/g, " ")}</Badge></TableCell>
                        {canWrite && t.status === "in_transit" && (
                          <TableCell>
                            <Button size="sm" variant="outline" className="rounded-lg" onClick={async () => { await receiveTransfer(t.id); router.refresh(); }}>
                              Receive
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
