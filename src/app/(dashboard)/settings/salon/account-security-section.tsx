"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Eye, EyeOff, Loader2, Lock, Mail, Shield } from "lucide-react";
import { updateUserEmail, updateUserPassword } from "@/actions/user-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { salonLoginPath } from "@/lib/salon-paths";

type AccountSecuritySectionProps = {
  currentEmail: string;
  salonSlug: string;
};

function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={name === "currentPassword" ? 1 : 6}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="pl-10 pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 transition hover:text-stone-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function AccountSecuritySection({
  currentEmail,
  salonSlug,
}: AccountSecuritySectionProps) {
  const router = useRouter();

  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    const result = await updateUserEmail({
      newEmail,
      currentPassword: emailCurrentPassword,
    });

    setEmailLoading(false);

    if ("error" in result && typeof result.error === "string") {
      setEmailError(result.error);
      return;
    }

    if ("requiresReLogin" in result && result.requiresReLogin) {
      await signOut({
        callbackUrl: `${salonLoginPath(salonSlug)}?email=updated`,
      });
      return;
    }

    setEmailSuccess("Login email updated successfully.");
    setNewEmail("");
    setEmailCurrentPassword("");
    router.refresh();
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    const result = await updateUserPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setPasswordLoading(false);

    if ("error" in result && typeof result.error === "string") {
      setPasswordError(result.error);
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-violet-600" />
          Login &amp; security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <p className="text-sm text-stone-500">
          Update the email and password you use to sign in to Go Tix. Your current
          login email is{" "}
          <span className="font-medium text-stone-700">{currentEmail}</span>.
        </p>

        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-violet-900">
            <Mail className="h-4 w-4" />
            Change login email
          </h3>
          <p className="mt-1 text-xs text-violet-700/80">
            You will be signed out and asked to sign in again with your new email.
          </p>

          <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
            {emailError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {emailError}
              </p>
            )}
            {emailSuccess && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {emailSuccess}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="newEmail">New login email</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                required
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <PasswordInput
              id="emailCurrentPassword"
              name="currentPassword"
              label="Current password"
              value={emailCurrentPassword}
              onChange={setEmailCurrentPassword}
              placeholder="Confirm with your current password"
              autoComplete="current-password"
            />

            <Button type="submit" disabled={emailLoading}>
              {emailLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating email…
                </>
              ) : (
                "Update login email"
              )}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Lock className="h-4 w-4" />
            Change password
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Use at least 6 characters. You will stay signed in after updating your password.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
            {passwordError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Password updated successfully.
              </p>
            )}

            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating password…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
