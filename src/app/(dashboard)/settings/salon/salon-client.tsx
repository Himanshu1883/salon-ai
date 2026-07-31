"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSalonProfile } from "@/actions/salon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalonPublicUrl } from "@/lib/salon-paths";

type SalonProfile = {
  name: string;
  slug: string;
  businessType: string | null;
  gstin: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
} | null;

export function SalonProfileClient({ profile }: { profile: SalonProfile }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateSalonProfile({
      name: formData.get("name") as string,
      businessType: (formData.get("businessType") as string) || undefined,
      gstin: (formData.get("gstin") as string) || undefined,
      addressLine1: (formData.get("addressLine1") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      pincode: (formData.get("pincode") as string) || undefined,
      businessPhone: (formData.get("businessPhone") as string) || undefined,
      businessEmail: (formData.get("businessEmail") as string) || undefined,
    });

    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Salon profile</CardTitle>
      </CardHeader>
      <CardContent>
        {profile?.slug && (
          <div className="mb-6 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-900">Your salon login URL</p>
            <p className="mt-1 break-all text-sm text-rose-700">
              {getSalonPublicUrl(profile.slug, "/login")}
            </p>
            <p className="mt-2 text-xs text-rose-600">
              Share this link with your team. Each salon has its own unique login page.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Profile updated successfully.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile?.name ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business type</Label>
              <Input
                id="businessType"
                name="businessType"
                defaultValue={profile?.businessType ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" name="gstin" defaultValue={profile?.gstin ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business phone</Label>
              <Input
                id="businessPhone"
                name="businessPhone"
                defaultValue={profile?.businessPhone ?? ""}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessEmail">Business email</Label>
              <Input
                id="businessEmail"
                name="businessEmail"
                type="email"
                defaultValue={profile?.businessEmail ?? ""}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                defaultValue={profile?.addressLine1 ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={profile?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={profile?.state ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                defaultValue={profile?.pincode ?? ""}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
