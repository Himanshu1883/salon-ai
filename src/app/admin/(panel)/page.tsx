import { Suspense } from "react";
import Link from "next/link";
import { AdminDashboardStats } from "./admin-dashboard-stats";
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import { Building2, AlertTriangle, ArrowRight, LayoutDashboard } from "lucide-react";

function DashboardStatsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-stone-100" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-stone-100" />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-dashboard-muted">
          Platform overview for all salon tenants
        </p>
      </div>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <AdminDashboardStats />
      </Suspense>

      <AdminCard>
        <AdminCardHeader
          title="Quick Actions"
          description="Common admin tasks"
          icon={LayoutDashboard}
        />
        <AdminCardContent>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/salons"
              className="inline-flex items-center gap-2 rounded-xl bg-dashboard-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-dashboard-primary-hover"
            >
              <Building2 className="h-4 w-4" />
              Manage Salons
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/salons?status=past_due"
              className="inline-flex items-center gap-2 rounded-xl border border-dashboard-border bg-white px-4 py-2.5 text-sm font-medium text-dashboard-text transition hover:bg-slate-50"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Review Past Due
            </Link>
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
