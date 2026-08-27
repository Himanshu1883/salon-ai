import type { LucideIcon } from "lucide-react";
import { parseSalonPrefixedPath } from "@/lib/salon-paths";
import {
  LayoutDashboard,
  Users,
  Scissors,
  TrendingUp,
  Package,
  BarChart3,
  Megaphone,
  Settings,
  Contact,
  Calendar,
  Crown,
  CreditCard,
  UserCheck,
  Wallet,
  LineChart,
  Receipt,
  Clock,
  Sparkles,
  Timer,
  CalendarDays,
} from "lucide-react";

export type SalonPlan = "BASIC" | "ENTERPRISE";

export type PlanModule =
  | "dashboard"
  | "appointments"
  | "walk-in"
  | "customers"
  | "billing"
  | "services"
  | "staff"
  | "reports"
  | "sales"
  | "inventory"
  | "membership"
  | "marketing"
  | "expense"
  | "analytics"
  | "consultation"
  | "settings"
  | "projects"
  | "attendance";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  module: PlanModule;
};

export const PLAN_LABELS: Record<SalonPlan, string> = {
  BASIC: "Basic",
  ENTERPRISE: "Enterprise",
};

export const PLAN_PRICING: Record<SalonPlan, { monthly: number; tagline: string }> = {
  BASIC: {
    monthly: 600,
    tagline: "Essentials for small salons",
  },
  ENTERPRISE: {
    monthly: 1999,
    tagline: "Full ERP for growing businesses",
  },
};

export const SUBSCRIPTION_PLANS: SalonPlan[] = ["BASIC", "ENTERPRISE"];

export function getPlanMonthlyAmount(plan: SalonPlan): number {
  return PLAN_PRICING[plan].monthly;
}

export function getSubscriptionPlanName(plan: SalonPlan): string {
  return PLAN_LABELS[plan];
}

export const PLAN_FEATURES: Record<SalonPlan, string[]> = {
  BASIC: [
    "Dashboard & daily overview",
    "Appointments",
    "Customer management",
    "Simple billing (no staff assignment)",
    "Services & staff directory",
    "Inventory & stock management",
    "Basic reports",
  ],
  ENTERPRISE: [
    "Everything in Basic",
    "Walk-in check-in & live queue",
    "Memberships & packages",
    "AI Hair Consultation & virtual try-on",
    "Marketing & notifications",
    "Expense tracking",
    "Advanced analytics",
    "Sales pipeline & commissions",
    "Full settings & integrations",
  ],
};

const BASIC_MODULES: PlanModule[] = [
  "dashboard",
  "appointments",
  "customers",
  "billing",
  "services",
  "staff",
  "attendance",
  "inventory",
  "reports",
  "projects",
];

const ENTERPRISE_MODULES: PlanModule[] = [
  ...BASIC_MODULES,
  "walk-in",
  "sales",
  "membership",
  "marketing",
  "expense",
  "analytics",
  "consultation",
  "settings",
];

export const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  // Hidden from sidebar nav — /projects route remains accessible via direct URL
  // { href: "/projects", label: "Projects", icon: FolderKanban, module: "projects" },
  { href: "/sales/appointments", label: "Appointments", icon: Calendar, module: "appointments" },
  { href: "/check-in", label: "Walk-ins", icon: UserCheck, module: "walk-in" },
  { href: "/clients", label: "Customers", icon: Contact, module: "customers" },
  { href: "/sales", label: "Sales", icon: TrendingUp, module: "sales" },
  { href: "/billing", label: "Billing", icon: Receipt, module: "billing" },
  { href: "/catalog/services", label: "Services", icon: Scissors, module: "services" },
  { href: "/inventory", label: "Inventory", icon: Package, module: "inventory" },
  { href: "/team/members", label: "Staff", icon: Users, module: "staff" },
  { href: "/attendance", label: "Attendance", icon: Clock, module: "attendance" },
  { href: "/memberships", label: "Memberships", icon: Crown, module: "membership" },
  { href: "/settings/notifications", label: "Marketing", icon: Megaphone, module: "marketing" },
  { href: "/reports", label: "Expenses", icon: Wallet, module: "expense" },
  { href: "/reports", label: "Reports", icon: BarChart3, module: "reports" },
  { href: "/reports/dashboards", label: "Analytics", icon: LineChart, module: "analytics" },
  { href: "/hair-consultation", label: "AI Hair", icon: Sparkles, module: "consultation" },
  { href: "/settings/billing", label: "Settings", icon: Settings, module: "settings" },
];

/** Extra nav entries prepended for staff/employee accounts (does not replace existing nav). */
export const EMPLOYEE_NAV_EXTRAS: NavItem[] = [
  { href: "/attendance", label: "My Time", icon: Timer, module: "attendance" },
  { href: "/sales/appointments", label: "Calendar", icon: CalendarDays, module: "appointments" },
];

export function isEmployeeNavUser(
  userRole: string,
  isOwner: boolean,
  roleKey?: string | null
): boolean {
  if (isOwner) return false;
  if (roleKey === "EMPLOYEE") return true;
  return userRole === "employee" || userRole === "staff";
}

/** Prepend employee shortcuts without removing existing sidebar items. */
export function prependEmployeeNavItems(baseItems: NavItem[]): NavItem[] {
  const seen = new Set(baseItems.map((item) => `${item.href}::${item.label}`));
  const extras: NavItem[] = [];

  for (const item of EMPLOYEE_NAV_EXTRAS) {
    const key = `${item.href}::${item.label}`;
    if (!seen.has(key)) {
      extras.push(item);
      seen.add(key);
    }
  }

  // Attendance module link — only add if not already present under any label
  const hasAttendanceLink = baseItems.some((item) => item.href === "/attendance");
  if (!hasAttendanceLink) {
    extras.push({
      href: "/attendance",
      label: "Attendance",
      icon: UserCheck,
      module: "attendance",
    });
  }

  return [...extras, ...baseItems];
}

const BASIC_SETTINGS_PATHS = ["/settings/salon", "/settings/billing", "/settings/subscription"];

export function getPlanModules(plan: SalonPlan): PlanModule[] {
  return plan === "ENTERPRISE" ? ENTERPRISE_MODULES : BASIC_MODULES;
}

export function canAccessModule(plan: SalonPlan, module: PlanModule): boolean {
  return getPlanModules(plan).includes(module);
}

export function getSidebarItems(plan: SalonPlan): NavItem[] {
  const allowed = new Set(getPlanModules(plan));
  return ALL_NAV_ITEMS.filter((item) => allowed.has(item.module));
}

export function isBasicPlan(plan: SalonPlan): boolean {
  return plan === "BASIC";
}

export function isEnterprisePlan(plan: SalonPlan): boolean {
  return plan === "ENTERPRISE";
}

export function normalizeSalonPlan(plan: string | null | undefined): SalonPlan {
  return plan === "BASIC" ? "BASIC" : "ENTERPRISE";
}

function matchPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function normalizeAppPath(pathname: string): string {
  const salonPath = parseSalonPrefixedPath(pathname);
  return salonPath?.innerPath ?? pathname;
}

export function getModuleForPath(pathname: string): PlanModule | null {
  const path = normalizeAppPath(pathname);
  if (path === "/dashboard" || path.startsWith("/dashboard/")) return "dashboard";
  if (matchPath(path, "/projects")) return "projects";
  if (
    matchPath(path, "/sales/appointments") ||
    matchPath(path, "/appointments")
  ) {
    return "appointments";
  }
  if (matchPath(path, "/check-in")) return "walk-in";
  if (matchPath(path, "/queue")) return "appointments";
  if (matchPath(path, "/clients") || matchPath(path, "/customers")) return "customers";
  if (matchPath(path, "/billing")) return "billing";
  if (matchPath(path, "/catalog/services") || matchPath(path, "/services")) {
    return "services";
  }
  if (matchPath(path, "/team/members") || matchPath(path, "/employees")) return "staff";
  if (matchPath(path, "/attendance") || matchPath(path, "/team/attendance")) {
    return "attendance";
  }
  if (matchPath(path, "/memberships") || matchPath(path, "/sales/memberships")) return "membership";
  if (matchPath(path, "/settings/notifications")) return "marketing";
  if (matchPath(path, "/reports/finance")) return "expense";
  if (matchPath(path, "/reports/dashboards")) return "analytics";
  if (matchPath(path, "/reports")) return "reports";
  if (matchPath(path, "/inventory") || matchPath(path, "/stock")) return "inventory";
  if (matchPath(path, "/sales")) return "sales";
  if (matchPath(path, "/hair-consultation")) return "consultation";
  if (matchPath(path, "/settings")) return "settings";
  if (matchPath(path, "/schedule")) return "appointments";
  if (matchPath(path, "/seats")) return "staff";
  return null;
}

export function canAccessPath(plan: SalonPlan, pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  if (path === "/invoice-due" || matchPath(path, "/invoice-due")) {
    return true;
  }

  const module = getModuleForPath(pathname);
  if (!module) return true;

  if (module === "settings" && plan === "BASIC") {
    return BASIC_SETTINGS_PATHS.some(
      (settingsPath) => path === settingsPath || path.startsWith(`${settingsPath}/`)
    );
  }

  return canAccessModule(plan, module);
}

export function getRestrictedModuleLabel(module: PlanModule): string {
  const labels: Record<PlanModule, string> = {
    dashboard: "Dashboard",
    appointments: "Appointments",
    "walk-in": "Walk-ins",
    customers: "Customers",
    billing: "Billing",
    services: "Services",
    staff: "Staff",
    attendance: "Attendance",
    reports: "Reports",
    sales: "Sales",
    inventory: "Inventory",
    membership: "Membership",
    marketing: "Marketing",
    expense: "Expenses",
    analytics: "Analytics",
    consultation: "AI Hair Consultation",
    settings: "Settings",
    projects: "Projects",
  };
  return labels[module];
}
