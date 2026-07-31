import { getMonthlyAttendanceReport, getActiveEmployeesForAttendance } from "@/actions/attendance";
import { AttendanceReportsClient } from "./attendance-reports-client";
import { Suspense } from "react";

export default async function AttendanceReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; employee?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  const [report, employees] = await Promise.all([
    getMonthlyAttendanceReport(year, month, params.employee),
    getActiveEmployeesForAttendance(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <Suspense fallback={<div className="text-stone-500">Loading...</div>}>
        <AttendanceReportsClient
          report={report}
          employees={employees}
          selectedYear={year}
          selectedMonth={month}
          selectedEmployeeId={params.employee}
        />
      </Suspense>
    </div>
  );
}
