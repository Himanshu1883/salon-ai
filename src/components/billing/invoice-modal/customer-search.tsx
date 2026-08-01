"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, Phone, Plus, Search } from "lucide-react";
import { searchCustomers, getCustomerStats } from "@/actions/customers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, getInitials } from "@/lib/utils";
import { formatLastVisit } from "@/components/clients/clients-utils";
import { invoiceModalStyles } from "./styles";

export type InvoiceCustomer = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  lastVisit?: Date | null;
};

function getMembershipBadge(loyaltyPoints: number) {
  if (loyaltyPoints >= 500) {
    return { label: "Gold", className: "bg-amber-50 text-amber-700" };
  }
  if (loyaltyPoints >= 200) {
    return { label: "Silver", className: "bg-slate-100 text-slate-700" };
  }
  if (loyaltyPoints >= 100) {
    return { label: "VIP", className: "bg-violet-50 text-[#6D5DF6]" };
  }
  return null;
}

type CustomerResult = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  loyaltyPoints: number;
  lastVisit?: Date | null;
};

type CustomerSearchProps = {
  value: InvoiceCustomer;
  onChange: (customer: InvoiceCustomer) => void;
  error?: string;
  autoFocus?: boolean;
};

export function CustomerSearch({
  value,
  onChange,
  error,
  autoFocus = false,
}: CustomerSearchProps) {
  const [query, setQuery] = useState(value.name);
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value.name);
  }, [value.name]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

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
      const enriched = await Promise.all(
        customers.map(async (customer) => {
          let lastVisit: Date | null = null;
          try {
            const stats = await getCustomerStats(customer.id);
            if (stats?.serviceHistory?.[0]?.date) {
              lastVisit = new Date(stats.serviceHistory[0].date);
            }
          } catch {
            lastVisit = null;
          }
          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            loyaltyPoints: customer.loyaltyPoints ?? 0,
            lastVisit,
          };
        })
      );
      setResults(enriched);
      setLoading(false);
      setOpen(true);
      setHighlightIndex(0);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function selectCustomer(customer: CustomerResult) {
    onChange({
      id: customer.id,
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      loyaltyPoints: customer.loyaltyPoints,
      lastVisit: customer.lastVisit,
    });
    setQuery(customer.name);
    setOpen(false);
  }

  function startNewCustomer() {
    setOpen(false);
    onChange({
      id: undefined,
      name: query.trim(),
      phone: value.phone,
      email: "",
      loyaltyPoints: 0,
      lastVisit: null,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectCustomer(results[highlightIndex]);
    }
  }

  return (
    <div className="space-y-2.5">
      <Label htmlFor="invoice-customer-name" className={invoiceModalStyles.label}>
        Customer name <span className="text-red-500">*</span>
      </Label>
      <div ref={containerRef} className="relative">
        <div className="relative">
          {value.id ? (
            <div className="pointer-events-none absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D5DF6] to-[#8B7CF8] text-xs font-semibold text-white">
              {getInitials(value.name)}
            </div>
          ) : (
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          )}
          <Input
            ref={inputRef}
            id="invoice-customer-name"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              onChange({
                ...value,
                id: undefined,
                name: next,
                loyaltyPoints: 0,
                lastVisit: null,
              });
            }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search customer name..."
            autoComplete="off"
            aria-invalid={!!error}
            className={cn(
              invoiceModalStyles.input,
              "pl-11 pr-28",
              value.id && "pl-14",
              error && invoiceModalStyles.inputError
            )}
          />
          <button
            type="button"
            onClick={startNewCustomer}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Customer
          </button>
        </div>

        {open && (loading || results.length > 0) && (
          <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-violet-100/80 bg-white shadow-[0_20px_50px_rgba(109,40,217,0.12)]">
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-[#6B7280]">
                <Loader2 className="h-4 w-4 animate-spin text-[#6D5DF6]" />
                Searching customers...
              </div>
            ) : (
              results.map((customer, index) => {
                const badge = getMembershipBadge(customer.loyaltyPoints);
                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => selectCustomer(customer)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#6D5DF6]/5",
                      index === highlightIndex && "bg-[#6D5DF6]/8"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D5DF6] to-[#8B7CF8] text-xs font-semibold text-white">
                      {getInitials(customer.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-[#1C103D]">
                          {customer.name}
                        </p>
                        {badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              badge.className
                            )}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#9CA3AF]">
                        {customer.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                        <span>{customer.loyaltyPoints} pts</span>
                        <span>
                          Last visit: {formatLastVisit(customer.lastVisit ?? null)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

type PhoneSearchProps = {
  value: InvoiceCustomer;
  onChange: (customer: InvoiceCustomer) => void;
};

export function PhoneSearch({ value, onChange }: PhoneSearchProps) {
  const [query, setQuery] = useState(value.phone);
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value.phone);
  }, [value.phone]);

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
    const digits = query.replace(/\D/g, "");
    if (digits.length < 4) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const customers = await searchCustomers(query);
      setResults(
        customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          loyaltyPoints: c.loyaltyPoints ?? 0,
        }))
      );
      setLoading(false);
      setOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function selectCustomer(customer: CustomerResult) {
    onChange({
      id: customer.id,
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      loyaltyPoints: customer.loyaltyPoints,
    });
    setQuery(customer.phone ?? "");
    setOpen(false);
  }

  return (
    <div className="space-y-2.5">
      <Label htmlFor="invoice-phone" className={invoiceModalStyles.label}>
        Phone <span className="text-red-500">*</span>
      </Label>
      <div ref={containerRef} className="relative">
        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted/70" />
        <Input
          id="invoice-phone"
          type="tel"
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            onChange({ ...value, phone: next, id: value.id });
          }}
          onFocus={() => query.replace(/\D/g, "").length >= 4 && setOpen(true)}
          placeholder="Search phone number..."
          className={cn(invoiceModalStyles.input, "pl-11")}
        />
        {open && (loading || results.length > 0) && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-[0_20px_50px_rgba(109,40,217,0.12)]">
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-[#6B7280]">
                <Loader2 className="h-4 w-4 animate-spin text-[#6D5DF6]" />
                Searching...
              </div>
            ) : (
              results.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => selectCustomer(customer)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#6D5DF6]/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1C103D]">
                      {customer.name}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{customer.phone}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type CustomerEmailFieldProps = {
  value: string;
  onChange: (email: string) => void;
};

export function CustomerEmailField({ value, onChange }: CustomerEmailFieldProps) {
  return (
    <div className="space-y-2.5 sm:col-span-2">
      <Label htmlFor="invoice-email" className={invoiceModalStyles.label}>
        Email <span className="font-normal text-dashboard-muted">(optional)</span>
      </Label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted/70" />
        <Input
          id="invoice-email"
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="customer@email.com"
          className={cn(invoiceModalStyles.input, "pl-11")}
        />
      </div>
    </div>
  );
}
