"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SalonAuthShell } from "@/components/auth/salon-auth-shell";
import { resetPasswordAction } from "@/actions/auth";
import {
  salonForgotPasswordPath,
  salonLoginPath,
} from "@/lib/salon-paths";
import type { SalonAuthBranding } from "@/lib/salon-auth-page";
import { cn } from "@/lib/utils";

type ResetPasswordFormProps = {
  salon: SalonAuthBranding;
};

export default function ResetPasswordForm({ salon }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <SalonAuthShell
        salon={salon}
        title="Invalid reset link"
        subtitle="This password reset link is missing or incomplete."
        backHref={salonForgotPasswordPath(salon.slug)}
        backLabel="Request a new reset link"
      >
        <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          Please request a new password reset email and use the link from that message.
        </p>
      </SalonAuthShell>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await resetPasswordAction({
      token,
      salonSlug: salon.slug,
      password,
      confirmPassword,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`${salonLoginPath(salon.slug)}?reset=success`);
    router.refresh();
  }

  return (
    <SalonAuthShell
      salon={salon}
      title="Set a new password"
      subtitle={`Choose a new password for your ${salon.name} account`}
      backHref={salonLoginPath(salon.slug)}
      backLabel="Back to login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-stone-700">
            New password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-11 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-dashboard-primary focus:bg-white focus:ring-2 focus:ring-dashboard-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 transition hover:text-stone-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-stone-700"
          >
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-11 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-dashboard-primary focus:bg-white focus:ring-2 focus:ring-dashboard-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 transition hover:text-stone-600"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
            {error.includes("expired") && (
              <>
                {" "}
                <Link
                  href={salonForgotPasswordPath(salon.slug)}
                  className="font-medium underline"
                >
                  Request a new link
                </Link>
              </>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-200/60 transition",
            "bg-gradient-to-r from-dashboard-primary to-dashboard-secondary hover:from-dashboard-primary-hover hover:to-dashboard-secondary",
            "disabled:cursor-not-allowed disabled:opacity-70"
          )}
        >
          {loading ? "Updating..." : "Update password"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </SalonAuthShell>
  );
}
