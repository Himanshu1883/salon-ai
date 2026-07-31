"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  updateAppointmentStatus,
  deleteAppointment,
} from "@/actions/appointments";
import { createInvoiceFromAppointment } from "@/actions/billing";
import { sendManualSms } from "@/actions/sms";
import { AppointmentReachedButton } from "@/components/appointments/appointment-reached-button";
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
  open,
  onOpenChange,
  onRefresh,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const start = new Date(appointment.scheduledAt);
  const end = new Date(start.getTime() + appointment.service.duration * 60_000);

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
      `Hi ${appointment!.customer.name}! Reminder: your ${appointment!.service.name} appointment is on ${format(start, "EEE, MMM d · h:mm a")}.`
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
            <div className="flex items-start gap-3">
              <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="font-medium text-stone-900">
                  {appointment.service.name}
                </p>
                <p className="text-stone-500">
                  {appointment.service.duration} min
                  {appointment.service.category
                    ? ` · ${appointment.service.category.name}`
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="font-medium text-stone-900">
                  {format(start, "EEEE, MMMM d")}
                </p>
                <p className="text-stone-500">
                  {format(start, "h:mm a")} – {format(end, "h:mm a")}
                </p>
              </div>
            </div>
            {appointment.employee && (
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <p className="text-stone-700">{appointment.employee.name}</p>
              </div>
            )}
            {appointment.notes && (
              <p className="border-t border-stone-200 pt-3 text-stone-600">
                {appointment.notes}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
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
