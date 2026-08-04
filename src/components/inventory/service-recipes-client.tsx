"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  createServiceRecipe,
  deleteServiceRecipe,
} from "@/actions/inventory/service-recipes";
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
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import {
  InventoryIconButton,
  InventoryMobileCard,
  InventoryMobileField,
} from "@/components/inventory/inventory-list-helpers";
import { STOCK_UNITS } from "@/lib/validations";

type Recipe = Awaited<
  ReturnType<typeof import("@/actions/inventory/service-recipes").getServiceRecipes>
>[number];

export function ServiceRecipesClient({
  recipes,
  services,
  products,
  canWrite,
}: {
  recipes: Recipe[];
  services: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string; unit: string }>;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [stockItemId, setStockItemId] = useState(products[0]?.id ?? "");
  const [unit, setUnit] = useState(products[0]?.unit ?? "piece");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("serviceId", serviceId);
    formData.set("stockItemId", stockItemId);
    formData.set("unit", unit);
    const result = await createServiceRecipe(formData);
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
      <InventoryPageHeader
        title="Service Recipes"
        description="Define products consumed per service — auto-deducted when appointments complete."
      >
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF]">
                <Plus className="mr-2 h-4 w-4" /> Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Service recipe</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={stockItemId}
                    onValueChange={(v) => {
                      setStockItemId(v);
                      const p = products.find((x) => x.id === v);
                      if (p) setUnit(p.unit);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input name="quantity" type="number" step="0.01" min={0.01} required defaultValue={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STOCK_UNITS.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">
                  {loading ? "Saving..." : "Save recipe"}
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
              recipes.length === 0 ? (
                <p className="py-8 text-center text-stone-500">
                  No service recipes yet. Add recipes to auto-deduct stock on appointment completion.
                </p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {recipes.map((r) => (
                    <InventoryMobileCard key={r.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#1C103D]">{r.service.name}</p>
                          <p className="text-sm text-stone-600">{r.stockItem.name}</p>
                        </div>
                        {canWrite && (
                          <InventoryIconButton
                            className="text-red-600"
                            onClick={async () => {
                              if (!confirm("Delete recipe?")) return;
                              await deleteServiceRecipe(r.id);
                              router.refresh();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </InventoryIconButton>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <InventoryMobileField label="Qty per service">{r.quantity} {r.unit}</InventoryMobileField>
                        <InventoryMobileField label="Stock on hand">{r.stockItem.quantityOnHand} {r.stockItem.unit}</InventoryMobileField>
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
                    <TableHead>Service</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty per service</TableHead>
                    <TableHead>Stock on hand</TableHead>
                    {canWrite && <TableHead className="w-16" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-stone-500">
                        No service recipes yet. Add recipes to auto-deduct stock on appointment completion.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipes.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.service.name}</TableCell>
                        <TableCell>{r.stockItem.name}</TableCell>
                        <TableCell>{r.quantity} {r.unit}</TableCell>
                        <TableCell>{r.stockItem.quantityOnHand} {r.stockItem.unit}</TableCell>
                        {canWrite && (
                          <TableCell>
                            <InventoryIconButton
                              className="text-red-600"
                              onClick={async () => {
                                if (!confirm("Delete recipe?")) return;
                                await deleteServiceRecipe(r.id);
                                router.refresh();
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </InventoryIconButton>
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
