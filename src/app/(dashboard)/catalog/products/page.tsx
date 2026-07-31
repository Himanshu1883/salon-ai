import Link from "next/link";
import { getStockItems } from "@/actions/stock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function CatalogProductsPage() {
  const items = await getStockItems();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Products</h1>
          <p className="mt-1 text-stone-500">
            Retail products available for sale at your salon.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/inventory/stock">Manage stock</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product catalog ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-stone-500">
                    No products yet. Add items from inventory stock.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/inventory/stock/${item.id}`}
                        className="font-medium text-violet-600 hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.sku && (
                        <p className="text-xs text-stone-500">{item.sku}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.quantityOnHand}</TableCell>
                    <TableCell className="capitalize">{item.unit}</TableCell>
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
