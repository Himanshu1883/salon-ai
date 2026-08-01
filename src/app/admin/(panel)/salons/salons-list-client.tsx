"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubscriptionStatusBadge } from "@/components/admin/subscription-status-badge";
import { SalonPlanBadge } from "@/components/admin/salon-plan-badge";
import { SalonLoginUrl } from "@/components/admin/salon-login-url";
import { SalonAccessActions } from "@/components/admin/salon-access-actions";
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import { updateSalonPlanAsAdmin } from "@/actions/plans";
import type {
  SalonPlanFilter,
  SalonStatusFilter,
} from "@/actions/platform-admin";
import type { getAdminStats } from "@/actions/platform-admin";
import { cn } from "@/lib/utils";

type SalonRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  phone: string | null;
  businessType: string | null;
  status: string;
  plan: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  ownerName: string;
  ownerEmail: string;
  seatsCount: number;
  staffCount: number;
};

type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

type ViewMode = "table" | "grid";

const STAT_SUMMARY: {
  key: keyof AdminStats;
  label: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  filter?: { status?: SalonStatusFilter; plan?: SalonPlanFilter };
}[] = [
  {
    key: "totalSalons",
    label: "Total",
    icon: Building2,
    accent: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    key: "onTrial",
    label: "Trial",
    icon: Sparkles,
    accent: "text-blue-600",
    iconBg: "bg-blue-100",
    filter: { status: "trial" },
  },
  {
    key: "activeMonthly",
    label: "Active",
    icon: CreditCard,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-100",
    filter: { status: "active" },
  },
  {
    key: "pastDueOrSuspended",
    label: "At risk",
    icon: AlertTriangle,
    accent: "text-amber-600",
    iconBg: "bg-amber-100",
    filter: { status: "past_due" },
  },
  {
    key: "enterprisePlan",
    label: "Enterprise",
    icon: Crown,
    accent: "text-violet-700",
    iconBg: "bg-violet-100",
    filter: { plan: "ENTERPRISE" },
  },
];

function SalonAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-dashboard-primary/15 to-dashboard-secondary/10 text-sm font-bold text-dashboard-primary ring-1 ring-dashboard-primary/10">
      {initials || "S"}
    </div>
  );
}

export function SalonsListClient({
  salons,
  total,
  page,
  totalPages,
  search,
  status,
  plan,
  stats,
}: {
  salons: SalonRow[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  status: SalonStatusFilter;
  plan: SalonPlanFilter;
  stats: AdminStats;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchInput, setSearchInput] = useState(search);

  const hasActiveFilters = status !== "all" || plan !== "all" || search.length > 0;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (!updates.page) {
        params.delete("page");
      }
      startTransition(() => {
        router.push(`/admin/salons?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function clearFilters() {
    setSearchInput("");
    startTransition(() => {
      router.push("/admin/salons");
    });
  }

  function applyStatFilter(filter?: {
    status?: SalonStatusFilter;
    plan?: SalonPlanFilter;
  }) {
    if (!filter) return;
    updateParams({
      status: filter.status && filter.status !== "all" ? filter.status : undefined,
      plan: filter.plan && filter.plan !== "all" ? filter.plan : undefined,
      search: undefined,
    });
    setSearchInput("");
  }

  const pageStart = total === 0 ? 0 : (page - 1) * 20 + 1;
  const pageEnd = Math.min(page * 20, total);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
            Salons
          </h1>
          <p className="mt-2 max-w-xl text-sm text-dashboard-muted">
            Manage all salon tenants — search, filter by plan or status, and jump into any account.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-dashboard-border bg-white px-4 py-2.5 text-sm shadow-sm">
          <Building2 className="h-4 w-4 text-dashboard-primary" />
          <span className="text-dashboard-muted">Showing</span>
          <span className="font-semibold tabular-nums text-dashboard-text">
            {pageStart}–{pageEnd}
          </span>
          <span className="text-dashboard-muted">of</span>
          <span className="font-semibold tabular-nums text-dashboard-text">{total}</span>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_SUMMARY.map(({ key, label, icon: Icon, accent, iconBg, filter }) => {
          const isActive =
            (filter?.status && status === filter.status) ||
            (filter?.plan && plan === filter.plan) ||
            (!filter && status === "all" && plan === "all" && !search);

          return (
            <button
              key={key}
              type="button"
              disabled={isPending}
              onClick={() => applyStatFilter(filter)}
              className={cn(
                "rounded-2xl border bg-white p-4 text-left transition-all",
                isActive
                  ? "border-dashboard-primary/40 shadow-md ring-1 ring-dashboard-primary/20"
                  : "border-dashboard-border hover:border-dashboard-primary/25 hover:shadow-sm"
              )}
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBg)}>
                <Icon className={cn("h-4 w-4", accent)} />
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
                {label}
              </p>
              <p className={cn("mt-0.5 text-2xl font-bold tabular-nums", accent)}>
                {stats[key]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & filters */}
      <AdminCard>
        <AdminCardContent className="space-y-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <form
              className="relative min-w-0 flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ search: searchInput.trim() || undefined });
              }}
            >
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted" />
              <Input
                name="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by salon name, owner email, or city..."
                className="h-11 rounded-xl border-dashboard-border bg-white pl-10 pr-10 shadow-sm focus-visible:ring-dashboard-primary/30"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: undefined });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-dashboard-muted hover:bg-slate-100 hover:text-dashboard-text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                value={status}
                onValueChange={(value) =>
                  updateParams({ status: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-dashboard-border bg-white sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past due</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={plan}
                onValueChange={(value) =>
                  updateParams({ plan: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-dashboard-border bg-white sm:w-44">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-xl border border-dashboard-border bg-slate-50 p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 rounded-lg px-3",
                    viewMode === "table" && "bg-white shadow-sm"
                  )}
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Table</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 rounded-lg px-3",
                    viewMode === "grid" && "bg-white shadow-sm"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Grid</span>
                </Button>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t border-dashboard-border/60 pt-3">
              <span className="text-xs font-medium text-dashboard-muted">Active filters:</span>
              {search && (
                <FilterChip label={`Search: "${search}"`} onRemove={() => {
                  setSearchInput("");
                  updateParams({ search: undefined });
                }} />
              )}
              {status !== "all" && (
                <FilterChip
                  label={`Status: ${status.replace(/_/g, " ")}`}
                  onRemove={() => updateParams({ status: undefined })}
                />
              )}
              {plan !== "all" && (
                <FilterChip
                  label={`Plan: ${plan === "BASIC" ? "Basic" : "Enterprise"}`}
                  onRemove={() => updateParams({ plan: undefined })}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg text-xs text-dashboard-muted"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </AdminCardContent>
      </AdminCard>

      {/* Results */}
      {salons.length === 0 ? (
        <AdminCard>
          <AdminCardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-slate-100">
                <Building2 className="h-10 w-10 text-violet-400" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-dashboard-border">
                <Search className="h-3.5 w-3.5 text-dashboard-muted" />
              </div>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-dashboard-text">No salons found</h3>
            <p className="mt-2 max-w-md text-sm text-dashboard-muted">
              {hasActiveFilters
                ? "No salons match your current search or filters. Try broadening your criteria."
                : "Salons will appear here once they sign up on the platform."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="mt-6 rounded-xl border-dashboard-border"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </AdminCardContent>
        </AdminCard>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {salons.map((salon) => (
            <SalonGridCard
              key={salon.id}
              salon={salon}
              isPending={isPending}
              onUpgrade={() => {
                startTransition(async () => {
                  await updateSalonPlanAsAdmin(salon.id, "ENTERPRISE");
                  router.refresh();
                });
              }}
            />
          ))}
        </div>
      ) : (
        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            title="All Salons"
            description={`${salons.length} result${salons.length !== 1 ? "s" : ""} on this page`}
            icon={Building2}
          />
          <AdminCardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border/60 bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="min-w-[220px] text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Salon
                    </TableHead>
                    <TableHead className="min-w-[160px] text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Owner
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Plan
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[180px] text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Login URL
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Signed up
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salons.map((salon) => (
                    <TableRow
                      key={salon.id}
                      className="group border-dashboard-border/40 transition-colors hover:bg-violet-50/30"
                    >
                      <TableCell>
                        <Link
                          href={`/admin/salons/${salon.id}`}
                          className="flex items-center gap-3"
                        >
                          <SalonAvatar name={salon.name} />
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-dashboard-text group-hover:text-dashboard-primary">
                              {salon.name}
                            </div>
                            {salon.city && (
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-dashboard-muted">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{salon.city}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-dashboard-text">
                          {salon.ownerName}
                        </div>
                        <div className="truncate text-xs text-dashboard-muted">
                          {salon.ownerEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SalonPlanBadge plan={salon.plan} />
                      </TableCell>
                      <TableCell>
                        <SubscriptionStatusBadge status={salon.status} />
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <SalonLoginUrl slug={salon.slug} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-dashboard-muted">
                        {format(new Date(salon.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2 opacity-100 transition-opacity sm:opacity-70 sm:group-hover:opacity-100">
                          <SalonAccessActions
                            salonId={salon.id}
                            salonSlug={salon.slug}
                            subscriptionStatus={salon.status}
                            ownerEmail={salon.ownerEmail}
                            ownerName={salon.ownerName}
                            compact
                          />
                          <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-dashboard-border text-xs"
                            asChild
                          >
                            <Link href={`/admin/salons/${salon.id}`}>
                              View
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                          {salon.plan !== "ENTERPRISE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              className="hidden rounded-lg text-xs text-violet-700 hover:bg-violet-50 lg:inline-flex"
                              onClick={() => {
                                startTransition(async () => {
                                  await updateSalonPlanAsAdmin(salon.id, "ENTERPRISE");
                                  router.refresh();
                                });
                              }}
                            >
                              <Crown className="mr-1 h-3 w-3" />
                              Upgrade
                            </Button>
                          )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AdminCardContent>
        </AdminCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashboard-border bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-dashboard-muted">
            Page{" "}
            <span className="font-semibold text-dashboard-text">{page}</span> of{" "}
            <span className="font-semibold text-dashboard-text">{totalPages}</span>
            <span className="hidden sm:inline">
              {" "}
              · {pageStart}–{pageEnd} of {total} salons
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              className="rounded-xl border-dashboard-border"
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <div className="hidden items-center gap-1 sm:flex">
              {getPageNumbers(page, totalPages).map((pageNum, index) =>
                pageNum === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-sm text-dashboard-muted">
                    …
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "ghost"}
                    size="sm"
                    disabled={isPending}
                    className={cn(
                      "h-8 w-8 rounded-lg p-0 text-xs",
                      pageNum === page &&
                        "bg-dashboard-primary hover:bg-dashboard-primary-hover"
                    )}
                    onClick={() => updateParams({ page: String(pageNum) })}
                  >
                    {pageNum}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              className="rounded-xl border-dashboard-border"
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashboard-border bg-slate-50 px-2.5 py-1 text-xs font-medium text-dashboard-text">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-dashboard-muted hover:bg-white hover:text-dashboard-text"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function SalonGridCard({
  salon,
  isPending,
  onUpgrade,
}: {
  salon: SalonRow;
  isPending: boolean;
  onUpgrade: () => void;
}) {
  return (
    <AdminCard className="group overflow-hidden transition-all hover:border-dashboard-primary/30 hover:shadow-lg">
      <AdminCardContent className="space-y-4 py-5">
        <div className="flex items-start gap-3">
          <SalonAvatar name={salon.name} />
          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/salons/${salon.id}`}
              className="block truncate text-base font-semibold text-dashboard-text group-hover:text-dashboard-primary"
            >
              {salon.name}
            </Link>
            {salon.city && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-dashboard-muted">
                <MapPin className="h-3 w-3" />
                {salon.city}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SalonPlanBadge plan={salon.plan} />
          <SubscriptionStatusBadge status={salon.status} />
        </div>

        <div className="space-y-2 rounded-xl border border-dashboard-border/60 bg-slate-50/50 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-dashboard-muted">
            <Users className="h-3.5 w-3.5" />
            <span className="truncate font-medium text-dashboard-text">{salon.ownerName}</span>
          </div>
          <p className="truncate pl-5 text-xs text-dashboard-muted">{salon.ownerEmail}</p>
        </div>

        <SalonLoginUrl slug={salon.slug} />

        <SalonAccessActions
          salonId={salon.id}
          salonSlug={salon.slug}
          subscriptionStatus={salon.status}
          ownerEmail={salon.ownerEmail}
          ownerName={salon.ownerName}
        />

        <div className="flex items-center justify-between border-t border-dashboard-border/60 pt-4">
          <span className="text-xs text-dashboard-muted">
            Joined {format(new Date(salon.createdAt), "MMM d, yyyy")}
          </span>
          <div className="flex gap-1.5">
            {salon.plan !== "ENTERPRISE" && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                className="h-8 rounded-lg text-xs text-violet-700 hover:bg-violet-50"
                onClick={onUpgrade}
              >
                <Crown className="mr-1 h-3 w-3" />
                Upgrade
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-dashboard-border text-xs"
              asChild
            >
              <Link href={`/admin/salons/${salon.id}`}>
                View
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
