import { format } from "date-fns";
import {
  getAttendanceLog,
  getActiveEmployeesForAttendance,
} from "@/actions/attendance";
import { AttendanceLogClient } from "./attendance-log-client";
import { Suspense } from "react";

export default async function AttendanceLogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; employee?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? format(new Date(), "yyyy-MM-dd");

  const [records, employees] = await Promise.all([
    getAttendanceLog(date, params.employee),
    getActiveEmployeesForAttendance(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <Suspense fallback={<div className="text-stone-500">Loading...</div>}>
        <AttendanceLogClient
          records={records}
          employees={employees}
          selectedDate={date}
          selectedEmployeeId={params.employee}
        />
      </Suspense>
    </div>
  );
}
