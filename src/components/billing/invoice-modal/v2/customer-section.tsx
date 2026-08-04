"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { getRecentCustomers } from "@/actions/customers";
import {
  CustomerEmailField,
  CustomerSearch,
  PhoneSearch,
  type InvoiceCustomer,
} from "../customer-search";
import { v2 } from "./tokens";

type CustomerSectionProps = {
  customer: InvoiceCustomer;
  onChange: (customer: InvoiceCustomer) => void;
  error?: string;
  autoFocus?: boolean;
};

export function CustomerSection({
  customer,
  onChange,
  error,
  autoFocus,
}: CustomerSectionProps) {
  const [recentLoaded, setRecentLoaded] = useState(false);

  useEffect(() => {
    void getRecentCustomers(5).then(() => setRecentLoaded(true)).catch(() => {});
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-labelledby="v2-customer-section"
      className={v2.card}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#7C3AED]/10">
          <Users className="h-4.5 w-4.5 text-[#7C3AED]" />
        </div>
        <div>
          <h3 id="v2-customer-section" className={v2.sectionTitle}>
            Customer Information
          </h3>
          <p className="text-xs text-[#6B7280]">
            Search existing or add a new customer
            {recentLoaded ? "" : " · loading recent…"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <CustomerSearch
          value={customer}
          onChange={onChange}
          error={error}
          autoFocus={autoFocus}
        />
        <PhoneSearch value={customer} onChange={onChange} />
        <CustomerEmailField value={customer.email} onChange={(email) => onChange({ ...customer, email })} />
      </div>
    </motion.section>
  );
}
