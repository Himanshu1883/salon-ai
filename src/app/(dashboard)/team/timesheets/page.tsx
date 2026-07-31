import { Clock } from "lucide-react";

export default function TimesheetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Timesheets</h1>
        <p className="mt-1 text-sm text-stone-500">
          Track hours worked by your team each week
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
        <Clock className="mb-4 h-10 w-10 text-stone-300" />
        <p className="text-lg font-medium text-stone-700">Coming soon</p>
        <p className="mt-1 max-w-md text-sm text-stone-500">
          Timesheet tracking will let you review and approve hours worked based
          on scheduled shifts and clock-in data.
        </p>
      </div>
    </div>
  );
}
