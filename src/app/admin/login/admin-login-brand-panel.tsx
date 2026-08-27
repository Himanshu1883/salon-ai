import {
  BarChart3,
  Building2,
  HeadphonesIcon,
  Shield,
  ShieldCheck,
} from "lucide-react";

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

export function AdminLoginBrandPanel() {
  return (
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
  );
}
