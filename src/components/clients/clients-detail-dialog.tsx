"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar,
  Cake,
  Check,
  CreditCard,
  FileText,
  Loader2,
  Pencil,
  Receipt,
  Sparkles,
} from "lucide-react";
import { getCustomerStats, updateCustomer } from "@/actions/customers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { getInitials } from "@/lib/utils";
import type { CustomerListItem } from "@/actions/customers";

type ClientsDetailDialogProps = {
  customer: CustomerListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerUpdated?: (customer: CustomerListItem) => void;
};

type CustomerStatsData = Awaited<ReturnType<typeof getCustomerStats>>;

function formatBirthday(birthday: Date | null | undefined) {
  if (!birthday) return "Not set";
  return format(new Date(birthday), "d MMM yyyy");
}

function ClientEditForm({
  customer,
  onCancel,
  onSuccess,
}: {
  customer: CustomerListItem;
  onCancel: () => void;
  onSuccess: (updated: CustomerListItem) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateCustomer(customer.id, formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess({
      ...customer,
      name: (formData.get("name") as string) || customer.name,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      notes: (formData.get("notes") as string) || null,
    });
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-name" className="text-[#374151]">
            Name
          </Label>
          <Input
            id="edit-name"
            name="name"
            required
            defaultValue={customer.name}
            className="rounded-xl border-[#E8ECF4]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-phone" className="text-[#374151]">
            Phone
          </Label>
          <Input
            id="edit-phone"
            name="phone"
            type="tel"
            defaultValue={customer.phone ?? ""}
            className="rounded-xl border-[#E8ECF4]"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-email" className="text-[#374151]">
            Email
          </Label>
          <Input
            id="edit-email"
            name="email"
            type="email"
            defaultValue={customer.email ?? ""}
            className="rounded-xl border-[#E8ECF4]"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-notes" className="text-[#374151]">
            Notes
          </Label>
          <Textarea
            id="edit-notes"
            name="notes"
            rows={4}
            defaultValue={customer.notes ?? ""}
            className="rounded-xl border-[#E8ECF4]"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-[#E8ECF4] pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
          className="rounded-xl border-[#E8ECF4]"
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}

export function ClientsDetailDialog({
  customer,
  open,
  onOpenChange,
  onCustomerUpdated,
}: ClientsDetailDialogProps) {
  const router = useRouter();
  const [localCustomer, setLocalCustomer] = useState<CustomerListItem | null>(
    customer
  );
  const [stats, setStats] = useState<CustomerStatsData>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalCustomer(customer);
    setIsEditing(false);
    setSaveSuccess(false);
  }, [customer?.id, open]);

  useEffect(() => {
    if (!open || !localCustomer) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setStats(null);

    getCustomerStats(localCustomer.id)
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [localCustomer?.id, open]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setIsEditing(false);
      setSaveSuccess(false);
    }
    onOpenChange(nextOpen);
  }

  function handleEditSuccess(updated: CustomerListItem) {
    setLocalCustomer(updated);
    onCustomerUpdated?.(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    router.refresh();
  }

  if (!localCustomer) return null;

  const upcoming = stats?.serviceHistory.filter(
    (s) =>
      s.status !== "completed" &&
      s.status !== "cancelled" &&
      new Date(s.date) > new Date()
  );

  const recentServices = stats?.serviceHistory
    .filter((s) => s.status === "completed")
    .slice(0, 6);

  const recentInvoices = stats?.invoices.slice(0, 6);
  const birthday = stats?.customer.birthday ?? null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-2xl border-[#E8ECF4] p-0 shadow-[0_8px_40px_rgba(28,16,61,0.12)]">
        <DialogHeader className="border-b border-[#E8ECF4] px-6 py-5">
          <div className="flex items-center justify-between gap-3 pr-12">
            <DialogTitle className="text-left text-xl font-semibold text-[#1C103D]">
              {isEditing ? "Edit Client" : "Client Details"}
            </DialogTitle>
            {!isEditing && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="relative z-10 shrink-0 rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] px-4 font-medium text-white shadow-sm hover:opacity-90"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {saveSuccess && !isEditing && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              >
                <Check className="h-4 w-4 shrink-0" />
                Client details saved successfully
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#6B7280]">
              <Loader2 className="h-5 w-5 animate-spin text-[#6C3BFF]" />
              Loading client details…
            </div>
          ) : isEditing ? (
            <ClientEditForm
              customer={localCustomer}
              onCancel={() => setIsEditing(false)}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-2xl font-bold text-white shadow-md">
                  {getInitials(localCustomer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-[#1C103D]">
                    {localCustomer.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {localCustomer.phone || "No phone"} ·{" "}
                    {localCustomer.email || "No email"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-lg">
                      {localCustomer.loyaltyPoints} loyalty pts
                    </Badge>
                    <Badge variant="secondary" className="rounded-lg">
                      {localCustomer.visitCount} visits
                    </Badge>
                    <Badge variant="secondary" className="rounded-lg">
                      {formatCurrency(localCustomer.totalSales)} lifetime
                    </Badge>
                  </div>
                </div>
                <div className="rounded-xl border border-[#E8ECF4] bg-[#F7F8FC] px-4 py-3 sm:min-w-[160px]">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <Cake className="h-3.5 w-3.5" />
                    Birthday
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#1C103D]">
                    {formatBirthday(birthday)}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <Calendar className="h-3.5 w-3.5" />
                    Visit Timeline
                  </h4>
                  {recentServices && recentServices.length > 0 ? (
                    <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {recentServices.map((visit) => (
                        <motion.li
                          key={visit.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-xl border border-[#E8ECF4] bg-white px-3 py-2.5 text-sm shadow-sm"
                        >
                          <p className="font-medium text-[#1C103D]">
                            {visit.services}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {format(new Date(visit.date), "d MMM yyyy")}
                            {visit.employee ? ` · ${visit.employee}` : ""}
                          </p>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl border border-dashed border-[#E8ECF4] bg-[#F7F8FC] px-3 py-6 text-center text-sm text-[#6B7280]">
                      No visit history yet
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <Receipt className="h-3.5 w-3.5" />
                    Invoices & Bookings
                  </h4>
                  {recentInvoices && recentInvoices.length > 0 ? (
                    <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {recentInvoices.map((inv) => (
                        <motion.li
                          key={inv.id}
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between rounded-xl border border-[#E8ECF4] bg-white px-3 py-2.5 text-sm shadow-sm"
                        >
                          <span className="text-[#6B7280]">
                            {format(new Date(inv.createdAt), "d MMM yyyy")}
                          </span>
                          <span className="font-medium tabular-nums text-[#1C103D]">
                            {formatCurrency(inv.total)}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl border border-dashed border-[#E8ECF4] bg-[#F7F8FC] px-3 py-6 text-center text-sm text-[#6B7280]">
                      No invoices yet
                    </p>
                  )}

                  {upcoming && upcoming.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs font-medium text-[#6C3BFF]">
                        Upcoming
                      </p>
                      <div className="space-y-2">
                        {upcoming.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            className="rounded-xl bg-[#EDE9FE] px-3 py-2 text-sm text-[#1C103D]"
                          >
                            {apt.services} ·{" "}
                            {format(new Date(apt.date), "d MMM · h:mm a")}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(localCustomer.notes || stats?.customer.notes) && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <FileText className="h-3.5 w-3.5" />
                    Notes
                  </h4>
                  <p className="rounded-xl border border-[#E8ECF4] bg-white p-3 text-sm text-[#374151] shadow-sm">
                    {localCustomer.notes || stats?.customer.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-[#E8ECF4] pt-4">
                <Badge variant="outline" className="rounded-lg opacity-60">
                  <CreditCard className="mr-1 h-3 w-3" />
                  Membership — coming soon
                </Badge>
                <Badge variant="outline" className="rounded-lg opacity-60">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Products — coming soon
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
