"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeamMemberProfile } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Pencil, X } from "lucide-react";
import { maskAadhar, maskPan } from "@/lib/employee";

type AddressFields = {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
};

export function MemberAddressSection({
  memberId,
  fields,
  canEdit,
}: {
  memberId: string;
  fields: AddressFields;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasAddress =
    fields.addressLine1 ||
    fields.city ||
    fields.state ||
    fields.pincode;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateTeamMemberProfile(memberId, formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditing(false);
    void router.refresh();
  }

  return (
    <Card className="rounded-2xl border-violet-100 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C3BFF]/10">
            <MapPin className="h-5 w-5 text-[#6C3BFF]" />
          </div>
          <div>
            <CardTitle className="text-lg text-stone-900">
              Personal &amp; Address
            </CardTitle>
            <CardDescription>
              Home address and government ID numbers
            </CardDescription>
          </div>
        </div>
        {canEdit && !editing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="border-violet-200 text-[#6C3BFF] hover:bg-violet-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
        {canEdit && editing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine1">Address line 1</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  defaultValue={fields.addressLine1 ?? ""}
                  placeholder="House / flat, street"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine2">Address line 2</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  defaultValue={fields.addressLine2 ?? ""}
                  placeholder="Landmark, area (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={fields.city ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={fields.state ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  defaultValue={fields.pincode ?? ""}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={fields.country ?? "India"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar number</Label>
                <Input
                  id="aadharNumber"
                  name="aadharNumber"
                  defaultValue={fields.aadharNumber ?? ""}
                  placeholder="12-digit Aadhar"
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN number</Label>
                <Input
                  id="panNumber"
                  name="panNumber"
                  defaultValue={fields.panNumber ?? ""}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="uppercase"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save address & IDs"}
            </Button>
          </form>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Address
              </p>
              {hasAddress ? (
                <div className="text-sm text-stone-700">
                  {fields.addressLine1 && <p>{fields.addressLine1}</p>}
                  {fields.addressLine2 && <p>{fields.addressLine2}</p>}
                  <p>
                    {[fields.city, fields.state, fields.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {fields.country && (
                    <p className="text-stone-500">{fields.country}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-400">No address on file</p>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                ID numbers
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Aadhar</dt>
                  <dd className="font-mono text-stone-800">
                    {maskAadhar(fields.aadharNumber)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">PAN</dt>
                  <dd className="font-mono text-stone-800">
                    {maskPan(fields.panNumber)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
