"use client";

import { useCallback, useState } from "react";
import { Menu, Plus, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { HeaderDataLoader } from "@/components/dashboard/header-data-loader";
import { RecordSaleProvider, useRecordSale } from "@/components/dashboard/record-sale-provider";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DashboardShellProps = {
  salonName: string;
  salonSlug?: string;
  userName: string;
  userRole: string;
  showSettings?: boolean;
  accessBlocked?: boolean;
  plan?: import("@/lib/plans").SalonPlan;
  children: React.ReactNode;
};

function DashboardShellInner({
  salonName,
  salonSlug,
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
  const { openRecordSale } = useRecordSale();

  const handleHeaderData = useCallback(
    (data: { alertCount: number; showUpgrade: boolean }) => {
      setAlertCount(data.alertCount);
      setShowUpgrade(data.showUpgrade);
    },
    []
  );

  const toggleMobileMenu = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  return (
    <>
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
          "fixed inset-y-0 left-0 z-50 shrink-0 transition-transform duration-200 lg:relative lg:h-full lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          salonName={salonName}
          salonSlug={salonSlug}
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

      <div className="dashboard-main-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="sticky top-0 z-30 border-b border-dashboard-border bg-white/90 backdrop-blur-xl pt-safe lg:hidden">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-dashboard-border bg-white text-dashboard-primary shadow-sm"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-dashboard-text">{salonName}</p>
              <p className="truncate text-xs text-dashboard-muted">Salon Management</p>
            </div>

            {!accessBlocked && (
              <Button
                type="button"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-2xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
                aria-label="Record sale"
                onClick={openRecordSale}
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>

          {!accessBlocked && (
            <div className="px-3 pb-3">
              <DashboardSearch />
            </div>
          )}
        </div>

        <DashboardHeader
          userName={userName}
          salonName={salonName}
          salonSlug={salonSlug}
          userRole={userRole}
          showSettings={showSettings}
          alertCount={alertCount}
          accessBlocked={accessBlocked}
        />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto max-w-[1440px] p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:p-6 lg:p-8 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav
        onOpenMenu={() => setMobileOpen(true)}
        accessBlocked={accessBlocked}
      />
    </>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <RecordSaleProvider>
      <div className="dashboard-shell flex h-dvh overflow-hidden font-[family-name:var(--font-inter)]">
        <DashboardShellInner {...props} />
      </div>
    </RecordSaleProvider>
  );
}
