"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  ArrowRight,
  Cake,
  CalendarSync,
  Clock,
  Crown,
  DollarSign,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment, Employee } from "./types";
import {
  computeTodayAnalytics,
  countAvailableSlotsToday,
  formatAppointmentTime,
  getInitials,
  getStatusColor,
} from "./appointments-utils";
import { cn } from "@/lib/utils";
import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import { usePlan } from "@/components/plans/plan-provider";

type AppointmentsSidebarProps = {
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  /** Full today's list for analytics; schedule lists exclude queue/completed. */
  analyticsAppointments?: Appointment[];
  employees: Employee[];
  weekStart: Date;
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
};

function SidebarSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[20px] border border-[#E8ECF4] bg-white p-4 shadow-[0_4px_24px_rgba(28,16,61,0.05)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1C103D]">{title}</h3>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

function PlaceholderLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-[#F7F8FC] p-3 transition-all hover:bg-[#EDE9FE] hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6C3BFF] shadow-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#1C103D]">{label}</p>
        <p className="text-xs text-[#6B7280]">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
    </Link>
  );
}

function MiniCalendar({
  weekStart,
  selectedDay,
  onSelectDay,
}: {
  weekStart: Date;
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDay));

  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(addDays(monthStart, 34), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          className="rounded-lg px-2 py-1 text-xs text-[#6B7280] hover:bg-[#F7F8FC]"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-[#1C103D]">
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="rounded-lg px-2 py-1 text-xs text-[#6B7280] hover:bg-[#F7F8FC]"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#9CA3AF]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const selected = isSameDay(day, selectedDay);
          const today = isToday(day);
          const inWeek = day >= weekStart && day <= addDays(weekStart, 6);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-lg text-xs transition-all",
                !inMonth && "text-[#D1D5DB]",
                inMonth && "text-[#374151] hover:bg-[#F7F8FC]",
                inWeek && inMonth && "bg-[#EDE9FE]/50",
                selected && "bg-[#6C3BFF] font-semibold text-white shadow-sm",
                today && !selected && "font-bold text-[#FF2D6F]"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AppointmentsSidebar({
  todayAppointments,
  upcomingAppointments,
  analyticsAppointments,
  employees,
  weekStart,
  selectedDay,
  onSelectDay,
  onAppointmentClick,
}: AppointmentsSidebarProps) {
  const { isEnterprise } = usePlan();
  const analyticsSource = analyticsAppointments ?? todayAppointments;
  const analytics = computeTodayAnalytics(analyticsSource, employees);
  const availableSlots = countAvailableSlotsToday(todayAppointments, new Date());
  const upcomingSlice = upcomingAppointments.slice(0, 4);

  return (
    <aside className="hidden w-[320px] shrink-0 space-y-4 xl:block">
      <SidebarSection title="Today's Schedule">
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No appointments today</p>
        ) : (
          <div className="space-y-2">
            {todayAppointments.slice(0, 5).map((apt) => (
              <button
                key={apt.id}
                type="button"
                onClick={() => onAppointmentClick(apt)}
                className="flex w-full items-center gap-3 rounded-xl bg-[#F7F8FC] p-2.5 text-left transition-all hover:bg-white hover:shadow-sm"
              >
                <div
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    getStatusColor(apt.status)
                  )}
                />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-[10px] font-bold text-white">
                  {getInitials(apt.customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {apt.customer.name}
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {formatAppointmentDateTime(apt.scheduledAt, "h:mm a")} ·{" "}
                    {apt.service.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection
        title="Upcoming"
        action={
          <Link
            href="/sales/appointments"
            className="text-xs font-medium text-[#6C3BFF] hover:underline"
          >
            View all
          </Link>
        }
      >
        {upcomingSlice.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Nothing upcoming</p>
        ) : (
          <div className="space-y-2">
            {upcomingSlice.map((apt) => (
              <button
                key={apt.id}
                type="button"
                onClick={() => onAppointmentClick(apt)}
                className="flex w-full items-start gap-2 rounded-xl p-2 text-left hover:bg-[#F7F8FC]"
              >
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6C3BFF]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {apt.customer.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatAppointmentDateTime(apt.scheduledAt, "MMM d · h:mm a")}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {formatAppointmentTime(apt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title="Quick links">
        <div className="space-y-2">
          {isEnterprise && (
            <PlaceholderLink
              href="/check-in"
              label="Walk-ins"
              description="Check in a new walk-in client"
              icon={<UserCheck className="h-4 w-4" />}
            />
          )}
          <PlaceholderLink
            href="/queue"
            label="Waiting clients"
            description="View the live service queue"
            icon={<Users className="h-4 w-4" />}
          />
          <PlaceholderLink
            href="/customers"
            label="VIP clients"
            description="Manage high-value customers"
            icon={<Crown className="h-4 w-4" />}
          />
          <PlaceholderLink
            href="/customers"
            label="Birthday clients"
            description="Send birthday offers"
            icon={<Cake className="h-4 w-4" />}
          />
        </div>
      </SidebarSection>

      <SidebarSection title="Mini calendar">
        <MiniCalendar
          weekStart={weekStart}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
        />
        <Button
          variant="outline"
          asChild
          className="mt-3 w-full rounded-xl border-[#E8ECF4]"
        >
          <Link href="/schedule/ai">
            <CalendarSync className="h-4 w-4" />
            Sync Calendar
          </Link>
        </Button>
      </SidebarSection>

      <SidebarSection title="AI suggestions">
        <div className="rounded-xl bg-gradient-to-br from-[#EDE9FE] to-[#FCE7F3] p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#6C3BFF]" />
            <div>
              <p className="text-sm font-medium text-[#1C103D]">
                {analytics.pending > 0
                  ? `${analytics.pending} pending bookings today`
                  : "Schedule looks optimized for today"}
              </p>
              <Link
                href="/schedule/ai"
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#6C3BFF] hover:underline"
              >
                View AI suggestions
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </SidebarSection>

      <SidebarSection title="Insights">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-[#F7F8FC] p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-[#6B7280]">Revenue opportunity</span>
            </div>
            <span className="text-sm font-semibold text-[#1C103D]">
              ${analytics.pending * 85}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#F7F8FC] p-3">
            <span className="text-sm text-[#6B7280]">Idle staff</span>
            <span className="text-sm font-semibold text-[#1C103D]">
              {analytics.idleStaff.length} / {employees.length}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#F7F8FC] p-3">
            <span className="text-sm text-[#6B7280]">Available slots</span>
            <span className="text-sm font-semibold text-[#6C3BFF]">
              {availableSlots} today
            </span>
          </div>
        </div>
      </SidebarSection>
    </aside>
  );
}
