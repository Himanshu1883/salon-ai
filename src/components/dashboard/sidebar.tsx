"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  ChevronDown,
  CreditCard,
  Building2,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  LogOut,
  HeadphonesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { signOutCallbackUrl } from "@/lib/salon-paths";
import { Button } from "@/components/ui/button";
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
  isBasicPlan,
  type NavItem,
  type SalonPlan,
} from "@/lib/plans";

type NavLink = NavItem;

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
  if (href === "/sales/memberships") {
    return pathname.startsWith("/sales/memberships");
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
}: {
  item: NavLink;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href, item.label);

  return (
    <Link
      href={item.href}
      prefetch
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
      {!collapsed && item.label}
    </Link>
  );
}

function PremiumPlanCard({
  showUpgrade,
  collapsed,
}: {
  showUpgrade?: boolean;
  collapsed?: boolean;
}) {
  if (!showUpgrade || collapsed) return null;

  return (
    <div className="mx-3 mb-3 rounded-[20px] border border-violet-400/25 bg-violet-900/60 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-800/80 text-amber-400">
          <Crown className="h-4 w-4 fill-amber-400/20" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Upgrade Plan</p>
          <p className="mt-1 text-xs leading-relaxed text-violet-200/75">
            Unlock advanced features and grow your salon.
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        className="mt-3 h-9 w-full rounded-2xl bg-white text-xs font-semibold text-violet-900 hover:bg-violet-50"
      >
        <Link href="/settings/subscription">Upgrade Now</Link>
      </Button>
    </div>
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
  userName,
  userRole = "owner",
  showSettings = false,
  accessBlocked = false,
  showUpgrade = false,
  collapsed = false,
  plan = "ENTERPRISE",
  onNavigate,
  onToggleCollapse,
}: {
  salonName: string;
  salonSlug?: string;
  userName: string;
  userRole?: string;
  showSettings?: boolean;
  accessBlocked?: boolean;
  showUpgrade?: boolean;
  collapsed?: boolean;
  plan?: SalonPlan;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const salonInitial = salonName.charAt(0).toUpperCase() || "S";

  const visibleNavItems: NavLink[] = accessBlocked
    ? [
        { href: "/invoice-due", label: "Invoice due", icon: CreditCard, module: "billing" },
        { href: "/support", label: "Customer Support", icon: HeadphonesIcon, module: "settings" },
      ]
    : getSidebarItems(plan);

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-gradient-to-b from-indigo-950 via-violet-950 to-purple-950 text-white shadow-xl transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className={cn("border-b border-white/10 px-5 py-5", collapsed && "px-3")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-lg font-bold text-white shadow-lg shadow-violet-900/40">
            {salonInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">{salonName}</p>
              <p className="flex items-center gap-1 text-xs text-violet-300/70">
                <Sparkles className="h-3 w-3" />
                Salon AI
              </p>
            </div>
          )}
        </div>
      </div>

      {!collapsed && !accessBlocked && (
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavLinkItem
            key={`${item.href}-${item.label}`}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
        {!accessBlocked && (
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

      {!accessBlocked && (
        <PremiumPlanCard showUpgrade={showUpgrade} collapsed={collapsed} />
      )}

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
