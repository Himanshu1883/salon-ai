"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Crown,
  Mail,
  Phone,
  QrCode,
  Search,
  User,
} from "lucide-react";
import { searchCustomers, getCustomerStats } from "@/actions/customers";
import { FloatingInput } from "./floating-input";
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
    <div className="rounded-[20px] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1C103D]">
          Customer Information
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#E8ECF4] px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#6C3BFF]/40 hover:text-[#6C3BFF]"
          title="Barcode / QR scan (coming soon)"
        >
          <QrCode className="h-3.5 w-3.5" />
          Scan
        </button>
      </div>

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
                className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-[#E8ECF4] bg-white shadow-xl"
              >
                {loading ? (
                  <p className="px-4 py-3 text-sm text-[#6B7280]">
                    Searching...
                  </p>
                ) : (
                  results.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F7F8FC]",
                        customerId === customer.id && "bg-[#EDE9FE]"
                      )}
                    >
                      <Search className="h-4 w-4 shrink-0 text-[#6C3BFF]" />
                      <div>
                        <p className="text-sm font-medium text-[#1C103D]">
                          {customer.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">
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
            <label className="text-xs font-medium text-[#6B7280]">Gender</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-14 rounded-2xl border-[#E8ECF4] shadow-sm">
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
          <FloatingInput
            id="customerDob"
            label="Date of Birth"
            value={dob}
            onChange={setDob}
            type="date"
            icon={Calendar}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#6B7280]">
              Membership
            </label>
            <Select value={membership} onValueChange={setMembership}>
              <SelectTrigger className="h-14 rounded-2xl border-[#E8ECF4] shadow-sm">
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
            <label className="text-xs font-medium text-[#6B7280]">
              Preferred Stylist
            </label>
            <Select
              value={preferredStylist}
              onValueChange={onPreferredStylistChange}
            >
              <SelectTrigger className="h-14 rounded-2xl border-[#E8ECF4] shadow-sm">
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
          <label htmlFor="customerNotes" className="text-xs font-medium text-[#6B7280]">
            Notes
          </label>
          <Textarea
            id="customerNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, preferences, special requests..."
            className="min-h-[80px] rounded-2xl border-[#E8ECF4] shadow-sm focus-visible:ring-[#6C3BFF]/20"
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
                <div className="animate-pulse rounded-2xl bg-[#F7F8FC] p-4">
                  <div className="h-4 w-32 rounded bg-[#E8ECF4]" />
                  <div className="mt-3 h-3 w-full rounded bg-[#E8ECF4]" />
                </div>
              ) : stats ? (
                <div className="rounded-2xl border border-[#EDE9FE] bg-gradient-to-br from-[#F7F8FC] to-[#EDE9FE]/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-sm font-bold text-white">
                      {getInitials(stats.customer.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1C103D]">
                        Returning customer
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
                        <span className="text-[#6B7280]">
                          Last visit:{" "}
                          <strong className="text-[#1C103D]">
                            {stats.serviceHistory[0]
                              ? format(
                                  new Date(stats.serviceHistory[0].date),
                                  "MMM d, yyyy"
                                )
                              : "—"}
                          </strong>
                        </span>
                        <span className="text-[#6B7280]">
                          Visits:{" "}
                          <strong className="text-[#1C103D]">
                            {stats.visitCount}
                          </strong>
                        </span>
                        <span className="text-[#6B7280]">
                          Loyalty:{" "}
                          <strong className="text-[#6C3BFF]">
                            {stats.customer.loyaltyPoints} pts
                          </strong>
                        </span>
                        <span className="text-[#6B7280]">
                          Spent:{" "}
                          <strong className="text-[#1C103D]">
                            {formatCurrency(stats.totalPaid)}
                          </strong>
                        </span>
                        <span className="text-[#6B7280]">
                          Balance:{" "}
                          <strong className="text-[#1C103D]">
                            {formatCurrency(outstandingBalance)}
                          </strong>
                        </span>
                        {membership && membership !== "none" && (
                          <span className="inline-flex items-center gap-1 text-[#6B7280]">
                            <Crown className="h-3 w-3 text-[#D97706]" />
                            <strong className="capitalize text-[#D97706]">
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
                              className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium text-[#6C3BFF] shadow-sm"
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
                  Existing customer linked — profile will be updated on check-in.
                </p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function CustomerInfoCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[20px] bg-white p-6 shadow-sm">
      <div className="mb-5 h-6 w-48 rounded bg-[#E8ECF4]" />
      <div className="space-y-4">
        <div className="h-14 rounded-2xl bg-[#F7F8FC]" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-14 rounded-2xl bg-[#F7F8FC]" />
          <div className="h-14 rounded-2xl bg-[#F7F8FC]" />
        </div>
      </div>
    </div>
  );
}
