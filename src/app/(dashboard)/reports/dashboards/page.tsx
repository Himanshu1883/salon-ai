import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { DASHBOARD_REPORTS } from "@/lib/reports-catalog";
import { ReportsAddButton } from "@/components/reports/reports-sidebar";

export default function DashboardsPage() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboards</h1>
          <p className="mt-1 text-stone-500">
            Quick access to key salon metrics.
          </p>
        </div>
        <ReportsAddButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_REPORTS.map((dash) => (
          <Link
            key={dash.slug}
            href={dash.route}
            className="rounded-xl border border-stone-700 bg-stone-800 p-6 transition-colors hover:border-violet-500"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-stone-700 text-violet-300">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-stone-100">{dash.title}</h3>
            <p className="mt-1 text-sm text-stone-400">{dash.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
