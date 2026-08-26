import {
  InventoryPageHeader,
  InventoryStatCard,
} from "@/components/inventory/inventory-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-violet-100/80 ${className ?? ""}`} />;
}

export function InventoryDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Inventory Dashboard"
        description="Track stock levels, consumption, purchases, and salon product movement."
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" disabled>
            New PO
          </Button>
          <Button className="rounded-xl bg-[#6C3BFF]" disabled>
            Add Product
          </Button>
        </div>
      </InventoryPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InventoryStatCard label="Total Products" value="—" sub="Loading…" />
        <InventoryStatCard label="Inventory Value" value="—" sub="Loading…" accent="emerald" />
        <InventoryStatCard label="Low Stock" value="—" sub="Loading…" accent="amber" />
        <InventoryStatCard label="Open POs" value="—" sub="Loading…" accent="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-violet-100 shadow-sm">
          <CardHeader>
            <Pulse className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Pulse className="h-[220px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-violet-100 shadow-sm">
          <CardHeader>
            <Pulse className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Pulse className="h-[220px] w-full" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardHeader>
          <Pulse className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
