"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Mail,
  Phone,
  QrCode,
  Search,
  User,
} from "lucide-react";
import { searchCustomers, getCustomerStats } from "@/actions/customers";
import { FloatingInput } from "./floating-input";
import {
  CheckInCard,
  CheckInCardContent,
  CheckInCardHeader,
} from "./check-in-card";
import { formatPhoneInput, getInitials } from "./utils";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import type { CustomerStats } from "./types";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CustomerOption = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

type CustomerInfoCardProps = {
  defaultName?: string;
  defaultPhone?: string;
  defaultCustomerId?: string;
  preferredStylist?: string;
  onPreferredStylistChange?: (value: string) => void;
  stylists?: { id: string; name: string }[];
};

export function CustomerInfoCard({
  defaultName = "",
  defaultPhone = "",
  defaultCustomerId = "",
  preferredStylist = "",
  onPreferredStylistChange,
  stylists = [],
}: CustomerInfoCardProps) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [customerId, setCustomerId] = useState(defaultCustomerId);
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [membership, setMembership] = useState("");
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(defaultName);
    setPhone(defaultPhone);
    setCustomerId(defaultCustomerId);
  }, [defaultName, defaultPhone, defaultCustomerId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const customers = await searchCustomers(query);
      setResults(customers);
      setLoading(false);
      setOpen(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!customerId) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setStatsLoading(true);
    getCustomerStats(customerId).then((data) => {
      if (!cancelled && data) {
        setStats(data);
        setEmail(data.customer.email ?? "");
        if (data.customer.birthday) {
          setDob(format(new Date(data.customer.birthday), "yyyy-MM-dd"));
        }
        setNotes(data.customer.notes ?? "");
      }
      if (!cancelled) setStatsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  async function selectCustomer(customer: CustomerOption) {
    setCustomerId(customer.id);
    setName(customer.name);
    setPhone(customer.phone ?? "");
    setEmail(customer.email ?? "");
    setQuery("");
    setOpen(false);
  }

  function handleNameChange(value: string) {
    setName(value);
    setQuery(value);
    if (customerId) {
      setCustomerId("");
      setStats(null);
    }
  }

  function handlePhoneChange(value: string) {
    const formatted = formatPhoneInput(value);
    setPhone(formatted);
    setQuery(formatted.replace(/\s/g, ""));
    if (customerId) {
      setCustomerId("");
      setStats(null);
    }
  }

  const recentServices = stats?.serviceHistory.slice(0, 3) ?? [];
  const outstandingBalance = 0;

  return (
    <CheckInCard>
      <CheckInCardHeader
        step={1}
        title="Customer Information"
        description="Search existing clients or register a new walk-in"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-dashboard-border px-3 py-1.5 text-xs font-medium text-dashboard-muted transition-colors hover:border-violet-300 hover:text-dashboard-primary"
            title="Barcode / QR scan (coming soon)"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan
          </button>
        }
      />

      <CheckInCardContent>
        <input type="hidden" name="customerId" value={customerId} />

        <div ref={containerRef} className="space-y-4">
          <div className="relative">
            <FloatingInput
              id="customerName"
              name="customerName"
              label="Customer Name"
              value={name}
              onChange={handleNameChange}
              required
              icon={User}
              autoComplete="off"
            />
            <AnimatePresence>
              {open && (results.length > 0 || loading) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-dashboard-border bg-white/98 shadow-xl backdrop-blur-md"
                >
                  {loading ? (
                    <p className="px-4 py-3 text-sm text-dashboard-muted">
                      Searching...
                    </p>
                  ) : (
                    results.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-violet-50/80",
                          customerId === customer.id && "bg-violet-50"
                        )}
                      >
                        <Search className="h-4 w-4 shrink-0 text-dashboard-primary" />
                        <div>
                          <p className="text-sm font-medium text-dashboard-text">
                            {customer.name}
                          </p>
                          <p className="text-xs text-dashboard-muted">
                            {[customer.phone, customer.email]
                              .filter(Boolean)
                              .join(" · ") || "No contact info"}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingInput
              id="customerPhone"
              name="customerPhone"
              label="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              type="tel"
              icon={Phone}
            />
            <FloatingInput
              id="customerEmail"
              label="Email (optional)"
              value={email}
              onChange={setEmail}
              type="email"
              icon={Mail}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-dashboard-muted">
                Gender
              </label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-14 rounded-xl border-dashboard-border bg-white/90 shadow-sm backdrop-blur-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="customerDob"
                className="text-xs font-medium text-dashboard-muted"
              >
                Date of Birth
              </label>
              <input
                id="customerDob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-14 w-full rounded-xl border border-dashboard-border bg-white/90 px-4 text-sm text-dashboard-text shadow-sm backdrop-blur-sm [color-scheme:light] focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-dashboard-muted">
                Membership
              </label>
              <Select value={membership} onValueChange={setMembership}>
                <SelectTrigger className="h-14 rounded-xl border-dashboard-border bg-white/90 shadow-sm backdrop-blur-sm">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {stylists.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-dashboard-muted">
                Preferred Stylist
              </label>
              <Select
                value={preferredStylist}
                onValueChange={onPreferredStylistChange}
              >
                <SelectTrigger className="h-14 rounded-xl border-dashboard-border bg-white/90 shadow-sm backdrop-blur-sm">
                  <SelectValue placeholder="Any available stylist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any available</SelectItem>
                  {stylists.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="customerNotes"
              className="text-xs font-medium text-dashboard-muted"
            >
              Notes
            </label>
            <Textarea
              id="customerNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, preferences, special requests..."
              className="min-h-[80px] rounded-xl border-dashboard-border bg-white/90 shadow-sm backdrop-blur-sm focus-visible:ring-violet-500/15"
            />
          </div>

          <AnimatePresence>
            {(customerId || statsLoading) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {statsLoading ? (
                  <div className="animate-pulse rounded-xl bg-violet-50/50 p-4">
                    <div className="h-4 w-32 rounded bg-violet-100" />
                    <div className="mt-3 h-3 w-full rounded bg-violet-100" />
                  </div>
                ) : stats ? (
                  <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white/90 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dashboard-primary to-violet-500 text-sm font-bold text-white shadow-md shadow-violet-500/20">
                        {getInitials(stats.customer.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-dashboard-text">
                          Returning customer
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
                          <span className="text-dashboard-muted">
                            Last visit:{" "}
                            <strong className="text-dashboard-text">
                              {stats.serviceHistory[0]
                                ? format(
                                    new Date(stats.serviceHistory[0].date),
                                    "MMM d, yyyy"
                                  )
                                : "—"}
                            </strong>
                          </span>
                          <span className="text-dashboard-muted">
                            Visits:{" "}
                            <strong className="text-dashboard-text">
                              {stats.visitCount}
                            </strong>
                          </span>
                          <span className="text-dashboard-muted">
                            Loyalty:{" "}
                            <strong className="text-dashboard-primary">
                              {stats.customer.loyaltyPoints} pts
                            </strong>
                          </span>
                          <span className="text-dashboard-muted">
                            Spent:{" "}
                            <strong className="text-dashboard-text">
                              {formatCurrency(stats.totalPaid)}
                            </strong>
                          </span>
                          <span className="text-dashboard-muted">
                            Balance:{" "}
                            <strong className="text-dashboard-text">
                              {formatCurrency(outstandingBalance)}
                            </strong>
                          </span>
                          {membership && membership !== "none" && (
                            <span className="inline-flex items-center gap-1 text-dashboard-muted">
                              <Crown className="h-3 w-3 text-amber-500" />
                              <strong className="capitalize text-amber-600">
                                {membership}
                              </strong>
                            </span>
                          )}
                        </div>
                        {recentServices.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {recentServices.map((s, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium text-dashboard-primary shadow-sm"
                              >
                                {s.services}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : customerId ? (
                  <p className="text-xs text-emerald-700">
                    Existing customer linked — profile will be updated on
                    check-in.
                  </p>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CheckInCardContent>
    </CheckInCard>
  );
}

export function CustomerInfoCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[20px] border border-dashboard-border bg-dashboard-card p-6 shadow-dashboard-card">
      <div className="mb-5 h-6 w-48 rounded bg-violet-100" />
      <div className="space-y-4">
        <div className="h-14 rounded-xl bg-violet-50" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-14 rounded-xl bg-violet-50" />
          <div className="h-14 rounded-xl bg-violet-50" />
        </div>
      </div>
    </div>
  );
}
