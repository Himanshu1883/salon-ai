"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ExternalLink, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import {
  getBillAttachmentUrl,
  getStockStatusLabel,
  type StockStatus,
} from "@/lib/stock";

type Purchase = {
  id: string;
  quantityPurchased: number;
  amount: number;
  unitCost: number | null;
  supplierName: string | null;
  purchaseDate: Date;
  billAttachmentPath: string | null;
  notes: string | null;
};

type StockDetail = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number | null;
  description: string | null;
  status: StockStatus;
  purchases: Purchase[];
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

export function StockDetailClient({ item }: { item: StockDetail }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/stock")}>
          <ArrowLeft className="h-4 w-4" />
          Back to stock
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{item.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {item.category}
            </Badge>
            <Badge variant={statusBadgeVariant(item.status)}>
              {getStockStatusLabel(item.status)}
            </Badge>
            {item.sku && (
              <span className="text-sm text-stone-500">SKU: {item.sku}</span>
            )}
          </div>
          {item.description && (
            <p className="mt-2 text-stone-600">{item.description}</p>
          )}
        </div>
        <Button asChild>
          <Link href={`/inventory/stock/purchases/new?itemId=${item.id}`}>
            <ShoppingCart className="h-4 w-4" />
            Record purchase
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {item.quantityOnHand}{" "}
              <span className="text-lg font-normal capitalize text-stone-500">
                {item.unit}
              </span>
            </p>
            <p className="text-xs text-stone-500">{item.quantityOnHand} available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Reorder level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {item.reorderLevel ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Total purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{item.purchases.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Unit cost</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Bill</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-stone-500">
                    No purchases recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                item.purchases.map((purchase) => {
                  const billUrl = getBillAttachmentUrl(purchase.billAttachmentPath);
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {format(new Date(purchase.purchaseDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {purchase.quantityPurchased} {item.unit}
                      </TableCell>
                      <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                      <TableCell>
                        {purchase.unitCost != null
                          ? formatCurrency(purchase.unitCost)
                          : "—"}
                      </TableCell>
                      <TableCell>{purchase.supplierName ?? "—"}</TableCell>
                      <TableCell>
                        {billUrl ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={billUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              View bill
                            </a>
                          </Button>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
