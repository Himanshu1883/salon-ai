"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { receiveGoods } from "@/actions/inventory/grn";
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
import { Plus, Trash2 } from "lucide-react";

type GRN = Awaited<
  ReturnType<typeof import("@/actions/inventory/grn").getGoodsReceipts>
>[number];

type LineDraft = {
  stockItemId: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
};

export function GrnClient({
  receipts,
  openPOs,
  vendors,
  products,
  canWrite,
}: {
  receipts: GRN[];
  openPOs: Awaited<ReturnType<typeof import("@/actions/inventory/grn").getOpenPurchaseOrders>>;
  vendors: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string; costPrice: number }>;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addLine() {
    const p = products[0];
    if (!p) return;
    setLines((prev) => [...prev, { stockItemId: p.id, quantity: 1, unitCost: p.costPrice }]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Add line items");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("lines", JSON.stringify(lines));
    const result = await receiveGoods(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setLines([]);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <InventoryPageHeader title="Goods Received (GRN)" description="Record incoming stock and update inventory.">
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF]" onClick={() => lines.length === 0 && addLine()}>
                <Plus className="mr-2 h-4 w-4" /> Receive Goods
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader><DialogTitle>Receive goods</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Linked PO (optional)</Label>
                  <Select name="purchaseOrderId">
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {openPOs.map((po) => (
                        <SelectItem key={po.id} value={po.id}>{po.orderNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Select name="supplierId">
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Label>Line items</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addLine}>Add</Button>
                </div>
                {lines.map((line, i) => (
                  <div key={i} className="space-y-2 rounded-xl border p-3">
                    <Select
                      value={line.stockItemId}
                      onValueChange={(v) =>
                        setLines((prev) =>
                          prev.map((l, j) =>
                            j === i
                              ? { ...l, stockItemId: v, unitCost: products.find((p) => p.id === v)?.costPrice ?? l.unitCost }
                              : l
                          )
                        )
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" min={1} placeholder="Qty" value={line.quantity}
                        onChange={(e) => setLines((prev) => prev.map((l, j) => j === i ? { ...l, quantity: Number(e.target.value) } : l))} />
                      <Input type="number" min={0} step="0.01" placeholder="Unit cost" value={line.unitCost}
                        onChange={(e) => setLines((prev) => prev.map((l, j) => j === i ? { ...l, unitCost: Number(e.target.value) } : l))} />
                    </div>
                    <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}>
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                ))}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">
                  {loading ? "Saving..." : "Confirm receipt"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </InventoryPageHeader>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>PO</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-stone-500">No GRNs yet.</TableCell></TableRow>
              ) : (
                receipts.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.grnNumber}</TableCell>
                    <TableCell>{format(new Date(g.receivedDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{g.purchaseOrder?.orderNumber ?? "—"}</TableCell>
                    <TableCell>{g.supplier?.name ?? "—"}</TableCell>
                    <TableCell>{g.lineItems.length}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
