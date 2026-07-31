import { getConsumptionHistory } from "@/actions/inventory/service-recipes";
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

export default async function ConsumptionPage() {
  const history = await getConsumptionHistory();

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Service Consumption"
        description="Products auto-deducted when appointments are marked completed."
      />
      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-stone-500">
                    No consumption recorded yet. Complete appointments with service recipes configured.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{format(new Date(h.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>{h.stockItem.name}</TableCell>
                    <TableCell>{h.appointment?.service?.name ?? "—"}</TableCell>
                    <TableCell>{h.appointment?.customer?.name ?? "—"}</TableCell>
                    <TableCell>{h.employee?.name ?? "—"}</TableCell>
                    <TableCell className="text-rose-600">{Math.abs(h.quantity)} {h.stockItem.unit}</TableCell>
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
