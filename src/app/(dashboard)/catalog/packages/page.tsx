import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function CatalogPackagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Packages</h1>
        <p className="mt-1 text-stone-500">
          Bundle services into packages for your clients.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-600" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-stone-600">
            Package catalog management is on the roadmap. Track packages sold
            from the Sales section in the meantime.
          </p>
          <Button asChild variant="outline">
            <Link href="/sales/packages">View packages sold</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
