"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getFaceProfiles,
  recordCheckIn,
} from "@/actions/attendance";
import { FaceCamera } from "@/components/attendance/face-camera";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScanFace, UserCheck, CheckCircle2, LogOut } from "lucide-react";
import {
  detectFaceDescriptor,
  descriptorToArray,
} from "@/lib/face-api-client";
import {
  findBestFaceMatch,
  FACE_MATCH_THRESHOLD,
} from "@/lib/face-match";

type Employee = { id: string; name: string };

type FaceProfile = {
  employeeId: string;
  employeeName: string;
  faceDescriptor: number[];
};

type Toast = {
  type: "success" | "error";
  message: string;
  sub?: string;
};

export function AttendanceKioskClient({
  employees,
  initialProfiles,
}: {
  employees: Employee[];
  initialProfiles: FaceProfile[];
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [manualEmployeeId, setManualEmployeeId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const lastScanRef = useRef<{ employeeId: string; at: number } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleMatch = useCallback(
    async (employeeId: string, employeeName: string, confidence: number) => {
      const now = Date.now();
      if (
        lastScanRef.current?.employeeId === employeeId &&
        now - lastScanRef.current.at < 5000
      ) {
        return;
      }
      lastScanRef.current = { employeeId, at: now };

      setProcessing(true);
      const result = await recordCheckIn(employeeId, "face", confidence);
      setProcessing(false);

      if (result.error) {
        setToast({ type: "error", message: result.error });
        return;
      }

      if (result.action === "check_in") {
        setToast({
          type: "success",
          message: `${employeeName} checked in`,
          sub: `Checked in at ${result.time}`,
        });
      } else {
        setToast({
          type: "success",
          message: `${employeeName} checked out`,
          sub: `Checked out at ${result.time}`,
        });
      }
    },
    []
  );

  const handleFaceCapture = useCallback(
    async (video: HTMLVideoElement) => {
      if (processing || profiles.length === 0) return;

      const descriptor = await detectFaceDescriptor(video);
      if (!descriptor) return;

      const match = findBestFaceMatch(
        descriptorToArray(descriptor),
        profiles,
        FACE_MATCH_THRESHOLD
      );

      if (match) {
        await handleMatch(match.employeeId, match.employeeName, match.confidence);
      }
    },
    [processing, profiles, handleMatch]
  );

  async function handleManualCheckIn() {
    if (!manualEmployeeId) return;
    const employee = employees.find((e) => e.id === manualEmployeeId);
    if (!employee) return;

    setProcessing(true);
    const result = await recordCheckIn(manualEmployeeId, "manual");
    setProcessing(false);

    if (result.error) {
      setToast({ type: "error", message: result.error });
      return;
    }

    if (result.action === "check_in") {
      setToast({
        type: "success",
        message: `${employee.name} checked in`,
        sub: `Checked in at ${result.time} (manual)`,
      });
    } else {
      setToast({
        type: "success",
        message: `${employee.name} checked out`,
        sub: `Checked out at ${result.time} (manual)`,
      });
    }
  }

  async function refreshProfiles() {
    const updated = await getFaceProfiles();
    setProfiles(updated);
  }

  useEffect(() => {
    refreshProfiles();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
          <ScanFace className="h-7 w-7 text-violet-600" />
        </div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Team Attendance
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Look at the camera to check in or out
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <Badge variant="secondary">
            {profiles.length} face{profiles.length !== 1 ? "s" : ""} enrolled
          </Badge>
          <Button variant="link" size="sm" asChild className="h-auto p-0">
            <Link href="/team/attendance/enroll">Enroll faces</Link>
          </Button>
        </div>
      </div>

      {toast && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {toast.type === "success" ? (
            toast.sub?.includes("out") ? (
              <LogOut className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            )
          ) : (
            <UserCheck className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <div>
            <p className="font-medium">{toast.message}</p>
            {toast.sub && <p className="text-sm opacity-80">{toast.sub}</p>}
          </div>
        </div>
      )}

      <FaceCamera
        autoCapture
        captureIntervalMs={2500}
        onCapture={handleFaceCapture}
        showControls={false}
      />

      {processing && (
        <p className="text-center text-sm text-stone-500">Processing...</p>
      )}

      {profiles.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
          No faces enrolled yet.{" "}
          <Link
            href="/team/attendance/enroll"
            className="font-medium underline"
          >
            Enroll team members
          </Link>{" "}
          to use face check-in.
        </div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-stone-700">
          Manual check-in / check-out
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={manualEmployeeId} onValueChange={setManualEmployeeId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleManualCheckIn}
            disabled={!manualEmployeeId || processing}
            className="sm:w-auto"
          >
            Check in / out
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-4 text-sm">
        <Link
          href="/team/attendance/log"
          className="text-violet-600 hover:underline"
        >
          View today&apos;s log
        </Link>
        <Link
          href="/team/attendance/reports"
          className="text-violet-600 hover:underline"
        >
          Monthly reports
        </Link>
      </div>
    </div>
  );
}
