"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createPurchaseOrder } from "@/actions/inventory/purchase-orders";
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

type PO = Awaited<
  ReturnType<typeof import("@/actions/inventory/purchase-orders").getPurchaseOrders>
>[number];

type LineDraft = { stockItemId: string; quantityOrdered: number; unitCost: number };

export function PurchaseOrdersClient({
  orders,
  vendors,
  products,
  canWrite,
}: {
  orders: PO[];
  vendors: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string; unit: string; costPrice: number }>;
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
    setLines((prev) => [
      ...prev,
      { stockItemId: p.id, quantityOrdered: 1, unitCost: p.costPrice },
    ]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Add at least one line item");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("lines", JSON.stringify(lines));
    const result = await createPurchaseOrder(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setLines([]);
    router.refresh();
  }

  const statusColor: Record<string, string> = {
    draft: "secondary",
    ordered: "default",
    partial: "warning",
    received: "success",
    cancelled: "destructive",
  };

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Purchase Orders"
        description="Create and track purchase orders from vendors."
      >
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF]" onClick={() => lines.length === 0 && addLine()}>
                <Plus className="mr-2 h-4 w-4" /> New PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader><DialogTitle>New purchase order</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="space-y-2">
                  <Label>Expected date</Label>
                  <Input name="expectedDate" type="date" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Line items</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addLine}>Add line</Button>
                  </div>
                  {lines.map((line, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_80px_32px] gap-2">
                      <Select
                        value={line.stockItemId}
                        onValueChange={(v) => {
                          const p = products.find((x) => x.id === v);
                          setLines((prev) =>
                            prev.map((l, j) =>
                              j === i
                                ? { ...l, stockItemId: v, unitCost: p?.costPrice ?? l.unitCost }
                                : l
                            )
                          );
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        value={line.quantityOrdered}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l, j) =>
                              j === i ? { ...l, quantityOrdered: Number(e.target.value) } : l
                            )
                          )
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitCost}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l, j) =>
                              j === i ? { ...l, unitCost: Number(e.target.value) } : l
                            )
                          )
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">
                  {loading ? "Creating..." : "Create PO"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </InventoryPageHeader>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <ResponsiveTableWrapper
            cards={
              orders.length === 0 ? (
                <p className="py-8 text-center text-stone-500">No purchase orders yet.</p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {orders.map((po) => (
                    <InventoryMobileCard key={po.id}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#1C103D]">{po.orderNumber}</p>
                        <Badge variant={(statusColor[po.status] as "secondary") ?? "secondary"} className="capitalize rounded-lg">
                          {po.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <InventoryMobileField label="Vendor">{po.supplier?.name ?? "—"}</InventoryMobileField>
                        <InventoryMobileField label="Date">{format(new Date(po.orderDate), "MMM d, yyyy")}</InventoryMobileField>
                        <InventoryMobileField label="Items">{po.lines.length} items</InventoryMobileField>
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
                    <TableHead>PO #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-stone-500">No purchase orders yet.</TableCell>
                    </TableRow>
                  ) : (
                    orders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.orderNumber}</TableCell>
                        <TableCell>{po.supplier?.name ?? "—"}</TableCell>
                        <TableCell>{format(new Date(po.orderDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>{po.lines.length} items</TableCell>
                        <TableCell>
                          <Badge variant={(statusColor[po.status] as "secondary") ?? "secondary"} className="capitalize rounded-lg">
                            {po.status}
                          </Badge>
                        </TableCell>
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
