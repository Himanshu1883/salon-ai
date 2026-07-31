import { getRetailSales } from "@/actions/inventory/ledger";
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
import { format } from "date-fns";

export default async function RetailSalesPage() {
  const sales = await getRetailSales();

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Retail Sales"
        description="Product sales deducted from inventory via POS/billing."
      />
      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Qty Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-stone-500">
                    No retail sales recorded. Product line items on paid invoices appear here.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{format(new Date(s.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>{s.stockItem.name}</TableCell>
                    <TableCell>{s.customer?.name ?? "Walk-in"}</TableCell>
                    <TableCell className="text-rose-600">{Math.abs(s.quantity)}</TableCell>
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
