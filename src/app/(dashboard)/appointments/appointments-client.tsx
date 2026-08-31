"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  addWeeks,
  format,
  startOfWeek,
} from "date-fns";
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
import type { OpeningHours } from "@/lib/onboarding";
import {
  filterAppointments,
  filterScheduleCalendarAppointments,
  type ViewMode,
} from "@/components/appointments/appointments-utils";

export function AppointmentsClient({
  weekAppointments,
  weekStartIso,
  todayAppointments,
  upcomingAppointments,
  services,
  employees,
  openingHours,
  prefilledCustomer,
  autoOpenCreate = false,
  includeCheckedInOnSchedule = false,
  canAddService = false,
}: {
  weekAppointments: Appointment[];
  weekStartIso: string;
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  services: Service[];
  employees: Employee[];
  openingHours: OpeningHours;
  prefilledCustomer?: PrefilledCustomer;
  autoOpenCreate?: boolean;
  includeCheckedInOnSchedule?: boolean;
  canAddService?: boolean;
}) {
  const router = useRouter();
  const weekStart = startOfWeek(new Date(weekStartIso), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const [view, setView] = useState<ViewMode>("week");
  const [open, setOpen] = useState(autoOpenCreate);
  const [defaultScheduledAt, setDefaultScheduledAt] = useState<string>();
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [removedAppointmentIds, setRemovedAppointmentIds] = useState<
    Set<string>
  >(() => new Set());

  useEffect(() => {
    void fetch("/api/appointments/check-in", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches && view === "week") {
        setView("day");
      }
    }
    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [view]);

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
    router.refresh();
  }

  function navigateWeek(offset: number) {
    const newStart = addWeeks(weekStart, offset);
    router.push(
      `/sales/appointments?weekStart=${format(newStart, "yyyy-MM-dd")}`
    );
  }

  function goToToday() {
    const today = new Date();
    setSelectedDay(today);
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    router.push(
      `/sales/appointments?weekStart=${format(thisWeekStart, "yyyy-MM-dd")}`
    );
  }

  function handleDateChange(value: string) {
    if (!value) return;
    const date = new Date(value + "T12:00:00");
    setSelectedDay(date);
    const newWeekStart = startOfWeek(date, { weekStartsOn: 1 });
    router.push(
      `/sales/appointments?weekStart=${format(newWeekStart, "yyyy-MM-dd")}`
    );
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
    const newWeekStart = startOfWeek(day, { weekStartsOn: 1 });
    if (format(newWeekStart, "yyyy-MM-dd") !== weekStartIso) {
      router.push(
        `/sales/appointments?weekStart=${format(newWeekStart, "yyyy-MM-dd")}`
      );
    }
  }

  const scheduleOptions = { includeCheckedIn: includeCheckedInOnSchedule };

  const scheduleWeekAppointments = useMemo(
    () =>
      filterScheduleCalendarAppointments(
        visibleWeekAppointments,
        scheduleOptions
      ),
    [visibleWeekAppointments, includeCheckedInOnSchedule]
  );
  const scheduleTodayAppointments = useMemo(
    () =>
      filterScheduleCalendarAppointments(
        visibleTodayAppointments,
        scheduleOptions
      ),
    [visibleTodayAppointments, includeCheckedInOnSchedule]
  );
  const scheduleUpcomingAppointments = useMemo(
    () =>
      filterScheduleCalendarAppointments(
        visibleUpcomingAppointments,
        scheduleOptions
      ),
    [visibleUpcomingAppointments, includeCheckedInOnSchedule]
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
    <div className="-mx-4 space-y-6 bg-[#F7F8FC] px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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
              <AppointmentsWeekCalendar
                weekStart={weekStart}
                appointments={filteredWeekAppointments}
                employees={employees}
                openingHours={openingHours}
                viewMode={view}
                selectedDay={selectedDay}
                onSelectDay={(day) => {
                  setSelectedDay(day);
                  setView("day");
                }}
                onSlotClick={openCreateAt}
                onAppointmentClick={openAppointmentDetail}
                onRefresh={() => router.refresh()}
              />
            </motion.div>
          )}

          {view === "list" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              <div className="rounded-[20px] border border-[#E8ECF4] bg-white p-6 shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1C103D]">Today</h2>
                  <span className="rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-xs font-semibold text-[#6C3BFF]">
                    {filteredTodayAppointments.length}
                  </span>
                </div>
                <AppointmentList
                  appointments={filteredTodayAppointments}
                  allAppointments={existingAppointments}
                  onRefresh={() => router.refresh()}
                  onCheckedIn={removeAppointmentsFromSchedule}
                  onCheckInError={restoreAppointmentsOnSchedule}
                  onOpen={openAppointmentDetail}
                />
              </div>
              <div className="rounded-[20px] border border-[#E8ECF4] bg-white p-6 shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
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
                  onRefresh={() => router.refresh()}
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
        onRefresh={() => router.refresh()}
        onCheckedIn={removeAppointmentsFromSchedule}
        onCheckInError={restoreAppointmentsOnSchedule}
      />
    </div>
  );
}
