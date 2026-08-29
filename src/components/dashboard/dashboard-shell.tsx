"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, Plus, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecordSaleProvider, useRecordSale } from "@/components/dashboard/record-sale-provider";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { SalonLogoMark } from "@/components/salon/salon-logo-mark";
import { DashboardSessionKeepAlive } from "@/components/dashboard/dashboard-session-keepalive";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DashboardShellProps = {
  salonName: string;
  salonSlug?: string;
  salonLogoUrl?: string | null;
  userName: string;
  userRole: string;
  showSettings?: boolean;
  accessBlocked?: boolean;
  plan?: import("@/lib/plans").SalonPlan;
  permissionKeys?: import("@/lib/permissions/catalog").PermissionKey[];
  isOwner?: boolean;
  roleKey?: string | null;
  headerAlerts?: React.ReactNode;
  duePayments?: { totalDue: number; invoiceCount: number } | null;
  recordSaleFormData?: RecordSaleFormData | null;
  children: React.ReactNode;
};

type RecordSaleFormData = {
  services: import("@/components/billing/types").BillingService[];
  employees: import("@/components/billing/types").BillingEmployee[];
  seats: import("@/components/billing/types").BillingSeat[];
  isBasicPlan: boolean;
  salonName: string;
  gstEnabled: boolean;
  whatsappSettings: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
};

function DashboardShellInner({
  salonName,
  salonSlug,
  salonLogoUrl = null,
  userName,
  userRole,
  showSettings = false,
  accessBlocked = false,
  plan = "ENTERPRISE",
  permissionKeys = [],
  isOwner = false,
  roleKey = null,
  headerAlerts = null,
  duePayments = null,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const { openRecordSale } = useRecordSale();

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    } else if (
      window.matchMedia("(min-width: 1024px) and (max-width: 1279px)").matches
    ) {
      setCollapsed(true);
    }
    setSidebarReady(true);
  }, []);

  useEffect(() => {
    if (!sidebarReady) return;
    localStorage.setItem("dashboard-sidebar-collapsed", String(collapsed));
  }, [collapsed, sidebarReady]);

  useEffect(() => {
    if (!sidebarReady) return;
    const mq = window.matchMedia("(max-width: 1023px)");
    function onChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) setMobileOpen(false);
    }
    onChange(mq);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [sidebarReady]);

  const toggleMobileMenu = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  return (
    <>
      <DashboardSessionKeepAlive />
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
          "fixed inset-y-0 left-0 z-50 shrink-0 transition-[transform,width] duration-200 lg:relative lg:h-full lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          salonName={salonName}
          salonSlug={salonSlug}
          salonLogoUrl={salonLogoUrl}
          userName={userName}
          userRole={userRole}
          showSettings={showSettings}
          accessBlocked={accessBlocked}
          collapsed={collapsed}
          plan={plan}
          permissionKeys={permissionKeys}
          isOwner={isOwner}
          roleKey={roleKey}
          duePayments={duePayments}
          onNavigate={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      <div className="dashboard-main-panel flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-hidden">
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

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <SalonLogoMark
                logoUrl={salonLogoUrl}
                fallbackInitial={salonName}
                size="xs"
                variant="dark"
                alt={`${salonName} logo`}
              />
              <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-dashboard-text">{salonName}</p>
              <p className="truncate text-xs text-dashboard-muted">Salon Management</p>
              </div>
            </div>

            {!accessBlocked && (
              <Button
                type="button"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-2xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
                aria-label="Record sale"
                onClick={() => openRecordSale()}
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
          salonLogoUrl={salonLogoUrl}
          userRole={userRole}
          showSettings={showSettings}
          alertBadge={headerAlerts}
          accessBlocked={accessBlocked}
        />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full max-w-[1440px] p-[var(--page-gutter)] pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-[var(--page-gutter)]">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav
        onOpenMenu={() => setMobileOpen(true)}
        accessBlocked={accessBlocked}
        userRole={userRole}
        isOwner={isOwner}
        roleKey={roleKey}
      />
    </>
  );
}

export function DashboardShell({
  recordSaleFormData = null,
  headerAlerts = null,
  ...props
}: DashboardShellProps) {
  return (
    <RecordSaleProvider initialFormData={recordSaleFormData}>
      <div className="dashboard-shell flex h-dvh overflow-hidden font-[family-name:var(--font-inter)]">
        <DashboardShellInner {...props} headerAlerts={headerAlerts} />
      </div>
    </RecordSaleProvider>
  );
}
