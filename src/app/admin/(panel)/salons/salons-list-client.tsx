"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
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
        <h1 className="text-2xl font-semibold text-slate-900">Salons</h1>
        <p className="mt-1 text-sm text-slate-500">
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, or city..."
            className="pl-9"
          />
        </form>
        <Select
          value={status}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-44">
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

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salon</TableHead>
              <TableHead>Login URL</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>ERP Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Signed up</TableHead>
              <TableHead>Seats / Staff</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-10 text-center text-slate-500">
                  No salons found
                </TableCell>
              </TableRow>
            ) : (
              salons.map((salon) => (
                <TableRow key={salon.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{salon.name}</div>
                    {salon.city && (
                      <div className="text-xs text-slate-500">{salon.city}</div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <SalonLoginUrl slug={salon.slug} />
                  </TableCell>
                  <TableCell>
                    <div>{salon.ownerName}</div>
                    <div className="text-xs text-slate-500">{salon.ownerEmail}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {salon.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm capitalize text-slate-600">
                    {salon.businessType?.replace(/_/g, " ") ?? "—"}
                  </TableCell>
                  <TableCell>
                    <SalonPlanBadge plan={salon.plan} />
                  </TableCell>
                  <TableCell>
                    <SubscriptionStatusBadge status={salon.status} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatBillingDate(salon)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {format(new Date(salon.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {salon.seatsCount} / {salon.staffCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/salons/${salon.id}`}>View</Link>
                      </Button>
                      {salon.plan !== "ENTERPRISE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await updateSalonPlanAsAdmin(salon.id, "ENTERPRISE");
                              router.refresh();
                            });
                          }}
                        >
                          Upgrade
                        </Button>
                      )}
                      {salon.plan !== "BASIC" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
