"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createStockItem,
  updateStockItem,
  deleteStockItem,
} from "@/actions/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  StockCategorySelect,
  type StockCategoryOption,
} from "@/components/stock/stock-category-select";
import { Plus, Search, Pencil, Trash2, Package, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { STOCK_UNITS } from "@/lib/validations";
import {
  getStockStatusLabel,
  type StockStatus,
} from "@/lib/stock";

type StockItemRow = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number | null;
  description: string | null;
  status: StockStatus;
  lastPurchaseDate: Date | null;
};

function statusBadgeVariant(status: StockStatus) {
  switch (status) {
    case "in_stock":
      return "success" as const;
    case "low":
      return "warning" as const;
    case "out":
      return "destructive" as const;
  }
}

function StockItemForm({
  item,
  categories: initialCategories,
  onSuccess,
}: {
  item?: StockItemRow;
  categories: StockCategoryOption[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [categoryId, setCategoryId] = useState(
    item?.categoryId ?? initialCategories[0]?.id ?? ""
  );
  const [unit, setUnit] = useState(item?.unit ?? "piece");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("unit", unit);

    const result = item
      ? await updateStockItem(item.id, formData)
      : await createStockItem(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Item name</Label>
          <Input id="name" name="name" required defaultValue={item?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU (optional)</Label>
          <Input id="sku" name="sku" defaultValue={item?.sku ?? ""} />
        </div>
        <div className="space-y-2">
          <StockCategorySelect
            categories={categories}
            value={categoryId}
            onValueChange={setCategoryId}
            onCategoryCreated={(category) =>
              setCategories((prev) => [...prev, category])
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="unit">
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
        <div className="space-y-2">
          <Label htmlFor="quantityOnHand">Quantity on hand</Label>
          <Input
            id="quantityOnHand"
            name="quantityOnHand"
            type="number"
            min={0}
            required
            defaultValue={item?.quantityOnHand ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reorderLevel">Reorder level (optional)</Label>
          <Input
            id="reorderLevel"
            name="reorderLevel"
            type="number"
            min={0}
            defaultValue={item?.reorderLevel ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={item?.description ?? ""}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : item ? "Update item" : "Add item"}
      </Button>
    </form>
  );
}

export function StockClient({
  items,
  categories,
}: {
  items: StockItemRow[];
  categories: StockCategoryOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StockItemRow | null>(null);
  const [localCategories, setLocalCategories] = useState(categories);

  const filtered = useMemo(() => {
    let result = items;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((item) => item.categoryId === categoryFilter);
    }

    if (lowStockOnly) {
      result = result.filter(
        (item) => item.status === "low" || item.status === "out"
      );
    }

    return result;
  }, [items, search, categoryFilter, lowStockOnly]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this stock item and its purchase history?")) return;
    await deleteStockItem(id);
    router.refresh();
  }

  function handleSuccess() {
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Stock</h1>
          <p className="mt-1 text-stone-500">
            Track inventory, purchases, and bill attachments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/inventory/stock/purchases/new">
              <ShoppingCart className="h-4 w-4" />
              Record purchase
            </Link>
          </Button>
          <Dialog open={open && !editing} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                <Plus className="h-4 w-4" />
                Add stock item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add stock item</DialogTitle>
              </DialogHeader>
              <StockItemForm
                categories={localCategories}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-rose-600" />
            Inventory ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search by name, SKU, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {localCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="capitalize">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant={lowStockOnly ? "default" : "outline"}
              onClick={() => setLowStockOnly((v) => !v)}
            >
              Low stock only
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Last purchase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-stone-500">
                    No stock items found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/inventory/stock/${item.id}`}
                        className="font-medium text-rose-700 hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.sku && (
                        <p className="text-xs text-stone-500">SKU: {item.sku}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{item.quantityOnHand}</span>{" "}
                      <span className="text-stone-500 capitalize">{item.unit}</span>
                      <span className="text-xs text-stone-400"> available</span>
                    </TableCell>
                    <TableCell>
                      {item.lastPurchaseDate
                        ? format(new Date(item.lastPurchaseDate), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(item.status)}>
                        {getStockStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditing(item);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!editing && open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit stock item</DialogTitle>
          </DialogHeader>
          {editing && (
            <StockItemForm
              item={editing}
              categories={localCategories}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
