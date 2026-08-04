"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { updateCustomer } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  IndianRupee,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Receipt,
  Sparkles,
  UserPlus,
  Crown,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn, getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { usePlan } from "@/components/plans/plan-provider";
import { CustomerMembershipTab } from "@/components/memberships/customer-membership-tab";
import type { PlanRecommendation } from "@/lib/memberships/recommendations";

type CustomerStats = {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    birthday: Date | null;
    loyaltyPoints: number;
    createdAt: Date;
  };
  totalPaid: number;
  visitCount: number;
  invoices: {
    id: string;
    status: string;
    total: number;
    createdAt: Date;
  }[];
  serviceHistory: {
    id: string;
    type: "check-in" | "appointment";
    date: Date;
    services: string;
    employee: string | null;
    status: string;
  }[];
};

type MembershipProfile = {
  membership: {
    id: string;
    membershipNumber: string;
    endDate: Date;
    plan: {
      name: string;
      themeColor: string;
      discountPercent: number;
      benefits: { benefit: { name: string } }[];
    };
    customer: { name: string };
  } | null;
  walletBalance: number;
  analytics: {
    visitCount: number;
    totalSpend: number;
    visitsLast90Days: number;
    favoriteServices: string[];
    hasActiveMembership: boolean;
  };
  recommendation: PlanRecommendation | null;
};

const invoiceStatusVariant: Record<
  string,
  "success" | "secondary" | "warning" | "destructive" | "default"
> = {
  paid: "success",
  draft: "secondary",
  sent: "default",
  overdue: "destructive",
  cancelled: "secondary",
};

const visitStatusVariant: Record<
  string,
  "success" | "secondary" | "warning" | "destructive" | "default"
> = {
  completed: "success",
  cancelled: "secondary",
  waiting: "warning",
  in_progress: "default",
  scheduled: "default",
  confirmed: "default",
  no_show: "destructive",
};

function EditCustomerForm({
  customer,
  onSuccess,
}: {
  customer: CustomerStats["customer"];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await updateCustomer(
      customer.id,
      new FormData(e.currentTarget)
    );
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-dashboard-text">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={customer.name}
            className="rounded-xl border-dashboard-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-dashboard-text">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={customer.phone ?? ""}
            className="rounded-xl border-dashboard-border"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email" className="text-dashboard-text">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer.email ?? ""}
            className="rounded-xl border-dashboard-border"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes" className="text-dashboard-text">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={customer.notes ?? ""}
            className="rounded-xl border-dashboard-border"
          />
        </div>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary hover:opacity-90"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Update client"
        )}
      </Button>
    </form>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
  delay?: number;
};

function StatCard({ label, value, icon, iconBg, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-[20px] border border-dashboard-border bg-dashboard-card p-5 shadow-dashboard-card"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconBg,
            accent
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-dashboard-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-dashboard-text">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ServiceHistoryList({
  entries,
}: {
  entries: CustomerStats["serviceHistory"];
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dashboard-border bg-dashboard-bg/50 px-6 py-16 text-center">
        <CalendarDays className="mb-3 h-10 w-10 text-dashboard-muted/50" />
        <p className="text-sm font-medium text-dashboard-text">No visits yet</p>
        <p className="mt-1 text-xs text-dashboard-muted">
          Service history will appear here after check-ins and appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <motion.div
          key={`${entry.type}-${entry.id}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          className="flex items-start justify-between gap-4 rounded-2xl border border-dashboard-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                entry.type === "appointment"
                  ? "bg-violet-50 text-dashboard-primary"
                  : "bg-emerald-50 text-emerald-600"
              )}
            >
              {entry.type === "appointment" ? (
                <Calendar className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-dashboard-text">{entry.services}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-dashboard-muted">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(entry.date), "MMM d, yyyy · h:mm a")}
                </span>
                {entry.employee && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{entry.employee}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge
              variant="outline"
              className="rounded-lg capitalize text-xs"
            >
              {entry.type.replace("-", " ")}
            </Badge>
            <Badge
              variant={visitStatusVariant[entry.status] ?? "secondary"}
              className="rounded-lg capitalize text-xs"
            >
              {entry.status.replace("_", " ")}
            </Badge>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function InvoicesTable({
  invoices,
}: {
  invoices: CustomerStats["invoices"];
}) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dashboard-border bg-dashboard-bg/50 px-6 py-16 text-center">
        <Receipt className="mb-3 h-10 w-10 text-dashboard-muted/50" />
        <p className="text-sm font-medium text-dashboard-text">No invoices yet</p>
        <p className="mt-1 text-xs text-dashboard-muted">
          Create an invoice to start tracking payments.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-dashboard-border">
      <Table>
        <TableHeader>
          <TableRow className="border-dashboard-border bg-dashboard-bg/60 hover:bg-dashboard-bg/60">
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Date
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Total
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-dashboard-muted">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="border-dashboard-border/60 transition-colors hover:bg-violet-50/30"
            >
              <TableCell className="text-sm text-dashboard-text">
                {format(new Date(invoice.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    invoiceStatusVariant[invoice.status] ?? "secondary"
                  }
                  className="rounded-lg capitalize"
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold tabular-nums text-dashboard-text">
                {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-dashboard-primary hover:bg-violet-50 hover:text-dashboard-primary"
                >
                  <Link href={`/billing/${invoice.id}`}>
                    <FileText className="h-4 w-4" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CustomerDetailClient({
  stats,
  membershipProfile,
}: {
  stats: CustomerStats;
  membershipProfile?: MembershipProfile;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const { isEnterprise } = usePlan();
  const { customer } = stats;

  const checkInUrl = `/check-in?customerId=${customer.id}&name=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone ?? "")}`;
  const appointmentUrl = `/sales/appointments?customerId=${customer.id}&name=${encodeURIComponent(customer.name)}&phone=${encodeURIComponent(customer.phone ?? "")}`;
  const billingUrl = `/billing?customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone ?? "")}`;

  const upcoming = stats.serviceHistory.filter(
    (s) =>
      s.status !== "completed" &&
      s.status !== "cancelled" &&
      new Date(s.date) > new Date()
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Back navigation */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 rounded-xl text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary"
      >
        <Link href="/clients">
          <ArrowLeft className="h-4 w-4" />
          Back to clients
        </Link>
      </Button>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-[20px] border border-dashboard-border bg-dashboard-card shadow-dashboard-card"
      >
        <div className="bg-gradient-to-br from-violet-600/5 via-dashboard-card to-dashboard-card px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-dashboard-primary to-violet-500 text-2xl font-bold text-white shadow-lg shadow-violet-500/25">
                {getInitials(customer.name)}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
                  {customer.name}
                </h1>
                <p className="mt-1 text-sm text-dashboard-muted">
                  Member since{" "}
                  {format(new Date(customer.createdAt), "MMMM d, yyyy")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-dashboard-muted">
                  {customer.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-dashboard-primary" />
                      {customer.phone}
                    </span>
                  )}
                  {customer.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-dashboard-primary" />
                      {customer.email}
                    </span>
                  )}
                  {!customer.phone && !customer.email && (
                    <span className="text-dashboard-muted">No contact info</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="rounded-lg border-0 bg-violet-100 px-2.5 py-0.5 text-violet-700 hover:bg-violet-100">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {customer.loyaltyPoints} loyalty pts
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-lg bg-dashboard-bg text-dashboard-text"
                  >
                    {stats.visitCount} visits
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-lg bg-dashboard-bg text-dashboard-text"
                  >
                    {formatCurrency(stats.totalPaid)} lifetime
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {isEnterprise && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-dashboard-border bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50"
                >
                  <Link href={checkInUrl}>
                    <UserPlus className="h-4 w-4" />
                    Check-in
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl border-dashboard-border bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50"
              >
                <Link href={appointmentUrl}>
                  <Calendar className="h-4 w-4" />
                  Appointment
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary shadow-md shadow-violet-500/20 hover:opacity-90"
              >
                <Link href={billingUrl}>
                  <Receipt className="h-4 w-4" />
                  Create invoice
                </Link>
              </Button>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-dashboard-border bg-white shadow-sm hover:border-violet-200 hover:bg-violet-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl border-dashboard-border sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-dashboard-text">
                      Edit client
                    </DialogTitle>
                  </DialogHeader>
                  <EditCustomerForm
                    customer={customer}
                    onSuccess={() => {
                      setEditOpen(false);
                      router.refresh();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total paid"
          value={formatCurrency(stats.totalPaid)}
          icon={<IndianRupee className="h-5 w-5" />}
          iconBg="bg-emerald-50"
          accent="text-emerald-600"
          delay={0.05}
        />
        <StatCard
          label="Completed visits"
          value={String(stats.visitCount)}
          icon={<CalendarDays className="h-5 w-5" />}
          iconBg="bg-violet-50"
          accent="text-dashboard-primary"
          delay={0.1}
        />
        <StatCard
          label="Invoices"
          value={String(stats.invoices.length)}
          icon={<Receipt className="h-5 w-5" />}
          iconBg="bg-sky-50"
          accent="text-sky-600"
          delay={0.15}
        />
        <StatCard
          label="Loyalty points"
          value={String(customer.loyaltyPoints)}
          icon={<Sparkles className="h-5 w-5" />}
          iconBg="bg-amber-50"
          accent="text-amber-600"
          delay={0.2}
        />
      </div>

      {/* Upcoming appointments banner */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-violet-50/50 p-4 sm:p-5"
        >
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-dashboard-primary">
            <Calendar className="h-3.5 w-3.5" />
            Upcoming
          </p>
          <div className="space-y-2">
            {upcoming.slice(0, 3).map((apt) => (
              <div
                key={apt.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/80 px-4 py-2.5 text-sm shadow-sm"
              >
                <span className="font-medium text-dashboard-text">
                  {apt.services}
                </span>
                <span className="text-dashboard-muted">
                  {format(new Date(apt.date), "MMM d · h:mm a")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabbed content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="rounded-[20px] border border-dashboard-border bg-dashboard-card shadow-dashboard-card"
      >
        <Tabs defaultValue="history" className="w-full">
          <div className="border-b border-dashboard-border/60 px-4 pt-4 sm:px-6 sm:pt-5">
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-dashboard-bg p-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden">
              <TabsTrigger
                value="history"
                className="min-h-[48px] shrink-0 rounded-lg px-4 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-dashboard-primary data-[state=active]:shadow-sm"
              >
                <CalendarDays className="mr-1.5 h-4 w-4" />
                Visits
                {stats.serviceHistory.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                    {stats.serviceHistory.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                className="min-h-[48px] shrink-0 rounded-lg px-4 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-dashboard-primary data-[state=active]:shadow-sm"
              >
                <Receipt className="mr-1.5 h-4 w-4" />
                Invoices
                {stats.invoices.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                    {stats.invoices.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="membership"
                className="min-h-[48px] shrink-0 rounded-lg px-4 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-dashboard-primary data-[state=active]:shadow-sm"
              >
                <Crown className="mr-1.5 h-4 w-4" />
                Membership
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="min-h-[48px] shrink-0 rounded-lg px-4 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-dashboard-primary data-[state=active]:shadow-sm"
              >
                <FileText className="mr-1.5 h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="mt-0 px-4 py-5 sm:px-6 sm:py-6">
            <ServiceHistoryList entries={stats.serviceHistory} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-0 px-4 py-5 sm:px-6 sm:py-6">
            <InvoicesTable invoices={stats.invoices} />
          </TabsContent>

          {membershipProfile && isEnterprise && (
            <TabsContent value="membership" className="mt-0 px-4 py-5 sm:px-6 sm:py-6">
              <CustomerMembershipTab
                customerId={customer.id}
                customerName={customer.name}
                loyaltyPoints={customer.loyaltyPoints}
                profile={membershipProfile}
              />
            </TabsContent>
          )}

          <TabsContent value="profile" className="mt-0 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-dashboard-muted">
                  Contact details
                </h3>
                <div className="space-y-3 rounded-2xl border border-dashboard-border bg-dashboard-bg/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-dashboard-primary">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-dashboard-muted">Phone</p>
                      <p className="mt-0.5 font-medium text-dashboard-text">
                        {customer.phone || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-dashboard-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-dashboard-muted">Email</p>
                      <p className="mt-0.5 font-medium text-dashboard-text">
                        {customer.email || "—"}
                      </p>
                    </div>
                  </div>
                  {customer.birthday && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-dashboard-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-dashboard-muted">
                          Birthday
                        </p>
                        <p className="mt-0.5 font-medium text-dashboard-text">
                          {format(new Date(customer.birthday), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-dashboard-muted">
                  Notes
                </h3>
                <div className="rounded-2xl border border-dashboard-border bg-white p-4 shadow-sm">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-dashboard-text">
                    {customer.notes || (
                      <span className="text-dashboard-muted">No notes added yet.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
