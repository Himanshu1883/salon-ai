import { getExpiringProducts } from "@/actions/inventory/ledger";
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
import { format, differenceInDays } from "date-fns";

export default async function ExpiryPage() {
  const products = await getExpiringProducts(30);

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Expiry Alerts"
        description="Products expiring within the next 30 days."
      />
      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Days left</TableHead>
                <TableHead>On hand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-stone-500">
                    No products expiring soon.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const days = p.expiryDate
                    ? differenceInDays(new Date(p.expiryDate), new Date())
                    : 0;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category.name}</TableCell>
                      <TableCell>{p.batchNumber ?? "—"}</TableCell>
                      <TableCell>
                        {p.expiryDate ? format(new Date(p.expiryDate), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={days <= 7 ? "destructive" : "warning"}
                          className="rounded-lg"
                        >
                          {days} days
                        </Badge>
                      </TableCell>
                      <TableCell>{p.quantityOnHand}</TableCell>
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
