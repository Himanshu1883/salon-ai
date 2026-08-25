import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function CatalogSchemaUpgradeNotice() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="w-full max-w-lg rounded-2xl border-dashboard-border shadow-dashboard-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-dashboard-text">
            Service menu update required
          </CardTitle>
          <CardDescription className="text-dashboard-muted">
            The live database is missing the latest service catalog columns.
            An admin needs to run the database migration, then redeploy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-dashboard-muted">
          <p>From the project root, run:</p>
          <pre className="overflow-x-auto rounded-xl bg-dashboard-bg p-3 text-xs text-dashboard-text">
            npm run db:ensure-catalog
          </pre>
          <p>Or redeploy production so the Vercel build applies migrations automatically.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="rounded-xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function isCatalogSchemaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("catalogtype") ||
    message.includes("servicepackageitem") ||
    message.includes("serviceaddonlink") ||
    message.includes("categorygroup") ||
    message.includes("column") && message.includes("does not exist") ||
    message.includes("p2022") ||
    message.includes("p2021") ||
    message.includes("invalid `prisma.service.findmany`")
  );
}
