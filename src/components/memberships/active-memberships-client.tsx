"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MembershipPageHeader } from "@/components/memberships/memberships-shell";
import { DigitalMembershipCardInline } from "@/components/memberships/digital-membership-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Search, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { FilterDrawer } from "@/components/ui/filter-drawer";

type Membership = {
  id: string;
  membershipNumber: string;
  status: string;
  startDate: Date;
  endDate: Date;
  pricePaid: number;
  autoRenew: boolean;
  customer: { id: string; name: string; phone: string | null; email: string | null };
  plan: { id: string; name: string; themeColor: string; category: string };
};

type Plan = { id: string; name: string };

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  EXPIRED: "secondary",
  CANCELLED: "destructive",
  SUSPENDED: "outline",
  PENDING: "outline",
};

export function ActiveMembershipsClient({
  memberships,
  plans,
  filters,
}: {
  memberships: Membership[];
  plans: Plan[];
  filters: { status?: string; planId?: string; search?: string };
}) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search ?? "");
  const [planId, setPlanId] = useState(filters.planId ?? "all");
  const [status, setStatus] = useState(filters.status ?? "ACTIVE");

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (planId !== "all") params.set("planId", planId);
    if (status !== "ACTIVE") params.set("status", status);
    router.push(`/memberships/active?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Active Memberships"
        description={`${memberships.length} membership${memberships.length !== 1 ? "s" : ""} found`}
      />

      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search member, phone, number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="h-11 rounded-xl pl-9"
            />
          </div>
          <div className="hidden flex-wrap items-center gap-3 lg:flex">
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="All plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={applyFilters} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
              Apply
            </Button>
          </div>
          <div className="lg:hidden">
            <FilterDrawer triggerLabel="Filter memberships" onApply={applyFilters}>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="all">All statuses</SelectItem>
                </SelectContent>
              </Select>
            </FilterDrawer>
          </div>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-200 p-12 text-center">
          <p className="font-medium text-stone-900">No memberships found</p>
          <Button asChild className="mt-4 rounded-xl bg-emerald-600">
            <Link href="/memberships/sell">Sell a membership</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {memberships.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{m.customer.name}</p>
                  <p className="text-xs text-stone-500">{m.customer.phone ?? m.customer.email}</p>
                </div>
                <Badge variant={statusVariant[m.status] ?? "secondary"} className="rounded-lg">
                  {m.status}
                </Badge>
              </div>

              <div className="mt-4">
                <DigitalMembershipCardInline
                  planName={m.plan.name}
                  membershipNumber={m.membershipNumber}
                  themeColor={m.plan.themeColor}
                  endDate={m.endDate}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-500">
                <div>
                  <p className="uppercase tracking-wide">Started</p>
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    {format(new Date(m.startDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-wide">Paid</p>
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    {formatCurrency(m.pricePaid)}
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-3 w-full rounded-xl text-emerald-700 hover:bg-emerald-50"
              >
                <Link href={`/clients/${m.customer.id}`}>
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View customer
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
