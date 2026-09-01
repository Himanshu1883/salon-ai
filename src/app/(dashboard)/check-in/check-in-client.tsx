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
import type { CheckInPrefill, CheckInService, RecentCustomerItem } from "@/components/check-in/types";
import type { CheckInOverview } from "@/lib/queue/overview-types";
import { Button } from "@/components/ui/button";

const EMPTY_EMPLOYEES: CheckInOverview["employees"] = [];

function seedStaffByService(
  serviceIds: string[],
  staffByService: Record<string, string> | undefined,
  fallbackEmployeeId: string,
  allowedEmployeeIds: Set<string>
): Record<string, string> {
  const fromQuery = Object.fromEntries(
    Object.entries(staffByService ?? {}).filter(([, id]) =>
      allowedEmployeeIds.has(id)
    )
  );
  if (Object.keys(fromQuery).length > 0) return fromQuery;
  if (!fallbackEmployeeId) return {};
  return Object.fromEntries(serviceIds.map((id) => [id, fallbackEmployeeId]));
}

export function CheckInClient({
  overview: initialOverview,
  prefilledCustomer,
}: {
  overview: CheckInOverview;
  prefilledCustomer?: CheckInPrefill;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const startNowRef = useRef(false);
  const router = useRouter();
  const [overview, setOverview] = useState(initialOverview);
  const [serviceCatalog, setServiceCatalog] = useState<CheckInService[]>(
    initialOverview.services ?? []
  );
  const services = serviceCatalog;
  const employees = overview?.employees ?? EMPTY_EMPLOYEES;
  const allowedEmployeeIds = useMemo(
    () => new Set(employees.map((employee) => employee.id)),
    [employees]
  );
  const recentCustomers = overview?.recentCustomers ?? [];
  const validPrefillServiceIds = useMemo(
    () => prefilledCustomer?.serviceIds ?? [],
    [prefilledCustomer?.serviceIds]
  );
  const prefillEmployeeId =
    prefilledCustomer?.employeeId &&
    employees.some((employee) => employee.id === prefilledCustomer.employeeId)
      ? prefilledCustomer.employeeId
      : "";

  useEffect(() => {
    setOverview(initialOverview);
  }, [initialOverview]);

  const [selectedServices, setSelectedServices] = useState<string[]>(
    validPrefillServiceIds
  );
  const [preferredStylist, setPreferredStylist] = useState(prefillEmployeeId);
  const [staffByService, setStaffByService] = useState<Record<string, string>>(
    () =>
      seedStaffByService(
        validPrefillServiceIds,
        prefilledCustomer?.staffByService,
        prefillEmployeeId,
        new Set(employees.map((employee) => employee.id))
      )
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ position: number } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [prefill, setPrefill] = useState(prefilledCustomer);

  function toggleService(id: string) {
    setSelectedServices((prev) => {
      const removing = prev.includes(id);
      if (removing) {
        setStaffByService((staff) => {
          const next = { ...staff };
          delete next[id];
          return next;
        });
        return prev.filter((s) => s !== id);
      }
      setStaffByService((staff) => {
        if (staff[id]) return staff;
        const fallback =
          preferredStylist ||
          Object.values(staff).find(Boolean) ||
          "";
        return fallback ? { ...staff, [id]: fallback } : staff;
      });
      return [...prev, id];
    });
  }

  function assignStaff(serviceId: string, employeeId: string) {
    setStaffByService((prev) => {
      if (!employeeId) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return { ...prev, [serviceId]: employeeId };
    });
  }

  function mergeServiceCatalog(items: CheckInService[]) {
    setServiceCatalog((prev) => {
      const map = new Map(prev.map((service) => [service.id, service]));
      for (const item of items) map.set(item.id, item);
      return [...map.values()];
    });
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
      for (const serviceId of selectedServices) {
        const staffId = staffByService[serviceId];
        if (staffId) formData.set(`staff_${serviceId}`, staffId);
      }
      const stylistId =
        selectedServices.map((id) => staffByService[id]).find(Boolean) ||
        preferredStylist;
      if (stylistId) formData.set("employeeId", stylistId);

      const result = await checkInCustomer(formData);
      setLoading(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      const nextPosition = (result.position ??
        (overview.dashboard?.activeCount ?? 0) + 1) as number;
      const started = Boolean(result.started);

      setSuccess({ position: nextPosition });
      setShowUndo(true);
      setSelectedServices([]);
      setPreferredStylist("");
      setStaffByService({});
      setPrefill({ customerId: "", name: "", phone: "" });
      formRef.current?.reset();
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      setTimeout(() => setShowUndo(false), 8000);

      try {
        const res = await fetch("/api/check-in/overview", { cache: "no-store" });
        if (res.ok) {
          setOverview((await res.json()) as CheckInOverview);
        }
      } catch {
        /* keep current overview until next load */
      }

      if (started) {
        router.push("/queue");
      }
    },
    [
      selectedServices,
      services,
      overview.dashboard?.activeCount,
      prefill?.fromAppointmentId,
      staffByService,
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
    setStaffByService(
      seedStaffByService(
        validPrefillServiceIds,
        prefilledCustomer?.staffByService,
        prefillEmployeeId,
        allowedEmployeeIds
      )
    );
    setPrefill(prefilledCustomer);
  }, [
    prefilledCustomer?.customerId,
    prefilledCustomer?.name,
    prefilledCustomer?.phone,
    prefilledCustomer?.fromAppointmentId,
    validPrefillServiceIds.join(","),
    prefillEmployeeId,
    allowedEmployeeIds,
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
          staffByService?: Record<string, string>;
        };
        if (parsed.selectedServices?.length) {
          setSelectedServices(parsed.selectedServices);
        }
        if (parsed.preferredStylist) {
          setPreferredStylist(parsed.preferredStylist);
        }
        if (parsed.staffByService) {
          setStaffByService(parsed.staffByService);
        }
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, [prefilledCustomer?.customerId, validPrefillServiceIds.length]);

  function handleSaveDraft() {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ selectedServices, preferredStylist, staffByService })
    );
  }

  function handleCancel() {
    setSelectedServices([]);
    setPreferredStylist("");
    setStaffByService({});
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
    <div className="space-y-4 pb-[7.5rem] sm:space-y-6 lg:pb-0">
      <CheckInHeader
        recentCustomers={recentCustomers}
        onSelectRecent={handleSelectRecent}
        queueCount={overview.dashboard?.activeCount ?? 0}
        selectedServicesCount={selectedServices.length}
      />

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-3 rounded-[20px] border border-emerald-200/60 bg-emerald-50/90 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-2 ring-emerald-200/60">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
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
                className="self-start rounded-xl text-emerald-700 hover:bg-emerald-100/80 sm:self-auto"
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

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6">
        <form
          id="check-in-form"
          ref={formRef}
          onSubmit={handleSubmit}
          className="min-w-0 space-y-4 sm:space-y-6"
        >
          <CustomerInfoCard
            key={`${prefill?.customerId}-${prefill?.name}`}
            defaultCustomerId={prefill?.customerId}
            defaultName={prefill?.name}
            defaultPhone={prefill?.phone}
            preferredStylist={preferredStylist}
            onPreferredStylistChange={(id) => {
              setPreferredStylist(id);
              if (!id) return;
              setStaffByService((prev) => {
                const next = { ...prev };
                for (const serviceId of selectedServices) {
                  if (!next[serviceId]) next[serviceId] = id;
                }
                return next;
              });
            }}
            stylists={employees}
          />

          <ServiceSelection
            selectedIds={selectedServices}
            onToggle={toggleService}
            onCatalogUpdate={mergeServiceCatalog}
          />

          <StylistSelection
            employees={employees}
            services={services}
            selectedServiceIds={selectedServices}
            staffByService={staffByService}
            onAssign={assignStaff}
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
        </form>

        <aside className="min-w-0 space-y-4">
          {selectedServices.length > 0 && (
            <div className="hidden lg:block">
              <EstimatedBillCard
                services={services}
                selectedIds={selectedServices}
              />
            </div>
          )}
          <QueueDashboard dashboard={overview.dashboard} />
        </aside>
      </div>

      <div className="hidden gap-3 sm:grid sm:grid-cols-3">
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

      <CheckInActionBar
        formId="check-in-form"
        loading={loading}
        canSubmit={selectedServices.length > 0}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onCheckInAndStart={handleCheckInAndStart}
      />
    </div>
  );
}
