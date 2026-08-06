"use client";

import { CtaBanner } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { SectionBackdrop } from "@/components/site/SectionBackdrop";
import { ImageSlot } from "@/components/site/Sections";
import { ALL_MODULES, MODULE_GROUPS } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Cloud,
  CreditCard,
  FileText,
  Layers,
  Link2,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const bannerModern = "/gotix/banner-modern.jpg";
const dashboardImg = "/gotix/dashboard.png";
const appointmentImg = "/gotix/appoinment.png";
const billingImg = "/gotix/biling.png";
const customersImg = "/gotix/customers.png";
const inventoryImg = "/gotix/inventory.png";
const servicesImg = "/gotix/services.png";
const staffImg = "/gotix/staff.png";
const settingImg = "/gotix/setting.png";

const GROUP_ICONS: Record<string, typeof Layers> = {
  Operations: Layers,
  "Sales & Billing": CreditCard,
  "Client Management": Users,
  Inventory: Package,
  Catalog: ShoppingBag,
  Team: UserCog,
  Growth: TrendingUp,
  Finance: BarChart3,
  Admin: Settings,
};

const MODULE_ICONS: Record<string, typeof Layers> = {
  Dashboard: Layers,
  Appointments: Calendar,
  "Walk In": Users,
  Queue: Users,
  "Multi Branch": Layers,
  Billing: CreditCard,
  POS: Wallet,
  Customers: Users,
  CRM: MessageSquare,
  Inventory: Package,
  Services: ShoppingBag,
  Packages: ShoppingBag,
  Membership: Sparkles,
  Staff: UserCog,
  Attendance: Calendar,
  Payroll: Wallet,
  Marketing: TrendingUp,
  WhatsApp: MessageSquare,
  Expenses: FileText,
  Reports: FileText,
  Analytics: BarChart3,
  Settings: Settings,
};

const MODULE_IMAGES: Record<string, string> = {
  Dashboard: dashboardImg,
  Appointments: appointmentImg,
  "Walk In": appointmentImg,
  Queue: appointmentImg,
  "Multi Branch": dashboardImg,
  Billing: billingImg,
  POS: billingImg,
  Customers: customersImg,
  CRM: customersImg,
  Inventory: inventoryImg,
  Services: servicesImg,
  Packages: servicesImg,
  Membership: servicesImg,
  Staff: staffImg,
  Attendance: staffImg,
  Payroll: staffImg,
  Marketing: servicesImg,
  WhatsApp: servicesImg,
  Expenses: dashboardImg,
  Reports: servicesImg,
  Analytics: dashboardImg,
  Settings: settingImg,
};

const MODULE_HIGHLIGHTS: Record<string, string[]> = {
  Dashboard: ["Live revenue & footfall", "Branch comparison view", "Pin widgets by role"],
  Appointments: ["Drag-and-drop calendar", "Conflict detection", "SMS & WhatsApp reminders"],
  "Walk In": ["Instant check-in", "Queue assignment", "No appointment needed"],
  Queue: ["Live wait-time board", "Client notifications", "Stylist routing"],
  "Multi Branch": ["Centralized dashboard", "Per-branch reporting", "Shared inventory sync"],
  Billing: ["Split payments", "GST-ready invoices", "Discounts & offers"],
  POS: ["Touch-friendly checkout", "UPI, card & cash", "Receipts via WhatsApp"],
  Customers: ["Full visit history", "Preferences & notes", "Spend tracking"],
  CRM: ["Auto-segmentation", "Win-back campaigns", "Loyalty & rebooking"],
  Inventory: ["Low-stock alerts", "Usage per service", "Multi-branch sync"],
  Services: ["Duration & pricing rules", "Category management", "Staff assignments"],
  Packages: ["Bundled deals", "Session tracking", "Seasonal promos"],
  Membership: ["Recurring plans", "Member perks", "Auto-renewal billing"],
  Staff: ["Roles & permissions", "Schedule management", "Commission rules"],
  Attendance: ["Clock-in / clock-out", "Shift reports", "Overtime tracking"],
  Payroll: ["Automated salary calc", "Commission payouts", "Export-ready reports"],
  Marketing: ["SMS & email campaigns", "Birthday offers", "ROI tracking"],
  WhatsApp: ["Booking confirmations", "Two-way chat", "Bulk reminders"],
  Expenses: ["Vendor payments", "Margin tracking", "Category tagging"],
  Reports: ["P&L & staff reports", "Scheduled exports", "Custom date ranges"],
  Analytics: ["Peak-hour insights", "Retention trends", "AI-powered forecasts"],
  Settings: ["Branding & taxes", "Notification rules", "Third-party integrations"],
};

const FLOW_STEPS = [
  {
    icon: Calendar,
    title: "Book",
    desc: "Appointments, walk-ins, and queue — every client enters the system once.",
    modules: ["Appointments", "Walk In", "Queue"],
  },
  {
    icon: Wallet,
    title: "Bill",
    desc: "POS, packages, and memberships applied automatically at checkout.",
    modules: ["POS", "Billing", "Membership"],
  },
  {
    icon: Users,
    title: "Retain",
    desc: "CRM, WhatsApp, and marketing turn one visit into repeat business.",
    modules: ["CRM", "WhatsApp", "Marketing"],
  },
  {
    icon: BarChart3,
    title: "Grow",
    desc: "Analytics and reports show what's working — before the month ends.",
    modules: ["Analytics", "Reports", "Dashboard"],
  },
];

const QUICK_STATS = [
  { label: "Total modules", value: "22+", icon: Layers },
  { label: "Categories", value: "9", icon: Package },
  { label: "Integrations", value: "50+", icon: Cloud },
  { label: "Uptime", value: "99.9%", icon: Shield },
];

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

function ModulesPage() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MODULE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const matchesGroup = activeGroup === "all" || group.group === activeGroup;
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          group.group.toLowerCase().includes(q);
        return matchesGroup && matchesQuery;
      }),
    })).filter((group) => group.items.length > 0);
  }, [query, activeGroup]);

  const visibleCount = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[85svh] w-full flex-col overflow-hidden border-b border-border/60 pt-[4.5rem] sm:pt-[5rem]">
        <SectionBackdrop variant="features" image={bannerModern} fadeFrom="background" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Layers className="h-3.5 w-3.5 text-primary" />
                22+ modules · one platform
              </span>
              <h1 className="mt-6 max-w-2xl font-display text-4xl leading-[1.04] sm:text-5xl lg:text-[3.35rem]">
                Every part of your salon,{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  built to work together.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Stop juggling booking apps, spreadsheets, and billing tools. Gotix replaces them
                with 22 connected modules — from the front desk to payroll day.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-base btn-primary">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/platform" className="btn-base btn-outline bg-background/60 backdrop-blur-sm">
                  Platform tour
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl" aria-hidden />
              <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-2xl">
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-3 truncate rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">
                    app.gotix.in/modules
                  </span>
                </div>
                <img
                  src={dashboardImg}
                  alt="Gotix module dashboard preview"
                  className="aspect-[16/10] w-full object-cover object-top"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {MODULE_GROUPS.slice(0, 6).map((g) => {
                  const Icon = GROUP_ICONS[g.group] ?? Layers;
                  return (
                    <div
                      key={g.group}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-xs backdrop-blur-sm"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate font-medium">{g.group}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative w-full border-b border-border/60 bg-card/40 py-10">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {QUICK_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How modules connect */}
      <section className="relative w-full py-20 lg:py-24">
        <SectionBackdrop variant="mesh" fadeFrom="background" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Connected by design</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              One system, not nine separate apps.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Data flows automatically between modules — a booking updates inventory, triggers a
              reminder, and lands in your reports without re-entry.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <div className="relative h-full rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
                  {i < FLOW_STEPS.length - 1 && (
                    <Link2
                      className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary/40 lg:block"
                      aria-hidden
                    />
                  )}
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {step.modules.map((mod) => (
                      <span
                        key={mod}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Category overview bento */}
      <section className="relative w-full border-y border-border/60 bg-muted/20 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="max-w-xl">
            <p className="eyebrow">9 categories</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Browse by what you need.</h2>
            <p className="mt-3 text-muted-foreground">
              Jump straight to the area of your business you want to explore.
            </p>
          </Reveal>

          <Stagger className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODULE_GROUPS.map((group) => {
              const Icon = GROUP_ICONS[group.group] ?? Layers;
              return (
                <StaggerItem key={group.group}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGroup(group.group);
                      setQuery("");
                      document.getElementById("module-explorer")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="group flex w-full items-start gap-4 rounded-2xl border border-border/60 bg-background/80 p-5 text-left transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold">{group.group}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.items.length} module{group.items.length !== 1 ? "s" : ""} ·{" "}
                        {group.items.map((i) => i.title).slice(0, 2).join(", ")}
                        {group.items.length > 2 ? "…" : ""}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Module explorer */}
      <section id="module-explorer" className="relative isolate w-full scroll-mt-28 py-16 lg:py-24">
        <SectionBackdrop variant="grid" image={bannerModern} fadeFrom="card" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Module explorer</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">All 22 modules, explained.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Showing {visibleCount} of {ALL_MODULES.length} modules
                </p>
              </div>

              <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2.5 backdrop-blur-sm">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search modules…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Search modules"
                />
              </div>
            </div>
          </Reveal>

          {/* Filter pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveGroup("all")}
              aria-pressed={activeGroup === "all"}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition sm:text-sm",
                activeGroup === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              All modules
            </button>
            {MODULE_GROUPS.map((group) => (
              <button
                key={group.group}
                type="button"
                onClick={() => setActiveGroup(group.group)}
                aria-pressed={activeGroup === group.group}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition sm:text-sm",
                  activeGroup === group.group
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {group.group}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeGroup}-${query}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-12 space-y-16"
            >
              {filteredGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
                  <p className="font-display text-lg">No modules match your search.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveGroup("all");
                    }}
                    className="mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const GroupIcon = GROUP_ICONS[group.group] ?? Layers;
                  return (
                    <div key={group.group} id={slugify(group.group)}>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/15 text-primary">
                          <GroupIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl sm:text-2xl">{group.group}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.items.length} module{group.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="hidden flex-1 border-t border-border/40 sm:block" />
                      </div>

                      <Stagger className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {group.items.map((module, index) => {
                          const ModIcon = MODULE_ICONS[module.title] ?? Layers;
                          const highlights = MODULE_HIGHLIGHTS[module.title] ?? [];
                          return (
                            <StaggerItem key={module.title}>
                              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5">
                                <div className="relative overflow-hidden">
                                  <ImageSlot
                                    name={`module-${slugify(module.title)}.jpg`}
                                    alt={`${module.title} module preview`}
                                    src={MODULE_IMAGES[module.title]}
                                    ratio="aspect-[16/10]"
                                    className="rounded-none transition duration-700 group-hover:scale-[1.03]"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-60" />
                                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                                    {group.group}
                                  </span>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <ModIcon className="h-4 w-4" />
                                      </span>
                                      <h4 className="font-display text-lg font-semibold leading-tight">
                                        {module.title}
                                      </h4>
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                      {String(index + 1).padStart(2, "0")}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {module.desc}
                                  </p>

                                  {highlights.length > 0 && (
                                    <ul className="mt-4 space-y-2 border-t border-border/50 pt-4">
                                      {highlights.map((point) => (
                                        <li
                                          key={point}
                                          className="flex items-start gap-2 text-xs text-muted-foreground"
                                        >
                                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                          {point}
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  <Link
                                    href="/signup"
                                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-80 transition group-hover:opacity-100"
                                  >
                                    Try in free trial
                                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                                  </Link>
                                </div>
                              </article>
                            </StaggerItem>
                          );
                        })}
                      </Stagger>
                    </div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Why unified */}
      <section className="relative w-full border-t border-border/60 bg-card/30 py-20 lg:py-24">
        <SectionBackdrop variant="features" fadeFrom="card" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Why Gotix
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Built for salons, not adapted from generic ERP.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "All-in-one platform",
                desc: "No more switching between apps. Every module shares the same client, staff, and inventory data.",
              },
              {
                icon: Shield,
                title: "Enterprise security",
                desc: "Encrypted data, daily backups, and 99.9% uptime — your client records stay safe.",
              },
              {
                icon: Users,
                title: "Every role covered",
                desc: "Owners, managers, reception, and stylists each get the tools they actually use.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="surface-card lift h-full p-7 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/platform" className="btn-base btn-outline">
              Take the platform tour
            </Link>
            <Link href="/pricing" className="btn-base btn-primary">
              View pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBanner title="See all 22 modules in action — free for 14 days." />
    </>
  );
}

export default ModulesPage;
