import { getInventoryReports } from "@/actions/inventory/ledger";
import { InventoryPageHeader } from "@/components/inventory/inventory-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";

export default async function InventoryReportsPage() {
  const reports = await getInventoryReports();

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Inventory Reports"
        description="Stock analysis, consumption trends, and purchase history."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-violet-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>SKUs</TableHead>
                  <TableHead>Total Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.stockByCategory.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="capitalize">{row.category}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-violet-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top Consumed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Units consumed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.topConsumed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-stone-500">
                      No consumption data yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.topConsumed.map((row) => (
                    <TableRow key={row.product}>
                      <TableCell>{row.product}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Purchases</CardTitle>
          <Link href="/inventory/ledger?type=purchase" className="text-sm text-[#6C3BFF] hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.recentPurchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{format(new Date(p.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>{p.stockItem.name}</TableCell>
                  <TableCell className="text-emerald-600">+{p.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
