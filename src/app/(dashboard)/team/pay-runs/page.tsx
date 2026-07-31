import { Wallet } from "lucide-react";

export default function PayRunsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Pay runs</h1>
        <p className="mt-1 text-sm text-stone-500">
          Process payroll for your team members
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
        <Wallet className="mb-4 h-10 w-10 text-stone-300" />
        <p className="text-lg font-medium text-stone-700">Coming soon</p>
        <p className="mt-1 max-w-md text-sm text-stone-500">
          Pay run management will help you calculate wages and process payments
          for your team based on timesheets and hourly rates.
        </p>
      </div>
    </div>
  );
}
