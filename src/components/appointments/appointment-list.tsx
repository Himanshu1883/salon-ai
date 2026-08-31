"use client";

import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import {
  Check,
  FileText,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteAppointment,
  updateAppointmentStatus,
} from "@/actions/appointments";
import { sendManualSms } from "@/actions/sms";
import { useAppointmentRecordSale } from "@/components/appointments/use-appointment-record-sale";
import { AppointmentReachedButton } from "@/components/appointments/appointment-reached-button";
import { collectVisitGroupAppointments } from "@/lib/appointments/check-in-prefill";
import {
  getAppointmentServiceItems,
  getServiceItemStatusLabel,
  groupAppointmentsByVisit,
  visitStaffCount,
  visitTotalPrice,
} from "@/lib/appointments/service-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "./types";
import {
  formatAppointmentTime,
  getInitials,
  getStatusLabel,
} from "./appointments-utils";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useMemo, useState } from "react";

function itemStatusVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "cancelled" || status === "no_show") {
    return "destructive" as const;
  }
  if (status === "in_progress" || status === "checked_in") {
    return "warning" as const;
  }
  return "default" as const;
}

export function AppointmentList({
  appointments,
  allAppointments,
  onRefresh,
  onCheckedIn,
  onCheckInError,
  onOpen,
}: {
  appointments: Appointment[];
  allAppointments?: Appointment[];
  onRefresh: () => void;
  onCheckedIn?: (appointmentIds: string[]) => void;
  onCheckInError?: (appointmentIds: string[]) => void;
  onOpen?: (appointment: Appointment) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { openAppointmentSale } = useAppointmentRecordSale();
  const source =
    allAppointments && allAppointments.length > 0
      ? allAppointments
      : appointments;
  const visits = useMemo(
    () => groupAppointmentsByVisit(appointments),
    [appointments]
  );

  async function handleStatus(id: string, status: string) {
    setLoading(true);
    await updateAppointmentStatus(id, status);
    setLoading(false);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this appointment?")) return;
    setLoading(true);
    await deleteAppointment(id);
    setLoading(false);
    onRefresh();
  }

  function handleInvoice(apt: Appointment) {
    openAppointmentSale(apt, source, { onRefresh });
  }

  async function handleSms(apt: Appointment) {
    if (!apt.customer.phone) {
      alert("Customer has no phone number");
      return;
    }
    const items = getAppointmentServiceItems(apt, source);
    const serviceLabel = items.map((item) => item.service.name).join(", ");
    setLoading(true);
    const formData = new FormData();
    formData.set("recipientPhone", apt.customer.phone);
    formData.set("recipientName", apt.customer.name);
    formData.set(
      "message",
      `Hi ${apt.customer.name}! Reminder: your ${serviceLabel} appointment is on ${formatAppointmentDateTime(apt.scheduledAt, "EEE, MMM d · h:mm a")}.`
    );
    formData.set("appointmentId", apt.id);
    const result = await sendManualSms(formData);
    setLoading(false);
    alert(
      result.error ??
        ("success" in result && result.success
          ? result.demoMode
            ? "SMS logged (demo mode)"
            : "SMS sent"
          : "Done")
    );
    onRefresh();
  }

  if (visits.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[#6B7280]">
        No appointments found
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {visits.map((apt) => {
        const items = getAppointmentServiceItems(apt, source);
        const staffCount = visitStaffCount(apt, source);
        const total = visitTotalPrice(apt, source);
        const serviceCount = items.length;

        return (
          <div
            key={apt.id}
            className="group rounded-2xl bg-[#F7F8FC] p-4 transition-all hover:bg-white hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => onOpen?.(apt)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-xs font-bold text-white">
                  {getInitials(apt.customer.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1C103D]">
                    {apt.customer.name}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    {formatAppointmentDateTime(apt.scheduledAt, "h:mm a")}
                    {" · "}
                    {serviceCount} {serviceCount === 1 ? "Service" : "Services"}
                    {" · "}
                    {staffCount} {staffCount === 1 ? "Staff" : "Staff"}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {formatAppointmentDateTime(apt.scheduledAt, "EEE, MMM d")} ·{" "}
                    {formatAppointmentTime(apt)}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    apt.status === "completed"
                      ? "success"
                      : apt.status === "cancelled"
                        ? "destructive"
                        : apt.status === "checked_in"
                          ? "warning"
                          : "default"
                  }
                >
                  {getStatusLabel(apt.status)}
                </Badge>
                {apt.status === "completed" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={loading}
                    title="Create invoice"
                    className="rounded-xl"
                    onClick={() => handleInvoice(apt)}
                  >
                    <FileText className="h-4 w-4 text-[#6C3BFF]" />
                  </Button>
                )}
                {apt.status === "scheduled" && apt.customer.phone && (
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={loading}
                    title="Send SMS reminder"
                    className="rounded-xl"
                    onClick={() => handleSms(apt)}
                  >
                    <MessageSquare className="h-4 w-4 text-[#6C3BFF]" />
                  </Button>
                )}
                {apt.status === "scheduled" && (
                  <>
                    <AppointmentReachedButton
                      appointment={apt}
                      visitAppointmentIds={collectVisitGroupAppointments(
                        apt,
                        source
                      ).map((item) => item.id)}
                      onCheckedIn={onCheckedIn}
                      onCheckInError={onCheckInError}
                      onSuccess={onRefresh}
                      variant="button"
                      className="h-9 px-3 text-xs"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={loading}
                      className="rounded-xl"
                      onClick={() => handleStatus(apt.id, "completed")}
                    >
                      <Check className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={loading}
                      className="rounded-xl"
                      onClick={() => handleStatus(apt.id, "cancelled")}
                    >
                      <X className="h-4 w-4 text-amber-600" />
                    </Button>
                  </>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={loading}
                  className={cn("rounded-xl opacity-0 group-hover:opacity-100")}
                  onClick={() => handleDelete(apt.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            {serviceCount > 0 && (
              <div className="mt-3 space-y-2 border-t border-[#E8ECF4] pt-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#1C103D]">
                        {item.service.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {item.employee?.name ?? "Unassigned"}
                        {" · "}
                        {formatAppointmentDateTime(item.scheduledAt, "h:mm a")}
                        {" · "}
                        {formatCurrency(item.price || 0)}
                      </p>
                    </div>
                    <Badge variant={itemStatusVariant(item.status)}>
                      {getServiceItemStatusLabel(item.status)}
                    </Badge>
                  </div>
                ))}
                <p className="pt-1 text-sm font-semibold text-[#1C103D]">
                  Total: {formatCurrency(total)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
