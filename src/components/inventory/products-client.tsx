"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/inventory/products";
import { InventoryPageHeader } from "@/components/inventory/inventory-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import { InventoryFilterBar } from "@/components/inventory/inventory-filter-bar";
import {
  InventoryIconButton,
  InventoryMobileCard,
  InventoryMobileField,
} from "@/components/inventory/inventory-list-helpers";
import { STOCK_UNITS } from "@/lib/validations";
import { getStockStatusLabel, type StockStatus } from "@/lib/stock";
import { format } from "date-fns";

type Product = Awaited<
  ReturnType<typeof import("@/actions/inventory/products").getProducts>
>[number];

type Option = { id: string; name: string };

function statusVariant(status: StockStatus) {
  if (status === "in_stock") return "success" as const;
  if (status === "low") return "warning" as const;
  return "destructive" as const;
}

function ProductForm({
  product,
  categories,
  brands,
  suppliers,
  onSuccess,
}: {
  product?: Product;
  categories: Option[];
  brands: Option[];
  suppliers: Option[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "none");
  const [supplierId, setSupplierId] = useState(product?.supplierId ?? "none");
  const [unit, setUnit] = useState(product?.unit ?? "piece");
  const [status, setStatus] = useState(product?.status ?? "active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("brandId", brandId === "none" ? "" : brandId);
    formData.set("supplierId", supplierId === "none" ? "" : supplierId);
    formData.set("unit", unit);
    formData.set("status", status);
    formData.set("isRetail", "true");

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Product name</Label>
          <Input name="name" required defaultValue={product?.name} />
        </div>
        <div className="space-y-2">
          <Label>SKU</Label>
          <Input name="sku" defaultValue={product?.sku ?? ""} />
        </div>
        <div className="space-y-2">
          <Label>Barcode</Label>
          <Input name="barcode" defaultValue={product?.barcode ?? ""} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select value={brandId} onValueChange={setBrandId}>
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Vendor</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STOCK_UNITS.map((u) => (
                <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Qty on hand</Label>
          <Input name="quantityOnHand" type="number" min={0} defaultValue={product?.quantityOnHand ?? 0} />
        </div>
        <div className="space-y-2">
          <Label>Reorder level</Label>
          <Input name="reorderLevel" type="number" min={0} defaultValue={product?.reorderLevel ?? ""} />
        </div>
        <div className="space-y-2">
          <Label>Max level</Label>
          <Input name="maxLevel" type="number" min={0} defaultValue={product?.maxLevel ?? ""} />
        </div>
        <div className="space-y-2">
          <Label>Cost price (₹)</Label>
          <Input name="costPrice" type="number" min={0} step="0.01" defaultValue={product?.costPrice ?? 0} />
        </div>
        <div className="space-y-2">
          <Label>Retail price (₹)</Label>
          <Input name="retailPrice" type="number" min={0} step="0.01" defaultValue={product?.retailPrice ?? 0} />
        </div>
        <div className="space-y-2">
          <Label>GST %</Label>
          <Input name="gstRate" type="number" min={0} max={100} defaultValue={product?.gstRate ?? 18} />
        </div>
        <div className="space-y-2">
          <Label>Shelf location</Label>
          <Input name="shelfLocation" defaultValue={product?.shelfLocation ?? ""} />
        </div>
        <div className="space-y-2">
          <Label>Batch number</Label>
          <Input name="batchNumber" defaultValue={product?.batchNumber ?? ""} />
        </div>
        <div className="space-y-2">
          <Label>Expiry date</Label>
          <Input
            name="expiryDate"
            type="date"
            defaultValue={
              product?.expiryDate
                ? format(new Date(product.expiryDate), "yyyy-MM-dd")
                : ""
            }
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Textarea name="description" rows={2} defaultValue={product?.description ?? ""} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">
        {loading ? "Saving..." : product ? "Update product" : "Create product"}
      </Button>
    </form>
  );
}

export function ProductsClient({
  products,
  categories,
  brands,
  suppliers,
  canWrite,
}: {
  products: Product[];
  categories: Option[];
  brands: Option[];
  suppliers: Option[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
      );
    });
  }, [products, query, categoryFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    router.refresh();
  }

  function refresh() {
    setOpen(false);
    setEditProduct(undefined);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Product Master"
        description="Manage salon products — SKUs, pricing, stock levels, and retail settings."
      >
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF] hover:bg-[#5A2FE0]">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add product</DialogTitle>
              </DialogHeader>
              <ProductForm
                categories={categories}
                brands={brands}
                suppliers={suppliers}
                onSuccess={refresh}
              />
            </DialogContent>
          </Dialog>
        )}
      </InventoryPageHeader>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search name, SKU, barcode..."
                className="h-11 rounded-xl pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <InventoryFilterBar
              triggerLabel="Filter products"
              mobileChildren={
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            >
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[180px] rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InventoryFilterBar>
          </div>

          <ResponsiveTableWrapper
            cards={
              filtered.length === 0 ? (
                <p className="py-8 text-center text-stone-500">No products found.</p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {filtered.map((p) => (
                    <InventoryMobileCard key={p.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <Link
                            href={`/inventory/stock/${p.id}`}
                            className="block font-semibold text-[#6C3BFF] hover:underline"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-stone-500">
                            {[p.sku, p.barcode].filter(Boolean).join(" · ") || "—"}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <InventoryMobileField label="On hand">
                              {p.quantityOnHand} {p.unit}
                            </InventoryMobileField>
                            <InventoryMobileField label="Cost / Retail">
                              ₹{p.costPrice} / ₹{p.retailPrice}
                            </InventoryMobileField>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="capitalize rounded-lg">
                              {p.category}
                            </Badge>
                            <Badge variant={statusVariant(p.statusStock)} className="rounded-lg">
                              {getStockStatusLabel(p.statusStock)}
                            </Badge>
                          </div>
                        </div>
                        {canWrite && (
                          <div className="flex shrink-0 gap-1">
                            <InventoryIconButton onClick={() => setEditProduct(p)}>
                              <Pencil className="h-4 w-4" />
                            </InventoryIconButton>
                            <InventoryIconButton
                              className="text-red-600"
                              onClick={() => handleDelete(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </InventoryIconButton>
                          </div>
                        )}
                      </div>
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
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>On hand</TableHead>
                      <TableHead>Cost / Retail</TableHead>
                      <TableHead>Status</TableHead>
                      {canWrite && <TableHead className="w-24" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-stone-500">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Link
                              href={`/inventory/stock/${p.id}`}
                              className="font-medium text-[#6C3BFF] hover:underline"
                            >
                              {p.name}
                            </Link>
                            <p className="text-xs text-stone-500">
                              {[p.sku, p.barcode].filter(Boolean).join(" · ") || "—"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize rounded-lg">
                              {p.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.quantityOnHand} {p.unit}
                          </TableCell>
                          <TableCell className="text-sm">
                            ₹{p.costPrice} / ₹{p.retailPrice}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(p.statusStock)} className="rounded-lg">
                              {getStockStatusLabel(p.statusStock)}
                            </Badge>
                          </TableCell>
                          {canWrite && (
                            <TableCell>
                              <div className="flex gap-1">
                                <InventoryIconButton onClick={() => setEditProduct(p)}>
                                  <Pencil className="h-4 w-4" />
                                </InventoryIconButton>
                                <InventoryIconButton
                                  className="text-red-600"
                                  onClick={() => handleDelete(p.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </InventoryIconButton>
                              </div>
                            </TableCell>
                          )}
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

      <Dialog open={!!editProduct} onOpenChange={(v) => !v && setEditProduct(undefined)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              product={editProduct}
              categories={categories}
              brands={brands}
              suppliers={suppliers}
              onSuccess={refresh}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
