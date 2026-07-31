"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { format } from "date-fns";
import { Building2, ChevronLeft, ChevronRight, Crown, Search } from "lucide-react";
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
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import { updateSalonPlanAsAdmin } from "@/actions/plans";
import type { SalonStatusFilter } from "@/actions/platform-admin";

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

export function SalonsListClient({
  salons,
  total,
  page,
  totalPages,
  search,
  status,
}: {
  salons: SalonRow[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  status: SalonStatusFilter;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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

  function formatBillingDate(salon: SalonRow) {
    if (salon.status === "trial" && salon.trialEndsAt) {
      return `Trial ends ${format(new Date(salon.trialEndsAt), "MMM d, yyyy")}`;
    }
    if (salon.currentPeriodEnd) {
      return `Next billing ${format(new Date(salon.currentPeriodEnd), "MMM d, yyyy")}`;
    }
    return "—";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
          Salons
        </h1>
        <p className="mt-2 text-sm text-dashboard-muted">
          {total} salon{total !== 1 ? "s" : ""} registered on the platform
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            updateParams({ search: (formData.get("search") as string) || undefined });
          }}
        >
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, or city..."
            className="h-11 rounded-xl border-dashboard-border bg-white pl-10 shadow-sm focus-visible:ring-dashboard-primary/30"
          />
        </form>
        <Select
          value={status}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-xl border-dashboard-border bg-white sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="active">Active (Monthly)</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminCard className="overflow-hidden">
        <AdminCardHeader
          title="All Salons"
          description={`Showing ${salons.length} of ${total}`}
          icon={Building2}
        />
        <AdminCardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border/60 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Salon
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Login URL
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Owner
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    ERP Plan
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Billing
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Signed up
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Seats / Staff
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <Building2 className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-dashboard-text">
                          No salons found
                        </p>
                        <p className="mt-1 text-sm text-dashboard-muted">
                          Try adjusting your search or filter criteria.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  salons.map((salon) => (
                    <TableRow key={salon.id} className="border-dashboard-border/40">
                      <TableCell>
                        <div className="font-semibold text-dashboard-text">{salon.name}</div>
                        {salon.city && (
                          <div className="text-xs text-dashboard-muted">{salon.city}</div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <SalonLoginUrl slug={salon.slug} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-dashboard-text">
                          {salon.ownerName}
                        </div>
                        <div className="text-xs text-dashboard-muted">{salon.ownerEmail}</div>
                      </TableCell>
                      <TableCell className="text-sm text-dashboard-muted">
                        {salon.phone ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm capitalize text-dashboard-muted">
                        {salon.businessType?.replace(/_/g, " ") ?? "—"}
                      </TableCell>
                      <TableCell>
                        <SalonPlanBadge plan={salon.plan} />
                      </TableCell>
                      <TableCell>
                        <SubscriptionStatusBadge status={salon.status} />
                      </TableCell>
                      <TableCell className="text-sm text-dashboard-muted">
                        {formatBillingDate(salon)}
                      </TableCell>
                      <TableCell className="text-sm text-dashboard-muted">
                        {format(new Date(salon.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-dashboard-muted">
                        {salon.seatsCount} / {salon.staffCount}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-dashboard-border text-xs"
                            asChild
                          >
                            <Link href={`/admin/salons/${salon.id}`}>View</Link>
                          </Button>
                          {salon.plan !== "ENTERPRISE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              className="rounded-lg border-violet-200 text-xs text-violet-700 hover:bg-violet-50"
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
                          {salon.plan !== "BASIC" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              className="rounded-lg text-xs text-dashboard-muted"
                              onClick={() => {
                                startTransition(async () => {
                                  await updateSalonPlanAsAdmin(salon.id, "BASIC");
                                  router.refresh();
                                });
                              }}
                            >
                              Downgrade
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </AdminCardContent>
      </AdminCard>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-dashboard-border bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-dashboard-muted">
            Page <span className="font-semibold text-dashboard-text">{page}</span> of{" "}
            <span className="font-semibold text-dashboard-text">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              className="rounded-lg border-dashboard-border"
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              className="rounded-lg border-dashboard-border"
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
