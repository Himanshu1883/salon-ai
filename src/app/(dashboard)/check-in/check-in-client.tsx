"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Undo2 } from "lucide-react";
import { checkInCustomer } from "@/actions/queue";
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
  prefilledCustomer?: PrefilledCustomer;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [queueEntries, setQueueEntries] = useState(queueEntriesProp);
  const [completedEntries, setCompletedEntries] = useState(completedEntriesProp);
  const [localEstimatedWait, setLocalEstimatedWait] = useState(estimatedWait);

  useEffect(() => {
    setQueueEntries(queueEntriesProp);
    setCompletedEntries(completedEntriesProp);
    setLocalEstimatedWait(estimatedWait);
  }, [queueEntriesProp, completedEntriesProp, estimatedWait]);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [preferredStylist, setPreferredStylist] = useState("");
  const [selectedStylist, setSelectedStylist] = useState("");
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

      setQueueEntries((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          position: nextPosition,
          status: "waiting",
          checkedInAt: new Date(),
          customer: { name: customerName, phone: customerPhone },
          employee: null,
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
    },
    [selectedServices, services, queueEntries.length]
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
    try {
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
  }, [prefilledCustomer?.customerId]);

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
    formRef.current?.requestSubmit();
  }

  function handleSelectRecent(customer: RecentCustomerItem) {
    setPrefill({
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone ?? "",
    });
  }

  return (
    <div className="-mx-4 min-h-[calc(100vh-8rem)] bg-[#F7F8FC] px-4 pb-24 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="space-y-6 py-2">
        <CheckInHeader
          recentCustomers={recentCustomers}
          onSelectRecent={handleSelectRecent}
          queueCount={queueEntries.length}
        />

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
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
                  className="text-emerald-700 hover:bg-emerald-100"
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

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
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

        <div className="grid gap-4 border-t border-[#E8ECF4] pt-6 sm:grid-cols-3">
          {[
            {
              title: "Secure & Private",
              desc: "Customer data encrypted and protected",
            },
            {
              title: "Real-time Queue",
              desc: "Instant updates across all devices",
            },
            {
              title: "Smart Notifications",
              desc: "Alerts when your turn is near",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-4 text-center shadow-sm"
            >
              <p className="text-sm font-semibold text-[#1C103D]">{item.title}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
