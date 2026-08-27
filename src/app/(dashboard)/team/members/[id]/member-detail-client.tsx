"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateTeamMember, deactivateTeamMember, deleteTeamMember } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, ScanFace, BarChart3, Clock } from "lucide-react";
import { MemberAvatar } from "@/components/team/member-avatar";
import { getRoleLabel } from "@/lib/team";
import { EmployeeRoleSelect } from "@/components/team/employee-role-select";
import { MemberAddressSection } from "./member-address-section";
import { MemberDocumentsSection } from "./member-documents-section";
import { EmployeeOtherDocument } from "@/lib/employee";

type Member = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  specialties: string | null;
  avatarUrl: string | null;
  status: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  aadharDocumentUrl: string | null;
  panDocumentUrl: string | null;
  offerLetterUrl: string | null;
  otherDocuments: EmployeeOtherDocument[];
  services: { service: { id: string; name: string } }[];
};

type Service = { id: string; name: string };

const statusVariant: Record<string, "success" | "secondary" | "warning"> = {
  active: "success",
  inactive: "secondary",
  on_break: "warning",
};

export function MemberDetailClient({
  member,
  services,
  faceStatus,
  canUpdate,
  canDelete,
}: {
  member: Member;
  services: Service[];
  faceStatus: { enrolled: boolean; enrolledAt: string | null };
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(member.role);
  const [status, setStatus] = useState(member.status);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    member.services.map((s) => s.service.id)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    selectedServices.forEach((id) => formData.append("serviceIds", id));

    const result = await updateTeamMember(member.id, formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDeactivate() {
    if (!confirm("Deactivate this team member?")) return;
    const result = await deactivateTeamMember(member.id);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (
      !confirm(
        "Permanently delete this team member? This cannot be undone."
      )
    ) {
      return;
    }
    setDeleting(true);
    const result = await deleteTeamMember(member.id);
    setDeleting(false);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.push("/team/members");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/team/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <MemberAvatar
            name={member.name}
            avatarUrl={member.avatarUrl}
            className="h-12 w-12 text-base"
          />
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              {member.name}
            </h1>
            <p className="text-sm text-stone-500">
              {getRoleLabel(member.role)}
            </p>
          </div>
          <Badge
            variant={statusVariant[member.status] ?? "secondary"}
            className="ml-auto"
          >
            {member.status.replace("_", " ")}
          </Badge>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/team/shifts?employee=${member.id}`}>
            <Calendar className="h-4 w-4" />
            View shifts
          </Link>
        </Button>
        {canDelete && member.status !== "inactive" && (
          <Button variant="outline" onClick={handleDeactivate}>
            Deactivate
          </Button>
        )}
        {canDelete && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <ScanFace className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-medium text-stone-700">Face enrollment</span>
          <Badge variant={faceStatus.enrolled ? "success" : "secondary"}>
            {faceStatus.enrolled ? "Enrolled" : "Not enrolled"}
          </Badge>
          {faceStatus.enrolledAt && (
            <span className="text-xs text-stone-500">
              since {new Date(faceStatus.enrolledAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/team/attendance/enroll?employee=${member.id}`}>
              <ScanFace className="h-4 w-4" />
              {faceStatus.enrolled ? "Re-enroll face" : "Enroll face"}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/attendance?employee=${member.id}`}>
              <Clock className="h-4 w-4" />
              View attendance
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/team/attendance/reports?employee=${member.id}`}>
              <BarChart3 className="h-4 w-4" />
              Monthly attendance
            </Link>
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={member.name} disabled={!canUpdate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <input type="hidden" name="role" value={role} />
            <EmployeeRoleSelect
              value={role}
              onChange={setRole}
              disabled={!canUpdate}
              customInputId="member-custom-role"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={member.phone ?? ""}
              disabled={!canUpdate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={member.email ?? ""}
              disabled={!canUpdate}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="specialties">Specialties</Label>
            <Input
              id="specialties"
              name="specialties"
              defaultValue={member.specialties ?? ""}
              disabled={!canUpdate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <input type="hidden" name="status" value={status} />
            <Select value={status} onValueChange={setStatus} disabled={!canUpdate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_break">On break</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {services.length > 0 && (
          <div className="space-y-2">
            <Label>Services they can perform</Label>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  disabled={!canUpdate}
                  onClick={() =>
                    setSelectedServices((prev) =>
                      prev.includes(service.id)
                        ? prev.filter((id) => id !== service.id)
                        : [...prev, service.id]
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs ${
                    selectedServices.includes(service.id)
                      ? "border-violet-400 bg-violet-50 text-violet-700"
                      : "border-stone-200"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {canUpdate ? (
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        ) : (
          <p className="text-xs text-stone-400">
            You do not have permission to edit team details.
          </p>
        )}
      </form>

      <MemberAddressSection
        memberId={member.id}
        canEdit={canUpdate}
        fields={{
          addressLine1: member.addressLine1,
          addressLine2: member.addressLine2,
          city: member.city,
          state: member.state,
          pincode: member.pincode,
          country: member.country,
          aadharNumber: member.aadharNumber,
          panNumber: member.panNumber,
        }}
      />

      <MemberDocumentsSection
        memberId={member.id}
        canEdit={canUpdate}
        fields={{
          aadharDocumentUrl: member.aadharDocumentUrl,
          panDocumentUrl: member.panDocumentUrl,
          offerLetterUrl: member.offerLetterUrl,
          otherDocuments: member.otherDocuments,
        }}
      />
    </div>
  );
}
