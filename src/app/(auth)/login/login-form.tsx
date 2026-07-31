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
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { salonDashboardPath } from "@/lib/salon-paths";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  salonSlug: string;
  salonName: string;
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

export default function LoginForm({ salonSlug, salonName }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCallback = salonDashboardPath(salonSlug);
  const callbackUrl = searchParams.get("callbackUrl") || defaultCallback;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`salon-login-email-${salonSlug}`);
    if (saved) setEmail(saved);
  }, [salonSlug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (rememberMe && typeof window !== "undefined") {
      localStorage.setItem(`salon-login-email-${salonSlug}`, email);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem(`salon-login-email-${salonSlug}`);
    }

    const result = await signIn("credentials", {
      email,
      password: formData.get("password") as string,
      salonSlug,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "Configuration" || result.error === "DatabaseUnavailable"
          ? "Sign-in is temporarily unavailable. The server database is reconnecting — please try again in a minute."
          : "Invalid email or password for this salon"
      );
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session?.user?.isSuperAdmin) {
      router.push("/admin");
      router.refresh();
      return;
    }

    router.push(callbackUrl);
    router.refresh();
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
        <div className="absolute inset-0 bg-[#0f2419]/82" />
        <div className="salon-login-brand-curve absolute inset-y-0 -right-16 z-10 w-32 bg-[#0f2419]/82" />

        <div className="relative z-20 flex w-full flex-col justify-between p-10 xl:p-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8DC63F]/20 ring-1 ring-[#8DC63F]/40">
                <Leaf className="h-6 w-6 text-[#8DC63F]" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                  Salon AI
                </p>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
                  Salon ERP
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-[2.75rem] xl:leading-[1.15]">
                Run Your Salon.{" "}
                <span className="text-[#8DC63F]">Grow</span> Your Business.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-white/75 xl:text-[15px]">
                All-in-one ERP solution to manage appointments, staff, billing,
                inventory, customers and more.
              </p>
            </div>

            <ul className="mt-10 space-y-5">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8DC63F]/15 ring-1 ring-[#8DC63F]/25">
                    <Icon className="h-5 w-5 text-[#8DC63F]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-white/65">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8DC63F]" />
            Secure • Reliable • Built for Salons
          </div>
        </div>
      </aside>

      {/* Right login panel */}
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
        <div className="mb-8 flex w-full max-w-[440px] items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B3B2B] text-[#8DC63F]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[#1B3B2B]">Salon AI</p>
            <p className="text-xs text-stone-500">{salonName}</p>
          </div>
        </div>

        <div className="w-full max-w-[440px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8DC63F]/15">
              <ShieldCheck className="h-6 w-6 text-[#3d7a2a]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1B3B2B]">
              Welcome Back!
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Login to access your{" "}
              <span className="font-medium text-stone-700">{salonName}</span>{" "}
              account
            </p>
          </div>

          <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-[0_8px_40px_rgba(15,36,25,0.08)] sm:p-8">
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
                    className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8DC63F] focus:bg-white focus:ring-2 focus:ring-[#8DC63F]/20"
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
                    className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-11 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#8DC63F] focus:bg-white focus:ring-2 focus:ring-[#8DC63F]/20"
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
                    className="rounded border-stone-300 text-[#3d7a2a] focus:ring-[#8DC63F]"
                  />
                  <span className="text-sm text-stone-600">Remember me</span>
                </label>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-[#3d7a2a] transition hover:text-[#1B3B2B]"
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
                  "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-[#1B3B2B]/20 transition",
                  "bg-gradient-to-r from-[#1B3B2B] to-[#5a9e2e] hover:from-[#16301f] hover:to-[#4d8f28]",
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
            New to Salon AI?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#3d7a2a] transition hover:text-[#1B3B2B]"
            >
              Create your salon
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
