"use client";

import { cn } from "@/lib/utils";

type DashboardMockupProps = {
  variant?: "dashboard" | "appointment" | "billing" | "crm" | "inventory" | "marketing" | "reports" | "analytics";
  className?: string;
  compact?: boolean;
};

const sidebarItems = ["Dashboard", "Appointments", "Billing", "CRM", "Inventory", "Reports"];

export function DashboardMockup({ variant = "dashboard", className, compact }: DashboardMockupProps) {
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg bg-[#FDFCFA] font-sans text-[10px] text-[#1B1714] md:text-xs",
        compact ? "h-full min-h-[180px]" : "min-h-[320px] md:min-h-[400px]",
        className
      )}
    >
      {/* Sidebar */}
      <div className="hidden w-[22%] shrink-0 border-r border-gray-200 bg-white p-2 sm:block">
        <div className="mb-3 flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md bg-[#7C3AED]" />
          <span className="text-[9px] font-bold text-[#1B1714] md:text-[10px]">Glow Desk</span>
        </div>
        {sidebarItems.map((item, i) => (
          <div
            key={item}
            className={cn(
              "mb-1 rounded-md px-2 py-1",
              (variant === "dashboard" && i === 0) ||
                (variant === "appointment" && i === 1) ||
                (variant === "billing" && i === 2) ||
                (variant === "crm" && i === 3) ||
                (variant === "inventory" && i === 4) ||
                (variant === "reports" && i === 5)
                ? "bg-[#7C3AED]/10 font-semibold text-[#7C3AED]"
                : "text-[#1B1714]/45"
            )}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-2 md:p-3">
        {variant === "dashboard" && <DashboardView compact={compact} />}
        {variant === "appointment" && <AppointmentView />}
        {variant === "billing" && <BillingView />}
        {variant === "crm" && <CrmView />}
        {variant === "inventory" && <InventoryView />}
        {variant === "marketing" && <MarketingView />}
        {variant === "reports" && <ReportsView />}
        {variant === "analytics" && <AnalyticsView />}
      </div>
    </div>
  );
}

function DashboardView({ compact }: { compact?: boolean }) {
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">Dashboard</div>
      <div className={cn("mb-2 grid gap-1.5", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
        {[
          { label: "Revenue", val: "₹2.4L", color: "bg-[#7C3AED]" },
          { label: "Appointments", val: "48", color: "bg-[#2F6F5E]" },
          { label: "Clients", val: "1,284", color: "bg-[#C9A25D]" },
          { label: "Staff", val: "12", color: "bg-[#7C3AED]/60" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-white p-2 shadow-sm">
            <div className={cn("mb-1 h-1 w-6 rounded-full", s.color)} />
            <div className="text-[8px] text-gray-500 md:text-[9px]">{s.label}</div>
            <div className="text-[10px] font-bold text-gray-900 md:text-xs">{s.val}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-white p-2 shadow-sm">
        <div className="mb-2 text-[9px] font-semibold text-gray-700">Revenue Trend</div>
        <div className="flex h-12 items-end gap-1 md:h-16">
          {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 88, 100].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-[#2F6F5E] to-[#2F6F5E]/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function AppointmentView() {
  const slots = ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00"];
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">Appointments</div>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1">
        <div />
        <div className="text-center text-[8px] font-semibold text-[#7C3AED]">Priya</div>
        <div className="text-center text-[8px] font-semibold text-[#2F6F5E]">Raj</div>
        {slots.map((time, i) => (
          <div key={time} className="contents">
            <div className="py-1 text-[8px] text-gray-400">{time}</div>
            <div className="py-0.5">
              {i % 2 === 0 && (
                <div className="rounded bg-[#7C3AED]/10 px-1 py-1 text-[7px] text-[#7C3AED]">
                  Hair Color
                </div>
              )}
            </div>
            <div className="py-0.5">
              {i % 3 !== 0 && (
                <div className="rounded bg-[#2F6F5E]/10 px-1 py-1 text-[7px] text-[#2F6F5E]">
                  Haircut
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BillingView() {
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">POS Billing</div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1">
          {["Hair Color", "Deep Conditioning", "Blow Dry"].map((s, i) => (
            <div key={s} className="flex justify-between rounded bg-white px-2 py-1 shadow-sm">
              <span className="text-[8px]">{s}</span>
              <span className="text-[8px] font-semibold">₹{[3500, 800, 500][i]}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-1 font-bold">
            <span className="text-[9px]">Total</span>
            <span className="text-[9px] text-[#2F6F5E]">₹4,800</span>
          </div>
        </div>
        <div className="rounded-lg bg-[#7C3AED] p-2 text-center text-white">
          <div className="text-[8px] opacity-80">Pay Now</div>
          <div className="text-sm font-bold">₹4,800</div>
        </div>
      </div>
    </>
  );
}

function CrmView() {
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">CRM</div>
      {["Ananya K.", "Rohit S.", "Meera P."].map((name, i) => (
        <div key={name} className="mb-1 flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
          <div className="h-6 w-6 rounded-full bg-[#C9A25D]/30" />
          <div className="flex-1">
            <div className="text-[9px] font-semibold">{name}</div>
            <div className="text-[7px] text-gray-400">{[12, 8, 24][i]} visits · VIP</div>
          </div>
          <div className="rounded-full bg-[#2F6F5E]/10 px-2 py-0.5 text-[7px] text-[#2F6F5E]">
            Active
          </div>
        </div>
      ))}
    </>
  );
}

function InventoryView() {
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">Inventory</div>
      {[
        { name: "L'Oreal Color", stock: 24, status: "ok" },
        { name: "Keratin Serum", stock: 3, status: "low" },
        { name: "Shampoo 500ml", stock: 48, status: "ok" },
      ].map((item) => (
        <div key={item.name} className="mb-1 flex items-center justify-between rounded bg-white px-2 py-1.5 shadow-sm">
          <span className="text-[8px]">{item.name}</span>
          <span className={cn("text-[8px] font-semibold", item.status === "low" ? "text-[#7C3AED]" : "text-[#2F6F5E]")}>
            {item.stock} units
          </span>
        </div>
      ))}
    </>
  );
}

function MarketingView() {
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">Marketing</div>
      <div className="mb-2 rounded-lg bg-[#7C3AED] p-3 text-white">
        <div className="text-[9px] font-semibold">Summer Glow Campaign</div>
        <div className="text-[7px] opacity-80">Sent to 842 clients via WhatsApp</div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {["Open Rate 68%", "Bookings +24", "Revenue ₹1.2L"].map((m) => (
          <div key={m} className="rounded bg-white p-1.5 text-center shadow-sm">
            <div className="text-[7px] font-semibold text-gray-800">{m}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function ReportsView() {
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">Reports</div>
      <div className="space-y-1">
        {["Revenue Report — July", "Staff Commission", "Service Breakdown"].map((r) => (
          <div key={r} className="flex items-center justify-between rounded bg-white px-2 py-1.5 shadow-sm">
            <span className="text-[8px]">{r}</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[7px]">PDF</span>
          </div>
        ))}
      </div>
    </>
  );
}

function AnalyticsView() {
  return (
    <>
      <div className="mb-2 text-[11px] font-bold text-gray-900 md:text-sm">AI Analytics</div>
      <div className="mb-2 rounded-lg border border-[#2F6F5E]/20 bg-[#2F6F5E]/10 p-2">
        <div className="text-[8px] font-semibold text-[#2F6F5E]">AI Insight</div>
        <div className="text-[7px] text-[#1B1714]/70">
          Peak demand Saturday 2–6 PM. Add 2 stylists to capture ₹45K extra revenue.
        </div>
      </div>
      <div className="flex h-14 items-end gap-1 md:h-20">
        {[30, 50, 40, 80, 65, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-[#2F6F5E] to-[#2F6F5E]/60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </>
  );
}
