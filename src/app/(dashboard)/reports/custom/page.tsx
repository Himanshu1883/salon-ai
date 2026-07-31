import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportsAddButton } from "@/components/reports/reports-sidebar";

export default function CustomReportsPage() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Custom reports</h1>
          <p className="mt-1 text-stone-500">
            Build reports tailored to your salon.
          </p>
        </div>
        <ReportsAddButton />
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 py-20 text-center">
        <p className="text-stone-500">No custom reports yet.</p>
        <Button variant="outline" size="sm" disabled className="mt-4 gap-1">
          <Plus className="h-4 w-4" />
          Create custom report
        </Button>
      </div>
    </div>
  );
}
