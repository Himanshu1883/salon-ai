"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SalonAuthShell } from "@/components/auth/salon-auth-shell";
import { requestPasswordResetAction } from "@/actions/auth";
import { salonLoginPath } from "@/lib/salon-paths";
import type { SalonAuthBranding } from "@/lib/salon-auth-page";
import { cn } from "@/lib/utils";

type ForgotPasswordFormProps = {
  salon: SalonAuthBranding;
};

export default function ForgotPasswordForm({ salon }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const result = await requestPasswordResetAction({
      email,
      salonSlug: salon.slug,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(result.message ?? "Check your email for reset instructions.");
  }

  return (
    <SalonAuthShell
      salon={salon}
      title="Forgot password?"
      subtitle={`Enter your email and we'll send reset instructions for ${salon.name}`}
      backHref={salonLoginPath(salon.slug)}
      backLabel="Back to login"
    >
      {message ? (
        <div className="space-y-5">
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
            {message}
          </p>
          <Link
            href={salonLoginPath(salon.slug)}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-200/60 transition",
              "bg-gradient-to-r from-dashboard-primary to-dashboard-secondary hover:from-dashboard-primary-hover hover:to-dashboard-secondary"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Return to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-stone-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-dashboard-primary focus:bg-white focus:ring-2 focus:ring-dashboard-primary/20"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
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
            {loading ? "Sending..." : "Send reset instructions"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}
    </SalonAuthShell>
  );
}
