"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createAdjustment } from "@/actions/inventory/adjustments";
import { InventoryPageHeader } from "@/components/inventory/inventory-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus } from "lucide-react";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import {
  InventoryMobileCard,
  InventoryMobileField,
} from "@/components/inventory/inventory-list-helpers";
import { ADJUSTMENT_REASONS } from "@/lib/inventory/constants";

type Adjustment = Awaited<
  ReturnType<typeof import("@/actions/inventory/adjustments").getAdjustments>
>[number];

export function AdjustmentsClient({
  adjustments,
  products,
  canWrite,
}: {
  adjustments: Adjustment[];
  products: Array<{ id: string; name: string }>;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("increase");
  const [stockItemId, setStockItemId] = useState(products[0]?.id ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("adjustmentType", adjustmentType);
    formData.set("stockItemId", stockItemId);
    const result = await createAdjustment(formData);
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
      <InventoryPageHeader title="Stock Adjustments" description="Manual stock corrections with reason and audit trail.">
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF]"><Plus className="mr-2 h-4 w-4" /> New Adjustment</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Stock adjustment</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={stockItemId} onValueChange={setStockItemId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase</SelectItem>
                      <SelectItem value="decrease">Decrease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input name="quantity" type="number" min={1} required defaultValue={1} />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Select name="reason" defaultValue={ADJUSTMENT_REASONS[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADJUSTMENT_REASONS.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">{r.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea name="notes" rows={2} />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">Save adjustment</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </InventoryPageHeader>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <ResponsiveTableWrapper
            cards={
              adjustments.length === 0 ? (
                <p className="py-8 text-center text-stone-500">No adjustments yet.</p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {adjustments.map((a) => (
                    <InventoryMobileCard key={a.id}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#1C103D]">{a.stockItem.name}</p>
                        <Badge variant="secondary" className="capitalize rounded-lg">{a.status}</Badge>
                      </div>
                      <p className="text-xs text-stone-500">{format(new Date(a.createdAt), "MMM d, yyyy")}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <InventoryMobileField label="Type">
                          <span className="capitalize">{a.adjustmentType}</span>
                        </InventoryMobileField>
                        <InventoryMobileField label="Qty">{a.quantity}</InventoryMobileField>
                        <InventoryMobileField label="Reason" className="col-span-2">
                          <span className="capitalize">{a.reason.replace(/_/g, " ")}</span>
                        </InventoryMobileField>
                      </div>
                    </InventoryMobileCard>
                  ))}
                </div>
              )
            }
            table={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-stone-500">No adjustments yet.</TableCell></TableRow>
                  ) : (
                    adjustments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{format(new Date(a.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>{a.stockItem.name}</TableCell>
                        <TableCell className="capitalize">{a.adjustmentType}</TableCell>
                        <TableCell>{a.quantity}</TableCell>
                        <TableCell className="capitalize">{a.reason.replace(/_/g, " ")}</TableCell>
                        <TableCell><Badge variant="secondary" className="rounded-lg capitalize">{a.status}</Badge></TableCell>
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
