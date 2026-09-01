"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AppointmentsWeekCalendar,
  slotToDatetimeLocal,
} from "@/components/appointments/appointments-week-calendar";
import { AppointmentDetailDialog } from "@/components/appointments/appointment-detail-dialog";
import { AppointmentsHeader } from "@/components/appointments/appointments-header";
import {
  AppointmentsFilterBar,
  AppointmentsViewSwitcher,
  getWeekRangeLabel,
} from "@/components/appointments/appointments-filter-bar";
import { AppointmentsSidebar } from "@/components/appointments/appointments-sidebar";
import { AppointmentsAnalytics } from "@/components/appointments/appointments-analytics";
import { AppointmentList } from "@/components/appointments/appointment-list";
import type {
  Appointment,
  Employee,
  PrefilledCustomer,
  Service,
} from "@/components/appointments/types";
import { DEFAULT_OPENING_HOURS, type OpeningHours } from "@/lib/onboarding";
import {
  filterAppointments,
  type ViewMode,
} from "@/components/appointments/appointments-utils";
import type { AppointmentsPagePayload } from "@/lib/appointments/page-types";
import {
  addDaysToKey,
  dateFromKey,
  resolveAppointmentsRangeStart,
} from "@/lib/appointments/page-windows";
import { getBusinessDateKey } from "@/lib/attendance/business-day";

type AppointmentsPagePart = "bootstrap" | "week" | "upcoming";

async function fetchAppointmentsPart(
  part: AppointmentsPagePart,
  weekStartIso: string,
  signal?: AbortSignal
): Promise<AppointmentsPagePayload> {
  const params = new URLSearchParams({
    part,
    weekStart: weekStartIso,
  });
  const response = await fetch(`/api/sales/appointments?${params}`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new Error("Failed to load appointments");
  }
  return response.json();
}

function CalendarLoadingSkeleton() {
  return (
    <div className="h-[360px] animate-pulse rounded-[20px] border border-[#E8ECF4] bg-white p-4 sm:h-[520px]">
      <div className="mb-4 h-8 w-48 rounded-lg bg-[#E8ECF4]" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-[#E8ECF4]" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-[#F7F8FC]" />
        ))}
      </div>
    </div>
  );
}

export function AppointmentsClient({
  weekStartIso,
  prefilledCustomer,
  autoOpenCreate = false,
}: {
  weekStartIso: string;
  prefilledCustomer?: PrefilledCustomer;
  autoOpenCreate?: boolean;
}) {
  const router = useRouter();
  const weekStart = dateFromKey(weekStartIso);
  const weekEnd = dateFromKey(addDaysToKey(weekStartIso, 6));

  const [weekAppointments, setWeekAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(
    []
  );
  const [calendarWeekAppointments, setCalendarWeekAppointments] = useState<
    Appointment[]
  >([]);
  const [calendarTodayAppointments, setCalendarTodayAppointments] = useState<
    Appointment[]
  >([]);
  const [calendarUpcomingAppointments, setCalendarUpcomingAppointments] =
    useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openingHours, setOpeningHours] =
    useState<OpeningHours>(DEFAULT_OPENING_HOURS);
  const [canAddService, setCanAddService] = useState(false);
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const [weekReady, setWeekReady] = useState(false);

  const [view, setView] = useState<ViewMode>("week");
  const [open, setOpen] = useState(false);
  const [defaultScheduledAt, setDefaultScheduledAt] = useState<string>();
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => dateFromKey(weekStartIso));
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [removedAppointmentIds, setRemovedAppointmentIds] = useState<
    Set<string>
  >(() => new Set());

  const applyPayload = useCallback(
    (part: AppointmentsPagePart, payload: AppointmentsPagePayload) => {
      setCanAddService(payload.canAddService);
      if (part === "bootstrap") {
        setTodayAppointments(payload.todayAppointments);
        setCalendarTodayAppointments(payload.calendarTodayAppointments);
        setServices(payload.services);
        setEmployees(payload.employees);
        setOpeningHours(payload.openingHours);
        setBootstrapReady(true);
      }
      if (part === "week") {
        setWeekAppointments(payload.weekAppointments);
        setCalendarWeekAppointments(payload.calendarWeekAppointments);
        setWeekReady(true);
      }
      if (part === "upcoming") {
        setUpcomingAppointments(payload.upcomingAppointments);
        setCalendarUpcomingAppointments(payload.calendarUpcomingAppointments);
      }
    },
    []
  );

  const loadPart = useCallback(
    async (
      part: AppointmentsPagePart,
      weekStartValue: string,
      signal?: AbortSignal
    ) => {
      const payload = await fetchAppointmentsPart(part, weekStartValue, signal);
      applyPayload(part, payload);
    },
    [applyPayload]
  );

  const reloadAll = useCallback(async () => {
    setRemovedAppointmentIds(new Set());
    await Promise.all([
      loadPart("bootstrap", weekStartIso),
      loadPart("week", weekStartIso),
      loadPart("upcoming", weekStartIso),
    ]);
  }, [loadPart, weekStartIso]);

  useEffect(() => {
    void fetch("/api/appointments/check-in", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        await loadPart("bootstrap", weekStartIso, controller.signal);
      } catch {
        if (!controller.signal.aborted) setBootstrapReady(true);
      }
      try {
        await loadPart("upcoming", weekStartIso, controller.signal);
      } catch {
        /* upcoming is secondary */
      }
    })();
    return () => controller.abort();
  }, [loadPart, weekStartIso]);

  useEffect(() => {
    const controller = new AbortController();
    setWeekReady(false);
    void loadPart("week", weekStartIso, controller.signal).catch(() => {
      if (!controller.signal.aborted) setWeekReady(true);
    });
    return () => controller.abort();
  }, [loadPart, weekStartIso]);

  useEffect(() => {
    setSelectedDay(dateFromKey(weekStartIso));
  }, [weekStartIso]);

  const visibleWeekAppointments = useMemo(
    () =>
      weekAppointments.filter((apt) => !removedAppointmentIds.has(apt.id)),
    [weekAppointments, removedAppointmentIds]
  );
  const visibleTodayAppointments = useMemo(
    () =>
      todayAppointments.filter((apt) => !removedAppointmentIds.has(apt.id)),
    [todayAppointments, removedAppointmentIds]
  );
  const visibleUpcomingAppointments = useMemo(
    () =>
      upcomingAppointments.filter((apt) => !removedAppointmentIds.has(apt.id)),
    [upcomingAppointments, removedAppointmentIds]
  );

  const existingAppointments = useMemo(() => {
    const byId = new Map<string, Appointment>();
    for (const apt of [
      ...visibleWeekAppointments,
      ...visibleTodayAppointments,
      ...visibleUpcomingAppointments,
    ]) {
      byId.set(apt.id, apt);
    }
    return [...byId.values()];
  }, [
    visibleWeekAppointments,
    visibleTodayAppointments,
    visibleUpcomingAppointments,
  ]);

  function removeAppointmentsFromSchedule(ids: string[]) {
    setRemovedAppointmentIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
    setDetailOpen(false);
    setDetailAppointment(null);
  }

  function restoreAppointmentsOnSchedule(ids: string[]) {
    setRemovedAppointmentIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }

  function handleSuccess() {
    setOpen(false);
    setDefaultScheduledAt(undefined);
    void reloadAll();
  }

  function navigateWeek(offset: number) {
    const nextKey = resolveAppointmentsRangeStart(
      addDaysToKey(weekStartIso, offset * 7)
    );
    setSelectedDay(dateFromKey(nextKey));
    router.push(`/sales/appointments?weekStart=${nextKey}`);
  }

  function goToToday() {
    const todayKey = getBusinessDateKey();
    setSelectedDay(dateFromKey(todayKey));
    router.push(`/sales/appointments?weekStart=${todayKey}`);
  }

  function handleDateChange(value: string) {
    if (!value) return;
    const nextKey = resolveAppointmentsRangeStart(value);
    setSelectedDay(dateFromKey(nextKey));
    router.push(`/sales/appointments?weekStart=${nextKey}`);
  }

  function openCreateAt(day: Date, hour: number, minute: number) {
    setDefaultScheduledAt(slotToDatetimeLocal(day, hour, minute));
    setOpen(true);
  }

  function openAppointmentDetail(appointment: Appointment) {
    setDetailAppointment(appointment);
    setDetailOpen(true);
  }

  function handleSidebarDaySelect(day: Date) {
    setSelectedDay(day);
    setView("day");
    const nextKey = resolveAppointmentsRangeStart(format(day, "yyyy-MM-dd"));
    if (nextKey !== weekStartIso) {
      router.push(`/sales/appointments?weekStart=${nextKey}`);
    }
  }

  const scheduleWeekAppointments = useMemo(
    () =>
      calendarWeekAppointments.filter(
        (apt) => !removedAppointmentIds.has(apt.id)
      ),
    [calendarWeekAppointments, removedAppointmentIds]
  );
  const scheduleTodayAppointments = useMemo(
    () =>
      calendarTodayAppointments.filter(
        (apt) => !removedAppointmentIds.has(apt.id)
      ),
    [calendarTodayAppointments, removedAppointmentIds]
  );
  const scheduleUpcomingAppointments = useMemo(
    () =>
      calendarUpcomingAppointments.filter(
        (apt) => !removedAppointmentIds.has(apt.id)
      ),
    [calendarUpcomingAppointments, removedAppointmentIds]
  );

  const filterOptions = {
    employeeFilter,
    serviceFilter,
    statusFilter,
    searchQuery,
    services,
  };

  const filteredWeekAppointments = useMemo(
    () => filterAppointments(scheduleWeekAppointments, filterOptions),
    [scheduleWeekAppointments, employeeFilter, serviceFilter, statusFilter, searchQuery, services]
  );

  const filteredTodayAppointments = useMemo(
    () => filterAppointments(scheduleTodayAppointments, filterOptions),
    [scheduleTodayAppointments, employeeFilter, serviceFilter, statusFilter, searchQuery, services]
  );

  const filteredUpcomingAppointments = useMemo(
    () => filterAppointments(scheduleUpcomingAppointments, filterOptions),
    [scheduleUpcomingAppointments, employeeFilter, serviceFilter, statusFilter, searchQuery, services]
  );

  const weekRangeLabel =
    view === "day"
      ? format(selectedDay, "EEEE, MMM d, yyyy")
      : getWeekRangeLabel(weekStart, weekEnd);

  return (
    <div className="-mx-4 space-y-3 bg-[#F7F8FC] px-4 py-2 sm:-mx-6 sm:space-y-6 sm:px-6 lg:-mx-8 lg:px-8">
      <AppointmentsHeader
        open={open}
        onOpenChange={setOpen}
        services={services}
        employees={employees}
        openingHours={openingHours}
        existingAppointments={existingAppointments}
        prefilledCustomer={prefilledCustomer}
        defaultScheduledAt={defaultScheduledAt}
        onSuccess={handleSuccess}
      />

      <AppointmentsFilterBar
        employees={employees}
        services={services}
        employeeFilter={employeeFilter}
        serviceFilter={serviceFilter}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        selectedDate={format(selectedDay, "yyyy-MM-dd")}
        onEmployeeFilterChange={setEmployeeFilter}
        onServiceFilterChange={setServiceFilter}
        onStatusFilterChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onDateChange={handleDateChange}
        onToday={goToToday}
        onWeekChange={navigateWeek}
        weekRangeLabel={weekRangeLabel}
      />

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          <AppointmentsViewSwitcher
            view={view}
            onChange={setView}
            listBadge={scheduleTodayAppointments.length + scheduleUpcomingAppointments.length}
          />

          {(view === "week" || view === "day") && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {weekReady ? (
                <AppointmentsWeekCalendar
                  weekStart={weekStart}
                  appointments={filteredWeekAppointments}
                  employees={employees}
                  openingHours={openingHours}
                  viewMode={view}
                  selectedDay={selectedDay}
                  onSelectDay={(day) => {
                    setSelectedDay(day);
                    if (window.matchMedia("(min-width: 768px)").matches) {
                      setView("day");
                    }
                  }}
                  onSlotClick={openCreateAt}
                  onAppointmentClick={openAppointmentDetail}
                  onRefresh={() => void reloadAll()}
                />
              ) : (
                <CalendarLoadingSkeleton />
              )}
            </motion.div>
          )}

          {view === "list" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid gap-4 sm:gap-6 lg:grid-cols-2"
            >
              <div className="rounded-[20px] border border-[#E8ECF4] bg-white p-4 shadow-[0_4px_24px_rgba(28,16,61,0.05)] sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1C103D]">Today</h2>
                  <span className="rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-xs font-semibold text-[#6C3BFF]">
                    {filteredTodayAppointments.length}
                  </span>
                </div>
                <AppointmentList
                  appointments={filteredTodayAppointments}
                  allAppointments={existingAppointments}
                  onRefresh={() => void reloadAll()}
                  onCheckedIn={removeAppointmentsFromSchedule}
                  onCheckInError={restoreAppointmentsOnSchedule}
                  onOpen={openAppointmentDetail}
                />
              </div>
              <div className="rounded-[20px] border border-[#E8ECF4] bg-white p-4 shadow-[0_4px_24px_rgba(28,16,61,0.05)] sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1C103D]">
                    Upcoming (30 days)
                  </h2>
                  <span className="rounded-full bg-[#F7F8FC] px-2.5 py-0.5 text-xs font-semibold text-[#6B7280]">
                    {filteredUpcomingAppointments.length}
                  </span>
                </div>
                <AppointmentList
                  appointments={filteredUpcomingAppointments}
                  allAppointments={existingAppointments}
                  onRefresh={() => void reloadAll()}
                  onCheckedIn={removeAppointmentsFromSchedule}
                  onCheckInError={restoreAppointmentsOnSchedule}
                  onOpen={openAppointmentDetail}
                />
              </div>
            </motion.div>
          )}
        </div>

        <AppointmentsSidebar
          todayAppointments={scheduleTodayAppointments}
          upcomingAppointments={scheduleUpcomingAppointments}
          analyticsAppointments={visibleTodayAppointments}
          employees={employees}
          weekStart={weekStart}
          selectedDay={selectedDay}
          onSelectDay={handleSidebarDaySelect}
          onAppointmentClick={openAppointmentDetail}
        />
      </div>

      <AppointmentsAnalytics
        todayAppointments={visibleTodayAppointments}
        employees={employees}
      />

      <AppointmentDetailDialog
        appointment={detailAppointment}
        allAppointments={existingAppointments}
        services={services}
        employees={employees}
        canAddService={canAddService}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRefresh={() => void reloadAll()}
        onCheckedIn={removeAppointmentsFromSchedule}
        onCheckInError={restoreAppointmentsOnSchedule}
      />
    </div>
  );
}
