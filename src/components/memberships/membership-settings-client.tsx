"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMembershipSettings } from "@/actions/memberships";
import { MembershipPageHeader } from "@/components/memberships/memberships-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { MEMBERSHIP_PRIMARY } from "@/lib/memberships/constants";

type Settings = {
  autoRenewEnabled: boolean;
  renewalReminderDays: number;
  allowFamilyMembers: boolean;
  maxFamilyMembers: number;
  defaultTaxRate: number;
  membershipPrefix: string;
  termsAndConditions: string | null;
};

export function MembershipSettingsClient({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    await updateMembershipSettings({
      autoRenewEnabled: fd.get("autoRenewEnabled") === "on",
      renewalReminderDays: Number(fd.get("renewalReminderDays")),
      allowFamilyMembers: fd.get("allowFamilyMembers") === "on",
      maxFamilyMembers: Number(fd.get("maxFamilyMembers")),
      defaultTaxRate: Number(fd.get("defaultTaxRate")),
      membershipPrefix: fd.get("membershipPrefix") as string,
      termsAndConditions: (fd.get("termsAndConditions") as string) || undefined,
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Membership Settings"
        description="Configure salon-wide membership policies and defaults."
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Membership number prefix</Label>
            <Input
              name="membershipPrefix"
              defaultValue={settings.membershipPrefix}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Default tax rate (%)</Label>
            <Input
              name="defaultTaxRate"
              type="number"
              step="0.1"
              defaultValue={settings.defaultTaxRate}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Renewal reminder (days before expiry)</Label>
            <Input
              name="renewalReminderDays"
              type="number"
              defaultValue={settings.renewalReminderDays}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Max family members</Label>
            <Input
              name="maxFamilyMembers"
              type="number"
              defaultValue={settings.maxFamilyMembers}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="autoRenewEnabled"
              defaultChecked={settings.autoRenewEnabled}
            />
            Enable auto-renewal
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="allowFamilyMembers"
              defaultChecked={settings.allowFamilyMembers}
            />
            Allow family memberships
          </label>
        </div>

        <div className="space-y-2">
          <Label>Terms & conditions</Label>
          <Textarea
            name="termsAndConditions"
            rows={5}
            defaultValue={settings.termsAndConditions ?? ""}
            placeholder="Membership terms shown at checkout..."
            className="rounded-xl"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl text-white"
            style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save settings
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600">Settings saved successfully.</span>
          )}
        </div>
      </form>
    </div>
  );
}
