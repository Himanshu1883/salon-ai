"use client";

import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  canAccessAdminRoute,
  defaultAdminHome,
  resolvePlatformRole,
} from "@/lib/platform-permissions";
import { getSignInErrorMessage } from "@/lib/sign-in-errors";

export function AdminLoginFormFields() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setLoading(false);
      setError("Email and password are required");
      return;
    }

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password: normalizedPassword,
      callbackUrl,
      redirect: false,
    });

    if (!result) {
      setLoading(false);
      setError(
        "Sign-in is temporarily unavailable. Check that AUTH_SECRET is set in .env and restart the dev server."
      );
      return;
    }

    if (!result.ok || result.error) {
      setLoading(false);
      setError(getSignInErrorMessage(result));
      return;
    }

    const session = await getSession();
    const platformRole = resolvePlatformRole(session?.user ?? {});

    if (!platformRole) {
      setLoading(false);
      setError("This account is not authorized for platform admin access");
      await signOut({ redirect: false });
      return;
    }

    const destination =
      platformRole === "CUSTOMER_SUPPORT" &&
      !canAccessAdminRoute(callbackUrl, platformRole)
        ? defaultAdminHome(platformRole)
        : callbackUrl;

    window.location.assign(destination);
  }

  return (
    <>
      <div className="mb-8 w-full max-w-[440px] lg:hidden">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-dashboard-primary to-dashboard-secondary shadow-lg shadow-violet-200/60">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-dashboard-text">
            Glow Desk
          </h2>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            Platform Admin
          </p>
        </div>
      </div>

      <div className="w-full max-w-[440px]">
        <div className="mb-8 hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dashboard-primary">
            Platform Admin
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-dashboard-text">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-stone-500">
            Sign in to manage Glow Desk tenants and operations
          </p>
        </div>

        <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-dashboard-card sm:p-8">
          <div className="mb-6 text-center lg:hidden">
            <h3 className="text-xl font-bold tracking-tight text-dashboard-text">
              Welcome back
            </h3>
            <p className="mt-1.5 text-sm text-stone-500">
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                Email address
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
                  placeholder="admin@salon.ai"
                  autoComplete="off"
                  className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-dashboard-primary focus:bg-white focus:ring-2 focus:ring-dashboard-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
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

            {process.env.NODE_ENV === "development" && (
              <p className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-800">
                Local dev credentials:{" "}
                <span className="font-mono">admin@salon.ai</span> /{" "}
                <span className="font-mono">admin1234</span>
              </p>
            )}

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
              {loading ? "Signing in..." : "Sign in to Admin"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-stone-400">
          Protected area. All access is logged and monitored.
        </p>
      </div>
    </>
  );
}
