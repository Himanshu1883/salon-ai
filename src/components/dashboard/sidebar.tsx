"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  CreditCard,
  Building2,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  LogOut,
  HeadphonesIcon,
  Shield,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { signOut } from "next-auth/react";
import { signOutCallbackUrl } from "@/lib/salon-paths";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleLabel } from "@/lib/team";
import {
  getSidebarItems,
  prependEmployeeNavItems,
  isBasicPlan,
  isEmployeeNavUser,
  type NavItem,
  type SalonPlan,
} from "@/lib/plans";
import { canViewModule } from "@/lib/permissions/nav";
import { filterEmployeeNavModules } from "@/lib/permissions/data-scope-core";
import type { PermissionKey } from "@/lib/permissions/catalog";
import { SalonLogoMark } from "@/components/salon/salon-logo-mark";

type NavLink = NavItem;

type DuePaymentsSummary = {
  totalDue: number;
  invoiceCount: number;
};

function SidebarDuePayments({
  duePayments,
  collapsed,
  onNavigate,
}: {
  duePayments: DuePaymentsSummary;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const hasDue = duePayments.invoiceCount > 0 && duePayments.totalDue > 0;

  if (collapsed) {
    return (
      <Link
        href="/billing?status=unpaid"
        prefetch={false}
        onClick={onNavigate}
        title={
          hasDue
            ? `Due payments: ${formatCurrency(duePayments.totalDue)}`
            : "Due payments: all clear"
        }
        className={cn(
          "mx-auto flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
          hasDue
            ? "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30 hover:bg-amber-500/30"
            : "bg-white/5 text-violet-300/70 hover:bg-white/10 hover:text-white"
        )}
      >
        <Wallet className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/billing?status=unpaid"
      prefetch={false}
      onClick={onNavigate}
      className={cn(
        "block rounded-2xl border px-3 py-3 transition-colors",
        hasDue
          ? "border-amber-400/25 bg-gradient-to-br from-amber-500/15 to-orange-500/10 hover:from-amber-500/25 hover:to-orange-500/15"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-amber-200/80">
            Due payments
          </p>
          <p
            className={cn(
              "mt-1 truncate text-lg font-bold tabular-nums",
              hasDue ? "text-white" : "text-violet-100"
            )}
          >
            {formatCurrency(duePayments.totalDue)}
          </p>
          <p className="mt-0.5 text-xs text-violet-200/70">
            {hasDue
              ? `${duePayments.invoiceCount} unpaid invoice${duePayments.invoiceCount !== 1 ? "s" : ""}`
              : "All payments collected"}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            hasDue ? "bg-amber-500/20 text-amber-100" : "bg-white/10 text-violet-200"
          )}
        >
          <Wallet className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function isActive(pathname: string, href: string, label: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/clients") {
    return (
      pathname === "/clients" ||
      /^\/clients\/(?!segments|loyalty)[^/]+$/.test(pathname)
    );
  }
  if (href === "/team/members") {
    return (
      pathname === "/team/members" ||
      pathname.startsWith("/team/members/") ||
      pathname.startsWith("/employees")
    );
  }
  if (href === "/catalog/services") {
    return (
      pathname.startsWith("/catalog/services") ||
      pathname.startsWith("/services")
    );
  }
  if (href === "/inventory") {
    return pathname.startsWith("/inventory") || pathname.startsWith("/stock");
  }
  if (label === "Reports") {
    return pathname === "/reports" || pathname.startsWith("/reports/");
  }
  if (label === "Expenses") {
    return pathname.startsWith("/reports/finance");
  }
  if (label === "Analytics") {
    return pathname.startsWith("/reports/dashboards");
  }
  if (href === "/settings/billing" && label === "Settings") {
    return pathname.startsWith("/settings");
  }
  if (href === "/sales/appointments") {
    return (
      pathname.startsWith("/sales/appointments") ||
      pathname.startsWith("/appointments")
    );
  }
  if (href === "/check-in") {
    return pathname === "/check-in" || pathname.startsWith("/queue");
  }
  if (href === "/memberships") {
    return pathname.startsWith("/memberships") || pathname.startsWith("/sales/memberships");
  }
  if (href === "/attendance") {
    return pathname === "/attendance" || pathname.startsWith("/attendance/");
  }
  if (href === "/sales/appointments" && label === "Calendar") {
    return (
      pathname.startsWith("/sales/appointments") ||
      pathname.startsWith("/appointments")
    );
  }
  if (href === "/projects") {
    return pathname === "/projects" || pathname.startsWith("/projects/");
  }
  if (href === "/support") {
    return pathname === "/support" || pathname.startsWith("/support/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinkItem({
  item,
  pathname,
  collapsed,
  onNavigate,
  badge,
}: {
  item: NavLink;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  badge?: string;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href, item.label);

  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-violet-500/30 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] ring-1 ring-violet-400/30"
          : "text-violet-200/90 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-violet-100" : "text-violet-300/80 group-hover:text-violet-100"
        )}
      />
      {!collapsed && (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate">{item.label}</span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-semibold text-amber-100 ring-1 ring-amber-400/30">
              {badge}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}

function UserProfileFooter({
  userName,
  userRole,
  salonSlug,
  showSettings,
  collapsed,
  onNavigate,
  onToggleCollapse,
}: {
  userName: string;
  userRole: string;
  salonSlug?: string;
  showSettings?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  const roleLabel =
    userRole === "owner"
      ? "Owner"
      : getRoleLabel(userRole).replace("Workspace owner", "Owner");

  return (
    <div className="border-t border-white/10 p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-white/10",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-sm font-semibold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="truncate text-xs text-violet-300/80">{roleLabel}</p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-violet-300/70" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          {showSettings && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/settings/billing" onClick={onNavigate}>
                  <CreditCard className="h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/salon" onClick={onNavigate}>
                  <Building2 className="h-4 w-4" />
                  Salon profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() =>
              signOut({ callbackUrl: signOutCallbackUrl({ salonSlug }) })
            }
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium text-violet-300/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Collapse
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function Sidebar({
  salonName,
  salonSlug,
  salonLogoUrl = null,
  userName,
  userRole = "owner",
  showSettings = false,
  accessBlocked = false,
  collapsed = false,
  plan = "ENTERPRISE",
  permissionKeys = [],
  isOwner = false,
  roleKey = null,
  duePayments = null,
  onNavigate,
  onToggleCollapse,
}: {
  salonName: string;
  salonSlug?: string;
  salonLogoUrl?: string | null;
  userName: string;
  userRole?: string;
  showSettings?: boolean;
  accessBlocked?: boolean;
  collapsed?: boolean;
  plan?: SalonPlan;
  permissionKeys?: PermissionKey[];
  isOwner?: boolean;
  roleKey?: string | null;
  duePayments?: DuePaymentsSummary | null;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const permissionSet = new Set(permissionKeys);
  const canViewBilling = canViewModule(permissionSet, "billing", isOwner);
  const duePaymentsBadge =
    duePayments && duePayments.invoiceCount > 0
      ? String(duePayments.invoiceCount)
      : undefined;

  const planNavItems = getSidebarItems(plan);
  const employeeNav = isEmployeeNavUser(userRole, isOwner, roleKey);
  const baseNavItems = planNavItems.filter((item) =>
    canViewModule(permissionSet, item.module, isOwner)
  );
  const visibleNavItems: NavLink[] = accessBlocked
    ? [
        { href: "/invoice-due", label: "Invoice due", icon: CreditCard, module: "billing" },
        { href: "/support", label: "Customer Support", icon: HeadphonesIcon, module: "settings" },
      ]
    : employeeNav
      ? filterEmployeeNavModules(
          prependEmployeeNavItems(baseNavItems),
          permissionSet
        )
      : baseNavItems;

  const canManageRoles =
    isOwner ||
    permissionSet.has("roles.view") ||
    permissionSet.has("permissions.manage");

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-gradient-to-b from-indigo-950 via-violet-950 to-purple-950 text-white shadow-xl transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className={cn("border-b border-white/10 px-5 py-5", collapsed && "px-3")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <SalonLogoMark
            logoUrl={salonLogoUrl}
            fallbackInitial={salonName}
            size="md"
            alt={`${salonName} logo`}
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">{salonName}</p>
              <p className="flex items-center gap-1 text-xs text-violet-300/70">
                <Sparkles className="h-3 w-3" />
                Go Tix
              </p>
            </div>
          )}
        </div>
      </div>

      {!collapsed && !accessBlocked && !employeeNav && (
        <div className="space-y-1 border-b border-white/10 px-3 py-3">
          <Link
            href="/settings/salon"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-violet-200/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Building2 className="h-3.5 w-3.5" />
            Salon profile
          </Link>
          <Link
            href={isBasicPlan(plan) ? "/settings/subscription" : "/settings/billing"}
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-violet-200/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CreditCard className="h-3.5 w-3.5" />
            {isBasicPlan(plan) ? "Plan & billing" : "Subscription"}
          </Link>
        </div>
      )}

      {canViewBilling && duePayments && !accessBlocked && (
        <div className={cn("border-b border-white/10 px-3 py-3", collapsed && "px-2")}>
          <SidebarDuePayments
            duePayments={duePayments}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        </div>
      )}

      <nav className="scrollbar-dark flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavLinkItem
            key={`${item.href}-${item.label}`}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
            badge={item.label === "Billing" ? duePaymentsBadge : undefined}
          />
        ))}
        {canManageRoles && !accessBlocked && !employeeNav && (
          <>
            <NavLinkItem
              item={{
                href: "/team/access",
                label: "Team Access",
                icon: Shield,
                module: "staff",
              }}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
            <NavLinkItem
              item={{
                href: "/team/roles",
                label: "Roles & Permissions",
                icon: Shield,
                module: "staff",
              }}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </>
        )}
        {!accessBlocked &&
          (isOwner || permissionSet.has("support.view")) && (
          <NavLinkItem
            item={{
              href: "/support",
              label: "Customer Support",
              icon: HeadphonesIcon,
              module: "settings",
            }}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        )}
      </nav>

      <UserProfileFooter
        userName={userName}
        userRole={userRole}
        salonSlug={salonSlug}
        showSettings={showSettings}
        collapsed={collapsed}
        onNavigate={onNavigate}
        onToggleCollapse={onToggleCollapse}
      />
    </aside>
  );
}
