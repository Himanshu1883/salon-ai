"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import {
  updateAppointmentStatus,
  deleteAppointment,
} from "@/actions/appointments";
import { createInvoiceFromAppointment } from "@/actions/billing";
import { sendManualSms } from "@/actions/sms";
import { AppointmentReachedButton } from "@/components/appointments/appointment-reached-button";
import { buildCheckInHref, collectVisitGroupAppointments } from "@/lib/appointments/check-in-prefill";
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
  FileText,
  MessageSquare,
  Clock,
  User,
  Scissors,
  LogIn,
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
}: {
  appointment: Appointment | null;
  allAppointments?: Appointment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const visitAppointments = collectVisitGroupAppointments(
    appointment,
    allAppointments.length > 0 ? allAppointments : [appointment]
  );
  const checkInHref = buildCheckInHref(
    appointment,
    allAppointments.length > 0 ? allAppointments : [appointment]
  );
  const canWalkIn =
    appointment.status === "scheduled" || appointment.status === "checked_in";

  const start = new Date(appointment.scheduledAt);
  const visitEnd = visitAppointments.reduce((latest, item) => {
    const itemEnd = new Date(item.scheduledAt).getTime() + item.service.duration * 60_000;
    return itemEnd > latest ? itemEnd : latest;
  }, start.getTime() + appointment.service.duration * 60_000);
  const end = new Date(visitEnd);

  async function handleStatus(status: string) {
    setLoading(true);
    await updateAppointmentStatus(appointment!.id, status);
    setLoading(false);
    onOpenChange(false);
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this appointment?")) return;
    setLoading(true);
    await deleteAppointment(appointment!.id);
    setLoading(false);
    onOpenChange(false);
    onRefresh();
  }

  async function handleInvoice() {
    setLoading(true);
    const result = await createInvoiceFromAppointment(appointment!.id);
    setLoading(false);
    if (result.error && !result.id) {
      alert(result.error);
      return;
    }
    if (result.id) {
      router.push(`/billing/${result.id}`);
      return;
    }
    onOpenChange(false);
    onRefresh();
  }

  async function handleSms() {
    if (!appointment!.customer.phone) {
      alert("Customer has no phone number");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("recipientPhone", appointment!.customer.phone);
    formData.set("recipientName", appointment!.customer.name);
    formData.set(
      "message",
      `Hi ${appointment!.customer.name}! Reminder: your ${appointment!.service.name} appointment is on ${formatAppointmentDateTime(start, "EEE, MMM d · h:mm a")}.`
    );
    formData.set("appointmentId", appointment!.id);
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
              <Button size="sm" asChild disabled={loading}>
                <Link
                  href={checkInHref}
                  onClick={() => onOpenChange(false)}
                >
                  <LogIn className="h-4 w-4" />
                  Walk-in check-in
                </Link>
              </Button>
            )}
            {appointment.status === "completed" && (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={handleInvoice}
              >
                <FileText className="h-4 w-4" />
                Create invoice
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
                <AppointmentReachedButton
                  appointment={appointment}
                  onSuccess={() => {
                    onOpenChange(false);
                    onRefresh();
                  }}
                />
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
