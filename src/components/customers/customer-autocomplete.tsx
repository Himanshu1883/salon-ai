"use client";

import { useEffect, useRef, useState } from "react";
import { searchCustomers } from "@/actions/customers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CustomerOption = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

export function CustomerAutocomplete({
  defaultName = "",
  defaultPhone = "",
  defaultCustomerId = "",
  phoneRequired = false,
  onSelect,
  onPhoneChange,
}: {
  defaultName?: string;
  defaultPhone?: string;
  defaultCustomerId?: string;
  phoneRequired?: boolean;
  onSelect?: (customer: CustomerOption | null) => void;
  onPhoneChange?: (phone: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [customerId, setCustomerId] = useState(defaultCustomerId);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  function selectCustomer(customer: CustomerOption) {
    setCustomerId(customer.id);
    setName(customer.name);
    const nextPhone = customer.phone ?? "";
    setPhone(nextPhone);
    onPhoneChange?.(nextPhone);
    setQuery("");
    setOpen(false);
    onSelect?.(customer);
  }

  function clearSelection() {
    setCustomerId("");
    onSelect?.(null);
  }

  function handleNameChange(value: string) {
    setName(value);
    setQuery(value);
    if (customerId) {
      clearSelection();
    }
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    onPhoneChange?.(value);
    if (customerId) {
      clearSelection();
    }
  }

  return (
    <div ref={containerRef} className="space-y-4">
      <input type="hidden" name="customerId" value={customerId} />

      <div className="relative space-y-2">
        <Label htmlFor="customerName">Customer name</Label>
        <Input
          id="customerName"
          name="customerName"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          autoComplete="off"
        />
        {open && (results.length > 0 || loading) && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg">
            {loading ? (
              <p className="px-3 py-2 text-sm text-stone-500">Searching...</p>
            ) : (
              results.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => selectCustomer(customer)}
                  className={cn(
                    "flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-rose-50",
                    customerId === customer.id && "bg-rose-50"
                  )}
                >
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-xs text-stone-500">
                    {[customer.phone, customer.email].filter(Boolean).join(" · ") ||
                      "No contact info"}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">
          Phone{phoneRequired ? "" : " (optional)"}
        </Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          value={phone}
          required={phoneRequired}
          minLength={phoneRequired ? 10 : undefined}
          onChange={(e) => handlePhoneChange(e.target.value)}
        />
      </div>

      {customerId && (
        <p className="text-xs text-emerald-700">
          Existing customer selected — details will be linked to their profile.
        </p>
      )}
    </div>
  );
}
