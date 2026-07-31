"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recordPurchase, createStockItem } from "@/actions/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import { STOCK_UNITS } from "@/lib/validations";
import {
  StockCategorySelect,
  type StockCategoryOption,
} from "@/components/stock/stock-category-select";

type StockOption = {
  id: string;
  name: string;
  unit: string;
  quantityOnHand: number;
};

export function PurchaseFormClient({
  stockItems,
  categories: initialCategories,
  preselectedItemId,
}: {
  stockItems: StockOption[];
  categories: StockCategoryOption[];
  preselectedItemId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stockItemId, setStockItemId] = useState(
    preselectedItemId ?? stockItems[0]?.id ?? ""
  );
  const [showNewItem, setShowNewItem] = useState(stockItems.length === 0);
  const [categories, setCategories] = useState(initialCategories);
  const [newItemCategoryId, setNewItemCategoryId] = useState(
    initialCategories[0]?.id ?? ""
  );
  const [newItemUnit, setNewItemUnit] = useState("piece");
  const [items, setItems] = useState(stockItems);

  async function handleCreateItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", newItemCategoryId);
    formData.set("unit", newItemUnit);
    formData.set("quantityOnHand", "0");

    const result = await createStockItem(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.id) {
      const name = formData.get("name") as string;
      const newItem: StockOption = {
        id: result.id,
        name,
        unit: newItemUnit,
        quantityOnHand: 0,
      };
      setItems((prev) => [...prev, newItem]);
      setStockItemId(result.id);
      setShowNewItem(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("stockItemId", stockItemId);

    const result = await recordPurchase(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(stockItemId ? `/inventory/stock/${stockItemId}` : "/inventory/stock");
    router.refresh();
  }

  const selectedItem = items.find((i) => i.id === stockItemId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/inventory/stock">
            <ArrowLeft className="h-4 w-4" />
            Back to stock
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-stone-900">Record purchase</h1>
        <p className="mt-1 text-stone-500">
          Add stock received and attach the purchase bill
        </p>
      </div>

      {showNewItem ? (
        <Card>
          <CardHeader>
            <CardTitle>Create new stock item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Item name</Label>
                <Input id="new-name" name="name" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <StockCategorySelect
                    categories={categories}
                    value={newItemCategoryId}
                    onValueChange={setNewItemCategoryId}
                    onCategoryCreated={(category) =>
                      setCategories((prev) => [...prev, category])
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_UNITS.map((u) => (
                        <SelectItem key={u} value={u} className="capitalize">
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create item"}
                </Button>
                {items.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewItem(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Purchase details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Stock item</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewItem(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New item
                  </Button>
                </div>
                <Select value={stockItemId} onValueChange={setStockItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.quantityOnHand} {item.unit} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedItem && (
                  <p className="text-xs text-stone-500">
                    Currently {selectedItem.quantityOnHand}{" "}
                    {selectedItem.unit} available
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantityPurchased">Quantity purchased</Label>
                  <Input
                    id="quantityPurchased"
                    name="quantityPurchased"
                    type="number"
                    min={1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Total amount (₹)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier (optional)</Label>
                  <Input id="supplierName" name="supplierName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase date</Label>
                  <Input
                    id="purchaseDate"
                    name="purchaseDate"
                    type="date"
                    required
                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billAttachment">Bill attachment (PDF, JPG, PNG — max 5MB)</Label>
                <Input
                  id="billAttachment"
                  name="billAttachment"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={loading || !stockItemId} className="w-full">
                {loading ? "Saving..." : "Record purchase"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
