import { getLowStockProducts } from "@/actions/inventory/ledger";
import { InventoryPageHeader } from "@/components/inventory/inventory-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getStockStatusLabel } from "@/lib/stock";

export default async function LowStockPage() {
  const products = await getLowStockProducts();

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Low Stock"
        description="Products at or below reorder level — time to restock."
      />
      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Reorder at</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-stone-500">
                    All products are adequately stocked.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/inventory/stock/${p.id}`} className="font-medium text-[#6C3BFF] hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.quantityOnHand} {p.unit}</TableCell>
                    <TableCell>{p.reorderLevel ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "out" ? "destructive" : "warning"} className="rounded-lg">
                        {getStockStatusLabel(p.status)}
                      </Badge>
                    </TableCell>
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
