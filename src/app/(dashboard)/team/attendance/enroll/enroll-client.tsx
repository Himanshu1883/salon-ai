"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { enrollFace } from "@/actions/attendance";
import { FaceCamera } from "@/components/attendance/face-camera";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, ScanFace } from "lucide-react";
import {
  detectFaceDescriptor,
  descriptorToArray,
} from "@/lib/face-api-client";

type Employee = { id: string; name: string };

export function EnrollFaceClient({
  employees,
  preselectedEmployeeId,
  canEnroll,
}: {
  employees: Employee[];
  preselectedEmployeeId?: string;
  canEnroll: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employeeId, setEmployeeId] = useState(
    preselectedEmployeeId ?? searchParams.get("employee") ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleCapture(video: HTMLVideoElement) {
    if (!employeeId || loading) return;

    setLoading(true);
    setError("");

    const descriptor = await detectFaceDescriptor(video);
    if (!descriptor) {
      setError("No face detected. Please position your face in the frame.");
      setLoading(false);
      return;
    }

    const result = await enrollFace(
      employeeId,
      JSON.stringify(descriptorToArray(descriptor))
    );

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  if (!canEnroll) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/team/attendance">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
          <p className="text-stone-600">
            Only owners and managers can enroll faces for team members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/team/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Enroll Face
          </h1>
          <p className="text-sm text-stone-500">
            Capture a team member&apos;s face for attendance check-in
          </p>
        </div>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <div>
            <p className="text-lg font-medium text-green-900">Face enrolled</p>
            <p className="text-sm text-green-700">
              This team member can now use face check-in at the kiosk.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSuccess(false)}>
              Enroll another
            </Button>
            <Button asChild>
              <Link href="/team/attendance">Go to kiosk</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4">
            <Label>Team member</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
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
          </div>

          <FaceCamera
            onCapture={handleCapture}
            showControls
            autoCapture={false}
          />

          <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
            <ScanFace className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <p>
              Position the face clearly in the frame with good lighting. Click
              &quot;Capture face&quot; when ready. Re-enrolling will replace the
              previous face data.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && (
            <p className="text-center text-sm text-stone-500">
              Detecting face and saving...
            </p>
          )}
        </>
      )}
    </div>
  );
}
