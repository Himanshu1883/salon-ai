"use client";

import { useCallback, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { HeaderDataLoader } from "@/components/dashboard/header-data-loader";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  salonName: string;
  userName: string;
  userRole: string;
  showSettings?: boolean;
  accessBlocked?: boolean;
  plan?: import("@/lib/plans").SalonPlan;
  children: React.ReactNode;
};

export function DashboardShell({
  salonName,
  userName,
  userRole,
  showSettings = false,
  accessBlocked = false,
  plan = "ENTERPRISE",
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleHeaderData = useCallback(
    (data: { alertCount: number; showUpgrade: boolean }) => {
      setAlertCount(data.alertCount);
      setShowUpgrade(data.showUpgrade);
    },
    []
  );

  return (
    <div className="flex min-h-screen bg-dashboard-bg font-[family-name:var(--font-inter)]">
      <HeaderDataLoader onData={handleHeaderData} />
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          salonName={salonName}
          userName={userName}
          userRole={userRole}
          showSettings={showSettings}
          accessBlocked={accessBlocked}
          showUpgrade={showUpgrade || plan === "BASIC"}
          collapsed={collapsed}
          plan={plan}
          onNavigate={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-dashboard-border bg-dashboard-card/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-dashboard-border bg-white text-dashboard-text shadow-sm"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-dashboard-text">{salonName}</p>
            <p className="truncate text-xs text-dashboard-muted">Salon Management</p>
          </div>
        </div>

        <DashboardHeader
          userName={userName}
          salonName={salonName}
          userRole={userRole}
          showSettings={showSettings}
          alertCount={alertCount}
          accessBlocked={accessBlocked}
        />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
