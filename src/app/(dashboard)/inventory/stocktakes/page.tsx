import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function StocktakesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Stocktakes</h1>
        <p className="mt-1 text-stone-500">
          Count and reconcile inventory on hand.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-violet-600" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-stone-600">
            Stocktake workflows are coming soon. Use stock inventory to view
            current quantities.
          </p>
          <Button asChild variant="outline">
            <Link href="/inventory/stock">View stock inventory</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
