import { getAttendancePageData } from "@/actions/attendance";
import { AttendanceClient } from "./attendance-client";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const data = await getAttendancePageData(params.date);

  return <AttendanceClient initialData={data} />;
}
