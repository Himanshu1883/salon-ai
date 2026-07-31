import {
  getActiveEmployeesForAttendance,
  canEnrollFaces,
} from "@/actions/attendance";
import { EnrollFaceClient } from "./enroll-client";
import { Suspense } from "react";

export default async function EnrollFacePage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string }>;
}) {
  const params = await searchParams;
  const [employees, enrollPerm] = await Promise.all([
    getActiveEmployeesForAttendance(),
    canEnrollFaces(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <Suspense fallback={<div className="text-stone-500">Loading...</div>}>
        <EnrollFaceClient
          employees={employees}
          preselectedEmployeeId={params.employee}
          canEnroll={enrollPerm.allowed}
        />
      </Suspense>
    </div>
  );
}
