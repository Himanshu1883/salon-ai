"use client";

import { useState, useTransition } from "react";
import { Copy, KeyRound, LogIn, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSalonImpersonationLink,
  resetSalonOwnerPassword,
} from "@/actions/platform-admin";
import { canPlatformAdminAccessSalon } from "@/lib/platform-admin-access-shared";
import { cn } from "@/lib/utils";

type SalonAccessActionsProps = {
  salonId: string;
  salonSlug: string;
  subscriptionStatus: string;
  ownerEmail: string;
  ownerName?: string;
  compact?: boolean;
};

export function SalonAccessActions({
  salonId,
  salonSlug,
  subscriptionStatus,
  ownerEmail,
  ownerName,
  compact = false,
}: SalonAccessActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [customPassword, setCustomPassword] = useState("");
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [resetResult, setResetResult] = useState<{
    temporaryPassword: string;
    ownerEmail: string;
    ownerName: string;
  } | null>(null);
  const [resetError, setResetError] = useState("");
  const [accessError, setAccessError] = useState("");
  const [copied, setCopied] = useState(false);

  const canAccessSalon = canPlatformAdminAccessSalon(subscriptionStatus);

  function handleResetPassword() {
    setResetError("");
    startTransition(async () => {
      const result = await resetSalonOwnerPassword(
        salonId,
        useCustomPassword ? customPassword : undefined
      );

      if ("error" in result && result.error) {
        setResetError(result.error);
        return;
      }

      if ("success" in result && result.success) {
        setResetResult({
          temporaryPassword: result.temporaryPassword!,
          ownerEmail: result.ownerEmail!,
          ownerName: result.ownerName ?? ownerName ?? "Owner",
        });
        setCustomPassword("");
      }
    });
  }

  function handleAccessSalon() {
    setAccessError("");
    startTransition(async () => {
      const result = await createSalonImpersonationLink(salonId);

      if ("error" in result && result.error) {
        setAccessError(result.error);
        return;
      }

      if ("success" in result && result.success && result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    });
  }

  async function copyPassword() {
    if (!resetResult?.temporaryPassword) return;
    await navigator.clipboard.writeText(resetResult.temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeResetDialog(open: boolean) {
    setResetOpen(open);
    if (!open) {
      setResetResult(null);
      setResetError("");
      setCustomPassword("");
      setUseCustomPassword(false);
      setCopied(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1.5",
          compact ? "flex-wrap justify-end" : "flex-wrap"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          className="rounded-lg border-dashboard-border text-xs"
          onClick={() => setResetOpen(true)}
        >
          <KeyRound className="mr-1 h-3 w-3" />
          Reset password
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isPending || !canAccessSalon}
          title={
            canAccessSalon
              ? `Open ${salonSlug} dashboard as owner`
              : "Only active or trial salons can be accessed"
          }
          className="rounded-lg bg-violet-600 text-xs hover:bg-violet-700"
          onClick={handleAccessSalon}
        >
          <LogIn className="mr-1 h-3 w-3" />
          Access salon
        </Button>
      </div>

      {accessError && (
        <p className="mt-2 text-xs text-red-600">{accessError}</p>
      )}

      <Dialog open={resetOpen} onOpenChange={closeResetDialog}>
        <DialogContent className="max-w-md border-dashboard-border">
          <DialogHeader>
            <DialogTitle>Reset owner password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-medium text-dashboard-text">
                {ownerName ?? "the salon owner"}
              </span>{" "}
              ({ownerEmail}). The temporary password is shown once.
            </DialogDescription>
          </DialogHeader>

          {resetResult ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-900">
                  Password updated for {resetResult.ownerEmail}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Temporary password
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold tracking-wide text-dashboard-text ring-1 ring-emerald-200">
                    {resetResult.temporaryPassword}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-lg"
                    onClick={copyPassword}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-3 text-xs text-emerald-800">
                  Share this securely with the owner. They can sign in at{" "}
                  <span className="font-medium">/{salonSlug}/login</span>.
                </p>
              </div>
              <Button
                type="button"
                className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
                onClick={() => closeResetDialog(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashboard-border/60 bg-slate-50/80 px-4 py-3 text-sm text-dashboard-muted">
                Leave custom password off to auto-generate a secure temporary
                password.
              </div>

              <div className="flex items-center gap-2">
                <input
                  id={`custom-password-${salonId}`}
                  type="checkbox"
                  checked={useCustomPassword}
                  onChange={(e) => setUseCustomPassword(e.target.checked)}
                  className="h-4 w-4 rounded border-dashboard-border text-violet-600"
                />
                <Label
                  htmlFor={`custom-password-${salonId}`}
                  className="text-sm font-normal text-dashboard-text"
                >
                  Set a custom password
                </Label>
              </div>

              {useCustomPassword && (
                <div className="space-y-2">
                  <Label htmlFor={`password-${salonId}`}>New password</Label>
                  <Input
                    id={`password-${salonId}`}
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="rounded-xl border-dashboard-border"
                    autoComplete="off"
                  />
                </div>
              )}

              {resetError && (
                <p className="text-sm text-red-600">{resetError}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl border-dashboard-border"
                  onClick={() => closeResetDialog(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 rounded-xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
                  disabled={
                    isPending ||
                    (useCustomPassword && customPassword.trim().length < 6)
                  }
                  onClick={handleResetPassword}
                >
                  {isPending ? "Resetting..." : "Reset password"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
