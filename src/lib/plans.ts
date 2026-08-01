import type { LucideIcon } from "lucide-react";
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
  FolderKanban,
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
  | "settings"
  | "projects";

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
    monthly: 499,
    tagline: "Essentials for small salons",
  },
  ENTERPRISE: {
    monthly: 1499,
    tagline: "Full ERP for growing businesses",
  },
};

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
  "settings",
];

export const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/projects", label: "Projects", icon: FolderKanban, module: "projects" },
  { href: "/sales/appointments", label: "Appointments", icon: Calendar, module: "appointments" },
  { href: "/check-in", label: "Walk-ins", icon: UserCheck, module: "walk-in" },
  { href: "/clients", label: "Customers", icon: Contact, module: "customers" },
  { href: "/sales", label: "Sales", icon: TrendingUp, module: "sales" },
  { href: "/billing", label: "Billing", icon: Receipt, module: "billing" },
  { href: "/catalog/services", label: "Services", icon: Scissors, module: "services" },
  { href: "/inventory", label: "Inventory", icon: Package, module: "inventory" },
  { href: "/team/members", label: "Staff", icon: Users, module: "staff" },
  { href: "/sales/memberships", label: "Membership", icon: Crown, module: "membership" },
  { href: "/settings/notifications", label: "Marketing", icon: Megaphone, module: "marketing" },
  { href: "/reports", label: "Expenses", icon: Wallet, module: "expense" },
  { href: "/reports", label: "Reports", icon: BarChart3, module: "reports" },
  { href: "/reports/dashboards", label: "Analytics", icon: LineChart, module: "analytics" },
  { href: "/settings/billing", label: "Settings", icon: Settings, module: "settings" },
];

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

export function getModuleForPath(pathname: string): PlanModule | null {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "dashboard";
  if (matchPath(pathname, "/projects")) return "projects";
  if (
    matchPath(pathname, "/sales/appointments") ||
    matchPath(pathname, "/appointments")
  ) {
    return "appointments";
  }
  if (matchPath(pathname, "/check-in")) return "walk-in";
  if (matchPath(pathname, "/queue")) return "appointments";
  if (matchPath(pathname, "/clients") || matchPath(pathname, "/customers")) return "customers";
  if (matchPath(pathname, "/billing")) return "billing";
  if (matchPath(pathname, "/catalog/services") || matchPath(pathname, "/services")) {
    return "services";
  }
  if (matchPath(pathname, "/team/members") || matchPath(pathname, "/employees")) return "staff";
  if (matchPath(pathname, "/sales/memberships")) return "membership";
  if (matchPath(pathname, "/settings/notifications")) return "marketing";
  if (matchPath(pathname, "/reports/finance")) return "expense";
  if (matchPath(pathname, "/reports/dashboards")) return "analytics";
  if (matchPath(pathname, "/reports")) return "reports";
  if (matchPath(pathname, "/inventory") || matchPath(pathname, "/stock")) return "inventory";
  if (matchPath(pathname, "/sales")) return "sales";
  if (matchPath(pathname, "/settings")) return "settings";
  if (matchPath(pathname, "/schedule")) return "appointments";
  if (matchPath(pathname, "/seats")) return "staff";
  return null;
}

export function canAccessPath(plan: SalonPlan, pathname: string): boolean {
  if (pathname === "/invoice-due" || matchPath(pathname, "/invoice-due")) {
    return true;
  }

  const module = getModuleForPath(pathname);
  if (!module) return true;

  if (module === "settings" && plan === "BASIC") {
    return BASIC_SETTINGS_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
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
    reports: "Reports",
    sales: "Sales",
    inventory: "Inventory",
    membership: "Membership",
    marketing: "Marketing",
    expense: "Expenses",
    analytics: "Analytics",
    settings: "Settings",
    projects: "Projects",
  };
  return labels[module];
}
