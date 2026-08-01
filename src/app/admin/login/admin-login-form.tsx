"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  HeadphonesIcon,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  canAccessAdminRoute,
  defaultAdminHome,
  resolvePlatformRole,
} from "@/lib/platform-permissions";

const PLATFORM_FEATURES = [
  {
    icon: Building2,
    title: "Tenant Management",
    description: "Onboard salons, plans, and workspace access",
  },
  {
    icon: HeadphonesIcon,
    title: "Support Center",
    description: "Handle customer conversations in one place",
  },
  {
    icon: BarChart3,
    title: "Platform Analytics",
    description: "Monitor growth, usage, and health metrics",
  },
  {
    icon: ShieldCheck,
    title: "Security Controls",
    description: "Role-based access for authorized staff only",
  },
] as const;

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "Configuration" || result.error === "DatabaseUnavailable"
          ? "Sign-in is temporarily unavailable. The server database is reconnecting — please try again in a minute."
          : "Invalid email or password"
      );
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    const platformRole = resolvePlatformRole(session?.user ?? {});

    if (!platformRole) {
      setError("This account is not authorized for platform admin access");
      await fetch("/api/auth/signout", { method: "POST" });
      return;
    }

    const destination =
      platformRole === "CUSTOMER_SUPPORT" &&
      !canAccessAdminRoute(callbackUrl, platformRole)
        ? defaultAdminHome(platformRole)
        : callbackUrl;

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="admin-login flex min-h-screen bg-white">
      {/* Left brand panel — platform admin identity */}
      <aside className="admin-login-brand relative hidden min-h-screen overflow-hidden lg:flex lg:w-[46%] xl:w-[48%]">
        <div className="admin-login-brand-bg absolute inset-0" />
        <div className="admin-login-brand-grid absolute inset-0 opacity-[0.35]" />
        <div className="admin-login-brand-glow absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="admin-login-brand-glow absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="admin-login-brand-curve absolute inset-y-0 -right-16 z-10 w-32 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950" />

        <div className="relative z-20 flex w-full flex-col justify-between px-10 py-12 xl:px-14 xl:py-14">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-dashboard-primary to-dashboard-secondary shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight tracking-tight text-white">
                  Glow Desk
                </p>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-300/70">
                  Platform Admin
                </p>
              </div>
            </div>

            <div className="mt-14 max-w-md xl:mt-16">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                Internal portal
              </p>
              <h1 className="mt-5 text-[2rem] font-bold leading-[1.15] tracking-tight text-white xl:text-[2.75rem]">
                Manage the{" "}
                <span className="bg-gradient-to-r from-violet-300 to-indigo-200 bg-clip-text text-transparent">
                  platform
                </span>
                , securely.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-400 xl:mt-5 xl:text-[15px]">
                Sign in to oversee tenant salons, support queues, billing plans,
                and platform-wide operations.
              </p>
            </div>

            <ul className="mt-9 space-y-4 xl:mt-10 xl:space-y-5">
              {PLATFORM_FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3.5 xl:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 xl:h-11 xl:w-11">
                    <Icon className="h-5 w-5 text-violet-300" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-semibold leading-snug text-white">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-violet-300" />
            Authorized personnel only
          </div>
        </div>
      </aside>

      {/* Right login panel */}
      <main className="admin-login-main flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
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

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="admin@salon.ai"
                    autoComplete="username"
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
      </main>
    </div>
  );
}
