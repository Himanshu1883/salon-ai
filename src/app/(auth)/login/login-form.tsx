"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { salonDashboardPath, salonForgotPasswordPath, sanitizeSalonCallbackUrl } from "@/lib/salon-paths";
import {
  formatSalonAddress,
  formatSalonPhone,
  getSalonLogoUrl,
} from "@/lib/salon-logo";
import { cn } from "@/lib/utils";
import { getSignInErrorMessage } from "@/lib/sign-in-errors";

type SalonBranding = {
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  businessPhone: string | null;
  phone: string | null;
};

type LoginFormProps = {
  salon: SalonBranding;
};

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Smart Appointments",
    description: "Manage bookings, walk-ins & schedules",
  },
  {
    icon: Users,
    title: "Staff & Performance",
    description: "Track staff, attendance and productivity",
  },
  {
    icon: ShoppingBag,
    title: "Inventory Management",
    description: "Stock tracking, low alerts & purchase",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Business insights at your fingertips",
  },
] as const;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function SalonLogoMark({
  logoUrl,
  size = "md",
  variant = "light",
}: {
  logoUrl: string | null;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}) {
  const publicUrl = getSalonLogoUrl(logoUrl);
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  }[size];

  if (publicUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl ring-1",
          sizeClasses,
          variant === "light"
            ? "bg-white/10 ring-white/20"
            : "bg-stone-50 ring-stone-200"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publicUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const Icon = variant === "light" ? Leaf : Sparkles;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl ring-1",
        sizeClasses,
        variant === "light"
          ? "bg-dashboard-secondary/20 ring-dashboard-secondary/40"
          : "bg-dashboard-primary/15 ring-dashboard-primary/25"
      )}
    >
      <Icon
        className={cn(
          variant === "light"
            ? "text-dashboard-secondary"
            : "text-dashboard-primary",
          size === "lg" ? "h-7 w-7" : size === "md" ? "h-6 w-6" : "h-5 w-5"
        )}
      />
    </div>
  );
}

function SalonIdentity({ salon, compact = false }: { salon: SalonBranding; compact?: boolean }) {
  const address = formatSalonAddress(salon);
  const phone = formatSalonPhone(salon.businessPhone, salon.phone);

  return (
    <div className={cn("flex flex-col", compact ? "items-center text-center" : "items-start")}>
      <div
        className={cn(
          "flex gap-3.5",
          compact ? "flex-col items-center" : "items-center"
        )}
      >
        <SalonLogoMark
          logoUrl={salon.logoUrl}
          size={compact ? "md" : "lg"}
          variant="dark"
        />
        <div className={compact ? "text-center" : "min-w-0"}>
          <h2
            className={cn(
              "font-bold tracking-tight text-dashboard-text",
              compact ? "text-xl" : "text-2xl"
            )}
          >
            {salon.name}
          </h2>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            Team login
          </p>
        </div>
      </div>

      {(address || phone) && (
        <div
          className={cn(
            "mt-4 space-y-2 text-sm text-stone-600",
            compact ? "text-center" : "w-full"
          )}
        >
          {address && (
            <p
              className={cn(
                "flex gap-2 leading-relaxed",
                compact ? "justify-center" : "items-start"
              )}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-dashboard-secondary" />
              <span>{address}</span>
            </p>
          )}
          {phone && (
            <p
              className={cn(
                "flex gap-2",
                compact ? "justify-center" : "items-center"
              )}
            >
              <Phone className="h-4 w-4 shrink-0 text-dashboard-secondary" />
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="font-medium text-dashboard-primary transition hover:text-dashboard-primary-hover hover:underline"
              >
                {phone}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginForm({ salon }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeSalonCallbackUrl(
    searchParams.get("callbackUrl"),
    salon.slug
  );
  const resetSuccess = searchParams.get("reset") === "success";
  const emailUpdated = searchParams.get("email") === "updated";
  const accountDisabled = searchParams.get("error") === "account_disabled";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`salon-login-email-${salon.slug}`);
    if (saved) setEmail(saved);
  }, [salon.slug]);

  useEffect(() => {
    router.prefetch(callbackUrl);
    void fetch("/api/warm").catch(() => {});
  }, [router, callbackUrl]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const emailValue = (formData.get("email") as string).trim().toLowerCase();
    const passwordValue = (formData.get("password") as string).trim();

    if (!emailValue || !passwordValue) {
      setLoading(false);
      setError("Email and password are required");
      return;
    }

    if (rememberMe && typeof window !== "undefined") {
      localStorage.setItem(`salon-login-email-${salon.slug}`, emailValue);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem(`salon-login-email-${salon.slug}`);
    }

    let result;
    try {
      result = await signIn("credentials", {
        email: emailValue,
        password: passwordValue,
        salonSlug: salon.slug,
        redirect: false,
      });
    } catch {
      setLoading(false);
      setError(
        "Sign-in service is unavailable. Stop the dev server, run npm run dev again, then retry."
      );
      return;
    }

    if (!result) {
      setLoading(false);
      setError(
        "Sign-in service is unavailable. Stop the dev server, run npm run dev again, then retry."
      );
      return;
    }

    if (!result.ok || result.error) {
      setLoading(false);
      setError(
        getSignInErrorMessage(result, "Invalid email or password for this salon")
      );
      return;
    }

    window.location.assign(callbackUrl);
  }

  return (
    <div className="salon-login flex min-h-screen bg-white">
      {/* Left brand panel */}
      <aside className="salon-login-brand relative hidden min-h-screen overflow-hidden lg:flex lg:w-[46%] xl:w-[48%]">
        <Image
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="salon-login-brand-overlay absolute inset-0" />
        <div className="salon-login-brand-overlay salon-login-brand-curve absolute inset-y-0 -right-16 z-10 w-32" />

        <div className="relative z-20 flex w-full flex-col justify-between px-10 py-12 xl:px-14 xl:py-14">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dashboard-secondary/20 ring-1 ring-dashboard-secondary/40">
                <Leaf className="h-6 w-6 text-dashboard-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight tracking-tight text-white">
                  Go Tix
                </p>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
                  Salon ERP
                </p>
              </div>
            </div>

            <div className="mt-14 max-w-md xl:mt-16">
              <h1 className="text-[2rem] font-bold leading-[1.15] tracking-tight text-white xl:text-[2.75rem]">
                Run Your Salon.{" "}
                <span className="text-dashboard-secondary">Grow</span> Your Business.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/75 xl:mt-5 xl:text-[15px]">
                All-in-one ERP solution to manage appointments, staff, billing,
                inventory, customers and more.
              </p>
            </div>

            <ul className="mt-9 space-y-4 xl:mt-10 xl:space-y-5">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3.5 xl:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dashboard-primary/15 ring-1 ring-dashboard-primary/25 xl:h-11 xl:w-11">
                    <Icon className="h-5 w-5 text-dashboard-secondary" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-semibold leading-snug text-white">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/65">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-dashboard-secondary" />
            Secure • Reliable • Built for Salons
          </div>
        </div>
      </aside>

      {/* Right login panel */}
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
        <div className="mb-8 w-full max-w-[440px] lg:hidden">
          <SalonIdentity salon={salon} compact />
        </div>

        <div className="w-full max-w-[440px]">
          <div className="mb-8 hidden lg:block">
            <SalonIdentity salon={salon} />
          </div>

          <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-dashboard-card sm:p-8">
            <div className="mb-6 text-center lg:text-left">
              <h3 className="text-xl font-bold tracking-tight text-dashboard-text">
                Welcome back
              </h3>
              <p className="mt-1.5 text-sm text-stone-500">
                Sign in to your {salon.name} account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {resetSuccess && (
                <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Your password has been updated. Sign in with your new password.
                </p>
              )}
              {emailUpdated && (
                <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Your login email has been updated. Sign in with your new email address.
                </p>
              )}
              {accountDisabled && (
                <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Your account has been deactivated. Contact your salon owner if you need access again.
                </p>
              )}
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

              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="rounded border-stone-300 text-dashboard-primary focus:ring-dashboard-primary"
                  />
                  <span className="text-sm text-stone-600">Remember me</span>
                </label>
                <Link
                  href={salonForgotPasswordPath(salon.slug)}
                  className="text-sm font-medium text-dashboard-primary transition hover:text-dashboard-primary-hover"
                >
                  Forgot password?
                </Link>
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
                {loading ? "Signing in..." : "Login"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide">
                <span className="bg-white px-3 text-stone-400">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                title="Coming soon"
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-600 opacity-60"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-600 opacity-60"
              >
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-stone-500">
            New to Go Tix?{" "}
            <Link
              href="/signup"
              className="font-semibold text-dashboard-primary transition hover:text-dashboard-primary-hover"
            >
              Create your salon
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
