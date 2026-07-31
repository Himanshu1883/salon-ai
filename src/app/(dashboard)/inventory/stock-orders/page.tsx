import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function StockOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Stock orders</h1>
        <p className="mt-1 text-stone-500">
          Record purchases and track stock orders from suppliers.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-violet-600" />
            Record a purchase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-stone-600">
            Use the purchase form to record stock orders and update quantities
            on hand.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/inventory/stock/purchases/new">
                Record purchase
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/inventory/stock">View stock inventory</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
