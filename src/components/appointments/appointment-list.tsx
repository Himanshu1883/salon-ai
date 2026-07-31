"use client";

import { useRouter } from "next/navigation";
import { format as formatDate } from "date-fns";
import {
  Check,
  FileText,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import {
  createInvoiceFromAppointment,
} from "@/actions/billing";
import {
  deleteAppointment,
  updateAppointmentStatus,
} from "@/actions/appointments";
import { sendManualSms } from "@/actions/sms";
import { AppointmentReachedButton } from "@/components/appointments/appointment-reached-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "./types";
import {
  formatAppointmentTime,
  getInitials,
  getStatusLabel,
} from "./appointments-utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function AppointmentList({
  appointments,
  onRefresh,
}: {
  appointments: Appointment[];
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  async function handleInvoice(id: string) {
    setLoading(true);
    const result = await createInvoiceFromAppointment(id);
    setLoading(false);
    if (result.error && !result.id) {
      alert(result.error);
      return;
    }
    if (result.id) {
      router.push(`/billing/${result.id}`);
      return;
    }
    onRefresh();
  }

  async function handleSms(apt: Appointment) {
    if (!apt.customer.phone) {
      alert("Customer has no phone number");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("recipientPhone", apt.customer.phone);
    formData.set("recipientName", apt.customer.name);
    formData.set(
      "message",
      `Hi ${apt.customer.name}! Reminder: your ${apt.service.name} appointment is on ${formatDate(new Date(apt.scheduledAt), "EEE, MMM d · h:mm a")}.`
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

  if (appointments.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[#6B7280]">
        No appointments found
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F7F8FC] p-4 transition-all hover:bg-white hover:shadow-md"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-xs font-bold text-white">
              {getInitials(apt.customer.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#1C103D]">{apt.customer.name}</p>
              <p className="text-sm text-[#6B7280]">
                {apt.service.name}
                {apt.employee ? ` · ${apt.employee.name}` : ""}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {formatDate(new Date(apt.scheduledAt), "EEE, MMM d")} ·{" "}
                {formatAppointmentTime(apt)}
              </p>
            </div>
          </div>
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
                onClick={() => handleInvoice(apt.id)}
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
      ))}
    </div>
  );
}
