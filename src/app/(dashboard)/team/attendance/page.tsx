import {
  getActiveEmployeesForAttendance,
  getFaceProfiles,
} from "@/actions/attendance";
import { AttendanceKioskClient } from "./attendance-kiosk-client";

export default async function AttendancePage() {
  const [employees, profiles] = await Promise.all([
    getActiveEmployeesForAttendance(),
    getFaceProfiles(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <AttendanceKioskClient employees={employees} initialProfiles={profiles} />
    </div>
  );
}
