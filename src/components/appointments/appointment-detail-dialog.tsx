"use client";

import { useEffect, useRef, useState } from "react";
import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import {
  updateAppointmentStatus,
  deleteAppointment,
} from "@/actions/appointments";
import { sendManualSms } from "@/actions/sms";
import { useAppointmentRecordSale } from "@/components/appointments/use-appointment-record-sale";
import { AppointmentReachedButton } from "@/components/appointments/appointment-reached-button";
import { requestAppointmentCheckIn } from "@/lib/appointments/check-in-from-schedule";
import { collectVisitGroupAppointments } from "@/lib/appointments/check-in-prefill";
import { stripVisitGroupMarker } from "@/lib/appointments/visit-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Trash2,
  MessageSquare,
  Clock,
  User,
  Scissors,
  LogIn,
  Receipt,
} from "lucide-react";
import type { Appointment } from "./types";
import { getStatusLabel } from "./appointments-utils";

function statusVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "cancelled") return "destructive" as const;
  if (status === "checked_in") return "warning" as const;
  return "default" as const;
}

export function AppointmentDetailDialog({
  appointment,
  allAppointments = [],
  open,
  onOpenChange,
  onRefresh,
  onCheckedIn,
  onCheckInError,
}: {
  appointment: Appointment | null;
  allAppointments?: Appointment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
  onCheckedIn?: (appointmentIds: string[]) => void;
  onCheckInError?: (appointmentIds: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const walkInInFlight = useRef(false);
  const { openAppointmentSale } = useAppointmentRecordSale();

  useEffect(() => {
    if (!open) return;
    void fetch("/api/appointments/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  }, [open]);

  if (!appointment) return null;
  const selectedAppointment = appointment;

  const visitAppointments = collectVisitGroupAppointments(
    selectedAppointment,
    allAppointments.length > 0 ? allAppointments : [selectedAppointment]
  );
  const visitAppointmentIds = visitAppointments.map((item) => item.id);
  const canWalkIn =
    selectedAppointment.status === "scheduled" ||
    selectedAppointment.status === "checked_in";

  async function handleWalkInCheckIn() {
    if (walkInInFlight.current) return;
    walkInInFlight.current = true;
    onCheckedIn?.(visitAppointmentIds);
    const result = await requestAppointmentCheckIn(selectedAppointment.id, {
      startNow: true,
    });
    walkInInFlight.current = false;
    if (result.error) {
      onCheckInError?.(visitAppointmentIds);
      alert(result.error);
    }
  }

  const start = new Date(selectedAppointment.scheduledAt);
  const visitEnd = visitAppointments.reduce((latest, item) => {
    const itemEnd = new Date(item.scheduledAt).getTime() + item.service.duration * 60_000;
    return itemEnd > latest ? itemEnd : latest;
  }, start.getTime() + selectedAppointment.service.duration * 60_000);
  const end = new Date(visitEnd);

  async function handleStatus(status: string) {
    setLoading(true);
    await updateAppointmentStatus(selectedAppointment.id, status);
    setLoading(false);
    onOpenChange(false);
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this appointment?")) return;
    setLoading(true);
    await deleteAppointment(selectedAppointment.id);
    setLoading(false);
    onOpenChange(false);
    onRefresh();
  }

  function handleInvoice() {
    openAppointmentSale(
      selectedAppointment,
      allAppointments.length > 0 ? allAppointments : [selectedAppointment],
      {
        onOpened: () => onOpenChange(false),
        onRefresh,
      }
    );
  }

  async function handleSms() {
    if (!selectedAppointment.customer.phone) {
      alert("Customer has no phone number");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("recipientPhone", selectedAppointment.customer.phone);
    formData.set("recipientName", selectedAppointment.customer.name);
    formData.set(
      "message",
      `Hi ${selectedAppointment.customer.name}! Reminder: your ${selectedAppointment.service.name} appointment is on ${formatAppointmentDateTime(start, "EEE, MMM d · h:mm a")}.`
    );
    formData.set("appointmentId", selectedAppointment.id);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-rose-600" />
            {appointment.customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>

          <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/50 p-4 text-sm">
            {visitAppointments.map((visitItem, index) => (
              <div
                key={visitItem.id}
                className={
                  index > 0 ? "border-t border-stone-200 pt-3" : undefined
                }
              >
                <div className="flex items-start gap-3">
                  <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <div>
                    <p className="font-medium text-stone-900">
                      {visitItem.service.name}
                    </p>
                    <p className="text-stone-500">
                      {visitItem.service.duration} min
                      {visitItem.service.category
                        ? ` · ${visitItem.service.category.name}`
                        : ""}
                    </p>
                    {visitItem.employee && (
                      <p className="mt-1 text-stone-600">
                        Staff: {visitItem.employee.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 border-t border-stone-200 pt-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="font-medium text-stone-900">
                  {formatAppointmentDateTime(start, "EEEE, MMMM d")}
                </p>
                <p className="text-stone-500">
                  {formatAppointmentDateTime(start, "h:mm a")} –{" "}
                  {formatAppointmentDateTime(end, "h:mm a")}
                </p>
              </div>
            </div>
            {appointment.customer.phone && (
              <div className="flex items-start gap-3 border-t border-stone-200 pt-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <p className="text-stone-700">{appointment.customer.phone}</p>
              </div>
            )}
            {stripVisitGroupMarker(appointment.notes) && (
              <p className="border-t border-stone-200 pt-3 text-stone-600">
                {stripVisitGroupMarker(appointment.notes)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canWalkIn && (
              <Button
                size="sm"
                disabled={loading}
                onClick={() => void handleWalkInCheckIn()}
              >
                <LogIn className="h-4 w-4" />
                Walk-in check-in
              </Button>
            )}
            {appointment.status === "scheduled" && (
              <AppointmentReachedButton
                appointment={appointment}
                visitAppointmentIds={visitAppointmentIds}
                onCheckedIn={onCheckedIn}
                onCheckInError={onCheckInError}
              />
            )}
            {(appointment.status === "scheduled" ||
              appointment.status === "checked_in" ||
              appointment.status === "completed") && (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={handleInvoice}
              >
                <Receipt className="h-4 w-4" />
                Billing
              </Button>
            )}
            {appointment.status === "scheduled" && appointment.customer.phone && (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={handleSms}
              >
                <MessageSquare className="h-4 w-4" />
                SMS reminder
              </Button>
            )}
            {appointment.status === "scheduled" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleStatus("completed")}
                >
                  <Check className="h-4 w-4 text-emerald-600" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleStatus("cancelled")}
                >
                  <X className="h-4 w-4 text-amber-600" />
                  Cancel
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              className="text-red-600 hover:text-red-700"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
