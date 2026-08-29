"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Shield,
  Radio,
  Bell,
  Undo2,
} from "lucide-react";
import { checkInCustomer } from "@/actions/queue";
import { useRouter } from "next/navigation";
import { CheckInHeader } from "@/components/check-in/check-in-header";
import { CustomerInfoCard } from "@/components/check-in/customer-info-card";
import { ServiceSelection } from "@/components/check-in/service-selection";
import { StylistSelection } from "@/components/check-in/stylist-selection";
import { EstimatedBillCard } from "@/components/check-in/estimated-bill-card";
import { QueueDashboard } from "@/components/check-in/queue-dashboard";
import { CheckInActionBar } from "@/components/check-in/check-in-action-bar";
import { DRAFT_STORAGE_KEY } from "@/components/check-in/utils";
import type {
  BillingStatsSnapshot,
  CheckInEmployee,
  CheckInService,
  CompletedEntryItem,
  PrefilledCustomer,
  CheckInPrefill,
  QueueEntryItem,
  RecentCustomerItem,
} from "@/components/check-in/types";
import { Button } from "@/components/ui/button";

export function CheckInClient({
  services,
  queueEntries: queueEntriesProp,
  completedEntries: completedEntriesProp,
  estimatedWait,
  employees,
  recentCustomers,
  billingStats,
  prefilledCustomer,
}: {
  services: CheckInService[];
  queueEntries: QueueEntryItem[];
  completedEntries: CompletedEntryItem[];
  estimatedWait: number;
  employees: CheckInEmployee[];
  recentCustomers: RecentCustomerItem[];
  billingStats: BillingStatsSnapshot;
  prefilledCustomer?: CheckInPrefill;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const startNowRef = useRef(false);
  const router = useRouter();
  const validPrefillServiceIds = useMemo(
    () =>
      (prefilledCustomer?.serviceIds ?? []).filter((id) =>
        services.some((service) => service.id === id)
      ),
    [prefilledCustomer?.serviceIds, services]
  );
  const prefillEmployeeId =
    prefilledCustomer?.employeeId &&
    employees.some((employee) => employee.id === prefilledCustomer.employeeId)
      ? prefilledCustomer.employeeId
      : "";
  const [queueEntries, setQueueEntries] = useState(queueEntriesProp);
  const [completedEntries, setCompletedEntries] = useState(completedEntriesProp);
  const [localEstimatedWait, setLocalEstimatedWait] = useState(estimatedWait);

  useEffect(() => {
    setQueueEntries(queueEntriesProp);
    setCompletedEntries(completedEntriesProp);
    setLocalEstimatedWait(estimatedWait);
  }, [queueEntriesProp, completedEntriesProp, estimatedWait]);

  const [selectedServices, setSelectedServices] = useState<string[]>(
    validPrefillServiceIds
  );
  const [preferredStylist, setPreferredStylist] = useState(prefillEmployeeId);
  const [selectedStylist, setSelectedStylist] = useState(prefillEmployeeId);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ position: number } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [prefill, setPrefill] = useState(prefilledCustomer);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      setSuccess(null);

      const formData = new FormData(e.currentTarget);
      selectedServices.forEach((id) => formData.append("serviceIds", id));
      const startNow = startNowRef.current;
      startNowRef.current = false;
      if (startNow) formData.set("startNow", "1");
      if (prefill?.fromAppointmentId) {
        formData.set("appointmentId", prefill.fromAppointmentId);
      }
      const stylistId = selectedStylist || preferredStylist;
      if (stylistId) formData.set("employeeId", stylistId);

      const result = await checkInCustomer(formData);
      setLoading(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      const customerName = formData.get("customerName") as string;
      const customerPhone = (formData.get("customerPhone") as string) || null;
      const selectedServiceItems = services.filter((s) =>
        selectedServices.includes(s.id)
      );
      const nextPosition = (result.position ?? queueEntries.length + 1) as number;
      const started = Boolean(result.started);
      const assignedEmployee =
        employees.find((employee) => employee.id === stylistId) ?? null;

      setQueueEntries((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          position: nextPosition,
          status: started
            ? "in_progress"
            : assignedEmployee
              ? "assigned"
              : "waiting",
          checkedInAt: new Date(),
          customer: { name: customerName, phone: customerPhone },
          employee: assignedEmployee
            ? { id: assignedEmployee.id, name: assignedEmployee.name }
            : null,
          services: selectedServiceItems.map((s) => ({
            service: {
              name: s.name,
              duration: s.duration,
              price: s.price,
            },
          })),
        },
      ]);
      setLocalEstimatedWait((w) => w + 5);

      setSuccess({ position: nextPosition });
      setShowUndo(true);
      setSelectedServices([]);
      setPreferredStylist("");
      setSelectedStylist("");
      setPrefill({ customerId: "", name: "", phone: "" });
      formRef.current?.reset();
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      setTimeout(() => setShowUndo(false), 8000);

      if (started) {
        router.push("/queue");
      }
    },
    [
      selectedServices,
      services,
      queueEntries.length,
      prefill?.fromAppointmentId,
      selectedStylist,
      preferredStylist,
      employees,
      router,
    ]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (selectedServices.length > 0 && !loading) {
          formRef.current?.requestSubmit();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedServices, loading]);

  useEffect(() => {
    setSelectedServices(validPrefillServiceIds);
    setPreferredStylist(prefillEmployeeId);
    setSelectedStylist(prefillEmployeeId);
    setPrefill(prefilledCustomer);
  }, [
    prefilledCustomer?.customerId,
    prefilledCustomer?.name,
    prefilledCustomer?.phone,
    prefilledCustomer?.fromAppointmentId,
    validPrefillServiceIds.join(","),
    prefillEmployeeId,
    prefilledCustomer,
  ]);

  useEffect(() => {
    try {
      if (validPrefillServiceIds.length > 0 || prefilledCustomer?.customerId) {
        return;
      }
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draft && !prefilledCustomer?.customerId) {
        const parsed = JSON.parse(draft) as {
          selectedServices?: string[];
          preferredStylist?: string;
        };
        if (parsed.selectedServices?.length) {
          setSelectedServices(parsed.selectedServices);
        }
        if (parsed.preferredStylist) {
          setPreferredStylist(parsed.preferredStylist);
        }
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, [prefilledCustomer?.customerId, validPrefillServiceIds.length]);

  function handleSaveDraft() {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ selectedServices, preferredStylist })
    );
  }

  function handleCancel() {
    setSelectedServices([]);
    setPreferredStylist("");
    setSelectedStylist("");
    setError("");
    setPrefill({ customerId: "", name: "", phone: "" });
    formRef.current?.reset();
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  function handleCheckInAndStart() {
    startNowRef.current = true;
    formRef.current?.requestSubmit();
  }

  function handleSelectRecent(customer: RecentCustomerItem) {
    setPrefill({
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone ?? "",
    });
  }

  const trustItems = [
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "Customer data encrypted and protected",
    },
    {
      icon: Radio,
      title: "Real-time Queue",
      desc: "Instant updates across all devices",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      desc: "Alerts when your turn is near",
    },
  ];

  return (
    <div className="space-y-5 pb-24 sm:space-y-6">
      <CheckInHeader
        recentCustomers={recentCustomers}
        onSelectRecent={handleSelectRecent}
        queueCount={queueEntries.length}
        selectedServicesCount={selectedServices.length}
      />

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-[20px] border border-emerald-200/60 bg-emerald-50/90 p-4 shadow-sm backdrop-blur-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-2 ring-emerald-200/60">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-800">
                Customer checked in successfully!
              </p>
              <p className="text-sm text-emerald-700">
                Queue position #{success.position}
              </p>
            </div>
            {showUndo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl text-emerald-700 hover:bg-emerald-100/80"
                onClick={() => {
                  setSuccess(null);
                  setShowUndo(false);
                }}
              >
                <Undo2 className="h-4 w-4" />
                Dismiss
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] xl:gap-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <CustomerInfoCard
            key={`${prefill?.customerId}-${prefill?.name}`}
            defaultCustomerId={prefill?.customerId}
            defaultName={prefill?.name}
            defaultPhone={prefill?.phone}
            preferredStylist={preferredStylist}
            onPreferredStylistChange={setPreferredStylist}
            stylists={employees}
          />

          <ServiceSelection
            services={services}
            selectedIds={selectedServices}
            onToggle={toggleService}
          />

          <StylistSelection
            employees={employees}
            services={services}
            selectedServiceIds={selectedServices}
            selectedStylistId={selectedStylist}
            onSelect={setSelectedStylist}
          />

          {selectedServices.length > 0 && (
            <div className="lg:hidden">
              <EstimatedBillCard
                services={services}
                selectedIds={selectedServices}
              />
            </div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-red-200/60 bg-red-50/90 px-4 py-3 text-sm text-red-600 backdrop-blur-sm"
            >
              {error}
            </motion.p>
          )}

          <CheckInActionBar
            loading={loading}
            canSubmit={selectedServices.length > 0}
            onCancel={handleCancel}
            onSaveDraft={handleSaveDraft}
            onCheckInAndStart={handleCheckInAndStart}
          />
        </form>

        <aside className="space-y-4">
          {selectedServices.length > 0 && (
            <div className="hidden lg:block">
              <EstimatedBillCard
                services={services}
                selectedIds={selectedServices}
              />
            </div>
          )}
          <QueueDashboard
            queueEntries={queueEntries}
            completedEntries={completedEntries}
            estimatedWait={localEstimatedWait}
            billingStats={billingStats}
            employeeCount={employees.length}
          />
        </aside>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {trustItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="flex items-center gap-3 rounded-[20px] border border-dashboard-border/40 bg-dashboard-card/80 p-4 shadow-sm backdrop-blur-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-dashboard-primary">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-dashboard-text">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs text-dashboard-muted">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
