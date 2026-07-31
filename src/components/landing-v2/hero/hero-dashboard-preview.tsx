"use client";

import {
  Calendar,
  ChevronRight,
  LayoutDashboard,
  Package,
  Receipt,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Calendar, label: "Appointments" },
  { icon: Receipt, label: "Billing" },
  { icon: Users, label: "Clients" },
  { icon: Package, label: "Inventory" },
];

const KPIS = [
  { label: "Revenue", value: "₹2.4L", change: "+12%", accent: "border-t-[#7C3AED]" },
  { label: "Appointments", value: "48", change: "Today", accent: "border-t-[#2F6F5E]" },
  { label: "Clients", value: "1,284", change: "+18%", accent: "border-t-[#C9A25D]" },
  { label: "Staff active", value: "11/12", change: "On floor", accent: "border-t-[#7C3AED]/60" },
];

const APPOINTMENTS = [
  { time: "10:30", client: "Ananya K.", service: "Balayage", stylist: "Priya" },
  { time: "11:45", client: "Rohit S.", service: "Haircut", stylist: "Raj" },
  { time: "1:00", client: "Meera P.", service: "Bridal trial", stylist: "Sana" },
];

function RevenueChart() {
  const points =
    "M0,48 C20,42 35,38 55,32 S95,22 120,26 S160,34 180,20 S220,8 240,14 S270,24 300,6";
  const area = `${points} L300,56 L0,56 Z`;

  return (
    <svg viewBox="0 0 300 56" className="h-full w-full" aria-hidden preserveAspectRatio="none">
      <defs>
        <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2F6F5E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2F6F5E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#heroChartFill)" />
      <path d={points} fill="none" stroke="#2F6F5E" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HeroDashboardPreview() {
  return (
    <div className="flex min-h-[340px] bg-[#FDFCFA] text-[#1B1714] sm:min-h-[380px] md:min-h-[420px]">
      {/* Sidebar */}
      <aside className="hidden w-[72px] shrink-0 flex-col border-r border-[#1B1714]/[0.06] bg-[#F7F3EC]/80 px-2 py-4 sm:flex">
        <div className="mb-5 flex flex-col items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C3AED] text-[11px] font-bold text-[#F7F3EC]">
            S
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              title={label}
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-xl transition-colors",
                active
                  ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                  : "text-[#1B1714]/35 hover:bg-[#1B1714]/[0.04] hover:text-[#1B1714]/60"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 1.75} />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-5">
        {/* Top bar */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#1B1714]/45 sm:text-[11px]">
              Luxe Hair Studio
            </p>
            <h3 className="hero-editorial__headline mt-0.5 text-base font-semibold tracking-tight sm:text-lg">
              Good morning, Priya
            </h3>
          </div>
          <div className="rounded-full border border-[#1B1714]/10 bg-white px-2.5 py-1 text-[10px] font-medium text-[#1B1714]/60 sm:text-[11px]">
            Fri, 31 Jul
          </div>
        </div>

        {/* KPI row */}
        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-2.5">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className={cn(
                "rounded-xl border border-[#1B1714]/[0.07] bg-white px-2.5 py-2.5 sm:px-3 sm:py-3",
                "border-t-2 shadow-[0_2px_12px_-4px_rgba(27,23,20,0.08)]",
                kpi.accent
              )}
            >
              <p className="text-[9px] font-medium text-[#1B1714]/50 sm:text-[10px]">{kpi.label}</p>
              <p className="hero-editorial__headline mt-0.5 text-sm font-semibold tabular-nums sm:text-base">
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[9px] font-medium text-[#2F6F5E] sm:text-[10px]">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Chart + AI + schedule */}
        <div className="grid flex-1 gap-2.5 md:grid-cols-5 md:gap-3">
          <div className="rounded-xl border border-[#1B1714]/[0.07] bg-white p-3 shadow-[0_2px_12px_-4px_rgba(27,23,20,0.08)] md:col-span-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-[#1B1714] sm:text-[11px]">Revenue trend</p>
              <span className="text-[9px] font-medium text-[#2F6F5E]">+12% vs last week</span>
            </div>
            <div className="h-14 sm:h-16 md:h-[72px]">
              <RevenueChart />
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="rounded-xl border border-[#2F6F5E]/20 bg-[#2F6F5E]/[0.06] p-2.5 sm:p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2F6F5E]/15 text-[#2F6F5E]">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#2F6F5E] sm:text-[10px]">
                    AI insight
                  </p>
                  <p className="mt-0.5 text-[9px] leading-snug text-[#1B1714]/70 sm:text-[10px]">
                    Saturday 2–6 PM is peak. Add 1 stylist to capture ~₹45K more.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-[#1B1714]/[0.07] bg-white p-2.5 sm:p-3">
              <p className="mb-2 text-[10px] font-semibold text-[#1B1714] sm:text-[11px]">Up next</p>
              <ul className="space-y-1.5">
                {APPOINTMENTS.slice(0, 2).map((apt) => (
                  <li key={apt.time} className="flex items-center gap-2 text-[9px] sm:text-[10px]">
                    <span className="w-8 shrink-0 font-medium tabular-nums text-[#1B1714]/45">
                      {apt.time}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-[#1B1714]">
                      {apt.client}
                    </span>
                    <ChevronRight className="h-3 w-3 shrink-0 text-[#1B1714]/25" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
