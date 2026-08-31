"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import {
  addAppointmentServiceLine,
  deleteAppointment,
  startAppointmentVisit,
  updateAppointmentServiceItemStatus,
  updateAppointmentStatus,
} from "@/actions/appointments";
import { sendManualSms } from "@/actions/sms";
import { useAppointmentRecordSale } from "@/components/appointments/use-appointment-record-sale";
import { AppointmentReachedButton } from "@/components/appointments/appointment-reached-button";
import {
  isCheckInBusinessFailure,
  requestAppointmentCheckIn,
} from "@/lib/appointments/check-in-from-schedule";
import { collectVisitGroupAppointments } from "@/lib/appointments/check-in-prefill";
import { stripVisitGroupMarker } from "@/lib/appointments/visit-group";
import {
  deriveAppointmentStatusFromItems,
  getAppointmentServiceItems,
  getServiceItemStatusLabel,
  visitTotalPrice,
  type AppointmentServiceItemView,
} from "@/lib/appointments/service-items";
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
  Play,
  Plus,
} from "lucide-react";
import type { Appointment, Employee, Service } from "./types";
import { getStatusLabel } from "./appointments-utils";
import { formatCurrency } from "@/lib/currency";
import { addMinutes } from "date-fns";

function statusVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "cancelled" || status === "no_show") {
    return "destructive" as const;
  }
  if (status === "checked_in" || status === "in_progress") {
    return "warning" as const;
  }
  return "default" as const;
}

export function AppointmentDetailDialog({
  appointment,
  allAppointments = [],
  services = [],
  employees = [],
  canAddService = false,
  open,
  onOpenChange,
  onRefresh,
  onCheckedIn,
  onCheckInError,
}: {
  appointment: Appointment | null;
  allAppointments?: Appointment[];
  services?: Service[];
  employees?: Employee[];
  canAddService?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
  onCheckedIn?: (appointmentIds: string[]) => void;
  onCheckInError?: (appointmentIds: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [localAppointment, setLocalAppointment] = useState<Appointment | null>(
    null
  );
  const [addServiceId, setAddServiceId] = useState("");
  const [addEmployeeId, setAddEmployeeId] = useState("");
  const [adding, setAdding] = useState(false);
  const [startingVisit, setStartingVisit] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const walkInInFlight = useRef(false);
  const { openAppointmentSale } = useAppointmentRecordSale();

  useEffect(() => {
    if (!open) {
      setLocalAppointment(null);
      setBusyItemId(null);
      setAdding(false);
      setStartingVisit(false);
      setAddServiceId("");
      setAddEmployeeId("");
      return;
    }
    if (!appointment) return;
    setLocalAppointment((prev) => {
      if (prev?.id === appointment.id) return prev;
      return appointment;
    });
  }, [open, appointment?.id]);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/appointments/check-in", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  }, [open]);

  const displayedAppointment =
    open && localAppointment?.id === appointment?.id
      ? localAppointment
      : appointment;

  const source = useMemo(
    () =>
      allAppointments.length > 0
        ? allAppointments
        : displayedAppointment
          ? [displayedAppointment]
          : [],
    [allAppointments, displayedAppointment]
  );

  if (!displayedAppointment) return null;
  const selectedAppointment = displayedAppointment;

  const visitAppointments = collectVisitGroupAppointments(
    selectedAppointment,
    source
  );
  const visitAppointmentIds = visitAppointments.map((item) => item.id);
  const items = getAppointmentServiceItems(selectedAppointment, source);
  const visitTotal = visitTotalPrice(selectedAppointment, source);
  const canWalkIn =
    selectedAppointment.status === "scheduled" ||
    selectedAppointment.status === "checked_in";

  const start = new Date(selectedAppointment.scheduledAt);
  const visitEnd = items.reduce((latest, item) => {
    const itemEnd =
      new Date(item.scheduledAt).getTime() + item.duration * 60_000;
    return itemEnd > latest ? itemEnd : latest;
  }, start.getTime() + selectedAppointment.service.duration * 60_000);
  const end = new Date(visitEnd);

  async function handleWalkInCheckIn() {
    if (walkInInFlight.current) return;
    walkInInFlight.current = true;
    onCheckedIn?.(visitAppointmentIds);
    const result = await requestAppointmentCheckIn(selectedAppointment.id, {
      startNow: true,
    });
    walkInInFlight.current = false;
    if (isCheckInBusinessFailure(result.error)) {
      onCheckInError?.(visitAppointmentIds);
      alert(result.error);
      return;
    }
    onOpenChange(false);
    onRefresh();
  }

  async function handleStatus(status: string) {
    setLoading(true);
    await updateAppointmentStatus(selectedAppointment.id, status);
    setLoading(false);
    onOpenChange(false);
    onRefresh();
  }

  async function handleItemStatus(itemId: string, status: string) {
    const previous = selectedAppointment;
    const now = new Date();
    const currentItems =
      previous.serviceItems && previous.serviceItems.length > 0
        ? previous.serviceItems
        : getAppointmentServiceItems(previous, source);
    const nextServiceItems = currentItems.map((row) =>
      row.id === itemId
        ? {
            ...row,
            status,
            startedAt:
              status === "in_progress" ? (row.startedAt ?? now) : row.startedAt,
            completedAt: status === "completed" ? now : row.completedAt,
          }
        : row
    );
    const nextVisitStatus = deriveAppointmentStatusFromItems(
      nextServiceItems.map((row) => row.status)
    );
    let visitStatus = previous.status;
    if (nextVisitStatus) {
      visitStatus = nextVisitStatus;
    } else if (status === "in_progress" && previous.status === "scheduled") {
      visitStatus = "checked_in";
    }

    setLocalAppointment({
      ...previous,
      status: visitStatus,
      serviceItems: nextServiceItems,
    });
    setBusyItemId(itemId);

    const result = await updateAppointmentServiceItemStatus(itemId, status);
    setBusyItemId(null);
    if (result.error) {
      setLocalAppointment(previous);
      alert(result.error);
      return;
    }
    void onRefresh();
  }

  async function handleStartVisit() {
    const previous = selectedAppointment;
    const now = new Date();
    const currentItems =
      previous.serviceItems && previous.serviceItems.length > 0
        ? previous.serviceItems
        : getAppointmentServiceItems(previous, source);
    const nextServiceItems = currentItems.map((row) =>
      row.status === "scheduled" && !row.id.startsWith("temp-")
        ? { ...row, status: "in_progress", startedAt: row.startedAt ?? now }
        : row
    );
    const nextVisitStatus = deriveAppointmentStatusFromItems(
      nextServiceItems.map((row) => row.status)
    );
    setLocalAppointment({
      ...previous,
      status:
        nextVisitStatus ??
        (previous.status === "scheduled" ? "checked_in" : previous.status),
      serviceItems: nextServiceItems,
    });
    setStartingVisit(true);
    const result = await startAppointmentVisit(previous.id);
    setStartingVisit(false);
    if (result.error) {
      setLocalAppointment(previous);
      alert(result.error);
      return;
    }
    void onRefresh();
  }

  async function handleAddService() {
    if (!addServiceId) return;
    const serviceId = addServiceId;
    const employeeId = addEmployeeId;
    const previous = selectedAppointment;
    const catalog = services.find((service) => service.id === serviceId);
    const staff = employees.find((employee) => employee.id === employeeId);
    const existingItems = getAppointmentServiceItems(previous, source);
    const last = existingItems[existingItems.length - 1];
    const scheduledAt = last
      ? addMinutes(new Date(last.scheduledAt), last.duration)
      : previous.scheduledAt;
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticItem: AppointmentServiceItemView = {
      id: tempId,
      serviceId,
      employeeId: employeeId || null,
      price: 0,
      duration: catalog?.duration ?? 0,
      status: "scheduled",
      scheduledAt,
      sortOrder: (last?.sortOrder ?? existingItems.length) + 1,
      service: {
        id: catalog?.id,
        name: catalog?.name ?? "Service",
        duration: catalog?.duration ?? 0,
      },
      employee: staff ? { id: staff.id, name: staff.name } : null,
    };

    setLocalAppointment({
      ...previous,
      serviceItems: [...existingItems, optimisticItem],
    });
    setAddServiceId("");
    setAddEmployeeId("");
    setAdding(true);

    const result = await addAppointmentServiceLine(previous.id, {
      serviceId,
      employeeId: employeeId || undefined,
    });
    setAdding(false);
    if (result.error) {
      setLocalAppointment(previous);
      setAddServiceId(serviceId);
      setAddEmployeeId(employeeId);
      alert(result.error);
      return;
    }
    if ("item" in result && result.item) {
      const created = result.item;
      setLocalAppointment((prev) => {
        if (!prev) return prev;
        const withoutTemp = (prev.serviceItems ?? []).filter(
          (item) => item.id !== tempId
        );
        return {
          ...prev,
          serviceItems: [...withoutTemp, created],
        };
      });
    }
    void onRefresh();
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
    openAppointmentSale(selectedAppointment, source, {
      onOpened: () => onOpenChange(false),
      onRefresh,
    });
  }

  async function handleSms() {
    if (!selectedAppointment.customer.phone) {
      alert("Customer has no phone number");
      return;
    }
    const serviceLabel = items.map((item) => item.service.name).join(", ");
    setLoading(true);
    const formData = new FormData();
    formData.set("recipientPhone", selectedAppointment.customer.phone);
    formData.set("recipientName", selectedAppointment.customer.name);
    formData.set(
      "message",
      `Hi ${selectedAppointment.customer.name}! Reminder: your ${serviceLabel} appointment is on ${formatAppointmentDateTime(start, "EEE, MMM d · h:mm a")}.`
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

  const canBill =
    selectedAppointment.status === "scheduled" ||
    selectedAppointment.status === "checked_in" ||
    selectedAppointment.status === "completed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-rose-600" />
            {selectedAppointment.customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(selectedAppointment.status)}>
              {getStatusLabel(selectedAppointment.status)}
            </Badge>
          </div>

          <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/50 p-4 text-sm">
            <div className="flex items-start gap-3">
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
            {selectedAppointment.customer.phone && (
              <div className="flex items-start gap-3 border-t border-stone-200 pt-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <p className="text-stone-700">
                  {selectedAppointment.customer.phone}
                </p>
              </div>
            )}
            {stripVisitGroupMarker(selectedAppointment.notes) && (
              <p className="border-t border-stone-200 pt-3 text-stone-600">
                {stripVisitGroupMarker(selectedAppointment.notes)}
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-stone-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Services
            </p>
            {items.map((item) => {
              const itemStart = new Date(item.scheduledAt);
              const itemEnd = addMinutes(itemStart, item.duration);
              const staffName =
                item.employee?.name ??
                employees.find((employee) => employee.id === item.employeeId)
                  ?.name ??
                "Unassigned";
              const storedItem =
                !item.id.startsWith("temp-") &&
                Boolean(
                  selectedAppointment.serviceItems?.some(
                    (row) => row.id === item.id
                  )
                );
              return (
                <div
                  key={item.id}
                  className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-3">
                      <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">
                          {item.service.name}
                        </p>
                        <p className="text-stone-500">
                          {staffName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {item.duration} min · {formatCurrency(item.price || 0)}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatAppointmentDateTime(itemStart, "h:mm a")} –{" "}
                          {formatAppointmentDateTime(itemEnd, "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(item.status)}>
                      {getServiceItemStatusLabel(item.status)}
                    </Badge>
                  </div>
                  {storedItem && item.status === "in_progress" && (
                    <div className="mt-2 flex flex-wrap gap-2 pl-7">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyItemId === item.id}
                        onClick={() => handleItemStatus(item.id, "completed")}
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        {busyItemId === item.id ? "Saving..." : "Complete"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {items.some(
              (item) =>
                item.status === "scheduled" &&
                !item.id.startsWith("temp-") &&
                selectedAppointment.serviceItems?.some((row) => row.id === item.id)
            ) && (
              <Button
                size="sm"
                className="w-full"
                disabled={startingVisit}
                onClick={() => void handleStartVisit()}
              >
                <Play className="h-3.5 w-3.5" />
                {startingVisit ? "Starting..." : "Start"}
              </Button>
            )}

            {canAddService &&
              selectedAppointment.status !== "cancelled" &&
              services.length > 0 && (
                <div className="space-y-2 border-t border-stone-200 pt-3">
                  <p className="text-xs font-medium text-stone-600">
                    Add service
                  </p>
                  <select
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                    value={addServiceId}
                    onChange={(event) => setAddServiceId(event.target.value)}
                  >
                    <option value="">Select service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                    value={addEmployeeId}
                    onChange={(event) => setAddEmployeeId(event.target.value)}
                  >
                    <option value="">Select staff</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={adding || !addServiceId}
                    onClick={() => void handleAddService()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {adding ? "Adding..." : "Add to this visit"}
                  </Button>
                </div>
              )}
          </div>

          <div className="space-y-2 rounded-lg border border-stone-200 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Billing
            </p>
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-medium text-stone-900">
                {formatCurrency(visitTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Discount</span>
              <span className="font-medium text-stone-900">
                {formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Tax</span>
              <span className="font-medium text-stone-900">
                {formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(visitTotal)}</span>
            </div>
            {canBill && (
              <Button
                size="sm"
                className="mt-2 w-full"
                variant="outline"
                disabled={loading}
                onClick={handleInvoice}
              >
                <Receipt className="h-4 w-4" />
                Record payment
              </Button>
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
            {selectedAppointment.status === "scheduled" && (
              <AppointmentReachedButton
                appointment={selectedAppointment}
                visitAppointmentIds={visitAppointmentIds}
                onCheckedIn={onCheckedIn}
                onCheckInError={onCheckInError}
                onSuccess={() => {
                  onOpenChange(false);
                  onRefresh();
                }}
              />
            )}
            {selectedAppointment.status === "scheduled" &&
              selectedAppointment.customer.phone && (
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
            {selectedAppointment.status === "scheduled" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleStatus("completed")}
                >
                  <Check className="h-4 w-4 text-emerald-600" />
                  Complete visit
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
