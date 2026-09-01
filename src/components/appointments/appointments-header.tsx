"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Appointment, Employee, PrefilledCustomer, Service } from "./types";
import type { OpeningHours } from "@/lib/onboarding";
import { AppointmentForm } from "./appointment-form";

type AppointmentsHeaderProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  employees: Employee[];
  openingHours: OpeningHours;
  existingAppointments?: Appointment[];
  prefilledCustomer?: PrefilledCustomer;
  defaultScheduledAt?: string;
  onSuccess: () => void;
};

export function AppointmentsHeader({
  open,
  onOpenChange,
  services,
  employees,
  openingHours,
  existingAppointments,
  prefilledCustomer,
  defaultScheduledAt,
  onSuccess,
}: AppointmentsHeaderProps) {
  const [formKey, setFormKey] = useState(0);

  function handleOpenChange(next: boolean) {
    if (next) setFormKey((key) => key + 1);
    onOpenChange(next);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#1C103D] sm:text-3xl lg:text-4xl">
          Appointments
        </h1>
        <p className="mt-0.5 hidden max-w-xl text-sm text-[#6B7280] sm:mt-1.5 sm:block sm:text-base">
          Manage bookings, walk-ins, staff schedules and appointments.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <Button
          variant="outline"
          asChild
          className="h-9 rounded-2xl border-[#E5E7EB] bg-white px-2.5 shadow-sm hover:border-[#6C3BFF]/30 hover:bg-[#F7F8FC] sm:h-11 sm:px-4"
        >
          <Link href="/schedule/ai" aria-label="AI Suggest">
            <Sparkles className="h-4 w-4 text-[#6C3BFF]" />
            <span className="hidden sm:inline">AI Suggest</span>
          </Link>
        </Button>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="h-9 rounded-2xl border-0 bg-gradient-to-r from-[#FF2D6F] to-[#FF5A8F] px-3 text-white shadow-lg shadow-[#FF2D6F]/25 hover:from-[#E82663] hover:to-[#FF2D6F] sm:h-11 sm:px-5">
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New Appointment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="!flex max-h-[min(92vh,820px)] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-[24px] border-0 p-0 shadow-2xl shadow-violet-500/10">
            <DialogHeader className="shrink-0 space-y-1 border-b border-violet-100/80 bg-gradient-to-r from-violet-50/90 via-white to-purple-50/50 px-6 pb-4 pt-6 text-left">
              <DialogTitle className="text-xl font-bold tracking-tight text-[#1C103D]">
                Schedule appointment
              </DialogTitle>
              <p className="text-sm text-[#6B7280]">
                Book one or more services for your client
              </p>
            </DialogHeader>
            <AppointmentForm
              key={formKey}
              services={services}
              employees={employees}
              openingHours={openingHours}
              existingAppointments={existingAppointments}
              prefilledCustomer={prefilledCustomer}
              defaultScheduledAt={defaultScheduledAt}
              onSuccess={onSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
