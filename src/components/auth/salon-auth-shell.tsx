import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  formatSalonAddress,
  formatSalonPhone,
  getSalonLogoUrl,
} from "@/lib/salon-logo";
import { cn } from "@/lib/utils";
import type { SalonAuthBranding } from "@/lib/salon-auth-page";

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

function SalonLogoMark({
  logoUrl,
  size = "md",
  variant = "dark",
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
        <img src={publicUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

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
      <Leaf
        className={cn(
          variant === "light" ? "text-dashboard-secondary" : "text-dashboard-primary",
          size === "lg" ? "h-7 w-7" : size === "md" ? "h-6 w-6" : "h-5 w-5"
        )}
      />
    </div>
  );
}

export function SalonAuthIdentity({
  salon,
  compact = false,
}: {
  salon: SalonAuthBranding;
  compact?: boolean;
}) {
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
          {address && <p className="leading-relaxed">{address}</p>}
          {phone && (
            <p>
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

type SalonAuthShellProps = {
  salon: SalonAuthBranding;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
};

export function SalonAuthShell({
  salon,
  title,
  subtitle,
  backHref,
  backLabel = "Back to login",
  children,
}: SalonAuthShellProps) {
  return (
    <div className="salon-login flex min-h-screen bg-white">
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
              {FEATURES.map(({ icon: Icon, title: featureTitle, description }) => (
                <li key={featureTitle} className="flex items-start gap-3.5 xl:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dashboard-primary/15 ring-1 ring-dashboard-primary/25 xl:h-11 xl:w-11">
                    <Icon className="h-5 w-5 text-dashboard-secondary" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-semibold leading-snug text-white">{featureTitle}</p>
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

      <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
        <div className="mb-8 w-full max-w-[440px] lg:hidden">
          <SalonAuthIdentity salon={salon} compact />
        </div>

        <div className="w-full max-w-[440px]">
          <div className="mb-8 hidden lg:block">
            <SalonAuthIdentity salon={salon} />
          </div>

          <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-dashboard-card sm:p-8">
            <div className="mb-6 text-center lg:text-left">
              <h3 className="text-xl font-bold tracking-tight text-dashboard-text">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>
            </div>

            {children}
          </div>

          {backHref && (
            <p className="mt-8 text-center text-sm text-stone-500">
              <Link
                href={backHref}
                className="font-semibold text-dashboard-primary transition hover:text-dashboard-primary-hover"
              >
                {backLabel}
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
