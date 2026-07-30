"use client";

import { cn } from "@/lib/utils";
import type { PreviewTab } from "../constants";

type DashboardMockupProps = {
  variant?: PreviewTab | "default";
  className?: string;
};

export function DashboardMockup({ variant = "default", className }: DashboardMockupProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg bg-slate-50 text-[10px] sm:text-xs", className)}>
      <div className="flex h-full min-h-[280px]">
        {/* Sidebar */}
        <div className="hidden w-16 shrink-0 border-r border-slate-200 bg-white sm:block md:w-20">
          <div className="flex h-10 items-center justify-center border-b border-slate-100">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-500 to-emerald-500" />
          </div>
          <div className="space-y-1 p-2">
            {["Dashboard", "Appts", "Billing", "Stock", "CRM"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "rounded-md px-2 py-1.5 text-[9px] font-medium",
                  (variant === "default" && i === 0) ||
                    (variant === "Dashboard" && i === 0) ||
                    (variant === "Appointment" && i === 1) ||
                    (variant === "Billing" && i === 2) ||
                    (variant === "Inventory" && i === 3) ||
                    (variant === "CRM" && i === 4)
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-400"
                )}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-3 sm:p-4">
          {variant === "default" || variant === "Dashboard" ? <DashboardView /> : null}
          {variant === "Appointment" ? <AppointmentView /> : null}
          {variant === "Billing" ? <BillingView /> : null}
          {variant === "Inventory" ? <InventoryView /> : null}
          {variant === "CRM" ? <CrmView /> : null}
          {variant === "Marketing" ? <MarketingView /> : null}
          {variant === "Analytics" ? <AnalyticsView /> : null}
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-800 sm:text-sm">Dashboard</div>
          <div className="text-[9px] text-slate-400">Today&apos;s overview</div>
        </div>
        <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
          Live
        </div>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Revenue", value: "₹48,250", color: "from-violet-500 to-purple-600" },
          { label: "Appointments", value: "24", color: "from-emerald-500 to-teal-600" },
          { label: "New Clients", value: "8", color: "from-blue-500 to-cyan-600" },
          { label: "Avg. Ticket", value: "₹2,010", color: "from-amber-500 to-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-100 bg-white p-2">
            <div className="text-[9px] text-slate-400">{stat.label}</div>
            <div className="mt-0.5 text-xs font-bold text-slate-800">{stat.value}</div>
            <div className={cn("mt-1 h-1 w-full rounded-full bg-gradient-to-r", stat.color)} />
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        <div className="rounded-lg border border-slate-100 bg-white p-2 sm:col-span-3">
          <div className="mb-2 text-[9px] font-medium text-slate-600">Revenue Trend</div>
          <div className="flex h-16 items-end gap-1">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-violet-500 to-emerald-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-2 sm:col-span-2">
          <div className="mb-2 text-[9px] font-medium text-slate-600">Top Services</div>
          {["Haircut", "Color", "Spa"].map((s, i) => (
            <div key={s} className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] text-slate-500">{s}</span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${90 - i * 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AppointmentView() {
  return (
    <>
      <div className="mb-3 text-xs font-semibold text-slate-800 sm:text-sm">Appointments</div>
      <div className="space-y-2">
        {[
          { time: "10:00", client: "Sarah M.", service: "Hair Color", staff: "Priya" },
          { time: "11:30", client: "James K.", service: "Haircut", staff: "Alex" },
          { time: "14:00", client: "Maria L.", service: "Spa Package", staff: "Neha" },
          { time: "15:30", client: "David R.", service: "Beard Trim", staff: "Alex" },
        ].map((appt) => (
          <div key={appt.time} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-2">
            <div className="w-10 shrink-0 text-[9px] font-bold text-violet-600">{appt.time}</div>
            <div className="flex-1">
              <div className="text-[10px] font-medium text-slate-700">{appt.client}</div>
              <div className="text-[9px] text-slate-400">{appt.service} · {appt.staff}</div>
            </div>
            <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] text-emerald-700">Confirmed</div>
          </div>
        ))}
      </div>
    </>
  );
}

function BillingView() {
  return (
    <>
      <div className="mb-3 text-xs font-semibold text-slate-800 sm:text-sm">Billing & Invoices</div>
      <div className="rounded-lg border border-slate-100 bg-white">
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 p-2 text-[9px] font-medium text-slate-400">
          <span>Invoice</span>
          <span>Client</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {[
          { id: "INV-1042", client: "Sarah M.", amount: "₹4,500", status: "Paid" },
          { id: "INV-1041", client: "James K.", amount: "₹1,200", status: "Paid" },
          { id: "INV-1040", client: "Maria L.", amount: "₹8,900", status: "Pending" },
        ].map((inv) => (
          <div key={inv.id} className="grid grid-cols-4 gap-2 border-b border-slate-50 p-2 text-[9px]">
            <span className="font-medium text-violet-600">{inv.id}</span>
            <span className="text-slate-600">{inv.client}</span>
            <span className="font-medium text-slate-800">{inv.amount}</span>
            <span className={inv.status === "Paid" ? "text-emerald-600" : "text-amber-600"}>{inv.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function InventoryView() {
  return (
    <>
      <div className="mb-3 text-xs font-semibold text-slate-800 sm:text-sm">Inventory</div>
      <div className="space-y-2">
        {[
          { name: "Shampoo Pro 500ml", stock: 45, status: "In Stock" },
          { name: "Hair Color #5N", stock: 8, status: "Low Stock" },
          { name: "Conditioner Luxe", stock: 32, status: "In Stock" },
          { name: "Styling Gel", stock: 3, status: "Critical" },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2">
            <div>
              <div className="text-[10px] font-medium text-slate-700">{item.name}</div>
              <div className="text-[9px] text-slate-400">{item.stock} units</div>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[8px] font-medium",
                item.status === "In Stock" && "bg-emerald-100 text-emerald-700",
                item.status === "Low Stock" && "bg-amber-100 text-amber-700",
                item.status === "Critical" && "bg-red-100 text-red-700"
              )}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function CrmView() {
  return (
    <>
      <div className="mb-3 text-xs font-semibold text-slate-800 sm:text-sm">CRM Segments</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { name: "VIP Clients", count: 128, color: "from-violet-500 to-purple-600" },
          { name: "At Risk", count: 34, color: "from-red-500 to-orange-600" },
          { name: "New This Month", count: 56, color: "from-emerald-500 to-teal-600" },
          { name: "Birthday Week", count: 12, color: "from-pink-500 to-rose-600" },
        ].map((seg) => (
          <div key={seg.name} className="rounded-lg border border-slate-100 bg-white p-2">
            <div className={cn("mb-2 h-1 w-8 rounded-full bg-gradient-to-r", seg.color)} />
            <div className="text-[10px] font-medium text-slate-700">{seg.name}</div>
            <div className="text-lg font-bold text-slate-900">{seg.count}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function MarketingView() {
  return (
    <>
      <div className="mb-3 text-xs font-semibold text-slate-800 sm:text-sm">Marketing Campaigns</div>
      <div className="space-y-2">
        {[
          { name: "Summer Glow Offer", channel: "WhatsApp", sent: 1250, open: "68%" },
          { name: "Birthday Special", channel: "SMS", sent: 340, open: "45%" },
          { name: "Re-engagement", channel: "Email", sent: 890, open: "32%" },
        ].map((camp) => (
          <div key={camp.name} className="rounded-lg border border-slate-100 bg-white p-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-medium text-slate-700">{camp.name}</div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[8px] text-green-700">{camp.channel}</span>
            </div>
            <div className="mt-1 flex gap-4 text-[9px] text-slate-400">
              <span>Sent: {camp.sent}</span>
              <span>Open: {camp.open}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AnalyticsView() {
  return (
    <>
      <div className="mb-3 text-xs font-semibold text-slate-800 sm:text-sm">Analytics</div>
      <div className="rounded-lg border border-slate-100 bg-white p-2">
        <div className="mb-2 text-[9px] font-medium text-slate-600">Monthly Performance</div>
        <div className="flex h-24 items-end gap-1.5">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => (
            <div key={m} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-violet-600 to-emerald-400"
                style={{ height: `${[55, 62, 58, 72, 68, 85][i]}%` }}
              />
              <span className="text-[8px] text-slate-400">{m}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          { label: "Growth", value: "+23%" },
          { label: "Retention", value: "87%" },
          { label: "NPS", value: "72" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-slate-100 bg-white p-2 text-center">
            <div className="text-[9px] text-slate-400">{m.label}</div>
            <div className="text-sm font-bold text-violet-600">{m.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}
